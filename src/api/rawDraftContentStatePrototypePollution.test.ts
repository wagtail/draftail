/**
 * Scenarios for checking prototype-pollution-style behavior when Draft.js ingests
 * crafted RawDraftContentState (the same path Draftail uses via convertFromRaw / convertToRaw).
 *
 * Run: npx jest src/api/rawDraftContentStatePrototypePollution.test.ts
 *
 * What “interesting” means (per GHSA-wf6x-7x77-mvgw-style issues on merge / Map.toObject / Map.toJS):
 * - A property like `admin` is visible via `obj.admin` but is NOT an own property
 *   (stealthy: `Object.keys` / `JSON.stringify` can omit it while checks still see it).
 *
 * This does not prove global `Object.prototype` pollution; the advisory’s PoCs often
 * show inherited properties on a *single* merged/converted object instead.
 */

import {
  convertFromRaw,
  convertToRaw,
  type RawDraftContentBlock,
  type RawDraftContentState,
} from "draft-js";

/** Minimal valid block for convertFromRaw (matches tests elsewhere in the repo). */
function baseBlock(overrides: Partial<RawDraftContentBlock> = {}): RawDraftContentBlock {
  return {
    key: "b0ei9",
    text: "test",
    type: "unstyled",
    depth: 0,
    inlineStyleRanges: [],
    entityRanges: [],
    ...overrides,
  } as RawDraftContentBlock;
}

describe("RawDraftContentState round-trip (prototype-pollution-style probes)", () => {
  afterEach(() => {
    // Ensure tests do not leave global pollution (should stay undefined).
    expect((Object.prototype as { admin?: boolean }).admin).toBeUndefined();
    delete (Object.prototype as { admin?: boolean }).admin;
  });

  it("round-trips benign block.data without spooky inherited keys", () => {
    const raw: RawDraftContentState = {
      entityMap: {},
      blocks: [baseBlock({ data: { safe: true } })],
    };

    const roundTrip = convertToRaw(convertFromRaw(raw));

    const data = roundTrip.blocks[0].data as Record<string, unknown>;
    expect(data.safe).toBe(true);
    expect(Object.hasOwn(data, "safe")).toBe(true);
  });

  it("flags when __proto__ in block.data survives round-trip with inherited ‘admin’", () => {
    // Crafted JSON: own property "__proto__" whose value is an object with admin.
    const maliciousData = JSON.parse('{"__proto__":{"admin":true}}') as Record<
      string,
      unknown
    >;

    const raw: RawDraftContentState = {
      entityMap: {},
      blocks: [baseBlock({ data: maliciousData })],
    };

    const content = convertFromRaw(raw);
    const roundTrip = convertToRaw(content);
    const data = roundTrip.blocks[0].data as Record<string, unknown> & {
      admin?: boolean;
    };

    const adminIsOwn = Object.hasOwn(data, "admin");
    const adminReadable = data.admin === true;

    // If vulnerable (Immutable Map.toObject path), you may see adminReadable true
    // while adminIsOwn is false — that is the “stealth” property the advisory describes.
    // Log when investigating locally:
    // eslint-disable-next-line no-console
    console.info("[prototype probe] block.data", {
      adminReadable,
      adminIsOwn,
      keys: Object.keys(data),
    });

    // The test does not assert failure by default — integrations can flip this to
    // expect(!adminReadable || adminIsOwn) once they require a patched immutable / sanitiser.
    expect(roundTrip.blocks).toHaveLength(1);
  });

  it("optional: entity data with __proto__ payload (same class of input)", () => {
    const maliciousEntityData = JSON.parse('{"__proto__":{"role":"admin"}}') as Record<
      string,
      unknown
    >;

    const raw: RawDraftContentState = {
      entityMap: {
        "0": {
          type: "LINK",
          mutability: "MUTABLE",
          data: maliciousEntityData,
        },
      },
      blocks: [
        baseBlock({
          text: "x",
          entityRanges: [{ offset: 0, length: 1, key: 0 }],
        }),
      ],
    };

    const roundTrip = convertToRaw(convertFromRaw(raw));
    const entityData = roundTrip.entityMap["0"].data as Record<string, unknown> & {
      role?: string;
    };

    const roleIsOwn = Object.hasOwn(entityData, "role");
    const roleReadable = entityData.role === "admin";

    // eslint-disable-next-line no-console
    console.info("[prototype probe] entity.data", {
      roleReadable,
      roleIsOwn,
      keys: Object.keys(entityData),
    });

    expect(roundTrip.entityMap["0"].type).toBe("LINK");
  });
});
