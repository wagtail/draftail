import {
  EditorState,
  ContentState,
  ContentBlock,
  Modifier,
  AtomicBlockUtils,
  RichUtils,
  SelectionState,
} from "draft-js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import isSoftNewlineEvent from "draft-js/lib/isSoftNewlineEvent";

import { BLOCK_TYPE, ENTITY_TYPE } from "./constants";

/**
 * Inspired by draftjs-utils, with our custom functions.
 *
 * DraftUtils functions are utility helpers useful in isolation, specific to the Draft.js API,
 * without ties to Draftail's specific behavior or other APIs.
 */
export default {
  /**
   * Returns the first selected block.
   */
  getSelectedBlock(editorState: EditorState) {
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();

    return content.getBlockMap().get(selection.getStartKey());
  },

  /**
   * Returns the entity applicable to whole of current selection.
   * An entity can not span multiple blocks.
   * https://github.com/jpuri/draftjs-utils/blob/e81c0ae19c3b0fdef7e0c1b70d924398956be126/js/inline.js#L75
   */
  getSelectionEntity(editorState: EditorState) {
    let entity;
    const selection = editorState.getSelection();
    let start = selection.getStartOffset();
    let end = selection.getEndOffset();

    if (start === end && start === 0) {
      end = 1;
    } else if (start === end) {
      start -= 1;
    }

    const block = this.getSelectedBlock(editorState);

    for (let i = start; i < end; i += 1) {
      const currentEntity = block.getEntityAt(i);

      if (!currentEntity) {
        entity = undefined;
        break;
      }

      if (i === start) {
        entity = currentEntity;
      } else if (entity !== currentEntity) {
        entity = undefined;
        break;
      }
    }

    return entity;
  },

  /**
   * Creates a selection on a given entity in the currently selected block.
   * Returns the current selection if no entity key is provided, or if the entity could not be found.
   */
  getEntitySelection(editorState: EditorState, entityKey?: string) {
    const selection = editorState.getSelection();

    if (!entityKey) {
      return selection;
    }

    const block = this.getSelectedBlock(editorState);
    let entityRange;
    // https://github.com/jpuri/draftjs-utils/blob/e81c0ae19c3b0fdef7e0c1b70d924398956be126/js/inline.js#L111
    block.findEntityRanges(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      (value) => value.get("entity") === entityKey,
      (start, end) => {
        entityRange = {
          start,
          end,
        };
      },
    );

    if (!entityRange) {
      return selection;
    }

    return selection.merge({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      anchorOffset: selection.isBackward ? entityRange.end : entityRange.start,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      focusOffset: selection.isBackward ? entityRange.start : entityRange.end,
    });
  },

  /**
   * Updates a given atomic block's entity, merging new data with the old one.
   */
  updateBlockEntity(
    editorState: EditorState,
    block: ContentBlock,
    data: { [key: string]: unknown },
  ) {
    const content = editorState.getCurrentContent();
    let nextContent = content.mergeEntityData(block.getEntityAt(0), data);

    // To remove in Draft.js 0.11.
    // This is necessary because entity data is still using a mutable, global store.
    nextContent = Modifier.mergeBlockData(
      nextContent,
      new SelectionState({
        anchorKey: block.getKey(),
        anchorOffset: 0,
        focusKey: block.getKey(),
        focusOffset: block.getLength(),
      }),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      {},
    );

    return EditorState.push(editorState, nextContent, "apply-entity");
  },

  /**
   * Inserts a horizontal rule in the place of the current selection.
   * Returns updated EditorState.
   * Inspired by DraftUtils.addLineBreakRemovingSelection.
   */
  addHorizontalRuleRemovingSelection(editorState: EditorState) {
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      ENTITY_TYPE.HORIZONTAL_RULE,
      "IMMUTABLE",
      {},
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

    return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, " ");
  },

  /**
   * Changes a block type to be `newType`, setting its new text.
   * Also removes the required characters from the characterList,
   * and resets block data.
   */
  resetBlockWithType(
    editorState: EditorState,
    newType?: string,
    newText = "",
    newData: { [key: string]: unknown } = {},
  ) {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const key = selectionState.getStartKey();
    const blockMap = contentState.getBlockMap();
    const block = blockMap.get(key);

    // Maintain persistence in the list while removing chars from the start.
    // https://github.com/facebook/draft-js/blob/788595984da7c1e00d1071ea82b063ff87140be4/src/model/transaction/removeRangeFromContentState.js#L333
    let chars = block.getCharacterList();
    let startOffset = 0;
    const sliceOffset = block.getText().length - newText.length;

    while (startOffset < sliceOffset) {
      chars = chars.shift();
      startOffset += 1;
    }

    const newBlock = block.merge({
      type: newType || block.getType(),
      text: newText,
      characterList: chars,
      data: newData,
    }) as ContentBlock;
    const newContentState = contentState.merge({
      blockMap: blockMap.set(key, newBlock),
    }) as ContentState;
    const newSelectionState = selectionState.merge({
      anchorOffset: 0,
      focusOffset: 0,
    });

    return EditorState.acceptSelection(
      EditorState.push(editorState, newContentState, "change-block-type"),
      newSelectionState,
    );
  },

  /**
   * Applies an inline style on a given range, based on a Markdown shortcut,
   * removing the Markdown markers.
   * Supports adding styles on existing styles, and entities.
   */
  applyMarkdownStyle(
    editorState: EditorState,
    range: {
      pattern: string;
      start: number;
      end: number;
      type: string;
    },
    char: string,
  ) {
    const selection = editorState.getSelection();
    let content = editorState.getCurrentContent();

    const marked = selection.merge({
      anchorOffset: range.start,
      focusOffset: range.end,
    });
    const endMarker = selection.merge({
      anchorOffset: range.end - range.pattern.length,
      focusOffset: range.end,
    });
    const startMarker = selection.merge({
      anchorOffset: range.start,
      focusOffset: range.start + range.pattern.length,
    });

    // Remove the markers separately to preserve existing styles and entities on the marked text.
    content = Modifier.applyInlineStyle(content, marked, range.type);
    content = Modifier.removeRange(content, endMarker, "forward");
    content = Modifier.removeRange(content, startMarker, "forward");

    const offset = selection.getFocusOffset() - range.pattern.length * 2;
    const endSelection = selection.merge({
      anchorOffset: offset,
      focusOffset: offset,
    });
    content = content.merge({ selectionAfter: endSelection }) as ContentState;

    content = Modifier.insertText(content, endSelection, char);

    return EditorState.push(editorState, content, "change-inline-style");
  },

  /**
   * Removes the block at the given key.
   */
  removeBlock(editorState: EditorState, key: string) {
    const content = editorState.getCurrentContent();
    const blockMap = content.getBlockMap().remove(key);

    return EditorState.set(editorState, {
      currentContent: content.merge({
        blockMap,
      }),
    });
  },

  /**
   * Removes a block-level entity, turning the block into an empty paragraph,
   * and placing the selection on it.
   */
  removeBlockEntity(
    editorState: EditorState,
    entityKey: string,
    blockKey: string,
  ) {
    let newState = editorState;

    const content = editorState.getCurrentContent();
    const blockMap = content.getBlockMap();
    const block = blockMap.get(blockKey);

    const newBlock = block.merge({
      type: BLOCK_TYPE.UNSTYLED,
      text: "",
      // No text = no character list
      characterList: block.getCharacterList().slice(0, 0),
      data: {},
    }) as ContentBlock;

    const newSelection = new SelectionState({
      anchorKey: blockKey,
      focusKey: blockKey,
      anchorOffset: 0,
      focusOffset: 0,
    });

    const newContent = content.merge({
      blockMap: blockMap.set(blockKey, newBlock),
    }) as ContentState;

    newState = EditorState.push(newState, newContent, "change-block-type");
    newState = EditorState.forceSelection(newState, newSelection);

    return newState;
  },

  /**
   * Handles pressing delete within an atomic block. This can happen when selection is placed on an image.
   * Ideally this should be handled by the built-in RichUtils, but it's not.
   * See https://github.com/wagtail/wagtail/issues/4370.
   */
  handleDeleteAtomic(editorState: EditorState) {
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();
    const key = selection.getAnchorKey();
    const offset = selection.getAnchorOffset();
    const block = content.getBlockForKey(key);

    // Problematic selection. Pressing delete here would remove the entity, but not the block.
    if (
      selection.isCollapsed() &&
      block.getType() === BLOCK_TYPE.ATOMIC &&
      offset === 0
    ) {
      return this.removeBlockEntity(editorState, block.getEntityAt(0), key);
    }

    return false;
  },

  /**
   * Get an entity decorator strategy based on the given entity type.
   * This strategy will find all entities of the given type.
   */
  getEntityTypeStrategy(entityType: string) {
    const strategy = (
      block: ContentBlock,
      callback: (start: number, end: number) => void,
      contentState: ContentState,
    ) => {
      block.findEntityRanges((character) => {
        const entityKey = character.getEntity();
        return (
          entityKey !== null &&
          contentState.getEntity(entityKey).getType() === entityType
        );
      }, callback);
    };

    return strategy;
  },

  /**
   * Inserts new unstyled block.
   * Initially inspired from https://github.com/jpuri/draftjs-utils/blob/e81c0ae19c3b0fdef7e0c1b70d924398956be126/js/block.js#L153,
   * but changed so that the split + block type reset amounts to
   * only one change in the undo stack.
   */
  insertNewUnstyledBlock(editorState: EditorState) {
    const selection = editorState.getSelection();
    let newContent = Modifier.splitBlock(
      editorState.getCurrentContent(),
      selection,
    );
    const blockMap = newContent.getBlockMap();
    const blockKey = selection.getStartKey();
    const insertedBlockKey = newContent.getKeyAfter(blockKey);

    const newBlock = blockMap
      .get(insertedBlockKey)
      .set("type", BLOCK_TYPE.UNSTYLED) as ContentBlock;

    newContent = newContent.merge({
      blockMap: blockMap.set(insertedBlockKey, newBlock),
    }) as ContentState;

    return EditorState.push(editorState, newContent, "split-block");
  },

  /**
   * Handles Shift + Enter keypress removing selection and inserting a line break.
   * https://github.com/jpuri/draftjs-utils/blob/112bbe449cc9156522fcf2b40f2910a071b795c2/js/block.js#L133
   */
  addLineBreak(editorState: EditorState) {
    const content = editorState.getCurrentContent();
    const selection = editorState.getSelection();

    if (selection.isCollapsed()) {
      return RichUtils.insertSoftNewline(editorState);
    }

    let newContent = Modifier.removeRange(content, selection, "forward");
    const fragment = newContent.getSelectionAfter();
    const block = newContent.getBlockForKey(fragment.getStartKey());
    newContent = Modifier.insertText(
      newContent,
      fragment,
      "\n",
      block.getInlineStyleAt(fragment.getStartOffset()),
      undefined,
    );
    return EditorState.push(editorState, newContent, "insert-fragment");
  },

  /**
   * Handles hard newlines.
   * https://github.com/jpuri/draftjs-utils/blob/e81c0ae19c3b0fdef7e0c1b70d924398956be126/js/keyPress.js#L17
   */
  handleHardNewline(editorState: EditorState) {
    const selection = editorState.getSelection();

    if (!selection.isCollapsed()) {
      return false;
    }

    const content = editorState.getCurrentContent();
    const blockKey = selection.getStartKey();
    const block = content.getBlockForKey(blockKey);
    const blockType = block.getType();
    // Use a loose check to allow custom list item types to reuse the continuation behavior.
    const isListBlock = blockType.endsWith("-list-item");

    if (
      !isListBlock &&
      block.getType() !== BLOCK_TYPE.UNSTYLED &&
      block.getLength() === selection.getStartOffset()
    ) {
      return this.insertNewUnstyledBlock(editorState);
    }

    if (isListBlock && block.getLength() === 0) {
      const depth = block.getDepth();

      if (depth === 0) {
        const nextContent = RichUtils.tryToRemoveBlockStyle(editorState);
        // At the moment, tryToRemoveBlockStyle always returns for
        // collapsed selections at the start of a block. So in theory this corner case should never happen.
        return nextContent
          ? EditorState.push(editorState, nextContent, "change-block-type")
          : false;
      }

      const blockMap = content.getBlockMap();
      const newBlock = block.set("depth", depth - 1) as ContentBlock;

      return EditorState.push(
        editorState,
        content.merge({
          blockMap: blockMap.set(blockKey, newBlock),
        }) as ContentState,
        "adjust-depth",
      );
    }

    return false;
  },

  /**
   * Handles three scenarios:
   * - Soft newlines.
   * - Hard newlines in the "defer breaking out of the block" case.
   * - Other hard newlines.
   * See https://github.com/wagtail/draftail/issues/104,
   * https://github.com/jpuri/draftjs-utils/issues/10.
   */
  handleNewLine(editorState: EditorState, event: React.KeyboardEvent) {
    // https://github.com/jpuri/draftjs-utils/blob/e81c0ae19c3b0fdef7e0c1b70d924398956be126/js/keyPress.js#L64
    if (isSoftNewlineEvent(event)) {
      return this.addLineBreak(editorState);
    }

    const content = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const key = selection.getStartKey();
    const offset = selection.getStartOffset();
    const block = content.getBlockForKey(key);

    const isDeferredBreakoutBlock = block.getType() === BLOCK_TYPE.CODE;

    if (isDeferredBreakoutBlock) {
      const isEmpty =
        selection.isCollapsed() && offset === 0 && block.getLength() === 0;

      if (isEmpty) {
        return EditorState.push(
          editorState,
          Modifier.setBlockType(content, selection, BLOCK_TYPE.UNSTYLED),
          "change-block-type",
        );
      }

      return false;
    }

    return this.handleHardNewline(editorState);
  },

  getCommandPalettePrompt(editorState: EditorState) {
    const selection = editorState.getSelection();
    const isCollapsed = selection.isCollapsed();

    // No prompt if the selection isn’t collapsed.
    if (!isCollapsed || !selection.getHasFocus()) {
      return null;
    }

    const block = this.getSelectedBlock(editorState);
    const focusOffset = selection.getFocusOffset();
    const blockText = block.getText().slice(0, focusOffset);
    const slashPos = blockText.lastIndexOf("/");
    const spaceAfterSlash =
      blockText.length > slashPos + 1 ? blockText[slashPos + 1] === " " : false;

    // No prompt if there is no slash or a space right after.
    if (slashPos === -1 || spaceAfterSlash) {
      return null;
    }

    const hasPromptStartOfLine =
      slashPos === 0 && (blockText.match(/\s/g) || []).length < 2;

    if (hasPromptStartOfLine) {
      return { text: blockText, block, position: slashPos };
    }

    const afterSlashText = blockText.slice(slashPos);

    const hasPrompt = (afterSlashText.match(/\s/g) || []).length < 1;

    if (hasPrompt) {
      return { text: afterSlashText, block, position: slashPos };
    }

    return null;
  },

  removeCommandPalettePrompt(editorState: EditorState) {
    const prompt = this.getCommandPalettePrompt(editorState);

    if (!prompt) {
      return editorState;
    }

    const selection = editorState.getSelection();
    const promptSelection = selection.merge({
      anchorOffset: prompt?.position,
    });
    const nextContent = Modifier.replaceText(
      editorState.getCurrentContent(),
      promptSelection,
      "",
    );
    return EditorState.push(editorState, nextContent, "remove-range");
  },
};
