import React, { Component } from "react";
import {
  EditorState,
  RichUtils,
  ContentBlock,
  Modifier,
  RawDraftContentState,
  DraftEditorCommand,
  DraftDecorator,
  EntityInstance,
} from "draft-js";
import { condenseBlocks } from "draftjs-filters";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Editor from "draft-js-plugins-editor";
import {
  DRAFT_DEFAULT_MAX_DEPTH,
  registerCopySource,
  handleDraftEditorPastedText,
  createEditorStateFromRaw,
  serialiseEditorStateToRaw,
} from "draftjs-conductor";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import decorateComponentWithProps from "decorate-component-with-props";

import {
  ENTITY_TYPE,
  BLOCK_TYPE,
  KEY_COMMANDS,
  HANDLED,
  NOT_HANDLED,
  UNDO_TYPE,
  REDO_TYPE,
  KnownKeyCommand,
} from "../api/constants";

import DraftUtils from "../api/DraftUtils";
import behavior from "../api/behavior";
import {
  BlockTypeControl,
  BoolControl,
  CommandCategory,
  ControlControl,
  EntityBlockProps,
  EntityTypeControl,
  InlineStyleControl,
  LegacyControlControl,
  TextDirectionality,
} from "../api/types";

import Toolbar, { ToolbarProps } from "./Toolbar/Toolbar";
import ListNestingStyles from "./ListNestingStyles";
import DividerBlock from "../blocks/DividerBlock";
import CommandPalette, {
  CommandPaletteProps,
  simulateInputEvent,
} from "./CommandPalette/CommandPalette";
import PlaceholderStyles from "./PlaceholderStyles/PlaceholderStyles";
import { MetaToolbarProps } from "./Toolbar/MetaToolbar";

export interface DraftailEditorProps {
  /** Initial content of the editor. Use this to edit pre-existing content. */
  rawContentState?: RawDraftContentState | null;

  /** Called when changes occurred. Use this to persist editor content. */
  onSave?: ((content: null | RawDraftContentState) => void) | null;

  /** Content of the editor, when using the editor as a controlled component. Incompatible with `rawContentState` and `onSave`. */
  editorState?: EditorState | null;

  /** Called whenever the editor state is updated. Use this to manage the content of a controlled editor. Incompatible with `rawContentState` and `onSave`. */
  onChange?: ((editorState: EditorState) => void) | null;

  /** Called when the editor receives focus. */
  onFocus?: (() => void) | null;

  /** Called when the editor loses focus. */
  onBlur?: (() => void) | null;

  /** Displayed when the editor is empty. Hidden if the user changes styling. */
  placeholder?: string | null;

  /** Enable the use of horizontal rules in the editor. */
  enableHorizontalRule: BoolControl;

  /** Enable the use of line breaks in the editor. */
  enableLineBreak: BoolControl;

  /** Show undo control in the toolbar. */
  showUndoControl: BoolControl;

  /** Show redo control in the toolbar. */
  showRedoControl: BoolControl;

  /** Disable copy/paste of rich text in the editor. */
  stripPastedStyles: boolean;

  /** Set if the editor supports multiple lines / blocks of text, or only a single line. */
  multiline: boolean;

  /** Set whether spellcheck is turned on for your editor.
   * See https://draftjs.org/docs/api-reference-editor.html#spellcheck.
   */
  spellCheck: boolean;

  /** Set whether the editor should be rendered in readOnly mode.
   * See https://draftjs.org/docs/api-reference-editor.html#readonly
   */
  readOnly: boolean;

  /** Optionally set the overriding text alignment for this editor.
   * See https://draftjs.org/docs/api-reference-editor.html#textalignment.
   */
  textAlignment?: string | null;

  /** Optionally set the overriding text directionality for this editor.
   * See https://draftjs.org/docs/api-reference-editor.html#textdirectionality.
   */
  textDirectionality: TextDirectionality;

  /** Set if auto capitalization is turned on and how it behaves.
   * See https://draftjs.org/docs/api-reference-editor.html#autocapitalize-string.
   */
  autoCapitalize?: string | null;

  /** Set if auto complete is turned on and how it behaves.
   * See https://draftjs.org/docs/api-reference-editor.html#autocomplete-string.
   */
  autoComplete?: string | null;

  /** Set if auto correct is turned on and how it behaves.
   * See https://draftjs.org/docs/api-reference-editor.html#autocorrect-string.
   */
  autoCorrect?: string | null;

  /** See https://draftjs.org/docs/api-reference-editor.html#aria-props. */
  ariaDescribedBy?: string | null;
  ariaExpanded?: boolean | null;
  ariaLabel?: string | null;
  ariaLabelledBy?: string | null;
  ariaOwneeID?: string | null;
  ariaRequired?: string | null;

  /** List of the available block types. */
  blockTypes: ReadonlyArray<BlockTypeControl>;

  /** List of the available inline styles. */
  inlineStyles: ReadonlyArray<InlineStyleControl>;

  /** List of the available entity types. */
  entityTypes: ReadonlyArray<EntityTypeControl>;

  /** List of active decorators. */
  decorators: ReadonlyArray<DraftDecorator>;

  /** List of extra toolbar controls. */
  controls: ReadonlyArray<ControlControl | LegacyControlControl>;

  /** Optionally enable the command palette UI. */
  commands: boolean | ReadonlyArray<CommandCategory>;

  /** List of plugins of the draft-js-plugins architecture. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: ReadonlyArray<any>;

  /** Optionally override the default Draftail toolbar, removing or replacing it. */
  topToolbar?: React.ComponentType<ToolbarProps> | null;

  /** Optionally add a custom toolbar underneath the editor, e.g. for metrics. */
  bottomToolbar?: React.ComponentType<MetaToolbarProps> | null;

  /** Optionally override the default command toolbar, removing or replacing it. */
  commandToolbar?: React.ComponentType<CommandPaletteProps> | null;

  /** Max level of nesting for list items. 0 = no nesting. Maximum = 10. */
  maxListNesting: number;

  /** Frequency at which to call the onSave callback (ms). */
  stateSaveInterval: number;
}

const defaultProps = {
  /** Initial content of the editor. Use this to edit pre-existing content. */
  rawContentState: null,
  /** Called when changes occurred. Use this to persist editor content. */
  onSave: null,
  /** Content of the editor, when using the editor as a controlled component. Incompatible with `rawContentState` and `onSave`. */
  editorState: null,
  /** Called whenever the editor state is updated. Use this to manage the content of a controlled editor. Incompatible with `rawContentState` and `onSave`. */
  onChange: null,
  /** Called when the editor receives focus. */
  onFocus: null,
  /** Called when the editor loses focus. */
  onBlur: null,
  /** Displayed when the editor is empty. Hidden if the user changes styling. */
  placeholder: null,
  /** Enable the use of horizontal rules in the editor. */
  enableHorizontalRule: false,
  /** Enable the use of line breaks in the editor. */
  enableLineBreak: false,
  /** Show undo control in the toolbar. */
  showUndoControl: false,
  /** Show redo control in the toolbar. */
  showRedoControl: false,
  /** Disable copy/paste of rich text in the editor. */
  stripPastedStyles: true,
  /** Set if the editor supports multiple lines / blocks of text, or only a single line. */
  multiline: true,
  /** Set whether spellcheck is turned on for your editor.
   * See https://draftjs.org/docs/api-reference-editor.html#spellcheck.
   */
  spellCheck: false,
  /** Set whether the editor should be rendered in readOnly mode.
   * See https://draftjs.org/docs/api-reference-editor.html#readonly
   */
  readOnly: false,
  /** Optionally set the overriding text alignment for this editor.
   * See https://draftjs.org/docs/api-reference-editor.html#textalignment.
   */
  textAlignment: null,
  /** Optionally set the overriding text directionality for this editor.
   * See https://draftjs.org/docs/api-reference-editor.html#textdirectionality.
   */
  textDirectionality: null,
  /** Set if auto capitalization is turned on and how it behaves.
   * See https://draftjs.org/docs/api-reference-editor.html#autocapitalize-string.
   */
  autoCapitalize: null,
  /** Set if auto complete is turned on and how it behaves.
   * See https://draftjs.org/docs/api-reference-editor.html#autocomplete-string.
   */
  autoComplete: null,
  /** Set if auto correct is turned on and how it behaves.
   * See https://draftjs.org/docs/api-reference-editor.html#autocorrect-string.
   */
  autoCorrect: null,
  /** See https://draftjs.org/docs/api-reference-editor.html#aria-props. */
  ariaDescribedBy: null,
  ariaExpanded: null,
  ariaLabel: null,
  ariaLabelledBy: null,
  ariaOwneeID: null,
  ariaRequired: null,
  /** List of the available block types. */
  blockTypes: [],
  /** List of the available inline styles. */
  inlineStyles: [],
  /** List of the available entity types. */
  entityTypes: [],
  /** List of active decorators. */
  decorators: [],
  /** List of extra toolbar controls. */
  controls: [],
  /** List of plugins of the draft-js-plugins architecture. */
  plugins: [],
  /** Optionally enable the command palette UI. */
  commands: false,
  /** Optionally override the default Draftail toolbar, removing or replacing it. */
  topToolbar: Toolbar,
  /** Optionally add a custom toolbar underneath the editor, e.g. for metrics. */
  bottomToolbar: null,
  /** Optionally override the default command toolbar, removing or replacing it. */
  commandToolbar: CommandPalette,
  /** Max level of nesting for list items. 0 = no nesting. Maximum = 10. */
  maxListNesting: 1,
  /** Frequency at which to call the onSave callback (ms). */
  stateSaveInterval: 250,
};

export interface DraftailEditorState {
  // editorState is only part of the local state if the editor is uncontrolled.
  editorState?: EditorState;
  hasFocus: boolean;
  readOnlyState: boolean;
  sourceOptions: {
    entity?: EntityInstance | null;
    entityKey?: string | null;
    entityType?: EntityTypeControl;
  } | null;
  lastShortcutKey: string | null;
}

type DraftEditorRef = React.Ref<Editor> & {
  focus: () => void;
};

/**
 * Main component of the Draftail editor.
 * Contains the Draft.js editor instance, and ties together UI and behavior.
 */
class DraftailEditor extends Component<
  DraftailEditorProps,
  DraftailEditorState
> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps: DraftailEditorProps;

  updateTimeout?: number;

  editorRef?: DraftEditorRef;

  tooltipParentRef: React.Ref<HTMLDivElement>;

  copySource?: ReturnType<typeof registerCopySource>;

  lockEditor: () => void;

  unlockEditor: () => void;

  getEditorState: () => EditorState;

  constructor(props: DraftailEditorProps) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.saveState = this.saveState.bind(this);

    this.toggleSource = this.toggleSource.bind(this);
    this.toggleEditor = this.toggleEditor.bind(this);
    this.lockEditor = this.toggleEditor.bind(this, true);
    this.unlockEditor = this.toggleEditor.bind(this, false);

    this.handleReturn = this.handleReturn.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onTab = this.onTab.bind(this);
    this.onUpArrow = this.onUpArrow.bind(this);
    this.onDownArrow = this.onDownArrow.bind(this);
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
    this.handleBeforeInput = this.handleBeforeInput.bind(this);
    this.handlePastedText = this.handlePastedText.bind(this);

    this.toggleBlockType = this.toggleBlockType.bind(this);
    this.toggleInlineStyle = this.toggleInlineStyle.bind(this);

    this.onEditEntity = this.onEditEntity.bind(this);
    this.onRemoveEntity = this.onRemoveEntity.bind(this);

    this.addHR = this.addHR.bind(this);
    this.addBR = this.addBR.bind(this);
    this.onUndoRedo = this.onUndoRedo.bind(this);

    this.blockRenderer = this.blockRenderer.bind(this);
    this.onRequestSource = this.onRequestSource.bind(this);
    this.onCompleteSource = this.onCompleteSource.bind(this);
    this.onCloseSource = this.onCloseSource.bind(this);

    this.focus = this.focus.bind(this);

    this.renderSource = this.renderSource.bind(this);

    this.tooltipParentRef = React.createRef<HTMLDivElement>();

    const { editorState, rawContentState } = props;

    this.state = {
      readOnlyState: false,
      hasFocus: false,
      sourceOptions: null,
      lastShortcutKey: null,
    };

    if (editorState !== null) {
      this.getEditorState = this.getEditorStateProp.bind(this);
    } else {
      // If editorState is not used as a prop, create it in local state from rawContentState.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      this.state.editorState = createEditorStateFromRaw(rawContentState);
      this.getEditorState = this.getEditorStateState.bind(this);
    }
  }

  componentDidMount() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    this.copySource = registerCopySource(this.editorRef.editor);
  }

  componentWillUnmount() {
    this.copySource.unregister();

    window.clearTimeout(this.updateTimeout);
  }

  onFocus() {
    this.setState({
      hasFocus: true,
    });

    const { onFocus } = this.props;

    if (onFocus) {
      onFocus();
    }
  }

  onBlur() {
    this.setState({
      hasFocus: false,
    });

    const { onBlur } = this.props;

    if (onBlur) {
      onBlur();
    }
  }

  onTab(event: React.KeyboardEvent) {
    const { maxListNesting } = this.props;
    const editorState = this.getEditorState();
    const newState = RichUtils.onTab(event, editorState, maxListNesting);

    this.onChange(newState);
    return true;
  }

  onUpArrow(event: React.KeyboardEvent<HTMLDivElement>) {
    const { commands } = this.props;
    const editorState = this.getEditorState();
    const showPrompt =
      !!commands && !!DraftUtils.getCommandPalettePrompt(editorState);
    if (showPrompt) {
      simulateInputEvent("ArrowUp", event);
    }
  }

  onDownArrow(event: React.KeyboardEvent<HTMLDivElement>) {
    const { commands } = this.props;
    const editorState = this.getEditorState();
    const showPrompt =
      !!commands && !!DraftUtils.getCommandPalettePrompt(editorState);
    if (showPrompt) {
      simulateInputEvent("ArrowDown", event);
    }
  }

  onChange(nextState: EditorState) {
    const {
      multiline,
      stateSaveInterval,
      maxListNesting,
      enableHorizontalRule,
      enableLineBreak,
      blockTypes,
      inlineStyles,
      entityTypes,
      onChange,
    } = this.props;
    const prevState = this.getEditorState();
    const shouldFilterPaste =
      nextState.getCurrentContent() !== prevState.getCurrentContent() &&
      nextState.getLastChangeType() === "insert-fragment";
    let filteredState = nextState;

    if (shouldFilterPaste) {
      filteredState = behavior.filterPaste(
        {
          maxListNesting,
          enableHorizontalRule,
          enableLineBreak,
          blockTypes,
          inlineStyles,
          entityTypes,
        },
        filteredState,
      );

      if (!multiline) {
        filteredState = condenseBlocks(filteredState, prevState);
      }
    }

    if (onChange) {
      onChange(filteredState);
    } else {
      this.setState(
        {
          editorState: filteredState,
        },
        () => {
          window.clearTimeout(this.updateTimeout);
          this.updateTimeout = window.setTimeout(
            this.saveState,
            stateSaveInterval,
          );
        },
      );
    }
  }

  onEditEntity(entityKey: string) {
    const { entityTypes } = this.props;
    const editorState = this.getEditorState();
    const content = editorState.getCurrentContent();
    const entity = content.getEntity(entityKey);
    const entityType = entityTypes.find((t) => t.type === entity.getType());

    if (!entityType!.block) {
      const entitySelection = DraftUtils.getEntitySelection(
        editorState,
        entityKey,
      );
      const nextState = EditorState.acceptSelection(
        editorState,
        entitySelection,
      );

      this.onChange(nextState);
    }

    this.toggleSource(entity.getType(), entityKey, entity);
  }

  onRemoveEntity(entityKey: string, blockKey?: string) {
    const { entityTypes } = this.props;
    const editorState = this.getEditorState();
    const content = editorState.getCurrentContent();
    const entity = content.getEntity(entityKey);
    const entityType = entityTypes.find((t) => t.type === entity.getType());
    let newState = editorState;

    if (blockKey && entityType!.block) {
      newState = DraftUtils.removeBlockEntity(newState, entityKey, blockKey);
    } else {
      const entitySelection = DraftUtils.getEntitySelection(
        editorState,
        entityKey,
      );

      newState = RichUtils.toggleLink(newState, entitySelection, null);
    }

    this.onChange(newState);
  }

  onUndoRedo(type: string) {
    const editorState = this.getEditorState();
    let newEditorState = editorState;

    if (type === UNDO_TYPE) {
      newEditorState = EditorState.undo(editorState);
    } else if (type === REDO_TYPE) {
      newEditorState = EditorState.redo(editorState);
    }

    this.onChange(newEditorState);
  }

  onRequestSource(entityType: string) {
    const editorState = this.getEditorState();
    const contentState = editorState.getCurrentContent();
    const entityKey = DraftUtils.getSelectionEntity(editorState);

    this.toggleSource(
      entityType,
      entityKey,
      entityKey ? contentState.getEntity(entityKey) : null,
    );
  }

  onCompleteSource(nextState: EditorState) {
    this.setState(
      {
        sourceOptions: null,
      },
      () => {
        if (nextState) {
          this.onChange(nextState);
        }

        window.setTimeout(() => {
          this.setState({ readOnlyState: false }, () => {
            window.setTimeout(() => {
              this.focus();
            }, 0);
          });
        }, 0);
      },
    );
  }

  onCloseSource() {
    this.setState({
      sourceOptions: null,
      readOnlyState: false,
    });
  }

  getEditorStateProp() {
    const { editorState } = this.props;
    return editorState as EditorState;
  }

  getEditorStateState() {
    const { editorState } = this.state;
    return editorState as EditorState;
  }

  saveState() {
    const { onSave } = this.props;
    const editorState = this.getEditorState();

    if (onSave) {
      onSave(serialiseEditorStateToRaw(editorState));
    }
  }

  toggleEditor(readOnlyState: boolean) {
    this.setState({
      readOnlyState,
    });
  }

  toggleSource(
    type: string,
    entityKey?: string | null,
    entity?: EntityInstance | null,
  ) {
    const { entityTypes } = this.props;
    const entityType = entityTypes.find((item) => item.type === type);

    this.setState({
      readOnlyState: true,
      sourceOptions: {
        entity,
        entityKey,
        entityType,
      },
    });
  }

  // eslint-disable-next-line react/sort-comp
  handleReturn(e: React.KeyboardEvent<HTMLDivElement>) {
    const { multiline, enableLineBreak, inlineStyles, commands } = this.props;
    const editorState = this.getEditorState();

    const showPrompt =
      !!commands && !!DraftUtils.getCommandPalettePrompt(editorState);
    if (showPrompt) {
      if (simulateInputEvent("Enter", e)) {
        return HANDLED;
      }
    }

    // alt + enter opens links and other entities with a `url` property.
    if (e.altKey) {
      const entityKey = DraftUtils.getSelectionEntity(editorState);

      if (entityKey) {
        const content = editorState.getCurrentContent();
        const entityData = content.getEntity(entityKey).getData();

        if (entityData.url) {
          window.open(entityData.url);
        }
      }

      // Mark the return as handled even if there is no entity.
      // alt + enter should never create a newline anyway.
      return HANDLED;
    }

    if (!enableLineBreak) {
      // Quick hack to disable soft line breaks.
      e.which = 0;
    }

    let newState: EditorState | false = editorState;
    let newStyle: ReturnType<typeof behavior.handleBeforeInputInlineStyle> =
      false;

    const selection = newState.getSelection();
    // Check whether we should apply a Markdown styles shortcut.
    if (selection.isCollapsed()) {
      const block = DraftUtils.getSelectedBlock(editorState);
      newStyle = behavior.handleBeforeInputInlineStyle(
        block.getText(),
        inlineStyles,
      );

      if (newStyle) {
        newState = DraftUtils.applyMarkdownStyle(newState, newStyle, "");
      }
    }

    if (!multiline) {
      return HANDLED;
    }

    const newLineState = DraftUtils.handleNewLine(newState, e);

    // Manually handle the return if there is a style to apply.
    if (!newLineState && newStyle) {
      const content = newState.getCurrentContent();
      const newContent = Modifier.splitBlock(content, selection);
      newState = EditorState.push(newState, newContent, "split-block");
      // Do not propagate the style from the last block.
      newState = RichUtils.toggleInlineStyle(newState, newStyle.type);
    } else {
      newState = newLineState;
    }

    if (newState && newState !== editorState) {
      this.onChange(newState);
      return HANDLED;
    }

    return NOT_HANDLED;
  }

  handleKeyCommand(command: DraftEditorCommand) {
    const { entityTypes, blockTypes, inlineStyles } = this.props;
    const editorState = this.getEditorState();

    if (entityTypes.some((t) => t.type === command)) {
      this.onRequestSource(command);
      return HANDLED;
    }

    if (blockTypes.some((t) => t.type === command)) {
      this.toggleBlockType(command);
      return HANDLED;
    }

    if (inlineStyles.some((t) => t.type === command)) {
      this.toggleInlineStyle(command);
      return HANDLED;
    }

    // Special case – some delete commands on atomic blocks are not covered by RichUtils.
    if (command === "delete") {
      const newState = DraftUtils.handleDeleteAtomic(editorState);

      if (newState) {
        this.onChange(newState);
        return HANDLED;
      }
    }

    // If the command is known but not enabled for this editor, treat it as handled but don't do anything.
    if (KEY_COMMANDS.includes(command as KnownKeyCommand)) {
      return HANDLED;
    }

    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return HANDLED;
    }

    return NOT_HANDLED;
  }

  handleBeforeInput(char: string) {
    const { blockTypes, inlineStyles, enableHorizontalRule } = this.props;
    const { lastShortcutKey } = this.state;
    const editorState = this.getEditorState();
    const selection = editorState.getSelection();

    if (selection.isCollapsed()) {
      const block = DraftUtils.getSelectedBlock(editorState);
      const startOffset = selection.getStartOffset();
      const text = block.getText();
      const beforeInput = text.slice(0, startOffset);
      const mark = `${beforeInput}${char}`;
      const shortcutKey = `${block.getKey()}:${beforeInput}`;
      let newEditorState = editorState;

      const newBlockType = behavior.handleBeforeInputBlockType(
        mark,
        blockTypes,
      );

      if (newBlockType && newBlockType !== block.getType()) {
        if (shortcutKey !== lastShortcutKey) {
          newEditorState = DraftUtils.resetBlockWithType(
            newEditorState,
            newBlockType,
            text.replace(beforeInput, ""),
          );
          this.setState({
            lastShortcutKey: shortcutKey,
          });
        } else {
          this.setState({
            lastShortcutKey: null,
          });
        }
      }

      if (enableHorizontalRule && behavior.handleBeforeInputHR(mark, block)) {
        newEditorState = DraftUtils.removeBlock(
          DraftUtils.addHorizontalRuleRemovingSelection(newEditorState),
          block.getKey(),
        );
      }

      const newStyle = behavior.handleBeforeInputInlineStyle(
        beforeInput,
        inlineStyles,
      );

      if (newStyle) {
        newEditorState = DraftUtils.applyMarkdownStyle(
          newEditorState,
          newStyle,
          char,
        );
      }

      if (newEditorState !== editorState) {
        this.onChange(newEditorState);
        return HANDLED;
      }
    }

    return NOT_HANDLED;
  }

  handlePastedText(
    text: string,
    html: string | undefined,
    editorState: EditorState,
  ) {
    const { stripPastedStyles, entityTypes } = this.props;

    const hasProcessedEntity = entityTypes.some((t) => {
      const ret =
        t.onPaste &&
        t.onPaste(
          text,
          html,
          editorState,
          {
            setEditorState: this.onChange,
            getEditorState: this.getEditorState,
          },
          t,
        );
      return ret === HANDLED;
    });

    if (hasProcessedEntity) {
      return HANDLED;
    }

    // Leave paste handling to Draft.js when stripping styles is desirable.
    if (stripPastedStyles) {
      return NOT_HANDLED;
    }

    const pastedState = handleDraftEditorPastedText(html, editorState);

    if (pastedState) {
      this.onChange(pastedState);
      return HANDLED;
    }

    return NOT_HANDLED;
  }

  toggleBlockType(blockType: string) {
    const editorState = this.getEditorState();
    this.onChange(RichUtils.toggleBlockType(editorState, blockType));
  }

  toggleInlineStyle(inlineStyle: string) {
    const editorState = this.getEditorState();
    this.onChange(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  }

  addHR() {
    const editorState = this.getEditorState();
    this.onChange(DraftUtils.addHorizontalRuleRemovingSelection(editorState));
  }

  addBR() {
    const editorState = this.getEditorState();
    this.onChange(DraftUtils.addLineBreak(editorState));
  }

  blockRenderer(block: ContentBlock) {
    const { entityTypes, textDirectionality } = this.props;
    const editorState = this.getEditorState();
    const contentState = editorState.getCurrentContent();

    if (block.getType() !== BLOCK_TYPE.ATOMIC) {
      return null;
    }

    const entityKey = block.getEntityAt(0);

    if (!entityKey) {
      return {
        editable: false,
      };
    }

    const entity = contentState.getEntity(entityKey);
    const isHorizontalRule = entity.getType() === ENTITY_TYPE.HORIZONTAL_RULE;

    if (isHorizontalRule) {
      return {
        component: DividerBlock,
        editable: false,
      };
    }

    const entityType = entityTypes.find((t) => t.type === entity.getType());

    return {
      component: entityType!.block,
      editable: false,
      props: {
        /** The editorState is available for arbitrary content manipulation. */
        editorState,
        /** Current entity to manage. */
        entity,
        /** Current entityKey to manage. */
        entityKey,
        /** Whole entityType configuration, as provided to the editor. */
        entityType,
        /** Optionally set the overriding text directionality for this editor. */
        textDirectionality,
        /** Make the whole editor read-only, except for the block. */
        lockEditor: this.lockEditor,
        /** Make the editor editable again. */
        unlockEditor: this.unlockEditor,
        /** Shorthand to edit entity data. */
        onEditEntity: this.onEditEntity.bind(null, entityKey),
        /** Shorthand to remove an entity, and the related block. */
        onRemoveEntity: this.onRemoveEntity.bind(
          null,
          entityKey,
          block.getKey(),
        ),
        /** Update the editorState with arbitrary changes. */
        onChange: this.onChange,
      } as EntityBlockProps["blockProps"],
    };
  }

  /**
   * Imperative focus API similar to that of Draft.js.
   * See https://draftjs.org/docs/advanced-topics-managing-focus.html#content.
   */
  focus() {
    this.editorRef!.focus();
  }

  renderSource() {
    const { textDirectionality } = this.props;
    const { sourceOptions } = this.state;
    const editorState = this.getEditorState();

    if (sourceOptions && sourceOptions.entityType) {
      const Source = sourceOptions.entityType.source;

      return (
        <Source
          /** The editorState is available for arbitrary content manipulation. */
          editorState={editorState}
          /** Takes the updated editorState, or null if there are no changes, and focuses the editor. */
          onComplete={this.onCompleteSource}
          /** Closes the source, without focusing the editor again. */
          onClose={this.onCloseSource}
          /** Current entity to edit, if any. */
          entity={sourceOptions.entity}
          /** Current entityKey to edit, if any. */
          entityKey={sourceOptions.entityKey}
          /** Whole entityType configuration, as provided to the editor. */
          entityType={sourceOptions.entityType}
          /** Optionally set the overriding text directionality for this editor. */
          textDirectionality={textDirectionality}
        />
      );
    }

    return null;
  }

  render() {
    const {
      placeholder,
      enableHorizontalRule,
      enableLineBreak,
      showUndoControl,
      showRedoControl,
      stripPastedStyles,
      multiline,
      spellCheck,
      textAlignment,
      textDirectionality,
      autoCapitalize,
      autoComplete,
      autoCorrect,
      ariaDescribedBy,
      ariaExpanded,
      ariaLabel,
      ariaLabelledBy,
      ariaOwneeID,
      ariaRequired,
      blockTypes,
      inlineStyles,
      entityTypes,
      decorators,
      controls,
      readOnly,
      maxListNesting,
      plugins,
      commands,
      topToolbar,
      bottomToolbar,
      commandToolbar,
    } = this.props;
    const { hasFocus, readOnlyState } = this.state;
    const editorState = this.getEditorState();
    const isReadOnly = readOnlyState || readOnly;
    const entityDecorators = entityTypes
      .filter((type) => !!type.decorator)
      .map((type) => ({
        strategy: DraftUtils.getEntityTypeStrategy(type.type),
        component: decorateComponentWithProps<React.Component<unknown>>(
          type.decorator,
          {
            onEdit: this.onEditEntity,
            onRemove: this.onRemoveEntity,
            textDirectionality,
          },
        ),
      }));

    const TopToolbar = topToolbar;
    const BottomToolbar = bottomToolbar;
    const CommandToolbar = commandToolbar;
    const selectedBlock = DraftUtils.getSelectedBlock(editorState);
    const toolbarProps = {
      currentStyles: editorState.getCurrentInlineStyle(),
      currentBlock: selectedBlock.getType(),
      currentBlockKey: selectedBlock.getKey(),
      enableHorizontalRule,
      enableLineBreak,
      showUndoControl,
      showRedoControl,
      blockTypes,
      inlineStyles,
      entityTypes,
      controls,
      commands,
      readOnly: isReadOnly,
      toggleBlockType: this.toggleBlockType,
      toggleInlineStyle: this.toggleInlineStyle,
      addHR: this.addHR,
      addBR: this.addBR,
      onUndoRedo: this.onUndoRedo,
      onRequestSource: this.onRequestSource,
      onCompleteSource: this.onCompleteSource,
      getEditorState: this.getEditorState,
      focus: this.focus,
      onChange: this.onChange,
    };

    /* eslint-disable react/jsx-props-no-spreading */
    return (
      <div
        className={`Draftail-Editor${
          isReadOnly ? " Draftail-Editor--readonly" : ""
        }${hasFocus ? " Draftail-Editor--focus" : ""}`}
        dir={textDirectionality === "RTL" ? "rtl" : undefined}
        data-draftail-editor
      >
        {TopToolbar ? <TopToolbar {...toolbarProps} /> : null}

        <Editor
          customStyleMap={behavior.getCustomStyleMap(inlineStyles)}
          ref={(ref: DraftEditorRef) => {
            this.editorRef = ref;
          }}
          editorState={editorState}
          onChange={this.onChange}
          readOnly={isReadOnly}
          stripPastedStyles={stripPastedStyles}
          spellCheck={spellCheck}
          textAlignment={textAlignment}
          textDirectionality={textDirectionality}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          autoCorrect={autoCorrect}
          ariaDescribedBy={ariaDescribedBy}
          ariaExpanded={ariaExpanded}
          ariaLabel={ariaLabel}
          ariaLabelledBy={ariaLabelledBy}
          ariaMultiline={multiline}
          ariaOwneeID={ariaOwneeID}
          ariaRequired={ariaRequired}
          handleReturn={this.handleReturn}
          defaultKeyBindings={false}
          handleKeyCommand={this.handleKeyCommand}
          handleBeforeInput={this.handleBeforeInput}
          handlePastedText={this.handlePastedText}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onTab={this.onTab}
          onUpArrow={this.onUpArrow}
          onDownArrow={this.onDownArrow}
          blockRendererFn={this.blockRenderer}
          blockRenderMap={behavior.getBlockRenderMap(blockTypes)}
          blockStyleFn={behavior.blockStyleFn}
          // Include the keyBindingFn in a plugin here so that
          // other plugin keyBindingFn's are still called, while
          // still being able to override the Draft.js oversensitive
          // keyboard shortcuts.
          plugins={plugins.concat([
            {
              keyBindingFn: behavior.getKeyBindingFn(
                blockTypes,
                inlineStyles,
                entityTypes,
              ),
            },
          ])}
          decorators={decorators.concat(entityDecorators)}
        />

        {BottomToolbar ? <BottomToolbar {...toolbarProps} /> : null}

        {commands && CommandToolbar ? (
          <CommandToolbar {...toolbarProps} />
        ) : null}

        {this.renderSource()}

        <div data-draftail-tooltip-parent ref={this.tooltipParentRef} />

        <PlaceholderStyles
          blockKey={selectedBlock.getKey()}
          blockTypes={blockTypes}
          placeholder={placeholder}
        />

        {maxListNesting > DRAFT_DEFAULT_MAX_DEPTH ? (
          <ListNestingStyles max={maxListNesting} />
        ) : null}
      </div>
    );
  }
}

DraftailEditor.defaultProps = defaultProps;

export default DraftailEditor;
