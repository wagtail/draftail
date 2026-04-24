import React from "react";
import { shallow } from "enzyme";

import PlaceholderStyles from "./PlaceholderStyles";

// Skipping these till the approach is addressed
describe.skip("PlaceholderStyles", () => {
  it("empty", () => {
    expect(
      shallow(
        <PlaceholderStyles
          blockKey={null}
          blockTypes={[]}
          placeholder={null}
        />,
      ),
    ).toMatchInlineSnapshot(`<style />`);
  });

  it("placeholder no blockKey", () => {
    expect(
      shallow(
        <PlaceholderStyles
          blockKey={null}
          blockTypes={[]}
          placeholder="Write here"
        />,
      ),
    ).toMatchInlineSnapshot(`<style />`);
  });

  it("blockKey no placeholder", () => {
    expect(
      shallow(
        <PlaceholderStyles
          blockKey="abcde"
          blockTypes={[]}
          placeholder={null}
        />,
      ),
    ).toMatchInlineSnapshot(`<style />`);
  });

  it("current focused block", () => {
    expect(
      shallow(
        <PlaceholderStyles
          blockKey="abcde"
          blockTypes={[]}
          placeholder="Write here"
        />,
      ),
    ).toMatchInlineSnapshot(`
      <style>
        .Draftail-block--unstyled.Draftail-block--empty[data-offset-key="abcde-0-0"]::before { content: "Write here"; }
      </style>
    `);
  });

  it("block descriptions", () => {
    expect(
      shallow(
        <PlaceholderStyles
          blockKey={null}
          blockTypes={[
            { type: "header-one", description: "Heading 1" },
            { type: "custom-nodescription" },
            { type: "my-custom-block", description: "My custom block" },
          ]}
          placeholder={null}
        />,
      ),
    ).toMatchInlineSnapshot(`
      <style>
        .Draftail-block--header-one.Draftail-block--empty::before { content: "Heading 1"; }.Draftail-block--my-custom-block.Draftail-block--empty::before { content: "My custom block"; }
      </style>
    `);
  });
});
