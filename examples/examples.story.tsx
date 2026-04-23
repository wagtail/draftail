import { storiesOf } from "@storybook/react";
import React, { useState } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import createHashtagPlugin from "draft-js-hashtag-plugin";
import {
  createEditorStateFromRaw,
  serialiseEditorStateToRaw,
} from "draftjs-conductor";

import { EditorState, RawDraftContentState } from "draft-js";
import {
  INLINE_CONTROL,
  BLOCK_CONTROL,
  ENTITY_CONTROL,
  BR_ICON,
  UNDO_ICON,
  REDO_ICON,
  TINY_TEXT_BLOCK,
  REDACTED_STYLE,
} from "./constants/ui";

import linkifyPlugin from "./plugins/linkifyPlugin";
import autoEmbedPlugin from "./plugins/autoEmbedPlugin";

import EditorWrapper from "./components/EditorWrapper";
import PrismDecorator from "./components/PrismDecorator";
import ReadingTime from "./components/ReadingTime";
import customContentState from "./constants/customContentState";
import allContentState from "./constants/allContentState";
import ColorPicker, { getColorInlineStyles } from "./components/ColorPicker";
import CharCount from "./components/CharCount";
import {
  BlockToolbar,
  DraftUtils,
  ENTITY_TYPE,
  InlineToolbar,
  MetaToolbar,
  TableWrapper,
} from "../src";
import indexContentState from "./constants/indexContentState";
import tableContentState from "./constants/tableContentState";

const hashtagPlugin = createHashtagPlugin();
const linkify = linkifyPlugin();
const autoEmbed = autoEmbedPlugin();

storiesOf("Examples", module)
  // Add a decorator rendering story as a component for hooks support.
  .addDecorator((Story) => <Story />)
  .add("Wagtail features", () => (
    <main>
      <p id="wagtail-editor">
        This editor demonstrates rich text features available in Wagtail.
      </p>
      <EditorWrapper
        id="wagtail"
        rawContentState={indexContentState as RawDraftContentState}
        ariaDescribedBy="wagtail-editor"
        placeholder="Write here or type ‘/’ to insert a block in this field"
        // Makes it easier to write automated tests retrieving the content.
        stateSaveInterval={50}
        enableHorizontalRule
        enableLineBreak
        stripPastedStyles={false}
        maxListNesting={6}
        spellCheck
        entityTypes={[
          ENTITY_CONTROL.IMAGE,
          ENTITY_CONTROL.EMBED,
          ENTITY_CONTROL.LINK,
          ENTITY_CONTROL.DOCUMENT,
        ]}
        blockTypes={[
          BLOCK_CONTROL.HEADER_TWO,
          BLOCK_CONTROL.HEADER_THREE,
          BLOCK_CONTROL.HEADER_FOUR,
          BLOCK_CONTROL.HEADER_FIVE,
          BLOCK_CONTROL.UNORDERED_LIST_ITEM,
          BLOCK_CONTROL.ORDERED_LIST_ITEM,
        ]}
        inlineStyles={[INLINE_CONTROL.BOLD, INLINE_CONTROL.ITALIC]}
        controls={[
          {
            meta: CharCount,
          },
        ]}
        topToolbar={(props) => (
          <>
            <InlineToolbar {...props} />
            <BlockToolbar {...props} />
          </>
        )}
        bottomToolbar={MetaToolbar}
        commands={[
          {
            label: "Rich text",
            type: "blockTypes",
          },
          {
            label: null,
            type: "entityTypes",
          },
          {
            label: null,
            type: "hr",
            items: [
              {
                type: ENTITY_TYPE.HORIZONTAL_RULE,
              },
            ],
          },
          {
            label: "Blocks",
            type: "streamfield",
            items: [
              {
                description: "Heading",
                type: "heading",
                onSelect: ({ editorState }: { editorState: EditorState }) => {
                  const block = DraftUtils.getSelectedBlock(editorState);
                  return DraftUtils.resetBlockWithType(
                    editorState,
                    block.getType(),
                    "😄 test",
                  );
                },
              },
              {
                description: "Paragraph",
                type: "paragraph",
                onSelect: ({ editorState }: { editorState: EditorState }) => {
                  const block = DraftUtils.getSelectedBlock(editorState);
                  return DraftUtils.resetBlockWithType(
                    editorState,
                    block.getType(),
                    "😄 test",
                  );
                },
              },
              {
                description: "Image",
                type: "image",
                onSelect: ({ editorState }: { editorState: EditorState }) => {
                  const block = DraftUtils.getSelectedBlock(editorState);
                  return DraftUtils.resetBlockWithType(
                    editorState,
                    block.getType(),
                    "😄 test",
                  );
                },
              },
              {
                description: "Blockquote",
                type: "blockquote",
                onSelect: ({ editorState }: { editorState: EditorState }) => {
                  const block = DraftUtils.getSelectedBlock(editorState);
                  return DraftUtils.resetBlockWithType(
                    editorState,
                    block.getType(),
                    "😄 test",
                  );
                },
              },
              {
                description: "Embed",
                type: "embed",
                onSelect: ({ editorState }: { editorState: EditorState }) => {
                  const block = DraftUtils.getSelectedBlock(editorState);
                  return DraftUtils.resetBlockWithType(
                    editorState,
                    block.getType(),
                    "😄 test",
                  );
                },
              },
            ],
          },
          {
            label: "Actions",
            type: "custom-actions",
            items: [
              {
                label: "✂",
                description: "Split",
                onSelect: ({ editorState }: { editorState: EditorState }) => {
                  const block = DraftUtils.getSelectedBlock(editorState);
                  return DraftUtils.resetBlockWithType(
                    editorState,
                    block.getType(),
                    "✂",
                  );
                },
              },
            ],
          },
        ]}
      />
    </main>
  ))
  .add("Multiple editors", () => (
    <main>
      <EditorWrapper
        id="multi-one"
        rawContentState={indexContentState as RawDraftContentState}
        placeholder="Write here or type ‘/’ to insert a block in this field"
        // Makes it easier to write automated tests retrieving the content.
        stateSaveInterval={50}
        enableHorizontalRule
        enableLineBreak
        stripPastedStyles={false}
        maxListNesting={6}
        spellCheck
        entityTypes={[
          ENTITY_CONTROL.IMAGE,
          ENTITY_CONTROL.EMBED,
          ENTITY_CONTROL.LINK,
          ENTITY_CONTROL.DOCUMENT,
        ]}
        blockTypes={[
          BLOCK_CONTROL.HEADER_TWO,
          BLOCK_CONTROL.HEADER_THREE,
          BLOCK_CONTROL.HEADER_FOUR,
          BLOCK_CONTROL.HEADER_FIVE,
          BLOCK_CONTROL.UNORDERED_LIST_ITEM,
          BLOCK_CONTROL.ORDERED_LIST_ITEM,
        ]}
        inlineStyles={[INLINE_CONTROL.BOLD, INLINE_CONTROL.ITALIC]}
        controls={[
          {
            meta: CharCount,
          },
        ]}
        topToolbar={(props) => (
          <>
            <InlineToolbar {...props} />
            <BlockToolbar {...props} />
          </>
        )}
        bottomToolbar={MetaToolbar}
        commands
      />
      <EditorWrapper
        id="multi-two"
        rawContentState={indexContentState as RawDraftContentState}
        placeholder="Write here or type ‘/’ to insert a block in this field"
        // Makes it easier to write automated tests retrieving the content.
        stateSaveInterval={50}
        enableHorizontalRule
        enableLineBreak
        stripPastedStyles={false}
        maxListNesting={6}
        spellCheck
        entityTypes={[
          ENTITY_CONTROL.IMAGE,
          ENTITY_CONTROL.EMBED,
          ENTITY_CONTROL.LINK,
          ENTITY_CONTROL.DOCUMENT,
        ]}
        blockTypes={[
          BLOCK_CONTROL.HEADER_TWO,
          BLOCK_CONTROL.HEADER_THREE,
          BLOCK_CONTROL.HEADER_FOUR,
          BLOCK_CONTROL.HEADER_FIVE,
          BLOCK_CONTROL.UNORDERED_LIST_ITEM,
          BLOCK_CONTROL.ORDERED_LIST_ITEM,
        ]}
        inlineStyles={[INLINE_CONTROL.BOLD, INLINE_CONTROL.ITALIC]}
        controls={[
          {
            meta: CharCount,
          },
        ]}
        topToolbar={(props) => (
          <>
            <InlineToolbar {...props} />
            <BlockToolbar {...props} />
          </>
        )}
        bottomToolbar={MetaToolbar}
        commands
      />
      <EditorWrapper
        id="multi-three"
        rawContentState={indexContentState as RawDraftContentState}
        placeholder="Write here or type ‘/’ to insert a block in this field"
        // Makes it easier to write automated tests retrieving the content.
        stateSaveInterval={50}
        enableHorizontalRule
        enableLineBreak
        stripPastedStyles={false}
        maxListNesting={6}
        spellCheck
        entityTypes={[
          ENTITY_CONTROL.IMAGE,
          ENTITY_CONTROL.EMBED,
          ENTITY_CONTROL.LINK,
          ENTITY_CONTROL.DOCUMENT,
        ]}
        blockTypes={[
          BLOCK_CONTROL.HEADER_TWO,
          BLOCK_CONTROL.HEADER_THREE,
          BLOCK_CONTROL.HEADER_FOUR,
          BLOCK_CONTROL.HEADER_FIVE,
          BLOCK_CONTROL.UNORDERED_LIST_ITEM,
          BLOCK_CONTROL.ORDERED_LIST_ITEM,
        ]}
        inlineStyles={[INLINE_CONTROL.BOLD, INLINE_CONTROL.ITALIC]}
        controls={[
          {
            meta: CharCount,
          },
        ]}
        topToolbar={(props) => (
          <>
            <InlineToolbar {...props} />
            <BlockToolbar {...props} />
          </>
        )}
        bottomToolbar={MetaToolbar}
        commands
      />
    </main>
  ))
  .add("Custom formats", () => {
    const [editorState, setEditorState] = useState(
      createEditorStateFromRaw(customContentState as RawDraftContentState),
    );
    const [colorStyles, setColorStyles] = useState(
      getColorInlineStyles(customContentState as RawDraftContentState),
    );
    const onChange = (state: EditorState) => {
      const raw = serialiseEditorStateToRaw(state);
      setColorStyles(raw ? getColorInlineStyles(raw) : []);
      setEditorState(state);
    };

    return (
      <EditorWrapper
        id="custom"
        ariaDescribedBy="custom-editor"
        editorState={editorState}
        onChange={onChange}
        stripPastedStyles={false}
        spellCheck
        blockTypes={[
          BLOCK_CONTROL.HEADER_TWO,
          BLOCK_CONTROL.CODE,
          TINY_TEXT_BLOCK,
        ]}
        inlineStyles={[
          {
            style: {
              fontWeight: "bold",
              textShadow: "1px 1px 1px black",
            },
            ...INLINE_CONTROL.BOLD,
          },
          REDACTED_STYLE,
          ...colorStyles.map((s) => ({
            type: s,
            style: {
              color: s.replace("COLOR_", "#"),
            },
          })),
        ]}
        entityTypes={[ENTITY_CONTROL.EMBED, ENTITY_CONTROL.DOCUMENT]}
        decorators={[new PrismDecorator({ defaultLanguage: "css" })]}
        controls={[{ meta: ReadingTime }, { inline: ColorPicker }]}
        plugins={[hashtagPlugin]}
      />
    );
  })
  .add("All built-in formats", () => (
    <EditorWrapper
      id="all"
      ariaDescribedBy="all-editor"
      rawContentState={allContentState as RawDraftContentState}
      stripPastedStyles={false}
      enableHorizontalRule={{
        description: "Horizontal rule",
      }}
      enableLineBreak={{
        description: "Soft line break",
        icon: BR_ICON,
      }}
      showUndoControl={{
        description: "Undo last change",
        icon: UNDO_ICON,
      }}
      showRedoControl={{
        description: "Redo last change",
        icon: REDO_ICON,
      }}
      maxListNesting={6}
      blockTypes={Object.values(BLOCK_CONTROL)}
      inlineStyles={Object.values(INLINE_CONTROL)}
      entityTypes={[ENTITY_CONTROL.IMAGE, ENTITY_CONTROL.LINK]}
      commands
    />
  ))
  .add("Content awareness", () => (
    <EditorWrapper
      id="content-awareness"
      stripPastedStyles={false}
      rawContentState={
        {
          entityMap: {},
          blocks: [
            {
              key: "aaa",
              text: "Paste YouTube or Twitter links! Instantly create links on text, and insert embed blocks",
            },
          ],
        } as RawDraftContentState
      }
      inlineStyles={[INLINE_CONTROL.BOLD, INLINE_CONTROL.ITALIC]}
      blockTypes={[
        BLOCK_CONTROL.HEADER_TWO,
        BLOCK_CONTROL.UNORDERED_LIST_ITEM,
        BLOCK_CONTROL.BLOCKQUOTE,
      ]}
      entityTypes={[ENTITY_CONTROL.LINK, ENTITY_CONTROL.EMBED]}
      enableHorizontalRule
      commands
      plugins={[autoEmbed, linkify]}
    />
  ))
  .add("Table support", () => {
    const [editorState, setEditorState] = useState(() =>
      createEditorStateFromRaw(tableContentState as RawDraftContentState),
    );
    const editorStateRef = React.useRef(editorState);
    editorStateRef.current = editorState;

    return (
      <EditorWrapper
        id="table-support"
        editorState={editorState}
        onChange={setEditorState}
        stripPastedStyles={false}
        inlineStyles={[INLINE_CONTROL.BOLD, INLINE_CONTROL.ITALIC]}
        blockTypes={[
          BLOCK_CONTROL.HEADER_TWO,
          BLOCK_CONTROL.UNORDERED_LIST_ITEM,
          {
            type: "table-cell",
            wrapper: (
              <TableWrapper
                getEditorState={() => editorStateRef.current}
                onChange={setEditorState}
              />
            ),
          },
        ]}
      />
    );
  });
