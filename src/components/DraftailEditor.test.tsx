import { OrderedSet } from "immutable";
import React from "react";
import { shallow, mount } from "enzyme";
import {
  convertFromRaw,
  EditorState,
  SelectionState,
  ContentBlock,
  RichUtils,
  RawDraftContentBlock,
  DraftEditorCommand,
  RawDraftContentState,
  DraftEntityMutability,
} from "draft-js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Editor from "draft-js-plugins-editor";

import { ENTITY_TYPE, INLINE_STYLE } from "../api/constants";
import behavior from "../api/behavior";
import DraftUtils from "../api/DraftUtils";

import DividerBlock from "../blocks/DividerBlock";
import DraftailEditor, {
  DraftailEditorProps,
  DraftailEditorState,
} from "./DraftailEditor";
import Toolbar from "./Toolbar/Toolbar";
import PlaceholderStyles from "./PlaceholderStyles/PlaceholderStyles";

jest.mock("draft-js/lib/generateRandomKey", () => () => "a");

const shallowNoLifecycle = (elt: React.ReactElement) =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  shallow<DraftailEditor, DraftailEditorProps, DraftailEditorState>(elt, {
    disableLifecycleMethods: true,
  });

type DraftailWrapper = ReturnType<typeof shallowNoLifecycle>;

const typedMount = (elt: React.ReactElement) =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  mount<DraftailEditor, DraftailEditorProps, DraftailEditorState>(elt);

describe("DraftailEditor", () => {
  it("empty", () => {
    expect(shallowNoLifecycle(<DraftailEditor />)).toMatchSnapshot();
  });

  it("#rawContentState sets local state", () => {
    const wrapper = shallowNoLifecycle(
      <DraftailEditor
        rawContentState={{
          entityMap: {},
          blocks: [{ text: "test" } as RawDraftContentBlock],
        }}
      />,
    );
    expect(wrapper.state("editorState")).toBeInstanceOf(EditorState);
  });

  it("#editorState is passed through", () => {
    const editorState = EditorState.createEmpty();
    const wrapper = shallowNoLifecycle(
      <DraftailEditor editorState={editorState} />,
    );
    expect(wrapper.find("PluginEditor").prop("editorState")).toBe(editorState);
  });

  it("editorRef", () => {
    expect(typedMount(<DraftailEditor />).instance().editorRef).toBeDefined();
  });

  describe("readOnly", () => {
    it("readOnly state", () => {
      expect(
        shallowNoLifecycle(<DraftailEditor />)
          .setState({
            readOnlyState: true,
          })
          .hasClass("Draftail-Editor--readonly"),
      ).toBeTruthy();
    });

    it("#readOnly prop", () => {
      expect(
        shallowNoLifecycle(<DraftailEditor readOnly />).hasClass(
          "Draftail-Editor--readonly",
        ),
      ).toBeTruthy();
    });

    it("#readOnly prop & readOnly state", () => {
      expect(
        shallowNoLifecycle(<DraftailEditor readOnly />)
          .setState({
            readOnlyState: true,
          })
          .hasClass("Draftail-Editor--readonly"),
      ).toBeTruthy();
    });
  });

  describe("#placeholder", () => {
    it("visible", () => {
      expect(
        shallowNoLifecycle(<DraftailEditor placeholder="Write here…" />)
          .find(PlaceholderStyles)
          .prop("placeholder"),
      ).toEqual("Write here…");
    });
  });

  it("#spellCheck", () => {
    expect(
      shallowNoLifecycle(<DraftailEditor spellCheck />)
        .find(Editor)
        .prop("spellCheck"),
    ).toEqual(true);
  });

  it("#textAlignment", () => {
    expect(
      shallowNoLifecycle(<DraftailEditor textAlignment="left" />)
        .find(Editor)
        .prop("textAlignment"),
    ).toEqual("left");
  });

  it("#textDirectionality", () => {
    expect(
      shallowNoLifecycle(<DraftailEditor textDirectionality="RTL" />)
        .find(Editor)
        .prop("textDirectionality"),
    ).toEqual("RTL");
  });

  it("#autoCapitalize", () => {
    expect(
      shallowNoLifecycle(<DraftailEditor autoCapitalize="characters" />)
        .find(Editor)
        .prop("autoCapitalize"),
    ).toEqual("characters");
  });

  it("#autoComplete", () => {
    expect(
      shallowNoLifecycle(<DraftailEditor autoComplete="given-name" />)
        .find(Editor)
        .prop("autoComplete"),
    ).toEqual("given-name");
  });

  it("#autoCorrect", () => {
    expect(
      shallowNoLifecycle(<DraftailEditor autoCorrect="on" />)
        .find(Editor)
        .prop("autoCorrect"),
    ).toEqual("on");
  });

  it("#ariaDescribedBy", () => {
    expect(
      shallowNoLifecycle(<DraftailEditor ariaDescribedBy="test" />)
        .find(Editor)
        .prop("ariaDescribedBy"),
    ).toEqual("test");
  });

  describe("#topToolbar", () => {
    it("defaults to top static Toolbar", () => {
      expect(
        shallowNoLifecycle(<DraftailEditor />)
          .find(Toolbar)
          .exists(),
      ).toBe(true);
    });

    it("can be disabled", () => {
      expect(
        shallowNoLifecycle(<DraftailEditor topToolbar={null} />)
          .find(Toolbar)
          .exists(),
      ).toBe(false);
    });

    it("can be customised", () => {
      expect(
        shallowNoLifecycle(
          <DraftailEditor
            topToolbar={() => <div className="CustomTopToolbar">Test</div>}
          />,
        )
          .find("topToolbar")
          .dive()
          .find(".CustomTopToolbar")
          .exists(),
      ).toBe(true);
    });

    it("receives default toolbar props", () => {
      expect(
        Object.keys(
          shallowNoLifecycle(<DraftailEditor topToolbar={() => <div />} />)
            .find("topToolbar")
            .props(),
        ),
      ).toMatchInlineSnapshot(`
        Array [
          "currentStyles",
          "currentBlock",
          "currentBlockKey",
          "enableHorizontalRule",
          "enableLineBreak",
          "showUndoControl",
          "showRedoControl",
          "blockTypes",
          "inlineStyles",
          "entityTypes",
          "controls",
          "commands",
          "readOnly",
          "toggleBlockType",
          "toggleInlineStyle",
          "addHR",
          "addBR",
          "onUndoRedo",
          "onRequestSource",
          "onCompleteSource",
          "getEditorState",
          "focus",
          "onChange",
        ]
      `);
    });
  });

  describe("#bottomToolbar", () => {
    it("defaults to no bottom toolbar", () => {
      expect(
        shallowNoLifecycle(<DraftailEditor />)
          .find("bottomToolbar")
          .exists(),
      ).toBe(false);
    });

    it("can be customised", () => {
      expect(
        shallowNoLifecycle(
          <DraftailEditor
            bottomToolbar={() => (
              <div className="CustomBottomToolbar">Test</div>
            )}
          />,
        )
          .find("bottomToolbar")
          .dive()
          .find(".CustomBottomToolbar")
          .exists(),
      ).toBe(true);
    });

    it("receives default toolbar props", () => {
      expect(
        Object.keys(
          shallowNoLifecycle(<DraftailEditor bottomToolbar={() => <div />} />)
            .find("bottomToolbar")
            .props(),
        ),
      ).toMatchInlineSnapshot(`
        Array [
          "currentStyles",
          "currentBlock",
          "currentBlockKey",
          "enableHorizontalRule",
          "enableLineBreak",
          "showUndoControl",
          "showRedoControl",
          "blockTypes",
          "inlineStyles",
          "entityTypes",
          "controls",
          "commands",
          "readOnly",
          "toggleBlockType",
          "toggleInlineStyle",
          "addHR",
          "addBR",
          "onUndoRedo",
          "onRequestSource",
          "onCompleteSource",
          "getEditorState",
          "focus",
          "onChange",
        ]
      `);
    });
  });

  describe("#maxListNesting", () => {
    it("renders when 6", () => {
      expect(
        shallowNoLifecycle(<DraftailEditor maxListNesting={6} />),
      ).toMatchSnapshot();
    });

    it("skips when 1", () => {
      expect(
        shallowNoLifecycle(<DraftailEditor maxListNesting={1} />),
      ).toMatchSnapshot();
    });
  });

  describe("#onSave", () => {
    it("works", () => {
      jest.useFakeTimers();

      const onSave = jest.fn();
      const wrapper = shallowNoLifecycle(
        <DraftailEditor onSave={onSave} stateSaveInterval={100} />,
      );

      wrapper.instance().onChange(EditorState.createEmpty());

      jest.advanceTimersByTime(150);

      expect(onSave).toHaveBeenCalled();
    });

    it("does not get called when onChange is used", () => {
      jest.useFakeTimers();

      const onSave = jest.fn();
      const wrapper = shallowNoLifecycle(
        <DraftailEditor onSave={onSave} onChange={() => {}} />,
      );

      wrapper.instance().onChange(EditorState.createEmpty());

      jest.advanceTimersByTime(1000);

      expect(onSave).not.toHaveBeenCalled();
    });
  });

  it("#stateSaveInterval", () => {
    jest.useFakeTimers();

    const onSave = jest.fn();
    const wrapper = shallowNoLifecycle(
      <DraftailEditor onSave={onSave} stateSaveInterval={100} />,
    );

    const contentState = convertFromRaw({
      entityMap: {},
      blocks: [{ text: "test" } as RawDraftContentBlock],
    });

    const editorState = EditorState.push(
      EditorState.createEmpty(),
      contentState,
      "insert-fragment",
    );

    wrapper.instance().onChange(editorState);
    jest.advanceTimersByTime(50);
    expect(onSave).not.toHaveBeenCalled();
    jest.advanceTimersByTime(50);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("readOnly", () => {
    const onSave = jest.fn();
    const wrapper = shallowNoLifecycle(<DraftailEditor onSave={onSave} />);

    wrapper.instance().toggleEditor(true);
    expect(wrapper.state("readOnlyState")).toBe(true);
    wrapper.instance().toggleEditor(false);
    expect(wrapper.state("readOnlyState")).toBe(false);
  });

  it("componentWillUnmount", () => {
    const wrapper = typedMount(<DraftailEditor />);
    const { copySource } = wrapper.instance();
    jest.spyOn(copySource, "unregister");
    jest.spyOn(window, "clearTimeout");
    expect(copySource).not.toBeNull();
    wrapper.unmount();
    expect(copySource.unregister).toHaveBeenCalled();
    expect(window.clearTimeout).toHaveBeenCalled();
  });

  describe("onChange", () => {
    beforeEach(() => {
      jest
        .spyOn(behavior, "filterPaste")
        .mockImplementation((opt, editorState) => editorState);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("no filter when typing", () => {
      const wrapper = shallowNoLifecycle(
        <DraftailEditor stripPastedStyles={false} />,
      );

      const contentState = convertFromRaw({
        entityMap: {},
        blocks: [{ text: "test" } as RawDraftContentBlock],
      });

      const editorState = EditorState.push(
        EditorState.createEmpty(),
        contentState,
        "insert-characters",
      );

      wrapper.instance().onChange(editorState);

      expect(behavior.filterPaste).not.toHaveBeenCalled();
    });

    it("filter on paste", () => {
      const wrapper = shallowNoLifecycle(
        <DraftailEditor stripPastedStyles={false} />,
      );

      const contentState = convertFromRaw({
        entityMap: {},
        blocks: [{ text: "test" } as RawDraftContentBlock],
      });

      const editorState = EditorState.push(
        EditorState.createEmpty(),
        contentState,
        "insert-fragment",
      );

      wrapper.instance().onChange(editorState);

      expect(behavior.filterPaste).toHaveBeenCalled();
    });

    it("calls onSave", () => {
      jest.useFakeTimers();

      const onSave = jest.fn();
      const wrapper = shallowNoLifecycle(<DraftailEditor onSave={onSave} />);

      wrapper.instance().onChange(EditorState.createEmpty());
      jest.advanceTimersByTime(1000);
      expect(onSave).toHaveBeenCalled();
    });

    it("calls onChange if used instead", () => {
      jest.useFakeTimers();

      const onSave = jest.fn();
      const onChange = jest.fn();
      const wrapper = shallowNoLifecycle(
        <DraftailEditor onSave={onSave} onChange={onChange} />,
      );

      wrapper.instance().onChange(EditorState.createEmpty());
      jest.advanceTimersByTime(1000);
      expect(onSave).not.toHaveBeenCalled();
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("getEditorState", () => {
    it("works with uncontrolled editor", () => {
      const wrapper = shallowNoLifecycle(<DraftailEditor />);

      expect(wrapper.instance().getEditorState()).toBeInstanceOf(EditorState);
    });

    it("works with controlled editor", () => {
      const editorState = EditorState.createEmpty();
      const wrapper = shallowNoLifecycle(
        <DraftailEditor editorState={editorState} />,
      );

      expect(wrapper.instance().getEditorState()).toBe(editorState);
    });
  });

  describe("handleReturn", () => {
    it("default", () => {
      const handleNewLine = jest
        .spyOn(DraftUtils, "handleNewLine")
        .mockImplementation(() => EditorState.createEmpty());
      const wrapper = shallowNoLifecycle(<DraftailEditor />);

      expect(
        wrapper.instance().handleReturn({
          keyCode: 13,
        } as React.KeyboardEvent<HTMLDivElement>),
      ).toBe("handled");

      handleNewLine.mockRestore();
    });

    it("enabled br", () => {
      const wrapper = shallowNoLifecycle(<DraftailEditor enableLineBreak />);

      expect(
        wrapper.instance().handleReturn({
          keyCode: 13,
        } as React.KeyboardEvent<HTMLDivElement>),
      ).toBe("not-handled");
    });

    it("alt + enter on text", () => {
      const wrapper = shallowNoLifecycle(<DraftailEditor />);

      expect(
        wrapper.instance().handleReturn({
          altKey: true,
        } as React.KeyboardEvent<HTMLDivElement>),
      ).toBe("handled");
    });

    it("alt + enter on entity without url", () => {
      const wrapper = shallowNoLifecycle(
        <DraftailEditor
          rawContentState={
            {
              entityMap: {
                1: {
                  type: "LINK",
                  data: {
                    url: "test",
                  },
                },
                2: {
                  type: "LINK",
                },
              },
              blocks: [
                {
                  text: "test",
                  entityRanges: [
                    {
                      offset: 0,
                      length: 4,
                      key: 2,
                    },
                  ],
                },
              ],
            } as unknown as RawDraftContentState
          }
        />,
      );

      expect(
        wrapper.instance().handleReturn({
          altKey: true,
        } as React.KeyboardEvent<HTMLDivElement>),
      ).toBe("handled");
    });

    it("alt + enter on entity", () => {
      const opn = jest.spyOn(window, "open");
      const wrapper = shallowNoLifecycle(
        <DraftailEditor
          rawContentState={
            {
              entityMap: {
                1: {
                  type: "LINK",
                  data: {
                    url: "test",
                  },
                },
              },
              blocks: [
                {
                  text: "test",
                  entityRanges: [
                    {
                      offset: 0,
                      length: 4,
                      key: 1,
                    },
                  ],
                },
              ],
            } as unknown as RawDraftContentState
          }
        />,
      );

      expect(
        wrapper.instance().handleReturn({
          altKey: true,
        } as React.KeyboardEvent<HTMLDivElement>),
      ).toBe("handled");
      expect(opn).toHaveBeenCalled();

      opn.mockRestore();
    });

    it("style shortcut", () => {
      const applyMarkdownStyle = jest.spyOn(DraftUtils, "applyMarkdownStyle");

      const wrapper = shallowNoLifecycle(
        <DraftailEditor
          rawContentState={{
            entityMap: {},
            blocks: [
              {
                key: "bbbb",
                text: "A *test*",
                type: "unstyled",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
              },
            ],
          }}
          inlineStyles={[{ type: INLINE_STYLE.ITALIC }]}
        />,
      );

      expect(
        wrapper
          .instance()
          .handleReturn({} as React.KeyboardEvent<HTMLDivElement>),
      ).toBe("handled");
      expect(applyMarkdownStyle).toHaveBeenCalled();

      applyMarkdownStyle.mockRestore();
    });

    it("style shortcut but selection is not collapsed", () => {
      const applyMarkdownStyle = jest.spyOn(DraftUtils, "applyMarkdownStyle");

      const wrapper = shallowNoLifecycle(
        <DraftailEditor
          rawContentState={{
            entityMap: {},
            blocks: [
              {
                key: "aaaa2",
                text: "A *test*",
                type: "unstyled",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
              },
            ],
          }}
          inlineStyles={[{ type: INLINE_STYLE.ITALIC }]}
        />,
      );

      // Monkey-patching the one method. A bit dirty.
      const selection = new SelectionState().set(
        "anchorKey",
        "aaaa2",
      ) as SelectionState;
      selection.isCollapsed = () => false;
      wrapper.setState({
        editorState: Object.assign(
          wrapper.state("editorState") as EditorState,
          {
            getSelection: () => selection,
            getCurrentInlineStyle: () => OrderedSet(),
          },
        ),
      });

      expect(
        wrapper
          .instance()
          .handleReturn({} as React.KeyboardEvent<HTMLDivElement>),
      ).toBe("not-handled");
      expect(applyMarkdownStyle).not.toHaveBeenCalled();

      applyMarkdownStyle.mockRestore();
    });
  });

  it("onFocus, onBlur", () => {
    const wrapper = shallowNoLifecycle(<DraftailEditor />);

    expect(wrapper.state("hasFocus")).toBe(false);

    wrapper.instance().onFocus();

    expect(wrapper.state("hasFocus")).toBe(true);

    wrapper.instance().onBlur();

    expect(wrapper.state("hasFocus")).toBe(false);
  });

  it("onBlur does not call onSave (#173)", () => {
    const onSave = jest.fn();
    const wrapper = shallowNoLifecycle(<DraftailEditor onSave={onSave} />);

    const contentState = convertFromRaw({
      entityMap: {},
      blocks: [{ text: "test" } as RawDraftContentBlock],
    });

    const editorState = EditorState.push(
      EditorState.createEmpty(),
      contentState,
      "insert-fragment",
    );

    wrapper.instance().onChange(editorState);

    wrapper.instance().onBlur();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("#onFocus", () => {
    const onFocus = jest.fn();
    const wrapper = shallowNoLifecycle(<DraftailEditor onFocus={onFocus} />);

    wrapper.instance().onFocus();

    expect(onFocus).toHaveBeenCalled();
  });

  it("#onBlur", () => {
    const onBlur = jest.fn();
    const wrapper = shallowNoLifecycle(<DraftailEditor onBlur={onBlur} />);

    wrapper.instance().onBlur();

    expect(onBlur).toHaveBeenCalled();
  });

  it("onTab", () => {
    const onTab = jest.spyOn(RichUtils, "onTab");

    expect(
      shallowNoLifecycle(<DraftailEditor />)
        .instance()
        .onTab({} as React.KeyboardEvent<HTMLDivElement>),
    ).toBe(true);

    expect(onTab).toHaveBeenCalled();

    onTab.mockRestore();
  });

  describe("handleKeyCommand", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    RichUtils.handleKeyCommand = jest.fn((editorState) => editorState);

    it("draftjs internal, handled", () => {
      const ret = shallowNoLifecycle(<DraftailEditor />)
        .instance()
        .handleKeyCommand("backspace");
      expect(RichUtils.handleKeyCommand).toHaveBeenCalled();
      expect(ret).toBe("handled");
    });

    it("draftjs internal, not handled", () => {
      RichUtils.handleKeyCommand = jest.fn(() => null);
      expect(
        shallowNoLifecycle(<DraftailEditor />)
          .instance()
          .handleKeyCommand("backspace"),
      ).toBe("not-handled");
    });

    it("entity type - active", () => {
      const wrapper = shallowNoLifecycle(
        <DraftailEditor
          entityTypes={[
            { type: "LINK", source: () => null, onPaste: () => "handled" },
          ]}
        />,
      ).instance();
      jest.spyOn(wrapper, "onRequestSource");
      expect(wrapper.handleKeyCommand("LINK" as DraftEditorCommand)).toBe(
        "handled",
      );
      expect(wrapper.onRequestSource).toHaveBeenCalled();
    });

    it("entity type - inactive", () => {
      const wrapper = shallowNoLifecycle(<DraftailEditor />).instance();
      jest.spyOn(wrapper, "onRequestSource");
      expect(wrapper.handleKeyCommand("LINK" as DraftEditorCommand)).toBe(
        "handled",
      );
      expect(wrapper.onRequestSource).not.toHaveBeenCalled();
    });

    it("block type - active", () => {
      const wrapper = shallowNoLifecycle(
        <DraftailEditor blockTypes={[{ type: "header-one" }]} />,
      ).instance();
      jest.spyOn(wrapper, "toggleBlockType");
      expect(wrapper.handleKeyCommand("header-one" as DraftEditorCommand)).toBe(
        "handled",
      );
      expect(wrapper.toggleBlockType).toHaveBeenCalled();
    });

    it("block type - inactive", () => {
      const wrapper = shallowNoLifecycle(<DraftailEditor />).instance();
      jest.spyOn(wrapper, "toggleBlockType");
      expect(wrapper.handleKeyCommand("header-one" as DraftEditorCommand)).toBe(
        "handled",
      );
      expect(wrapper.toggleBlockType).not.toHaveBeenCalled();
    });

    it("inline style - active", () => {
      const wrapper = shallowNoLifecycle(
        <DraftailEditor inlineStyles={[{ type: "BOLD" }]} />,
      ).instance();
      jest.spyOn(wrapper, "toggleInlineStyle");
      expect(wrapper.handleKeyCommand("BOLD" as DraftEditorCommand)).toBe(
        "handled",
      );
      expect(wrapper.toggleInlineStyle).toHaveBeenCalled();
    });

    it("inline style - inactive", () => {
      const wrapper = shallowNoLifecycle(<DraftailEditor />).instance();
      jest.spyOn(wrapper, "toggleInlineStyle");
      expect(wrapper.handleKeyCommand("BOLD" as DraftEditorCommand)).toBe(
        "handled",
      );
      expect(wrapper.toggleInlineStyle).not.toHaveBeenCalled();
    });

    it("draft-js defaults", () => {
      const wrapper = shallowNoLifecycle(<DraftailEditor />).instance();
      jest.spyOn(wrapper, "toggleInlineStyle");
      expect(wrapper.handleKeyCommand("bold")).toBe("handled");
      expect(wrapper.handleKeyCommand("italic")).toBe("handled");
      expect(wrapper.handleKeyCommand("underline")).toBe("handled");
      expect(wrapper.handleKeyCommand("code")).toBe("handled");
      expect(wrapper.toggleInlineStyle).not.toHaveBeenCalled();
    });

    describe("delete", () => {
      it("handled", () => {
        const handleDeleteAtomic = jest
          .spyOn(DraftUtils, "handleDeleteAtomic")
          .mockImplementation((e) => e);

        expect(
          shallowNoLifecycle(<DraftailEditor />)
            .instance()
            .handleKeyCommand("delete"),
        ).toBe("handled");
        expect(handleDeleteAtomic).toHaveBeenCalled();

        handleDeleteAtomic.mockRestore();
      });

      it("not handled", () => {
        const handleDeleteAtomic = jest.spyOn(DraftUtils, "handleDeleteAtomic");

        expect(
          shallowNoLifecycle(<DraftailEditor />)
            .instance()
            .handleKeyCommand("delete"),
        ).toBe("not-handled");
        expect(handleDeleteAtomic).toHaveBeenCalled();

        handleDeleteAtomic.mockRestore();
      });
    });
  });

  describe("handleBeforeInput", () => {
    let wrapper: DraftailWrapper;

    beforeEach(() => {
      wrapper = shallowNoLifecycle(<DraftailEditor enableHorizontalRule />);

      jest.spyOn(DraftUtils, "resetBlockWithType");
      jest
        .spyOn(DraftUtils, "getSelectedBlock")
        .mockImplementation(() => new ContentBlock());
      jest.spyOn(DraftUtils, "addHorizontalRuleRemovingSelection");
      jest.spyOn(DraftUtils, "applyMarkdownStyle");
      jest.spyOn(behavior, "handleBeforeInputBlockType");
      jest.spyOn(behavior, "handleBeforeInputHR");
      jest.spyOn(behavior, "handleBeforeInputInlineStyle");

      jest.spyOn(wrapper.instance(), "onChange");
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("non-collapsed selection", () => {
      // Monkey-patching the one method. A bit dirty.
      const selection = new SelectionState();
      selection.isCollapsed = () => false;
      wrapper.setState({
        editorState: Object.assign(
          wrapper.state("editorState") as EditorState,
          {
            getSelection: () => selection,
            getCurrentInlineStyle: () => OrderedSet(),
          },
        ),
      });
      expect(wrapper.instance().handleBeforeInput("a")).toBe("not-handled");
      expect(wrapper.instance().onChange).not.toHaveBeenCalled();
    });

    it("enter text", () => {
      expect(wrapper.instance().handleBeforeInput("a")).toBe("not-handled");
    });

    it("change block type", () => {
      behavior.handleBeforeInputBlockType = jest.fn(() => "header-one");
      expect(wrapper.instance().handleBeforeInput(" ")).toBe("handled");
      expect(wrapper.instance().onChange).toHaveBeenCalled();
      expect(DraftUtils.resetBlockWithType).toHaveBeenCalled();
    });

    it("enter hr", () => {
      wrapper.instance().render = () => <b>a</b>;
      behavior.handleBeforeInputHR = jest.fn(() => true);
      expect(wrapper.instance().handleBeforeInput("-")).toBe("handled");
      expect(wrapper.instance().onChange).toHaveBeenCalled();
      expect(DraftUtils.addHorizontalRuleRemovingSelection).toHaveBeenCalled();
    });

    it("change style", () => {
      wrapper.instance().render = () => <b>a</b>;
      behavior.handleBeforeInputInlineStyle = jest.fn(() => ({
        pattern: "**",
        type: "BOLD",
        start: 0,
        end: 0,
      }));
      expect(wrapper.instance().handleBeforeInput("!")).toBe("handled");
      expect(wrapper.instance().onChange).toHaveBeenCalled();
      expect(DraftUtils.applyMarkdownStyle).toHaveBeenCalled();
    });
  });

  describe("handlePastedText", () => {
    it("default handling", () => {
      const wrapper = typedMount(<DraftailEditor stripPastedStyles={false} />);

      expect(
        wrapper
          .instance()
          .handlePastedText(
            "this is plain text paste",
            "this is plain text paste",
            wrapper.state("editorState") as EditorState,
          ),
      ).toBe("not-handled");
    });

    it("stripPastedStyles", () => {
      const wrapper = typedMount(<DraftailEditor stripPastedStyles />);

      expect(
        wrapper
          .instance()
          .handlePastedText(
            "bold",
            "<p><strong>bold</strong></p>",
            wrapper.state("editorState") as EditorState,
          ),
      ).toBe("not-handled");
    });

    it("handled by handleDraftEditorPastedText", () => {
      const wrapper = typedMount(<DraftailEditor stripPastedStyles={false} />);
      const text = "hello,\nworld!";
      const content = {
        blocks: [
          {
            data: {},
            depth: 0,
            entityRanges: [],
            inlineStyleRanges: [],
            key: "a",
            text,
            type: "unstyled",
          },
        ],
        entityMap: {},
      } as RawDraftContentState;
      const html = `<div data-draftjs-conductor-fragment='${JSON.stringify(
        content,
      )}'><p>${text}</p></div>`;

      expect(
        wrapper
          .instance()
          .handlePastedText(
            text,
            html,
            wrapper.state("editorState") as EditorState,
          ),
      ).toBe("handled");
    });

    it("entities onPaste not-handled", () => {
      const onPaste = jest.fn(() => "not-handled" as const);
      const wrapper = typedMount(
        <DraftailEditor
          entityTypes={[
            { type: ENTITY_TYPE.LINK, onPaste, source: () => <b>a</b> },
          ]}
        />,
      );

      expect(
        wrapper
          .instance()
          .handlePastedText(
            "https://www.example.com/",
            "https://www.example.com/",
            wrapper.state("editorState") as EditorState,
          ),
      ).toBe("not-handled");
    });

    it("entities onPaste handled", () => {
      const onPaste = jest.fn(() => "handled" as const);
      const wrapper = typedMount(
        <DraftailEditor
          entityTypes={[
            { type: ENTITY_TYPE.LINK, onPaste, source: () => <b>a</b> },
          ]}
        />,
      );

      expect(
        wrapper
          .instance()
          .handlePastedText(
            "https://www.example.com/",
            "https://www.example.com/",
            wrapper.state("editorState") as EditorState,
          ),
      ).toBe("handled");
    });

    it("entities onPaste handled trumps stripPastedStyles", () => {
      const onPaste = jest.fn(() => "handled" as const);
      const wrapper = typedMount(
        <DraftailEditor
          entityTypes={[
            { type: ENTITY_TYPE.LINK, onPaste, source: () => <b>a</b> },
          ]}
          stripPastedStyles
        />,
      );

      expect(
        wrapper
          .instance()
          .handlePastedText(
            "https://www.example.com/",
            "https://www.example.com/",
            wrapper.state("editorState") as EditorState,
          ),
      ).toBe("handled");
    });
  });

  describe("toggleBlockType", () => {
    let wrapper: DraftailWrapper;
    let toggleBlockType: jest.SpyInstance;

    beforeEach(() => {
      wrapper = shallowNoLifecycle(<DraftailEditor />);

      toggleBlockType = jest.spyOn(RichUtils, "toggleBlockType");
      jest.spyOn(wrapper.instance(), "onChange");
    });

    afterEach(() => {
      toggleBlockType.mockRestore();
    });

    it("works", () => {
      wrapper.instance().toggleBlockType("header-one");

      expect(toggleBlockType).toHaveBeenCalled();
      expect(wrapper.instance().onChange).toHaveBeenCalled();
    });
  });

  describe("toggleInlineStyle", () => {
    let wrapper: DraftailWrapper;
    let toggleInlineStyle: jest.SpyInstance;

    beforeEach(() => {
      wrapper = shallowNoLifecycle(<DraftailEditor />);

      toggleInlineStyle = jest.spyOn(RichUtils, "toggleInlineStyle");
      jest.spyOn(wrapper.instance(), "onChange");
    });

    afterEach(() => {
      toggleInlineStyle.mockRestore();
    });

    it("works", () => {
      wrapper.instance().toggleInlineStyle("BOLD");

      expect(toggleInlineStyle).toHaveBeenCalled();
      expect(wrapper.instance().onChange).toHaveBeenCalled();
    });
  });

  describe("onEditEntity", () => {
    const rawContentState = {
      entityMap: {
        1: {
          type: "LINK",
          mutability: "IMMUTABLE",
          data: {
            url: "test",
          },
        },
      },
      blocks: [
        {
          key: "b3kdk",
          text: "test",
          type: "unstyled",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [
            {
              offset: 0,
              length: 4,
              key: 1,
            },
          ],
          data: {},
        },
      ],
    } as RawDraftContentState;
    let getEntitySelection: jest.SpyInstance;

    beforeEach(() => {
      getEntitySelection = jest
        .spyOn(DraftUtils, "getEntitySelection")
        .mockImplementation((editorState) => editorState.getSelection());
    });

    afterEach(() => {
      getEntitySelection.mockRestore();
    });

    it("works", () => {
      const wrapper = shallowNoLifecycle(
        <DraftailEditor
          rawContentState={rawContentState}
          entityTypes={[
            {
              type: ENTITY_TYPE.LINK,
              source: () => <b>a</b>,
            },
          ]}
        />,
      );
      jest.spyOn(wrapper.instance(), "toggleSource");

      wrapper.instance().onEditEntity("1");

      expect(getEntitySelection).toHaveBeenCalled();
      expect(wrapper.instance().toggleSource).toHaveBeenCalled();
    });

    it("block", () => {
      const wrapper = shallowNoLifecycle(
        <DraftailEditor
          rawContentState={rawContentState}
          entityTypes={[
            {
              type: ENTITY_TYPE.LINK,
              source: () => <b>a</b>,
              block: () => <b>a</b>,
            },
          ]}
        />,
      );
      jest.spyOn(wrapper.instance(), "toggleSource");

      wrapper.instance().onEditEntity("1");

      expect(getEntitySelection).not.toHaveBeenCalled();
      expect(wrapper.instance().toggleSource).toHaveBeenCalled();
    });
  });

  describe("onRemoveEntity", () => {
    const rawContentState = {
      entityMap: {
        1: {
          type: "LINK",
          mutability: "IMMUTABLE" as DraftEntityMutability,
          data: {
            url: "test",
          },
        },
      },
      blocks: [
        {
          key: "b3kdk",
          text: "test",
          type: "unstyled",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [
            {
              offset: 0,
              length: 4,
              key: 1,
            },
          ],
          data: {},
        },
      ],
    };

    let toggleLink: jest.SpyInstance;
    let getEntitySelection: jest.SpyInstance;

    beforeEach(() => {
      EditorState.push = jest.fn((e) => e);
      toggleLink = jest.spyOn(RichUtils, "toggleLink");
      getEntitySelection = jest
        .spyOn(DraftUtils, "getEntitySelection")
        .mockImplementation((editorState) => editorState.getSelection());
      DraftUtils.getEntitySelection = jest.fn();
      DraftUtils.removeBlockEntity = jest.fn();
    });

    afterEach(() => {
      toggleLink.mockRestore();
      getEntitySelection.mockRestore();
    });

    it.skip("works", () => {
      const wrapper = shallowNoLifecycle(
        <DraftailEditor
          rawContentState={rawContentState}
          entityTypes={[
            {
              type: ENTITY_TYPE.LINK,
              source: () => <div>Test</div>,
            },
          ]}
        />,
      );

      wrapper.instance().onChange = jest.fn();
      wrapper.instance().onRemoveEntity("1");

      expect(toggleLink).toHaveBeenCalled();
      expect(EditorState.push).not.toHaveBeenCalled();
      expect(wrapper.instance().onChange).toHaveBeenCalled();
    });

    it("block", () => {
      const wrapper = shallowNoLifecycle(
        <DraftailEditor
          rawContentState={rawContentState}
          entityTypes={[
            {
              type: ENTITY_TYPE.LINK,
              source: () => <b>a</b>,
              block: () => <b>a</b>,
            },
          ]}
        />,
      );

      wrapper.instance().onChange = jest.fn();
      wrapper.instance().onRemoveEntity("1", "b3kdk");

      expect(RichUtils.toggleLink).not.toHaveBeenCalled();
      expect(DraftUtils.removeBlockEntity).toHaveBeenCalled();
      expect(wrapper.instance().onChange).toHaveBeenCalled();
    });
  });

  describe("addHR", () => {
    let wrapper: DraftailWrapper;
    let addHR: jest.SpyInstance;

    beforeEach(() => {
      wrapper = shallowNoLifecycle(<DraftailEditor />);

      addHR = jest.spyOn(DraftUtils, "addHorizontalRuleRemovingSelection");
      jest.spyOn(wrapper.instance(), "onChange");
    });

    afterEach(() => {
      addHR.mockRestore();
    });

    it("works", () => {
      wrapper.instance().addHR();

      expect(addHR).toHaveBeenCalled();
      expect(wrapper.instance().onChange).toHaveBeenCalled();
    });
  });

  describe("addBR", () => {
    let wrapper: DraftailWrapper;
    let addBR: jest.SpyInstance;

    beforeEach(() => {
      wrapper = shallowNoLifecycle(<DraftailEditor />);

      addBR = jest.spyOn(DraftUtils, "addLineBreak");
      jest.spyOn(wrapper.instance(), "onChange");
    });

    afterEach(() => {
      addBR.mockRestore();
    });

    it("works", () => {
      wrapper.instance().addBR();

      expect(addBR).toHaveBeenCalled();
      expect(wrapper.instance().onChange).toHaveBeenCalled();
    });
  });

  describe("onUndoRedo", () => {
    let wrapper: DraftailWrapper;
    let undo: jest.SpyInstance;
    let redo: jest.SpyInstance;

    beforeEach(() => {
      undo = jest.spyOn(EditorState, "undo");
      redo = jest.spyOn(EditorState, "redo");

      wrapper = shallowNoLifecycle(<DraftailEditor />);
      jest.spyOn(wrapper.instance(), "onChange");
    });

    afterEach(() => {
      undo.mockRestore();
      redo.mockRestore();
    });

    it("undo", () => {
      wrapper.instance().onUndoRedo("undo");

      expect(undo).toHaveBeenCalled();
      expect(wrapper.instance().onChange).toHaveBeenCalled();
    });

    it("redo", () => {
      wrapper.instance().onUndoRedo("redo");

      expect(redo).toHaveBeenCalled();
      expect(wrapper.instance().onChange).toHaveBeenCalled();
    });

    it("invalid", () => {
      wrapper.instance().onUndoRedo("invalid");

      expect(EditorState.undo).not.toHaveBeenCalled();
      expect(EditorState.redo).not.toHaveBeenCalled();
      expect(wrapper.instance().onChange).toHaveBeenCalled();
    });
  });

  describe("blockRenderer", () => {
    it("default", () => {
      const rawContentState = {
        entityMap: {},
        blocks: [
          {
            text: " ",
            type: "unstyled",
          },
        ],
      } as RawDraftContentState;
      expect(
        shallowNoLifecycle(<DraftailEditor rawContentState={rawContentState} />)
          .instance()
          .blockRenderer(convertFromRaw(rawContentState).getFirstBlock()),
      ).toBe(null);
    });

    it("atomic", () => {
      const rawContentState = {
        entityMap: {
          0: {
            type: "IMAGE",
          },
        },
        blocks: [
          {
            text: " ",
            type: "atomic",
            entityRanges: [
              {
                offset: 0,
                length: 1,
                key: 0,
              },
            ],
          },
        ],
      } as unknown as RawDraftContentState;
      const wrapper = shallowNoLifecycle(
        <DraftailEditor
          rawContentState={rawContentState}
          entityTypes={[
            {
              type: "IMAGE",
              source: () => <b>a</b>,
              block: () => <b>a</b>,
            },
          ]}
        />,
      );

      const contentState = convertFromRaw(rawContentState);

      expect(
        wrapper.instance().blockRenderer(contentState.getFirstBlock()),
      ).toMatchObject({
        props: {
          entityType: { type: "IMAGE" },
        },
      });
    });

    it("HORIZONTAL_RULE", () => {
      const rawContentState = {
        entityMap: {
          0: {
            type: "HORIZONTAL_RULE",
          },
        },
        blocks: [
          {
            text: " ",
            type: "atomic",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [
              {
                offset: 0,
                length: 1,
                key: 0,
              },
            ],
          },
        ],
      } as unknown as RawDraftContentState;
      const wrapper = shallowNoLifecycle(
        <DraftailEditor rawContentState={rawContentState} />,
      );

      const contentState = convertFromRaw(rawContentState);

      expect(
        wrapper.instance().blockRenderer(contentState.getFirstBlock()),
      ).toMatchObject({
        component: DividerBlock,
      });
    });

    it("atomic missing entity", () => {
      const rawContentState = {
        entityMap: {},
        blocks: [
          {
            text: " ",
            type: "atomic",
          },
        ],
      } as RawDraftContentState;
      const wrapper = shallowNoLifecycle(
        <DraftailEditor rawContentState={rawContentState} />,
      );

      const contentState = convertFromRaw(rawContentState);

      expect(
        wrapper.instance().blockRenderer(contentState.getFirstBlock()),
      ).toEqual({
        editable: false,
      });
    });
  });

  describe("source", () => {
    describe("onRequestSource", () => {
      it("empty", () => {
        const wrapper = shallowNoLifecycle(<DraftailEditor />);

        wrapper.instance().onRequestSource("LINK");

        expect(wrapper.state()).toMatchObject({
          readOnlyState: true,
          sourceOptions: {
            entityType: undefined,
          },
        });
      });

      it("with sourceOptions", () => {
        const source = () => <blockquote />;
        const wrapper = shallowNoLifecycle(
          <DraftailEditor
            entityTypes={[{ type: "LINK", source, onPaste: () => "handled" }]}
          />,
        );

        wrapper.instance().onRequestSource("LINK");

        expect(wrapper.state()).toMatchObject({
          readOnlyState: true,
          sourceOptions: {
            entityType: {
              type: "LINK",
              source,
            },
          },
        });
      });

      it("with entity", () => {
        const source = () => <blockquote />;
        const wrapper = shallowNoLifecycle(
          <DraftailEditor
            entityTypes={[{ type: "LINK", source, onPaste: () => "handled" }]}
            rawContentState={{
              entityMap: {
                0: {
                  type: "LINK",
                  mutability: "MUTABLE",
                  data: {
                    href: "example.com",
                  },
                },
              },
              blocks: [
                {
                  key: "b3kdk",
                  text: "test",
                  type: "unstyled",
                  depth: 0,
                  inlineStyleRanges: [],
                  entityRanges: [
                    {
                      offset: 0,
                      length: 4,
                      key: 0,
                    },
                  ],
                  data: {},
                },
              ],
            }}
          />,
        );

        wrapper.instance().onRequestSource("LINK");

        expect(wrapper.state()).toMatchObject({
          readOnlyState: true,
          sourceOptions: {
            entityType: {
              type: "LINK",
              source,
            },
          },
        });
      });
    });

    describe("onCompleteSource", () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });

      it.skip("empty", () => {
        const wrapper = typedMount(<DraftailEditor />);

        wrapper.instance().onCompleteSource(EditorState.createEmpty());

        expect(wrapper.state("sourceOptions")).toBe(null);
        jest.runOnlyPendingTimers();
        expect(wrapper.state("readOnlyState")).toBe(false);

        const focus = jest.fn();
        const instance = wrapper.instance();
        if (instance.editorRef) {
          instance.editorRef.focus = focus;
        }
        jest.runOnlyPendingTimers();
        expect(focus).toHaveBeenCalled();
      });

      it("works", () => {
        const wrapper = shallowNoLifecycle(<DraftailEditor />);

        wrapper
          .instance()
          .onCompleteSource(wrapper.state("editorState") as EditorState);

        expect(wrapper.state("hasFocus")).toBe(false);
      });
    });
  });

  describe("onCloseSource", () => {
    it("works", () => {
      const wrapper = shallowNoLifecycle(<DraftailEditor />);

      wrapper.instance().toggleSource("TEST");
      wrapper.instance().onCloseSource();

      expect(wrapper.state("sourceOptions")).toBe(null);
      expect(wrapper.state("readOnlyState")).toBe(false);
    });
  });

  describe("#focus", () => {
    it("works", () => {
      const wrapper = typedMount(<DraftailEditor />);
      const focus = jest.fn();
      const instance = wrapper.instance();
      if (instance.editorRef) {
        instance.editorRef.focus = focus;
      }

      wrapper.instance().focus();

      expect(focus).toHaveBeenCalled();
    });
  });

  describe("#plugins", () => {
    it("forwards to draft-js-plugins-editor", () => {
      const plugins = [{ test: true }];
      const pluginsProp = shallowNoLifecycle(
        <DraftailEditor plugins={plugins} />,
      )
        .find(Editor)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .prop("plugins") as any[];
      expect(pluginsProp.slice(0, -1)).toEqual([{ test: true }]);
    });

    it("contains keyBindingFn for default behaviour", () => {
      const getBinding = jest.spyOn(behavior, "getKeyBindingFn");
      const plugins = shallowNoLifecycle(<DraftailEditor />)
        .find(Editor)
        .prop("plugins");
      expect(getBinding).toHaveBeenCalled();
      const keyBindingFn = getBinding.mock.results[0].value;
      expect(plugins).toEqual([{ keyBindingFn }]);
    });

    it("passes plugin keyBindingFns to Draft-JS", () => {
      const pluginBinding = jest.fn();
      const keyBindingFn = shallowNoLifecycle(
        <DraftailEditor plugins={[{ keyBindingFn: pluginBinding }]} />,
      )
        .find(Editor)
        .dive()
        .prop("keyBindingFn") as (e: KeyboardEvent) => void;
      keyBindingFn(new KeyboardEvent("keydown", { key: "e" }));
      expect(pluginBinding).toHaveBeenCalled();
    });
  });
});
