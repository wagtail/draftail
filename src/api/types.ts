import {
  ContentBlock,
  ContentState,
  EditorState,
  EntityInstance,
} from "draft-js";
import React, { CSSProperties } from "react";

export type IconProp = string | string[] | JSX.Element;
export type TextDirectionality = "LTR" | "RTL" | null;

export interface Control {
  // Identifier for this item.
  type?: string;
  // Describes the control in the editor UI, concisely.
  label?: string | null;
  // Describes the control in the editor UI.
  description?: string | null;
  // Represents the control in the editor UI.
  icon?: IconProp;
}

export type BoolControl = boolean | Control;

export interface BlockTypeControl extends Control {
  /** Unique type shared between block instances. */
  type: string;
  /** DOM element used to display the block within the editor area. */
  element?: string;
  /** React element to wrap consecutive blocks of this type. */
  wrapper?: React.ReactElement;
}

export interface InlineStyleControl extends Control {
  /** Unique type shared between inline style instances. */
  type: string;
  /** CSS properties (in JS format) to apply for styling within the editor area. */
  style?: CSSProperties;
}

export interface EntityTypeControl extends Control {
  /** Unique type shared between entity instances. */
  type: string;

  /** React component providing the UI to manage entities of this type. */
  source: React.ComponentType<EntitySourceProps>;

  /** React component to display inline entities. */
  decorator?: React.ComponentType<EntityDecoratorProps>;

  /** React component to display block-level entities. */
  block?: React.ComponentType<EntityBlockProps>;

  /** Custom copy-paste processing checker. */
  onPaste?: (
    text: string,
    html: string | null | undefined,
    editorState: EditorState,
    helpers: {
      setEditorState: (state: EditorState) => void;
      getEditorState: () => EditorState;
    },
    entityType: EntityTypeControl,
  ) => "handled" | "not-handled";

  /** Array of attributes the entity uses, to preserve when filtering entities on paste.
   * If undefined, all entity data is preserved.
   */
  attributes?: ReadonlyArray<string>;

  /** Attribute - regex mapping, to preserve entities based on their data on paste.
   * For example, { url: '^https:' } will only preserve links that point to HTTPS URLs.
   */
  allowlist?: { [attr: string]: string };

  /** Attribute - regex mapping, to preserve entities based on their data on paste.
   * For example, { url: '^https:' } will only preserve links that point to HTTPS URLs.
   */
  whitelist?: { [attr: string]: string };
}

export interface EntitySourceProps {
  /** The editorState is available for arbitrary content manipulation. */
  editorState: EditorState;
  /** Takes the updated editorState, or null if there are no changes, and focuses the editor. */
  onComplete: (nextState: EditorState) => void;
  /** Closes the source, without focusing the editor again. */
  onClose: () => void;
  /** Current entity to edit, if any. */
  entityType: EntityTypeControl;
  /** Current entityKey to edit, if any. */
  entityKey?: string | null;
  /** Whole entityType configuration, as provided to the editor. */
  entity?: EntityInstance | null;
  /** Optionally set the overriding text directionality for this editor. */
  textDirectionality: TextDirectionality;
}

export interface EntityDecoratorProps {
  /** The key of the decorated entity. */
  entityKey: string;
  /** The editor’s content. */
  contentState: ContentState;
  /** Rich text to be displayed inside the decorator. */
  children: React.ReactNode;
  /** Shorthand to edit entity data. */
  onEdit: (entityKey: string) => void;
  /** Shorthand to remove an entity, and the related block. */
  onRemove: (entityKey: string, blockKey?: string) => void;
  /** Optionally set the overriding text directionality for this editor. */
  textDirectionality: TextDirectionality;
}

export interface EntityBlockProps {
  block: ContentBlock;
  blockProps: {
    /** The editorState is available for arbitrary content manipulation. */
    editorState: EditorState;
    /** Current entity to manage. */
    entity: EntityInstance;
    /** Current entityKey to manage. */
    entityKey: string;
    /** Whole entityType configuration, as provided to the editor. */
    entityType: EntityTypeControl;
    /** Make the whole editor read-only, except for the block. */
    lockEditor: () => void;
    /** Make the editor editable again. */
    unlockEditor: () => void;
    /** Shorthand to edit entity data. */
    onEditEntity: () => void;
    /** Shorthand to remove an entity, and the related block. */
    onRemoveEntity: () => void;
    /** Update the editorState with arbitrary changes. */
    onChange: (nextState: EditorState) => void;
    /** Optionally set the overriding text directionality for this editor. */
    textDirectionality: TextDirectionality;
  };
}

export interface ControlComponentProps {
  getEditorState: () => EditorState;
  onChange: (state: EditorState) => void;
}

export interface ControlControl extends Control {
  inline?: React.ComponentType<ControlComponentProps>;
  block?: React.ComponentType<ControlComponentProps>;
  meta?: React.ComponentType<ControlComponentProps>;
}
export type LegacyControlControl =
  React.ComponentClass<ControlComponentProps> & {
    inline: never;
    block: never;
    meta: never;
  };

export interface CommandControl extends Control {
  onSelect?: ({
    editorState,
    prompt,
  }: {
    editorState: EditorState;
    prompt?: string;
  }) => EditorState;
  category?: string;
  render?: (props: { option: CommandControl }) => JSX.Element;
}

export interface CommandCategory {
  type: "blockTypes" | "entityTypes" | string;
  label: string | null;
  items?: CommandControl[];
}
