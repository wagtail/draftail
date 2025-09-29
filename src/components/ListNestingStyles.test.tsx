import React from "react";
import { render, cleanup } from "@testing-library/react";
import ListNestingStyles from "./ListNestingStyles";

// Mock getListNestingStyles
jest.mock("draftjs-conductor", () => ({
  getListNestingStyles: (max: number) => `.depth-${max} { color: red; }`,
}));

describe("ListNestingStyles", () => {
  let originalAdoptedStyleSheets: CSSStyleSheet[];
  let mockSheet: CSSStyleSheet;

  beforeEach(() => {
    // Save original adoptedStyleSheets
    originalAdoptedStyleSheets = [...document.adoptedStyleSheets];
    // Mock adoptedStyleSheets as a mutable array
    Object.defineProperty(document, "adoptedStyleSheets", {
      configurable: true,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      get: () => global.adoptedStyleSheets || [],
      set: (sheets) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        global.adoptedStyleSheets = sheets;
      },
    });
    document.adoptedStyleSheets = [];
    // Mock CSSStyleSheet
    mockSheet = {
      replaceSync: jest.fn(),
    } as unknown as CSSStyleSheet;
    window.CSSStyleSheet = jest.fn(() => mockSheet);
  });

  afterEach(() => {
    // Restore adoptedStyleSheets
    Object.defineProperty(document, "adoptedStyleSheets", {
      configurable: true,
      value: originalAdoptedStyleSheets,
      writable: true,
    });
    cleanup();
  });

  it("injects a stylesheet when mounted with max", () => {
    render(<ListNestingStyles max={3} />);
    expect(window.CSSStyleSheet).toHaveBeenCalled();
    expect(mockSheet.replaceSync).toHaveBeenCalledWith(
      ".depth-3 { color: red; }",
    );
    expect(document.adoptedStyleSheets).toContain(mockSheet);
  });

  it("removes the stylesheet on unmount", () => {
    const { unmount } = render(<ListNestingStyles max={2} />);
    expect(document.adoptedStyleSheets).toContain(mockSheet);
    unmount();
    expect(document.adoptedStyleSheets).not.toContain(mockSheet);
  });

  it("does nothing if max is not provided", () => {
    render(<ListNestingStyles />);
    expect(window.CSSStyleSheet).not.toHaveBeenCalled();
    expect(document.adoptedStyleSheets).toHaveLength(0);
  });
});
