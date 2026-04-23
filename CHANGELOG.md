# Changelog

> All notable changes to this project are documented in this file. This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [[v2.0.1]](https://github.com/wagtail/draftail/releases/tag/v2.0.1)

> Documentation: [v2.0.0 Getting started](https://www.draftail.org/docs/getting-started)

### Fixed

- Fix Sass deprecation warning with `@import` syntax. [#459](https://github.com/wagtail/draftail/issues/459)
- Fix Sass deprecation warning with legacy color functions. [#459](https://github.com/wagtail/draftail/issues/459)

### Changed

- Allow a wide range of downshift dependency versions: `^7.0.4 || ^8.5.0 || ^9.0.0`.

## [[v2.0.0]](https://github.com/wagtail/draftail/releases/tag/v2.0.0)

> This release contains **breaking changes** compared to v1.4.1. It’s identical to the v2.0.0-rc.6 pre-release.
>
> Documentation: [v2.0.0 Getting started](https://www.draftail.org/docs/getting-started)

### Added

#### Toolbars

- Add a new optional `FloatingToolbar` component so the editor can be rendered with a minimal height.
- Add a new optional `BlockToolbar` component, intended for keyboard and first-time users.
- Add a new optional `MetaToolbar` component intended to display editor metadata at the bottom of the editor.
- Add a new optional `InlineToolbar` component, which is user-configurable to display either a static or floating toolbar.
- Add a new optional `CommandPalette` component, usable with the `commandPalette` rendering prop and the `commands` data prop.
- Placeholder follow focus
- Heading blocks highlight
- Single-line editing support

#### Miscellaneous improvements

- Add strict TypeScript module definition for Draftail. [#388](https://github.com/wagtail/draftail/issues/388), [#429](https://github.com/wagtail/draftail/pull/429)
- Implement `onPaste` handler for entities to be able to create themselves on paste.
- Empty blocks now have a `Draftail-block--empty` class for styling.
- Add support for [Windows High contrast mode / Contrast themes](https://docs.microsoft.com/en-us/fluent-ui/web-components/design-system/high-contrast) for the whole editor UI.
- Pass Draft.js ARIA props through. [#436](https://github.com/wagtail/draftail/issues/436), [#438](https://github.com/wagtail/draftail/pull/438)
- Add a name prop and className to ToolbarGroup so different groups can have different styles, for example `Draftail-ToolbarGroup--entities`.

### Changed

- The controls API now expects JS objects similarly to other APIs. Controls can now declare in what type of toolbar they should be rendered: `block` (static top toolbar), `inline` (floating toolbar), `meta` (bottom / meta toolbar). They can also have a `type` to help with troubleshooting.
- Draftail now uses [CSS logical properties and values](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties) to [support right-to-left (RTL) languages](https://rtlstyling.com/posts/rtl-styling).
- Latest draftjs-conductor
- Latest draftjs-filters
- Dismiss keyboard shortcuts
- Move Sass import from `draftail/lib/index.scss` to `draftail/src/index.scss`

### Fixed

- Fix Sass deprecation warning with `/` slash character for divisions and separators.
- Fix potential SSR issue with first-child selector

### Removed

- Remove IE11 support

### Breaking changes

#### TypeScript type definitions

For projects using TypeScript, the addition of type definitions is likely to cause new linting issues being reported in case Draftail’s new types are incompatible with the implementation.

#### Sass import

- Move Sass import from `draftail/lib/index.scss` to `draftail/src/index.scss`

#### Browser support

The editor now supports modern browsers only, in particular IE11 support has been removed. The new browser support follows evergreen browsers only. The oldest-supported browser is currently Safari 14.1.

| Browser       | Device/OS  | Version(s) |
| ------------- | ---------- | ---------- |
| Mobile Safari | iOS Phone  | Last 2     |
| Mobile Safari | iOS Tablet | Last 2     |
| Chrome        | Android    | Last 2     |
| Chrome        | Desktop    | Last 2     |
| MS Edge       | Windows    | Last 2     |
| Firefox       | Desktop    | Latest     |
| Firefox ESR   | Desktop    | Latest     |
| Safari        | macOS      | Last 3     |

#### RTL support

To introduce RTL support, a lot of the editor’s styles have been rewritten to use [CSS logical properties and values](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties), as well as Flexbox and Grid layout. This could lead to issues with bespoke UI customisations.

#### Controls API shape

The `controls` prop now takes objects rather than React components. Controls which aren’t updated to the new API will render in the static "top" toolbar only.

#### Entities API shape

Entities now accept a `allowlist` attribute rather than `whitelist`.

## [[v1.4.1]](https://github.com/wagtail/draftail/releases/tag/v1.4.1)

> Documentation: [v1.4.0 Getting started](https://www.draftail.org/docs/1.4.0/getting-started)

### Fixed

- Fix plugin `keyBindingFn`s not being called. [#246](https://github.com/wagtail/draftail/pull/246), [#445](https://github.com/wagtail/draftail/pull/445)

## [[v1.4.0]](https://github.com/wagtail/draftail/releases/tag/v1.4.0)

> Documentation: [v1.4.0 Getting started](https://www.draftail.org/docs/1.4.0/getting-started)

### Added

- Make it possible to hide buttons with default labels by setting their `label` to `null`. [#442](https://github.com/wagtail/draftail/pull/442)

### Changed

- Improve the editor props’ JSDoc annotations. [#441](https://github.com/wagtail/draftail/pull/441)

### Fixed

- Fix empty buttons appearing when providing custom formats without a defined label or icon. [#442](https://github.com/wagtail/draftail/pull/442)
- Clear save timeout handler when unmounting the editor. [#208](https://github.com/wagtail/draftail/issues/208), [#443](https://github.com/wagtail/draftail/pull/443)

## [[v1.3.0]](https://github.com/wagtail/draftail/releases/tag/v1.3.0)

> Documentation: [v1.3.0 Getting started](https://www.draftail.org/docs/1.3.0/getting-started)

🎉 blog post for this release: [Draftail v1.3.0: community improvements, beyond Wagtail](https://www.draftail.org/blog/2019/03/03/draftail-v1-2-0-supporting-modern-experiences).

### Added

- Add ability to disable the editor on demand with the [`readOnly`](https://www.draftail.org/docs/api#draftaileditor) prop, matching behavior of Draft.js. [#201](https://github.com/wagtail/draftail/issues/201), [#206](https://github.com/wagtail/draftail/pull/206), thanks to [@SpearThruster](https://github.com/SpearThruster).
- Add ability to use the editor as a controlled component, like vanilla Draft.js editors, with [`editorState` and `onChange`](https://www.draftail.org/docs/api#editorstate-and-onchange) props. Have a look at the [controlled component documentation](https://www.draftail.org/docs/controlled-component) for further details. [#180](https://github.com/wagtail/draftail/issues/180), [#207](https://github.com/wagtail/draftail/pull/207).

### Fixed

- Fix undo/redo button icons not being customisable ([#195](https://github.com/wagtail/draftail/issues/195), [#196](https://github.com/wagtail/draftail/pull/196)).

## [[v1.2.1]](https://github.com/wagtail/draftail/releases/tag/v1.2.1)

> Documentation: [draftail.org/docs/1.2.1/getting-started](https://www.draftail.org/docs/1.2.1/getting-started)

### Fixed

- Fix regression introduced in v1.2.0 where Draft.js-defined keyboard shortcuts were available unconditionally ([#189](https://github.com/wagtail/draftail/pull/189)).

## [[v1.2.0]](https://github.com/wagtail/draftail/releases/tag/v1.2.0)

> Documentation: [draftail.org/docs/1.2.0/getting-started](https://www.draftail.org/docs/1.2.0/getting-started)

🎉 blog post for this release: [Draftail v1.2.0: supporting modern experiences](https://www.draftail.org/blog/2019/03/03/draftail-v1-2-0-supporting-modern-experiences).

### Added

- Add [`plugins`](https://www.draftail.org/docs/plugins) API to support extensions of the editor using the [draft-js-plugins](https://github.com/draft-js-plugins/draft-js-plugins) architecture ([#83](https://github.com/wagtail/draftail/issues/83), [#171](https://github.com/wagtail/draftail/pull/171)).

This new API makes it possible to build much more advanced extensions to the editor than ever before, such as autocompletes, [linkify](https://www.draftail.org/docs/extensions-tutorial-linkify), [custom blocks](https://www.draftail.org/docs/blocks#custom-block-rendering), [custom toolbars](https://www.draftail.org/docs/customising-toolbars), and more. Read the [release blog post](https://www.draftail.org/blog/2019/03/03/draftail-v1-2-0-supporting-modern-experiences) to learn more about the motivation for those new APIs.

- Add data reset parameter to `DraftUtils.resetBlockWithType()`.
- Add ability to disable or customise the editor toolbar with [`topToolbar`](https://www.draftail.org/docs/customising-toolbars).
- Add ability to add a toolbar below the editor with [`bottomToolbar`](https://www.draftail.org/docs/customising-toolbars).
- Add support for Markdown shortcuts for inline styles, e.g. `**` for bold, `_` for italic, etc ([#134](https://github.com/wagtail/draftail/issues/134), [#187](https://github.com/wagtail/draftail/pull/187)). View the full list of [keyboard shortcuts](https://www.draftail.org/docs/keyboard-shortcuts).

### Changed

- Enable list continuation on Enter for custom `*-list-item` blocks. All that’s required is for the block type to end with `-list-item`.

## [[v1.1.0]](https://github.com/wagtail/draftail/releases/tag/v1.1.0)

> Documentation: [draftail.org/docs/1.1.0/getting-started](https://www.draftail.org/docs/1.1.0/getting-started)

🎉 blog post for this release: [Draftail v1.1.0: a quality of life release](https://www.draftail.org/blog/2019/02/08/draftail-v1-1-0-a-quality-of-life-release).

### Added

- Add [`onFocus`](https://www.draftail.org/docs/api#managing-focus) and [`onBlur`](https://www.draftail.org/docs/api#managing-focus) props to use callbacks on those events. This can be useful for [form validation](https://www.draftail.org/docs/form-validation). [#170](https://github.com/wagtail/draftail/issues/170), [#174](https://github.com/wagtail/draftail/pull/174), thanks to [@TheSpicyMeatball](https://github.com/TheSpicyMeatball).

### Fixed

- Stop unnecessarily calling `onSave` in the editor’s `onBlur` ([#173](https://github.com/wagtail/draftail/issues/173)).
- Prevent crash when filtering pasted content whose last block is to be removed (e.g. unsupported image) ([#179](https://github.com/wagtail/draftail/issues/179)).
- Prevent crash in `DraftUtils.getEntitySelection`, when the provided entity key isn't valid (undefined, missing) ([#168](https://github.com/wagtail/draftail/pull/168)).
- Fix entity removal and editing not doing anything when the selection is backwards (right to left) ([#168](https://github.com/wagtail/draftail/pull/168)).

### Changed

- Update [`draftjs-filters`](https://github.com/thibaudcolas/draftjs-filters) dependency ([#179](https://github.com/wagtail/draftail/issues/179)).
- Update [`draftjs-conductor`](https://github.com/thibaudcolas/draftjs-conductor) dependency.

### Removed

- Remove all [`PropTypes`](https://www.npmjs.com/package/prop-types). The project is now typed with [Flow](https://flow.org/) ([#127](https://github.com/wagtail/draftail/issues/127), [#178](https://github.com/wagtail/draftail/pull/178)).
- Remove peerDependency on `prop-types` ([#127](https://github.com/wagtail/draftail/issues/127), [#178](https://github.com/wagtail/draftail/pull/178)).

## [[v1.0.0]](https://github.com/wagtail/draftail/releases/tag/v1.0.0)

> Documentation: [draftail.org/docs/1.0.0/getting-started](https://www.draftail.org/docs/1.0.0/getting-started)

> This release is functionally identical to the last one, `v0.17.2`.

The project has reached a high-enough level of stability to be used in production, and breaking changes will now be reflected via major version changes.

## [[v0.17.2]](https://github.com/wagtail/draftail/releases/tag/v0.17.2)

### Changed

- Update to `draftjs-filters@1.0.0`. This does not include any functional changes, but will cause a duplicated dependency for projects having both `draftail` and `draftjs-filters` as deps if they don’t also update `draftjs-filters`.
- Add Draft.js copy-paste handling overrides from `draftjs-conductor`. This makes Draftail always preserve the full content as-is when copy-pasting between editors. Fix [#147](https://github.com/wagtail/draftail/issues/147) ([thibaudcolas/draftjs-conductor#2](https://github.com/thibaudcolas/draftjs-conductor/pull/2)).

## [[v0.17.1]](https://github.com/wagtail/draftail/releases/tag/v0.17.1)

### Changed

- Unsupported actions causing an atomic block to be without entity now soft-fail with an un-editable atomic block instead of hard-fail [wagtail/wagtail#4370](https://github.com/wagtail/wagtail/issues/4370).

### Fixed

- Add workaround for RichUtils image delete blind spot reported in [wagtail/wagtail#4370](https://github.com/wagtail/wagtail/issues/4370) ([#144](https://github.com/wagtail/draftail/pull/144)).

## [[v0.17.0]](https://github.com/wagtail/draftail/releases/tag/v0.17.0)

### Added

- Add basic API for arbitrary controls in the toolbar.
- Expose `ToolbarButton` component in the API.
- Add ability to set `ariaDescribedBy` prop of Draft.js.

### Changed

- Replace block entities by a paragraph when using `onRemoveEntity`.
- Replace `ListNesting` implementation with the one from `draftjs-conductor`.

### Fixed

- Fix copy-paste filter running more often than necessary.
- Use darker placeholder text color to pass WCAG2.0 AAA level contrast ratio. Overridable via `$draftail-placeholder-text`.
- Fix HR block spacing at the top of the editor.

### Removed

- Remove `DraftUtils.isSelectedBlockType()`.
- Remove `DraftUtils.hasCurrentInlineStyle()`.

## [[v0.16.0]](https://github.com/wagtail/draftail/releases/tag/v0.16.0)

### Changed

- Remove toolbar z-index when the editor is not focused, to reduce chances of interferring with other components.
- Adjust toolbar button alignment for text-only buttons.
- Replace `className` prop for blocks by dynamically adding a class based on block type.
- Update to `draftjs-filters@0.7.0` to preserve list items in Word.
- Update `draft-js` peerDependency version to 0.10.5.

### Fixed

- Fix Markdown shortcuts for blocks removing styles and entities at the end of the block text.

### Removed

- Remove React 15 from peerDependencies.

## [[v0.15.0]](https://github.com/wagtail/draftail/releases/tag/v0.15.0)

### Changed

- Replace nested-list-items Sass helper with new auto-generated CSS in JS.
- Update to `draftjs-filters@0.6.1` to fix entities not being cloned on paste.

### Removed

- Remove support for `maxListNesting` greater than 10.

## [[v0.14.0]](https://github.com/wagtail/draftail/releases/tag/v0.14.0)

### Added

- Make line break and horizontal line controls configurable, by passing an object with `icon`, `label`, `description` props.
- Add ability to set `textAlignment`, `textDirectionality`, `autoCapitalize`, `autoComplete`, `autoCorrect` props of Draft.js.

### Changed

- Rename `DraftUtils.addLineBreakRemovingSelection` to `DraftUtils.addLineBreak`.
- Replace `showUndoRedoControls` with separate props `showUndoControl` and `showRedoControl` for which control UI can be overriden.
- Make all keyboard shortcut labels language agnostic.

### Fixed

- Fix `DraftUtils.addLineBreak` adding line breaks in the wrong place when selection is collapsed.

## [[v0.13.0]](https://github.com/wagtail/draftail/releases/tag/v0.13.0)

### Added

- Add default block spacing to make it easier to distinguish empty blocks.

### Changed

- Make rich text styles specific to Draftail.
- Update to `draftjs-filters@0.5.0` to improve filtering on [undefined attributes](https://github.com/thibaudcolas/draftjs-filters/commit/f836563).
- Update editor read-only styles to integrate better with any background color.

### Fixed

- Prevent toolbar tooltip from having a transition delay on close.
- Prevent toolbar tooltip from staying open when hovered.

## [[v0.12.0]](https://github.com/wagtail/draftail/releases/tag/v0.12.0)

### Added

- Add `Draftail-unstyled` class to unstyled block, makes it easy to style unstyled blocks.
- Add `$draftail-editor-background` variable to override editor bg.
- Add `draftail-richtext-styles` mixin to style rich text content within the editor.
- Add imperative `focus()` API to the editor, like that of Draft.js.
- Add `onClose` prop to sources, to close the source without focusing the editor again.

### Changed

- Make all icons `vertical-align: middle;` by default.
- Update to `draftjs-filters@0.4.0` to allow filtering on [undefined attributes](https://github.com/thibaudcolas/draftjs-filters/commit/a4af845).

### Fixed

- Fix icons / labels alignment in the toolbar.

## [[v0.11.0]](https://github.com/wagtail/draftail/releases/tag/v0.11.0)

### Added

- Add new Sass constants to make the editor more themable: `$draftail-editor-padding, $draftail-editor-text, $draftail-editor-font-family, $draftail-editor-font-size, $draftail-editor-line-height, $draftail-toolbar-radius, $draftail-editor-border, $draftail-toolbar-tooltip-radius, $draftail-toolbar-tooltip-duration, $draftail-toolbar-tooltip-delay`.
- Delay toolbar tooltip opening on hover by 0.5s, animated over 0.1s.
- Make Markdown-style markers work on non-empty blocks ([#53](https://github.com/wagtail/draftail/issues/53)).

### Changed

- Switch to rollup for package compilation.
- Move `DraftailEditor` from default export of draftail to named export (`import { DraftailEditor } from 'draftail';`).
- Wrap `propTypes` in env check so they only appear in dev build.
- Rename / namespace all overridable Sass constants.
- Rename `nested-list-item($depth)` to `draftail-nested-list-item($depth)`.
- Stop defining `$draftail-tooltip-radius` based on `$draftail-editor-radius`.
- Simplify `DraftUtils.getSelectedBlock()` implementation.
- Rename `options` prop to `entityType` for entity sources.
- Rename `onUpdate` prop to `onComplete` for entity sources.
- Rename `entityConfig` prop to `entityType` for entity blocks.
- Replace normalize API with `draftjs-filters` ([#123](https://github.com/wagtail/draftail/issues/123)).
- Update toolbar tooltips to show markdown markers for all blocks.

### Fixed

- Prevent toolbar button labels from being selected.
- Fix newline block insertion & reset creating 2 entries in undo stack ([#105](https://github.com/wagtail/draftail/issues/105)).

### Removed

- Remove all unused variables from Sass constants.
- Remove `immutable` from `peerDependencies`.
- Remove `draftjs-utils` from `dependencies`.
- Remove `DraftUtils.createEntity()`.
- Remove `DraftUtils.getAllBlocks()`.
- Remove `DraftUtils.getEntityRange()`.
- Remove `onClose` prop for entity sources.

## [[v0.10.0]](https://github.com/wagtail/draftail/releases/tag/v0.10.0)

### Added

- Add new `DraftUtils.getEntitySelection(editorState, entityKey)` method, returning the selection corresponding to a given entity. Note: only works if the entity is in the currently selected block.
- Add `DraftUtils.updateBlockEntity` method, with workaround for Draft.s 0.10 entity data update bug.
- Add shortcuts for blockquote and code block to toolbar tooltips.
- Use alternative keyboard shortcuts for more formats.
- Add default labels & descriptions for built-in formats ([#122](https://github.com/wagtail/draftail/issues/122)).
- Process, filter, migrate available blocks, styles and entities when pasting rich text ([#50](https://github.com/wagtail/draftail/pull/50) & [#103](https://github.com/wagtail/draftail/pull/103) thanks to [@inostia](https://github.com/inostia), see [#123](https://github.com/wagtail/draftail/issues/123) for next steps).
- Add support for custom text decorators ([#121](https://github.com/wagtail/draftail/issues/121)).
- Add predefined classes for block depth levels above 4, of the format `public-DraftStyleDefault-depth${depth}`.
- Add `nested-list-item($depth)` Sass mixin to generate styles for arbitrary list item nesting.
- Introduce new `Draftail-` class namespace for all styles ([#63](https://github.com/wagtail/draftail/issues/63)).
- Expose Sass stylesheets to Draftail users, for extension.

### Changed

- Exclude toolbar buttons from default focus navigation flow.
- Disable ligatures in the editor, to simplify cursor behaviour.
- Stop bundling the Draft.js styles. They now have to be manually included. The previous approach was prone to version mismatches.
- Configure text antialiasing for Firefox.
- Change `Icon` implementation to use SVG by default. Supports symbol references, SVG path(s), and arbitrary React components ([#119](https://github.com/wagtail/draftail/issues/119)).
- Disable pointer events on all icons by default.
- Remove toolbar hover styles.
- Make more of the editor styling overridable.
- Move `Tooltip` outside of Draftail package.
- Refactor tooltip for inline entities to be defined directly in decorators. They should now define their own tooltip (or other control), rather than rely on `data-tooltip`.
- Move `Portal` component outside of Draftail.
- Add `block` prop to entityTypes, and move `IMAGE` and `EMBED` blocks outside of Draftail ([#121](https://github.com/wagtail/draftail/issues/121)).
- Provide methods for `entityTypes`' `block` to edit, remove entity.

### Removed

- Remove Save and Cancel buttons from image block, thanks to [@allcaps](https://github.com/allcaps) ([#102](https://github.com/wagtail/draftail/pull/102))
- Remove `DraftUtils.getSelectedEntitySelection`. It can be replaced by `DraftUtils.getEntitySelection(editorState, DraftUtils.getSelectionEntity(editorState))`.
- Remove built-in support for `MODEL` entities.
- Remove built-in support for `EMBED` entities.
- Remove built-in support for `DOCUMENT` entities.
- Remove support for `entityTypes`' `imageFormats`.
- Remove support for custom `entityTypes` `strategy`.

### Fixed

- Update handleNewLine to defer breakout in code-block. Fix [#104](https://github.com/wagtail/draftail/issues/104).
- Fix toolbar entity edit and remove not working on selection pre first char. Fix [#109](https://github.com/wagtail/draftail/issues/109).
- Fix block type transformations moving selection to the wrong block.
- Fix editor scrolling in the wrong position when breaking a big block (https://github.com/facebook/draft-js/issues/304#issuecomment-327606596).

## [[v0.9.0]](https://github.com/wagtail/draftail/releases/tag/v0.9.0)

### Added

- Add support for [custom inline styles](https://github.com/wagtail/draftail#custom-inline-styles), thanks to [@vincentaudebert](https://github.com/vincentaudebert) ([#97](https://github.com/wagtail/draftail/pull/97)).
- Add [basic styles](https://github.com/wagtail/draftail/blob/60f2f6ef5684c10c7c409a6333f2b157b955fa45/lib/api/constants.js#L51) for common inline styles.
- Add new `description` prop for all formats to describe the format's use with more text than the `label`.
- Add tooltips for toolbar buttons to display the full control `description` as well as its keyboard shortcut.
- Add separate button groups in the toolbar.
- Add basic undo/redo controls in the toolbar ([#100](https://github.com/wagtail/draftail/pull/100)), displaying the related keyboard shortcuts.
- Introduce icons for hr: `―` and br: `↵`.
- Add keyboard shortcuts for superscript & subscript.
- Add more Markdown-like markers for heading levels (`##`), code block (triple backtick), blockquote (`>`), hr (`---`) ([#53](https://github.com/wagtail/draftail/issues/53)).
- Add `spellCheck` prop, passed to Draft.js `Editor`. Sets whether spellcheck is turned on for your editor.
- Add support for React 16.

### Changed

- Update keyboard shortcuts format to follow that of Google Docs.
- Refine toolbar styles. Fix toolbar to the top of the page when sticky.
- Make the editor look closer to a textarea ([#96](https://github.com/wagtail/draftail/issue/96)).
- Update strikethrough shortcut from Google Docs.
- Update Draft.js dependency to 0.10.4, and `draftjs-utils` to 0.8.8.
- Stop preserving Markdown-like block marker when undoing block type change.
- Stop restricting block type changes based on Markdown-style markers to unstyled blocks only.

### Fixed

- Fix tooltip position when scrolling ([#99](https://github.com/wagtail/draftail/pull/99)).
- Fix beforeInput text replacement happening on non-collapsed selections.
- Prevent text inserted after entities from continuing the entity. Fix [#86](https://github.com/wagtail/draftail/issue/86) ([#106](https://github.com/wagtail/draftail/pull/106)).

### How to upgrade

This release does not have many breaking changes, but the editor's toolbar styles have changed a lot and this may cause breakage.

First, update Draftail and its Draft.js peer dependency: `npm install --save draft-js@^0.10.4 draftail@0.9.0`.

Then, you will want to update controls to leverage the new `description` prop. It will be displayed in the new toolbar tooltips. Here is a brief example:

```diff
blockTypes={[
    {
        type: BLOCK_TYPE.HEADER_THREE,
        label: 'H3',
        // Use a description to further convey what the control does.
+        description: 'Heading 3',
    },
    {
        type: BLOCK_TYPE.UNORDERED_LIST_ITEM,
        // The icon is enough – but use the new prop to help screen reader users.
-        label: 'UL',
+        description: 'Bulleted list',
        icon: 'icon-list-ul',
    },
]}
```

## [[v0.8.0]](https://github.com/wagtail/draftail/releases/tag/v0.8.0)

### Added

- Add `name` attribute to button elements to simplify targeting in browser automation tests.
- Publish the package as an ES2015 module.

### Changed

- Upgrade draftjs-utils to latest (draftjs-utils).
- Use references to window object instead of global.
- Update dependencies to remove Immutable.js duplication

## [[v0.7.3]](https://github.com/wagtail/draftail/releases/tag/v0.7.3)

### Added

- Expose reusable Portal component as part of the API.

## [[v0.7.2]](https://github.com/wagtail/draftail/releases/tag/v0.7.2)

### Changed

- Only stick toolbar when editor is active.
- Make editor slightly bigger.

### Fixed

- Fix `editor` class name concatenation.

## [[v0.7.1]](https://github.com/wagtail/draftail/releases/tag/v0.7.1)

### Fixed

- Fix CSS import present in published library.

## [[v0.7.0]](https://github.com/wagtail/draftail/releases/tag/v0.7.0)

### Added

- Make the editor toolbar sticky (requires a polyfill, documented in README).
- Add support for `placeholder` attribute.

### Changed

- Improve "active block" rendering and disabled state.

### Fixed

- Fix missing vertical spacing between button rows.
- Fix missing pointer cursor on tooltip button.

### Removed

- Remove `Element.closest` polyfill from main lib.

## [[v0.6.0]](https://github.com/wagtail/draftail/releases/tag/v0.6.0)

### Added

- Add default `strategy` for entity types based on `type`.

### Changed

- Change empty `RawDraftContentState` in conversion API to be null.
- Change entity type nomenclature to use `source` and `decorator` in place of `control` and `component`.

## [[v0.5.0]](https://github.com/wagtail/draftail/releases/tag/v0.5.0)

### Added

- Implement list depth normalisation on copy/paste.
- Add title attributes on buttons to display keyboard shortcuts. Fix #37.
- Override default code-block element. Fix #41.

### Changed

- Update project to use draft-js@0.10 API
- Move draftjs-utils `peerDependency` to be a dependency.
- Move immutable `peerDependency` to be a dependency.
- Copy/paste of rich text is now configurable via the `stripPastedStyles` option.
- Copy/paste of rich text is now disabled by default. This will be enabled by default once it is better supported.

## [[v0.4.1]](https://github.com/wagtail/draftail/releases/tag/v0.4.1)

### Fixed

- Fix image block not unlocking editor on cancel.

## [[v0.4.0]](https://github.com/wagtail/draftail/releases/tag/v0.4.0)

### Added

- Make `hr` availability configurable with `enableHorizontalRule`. #25.
- Add `br` support, availability configurable with `enableLineBreak`.
- Prevent soft line breaks from keyboard shortcut if disabled.
- Add editor CSS to published package. #17
- Add common keyboard shortcuts (inspired by Google Docs, see documentation for the full list).
- Add support for "autolist" behavior (lines starting with `-`, `*`, `1.` are automatically converted to list items).

### Changed

- Max nested list level is now 1.
- Max nested list level is now configurable via a prop.
- Save interval is now configurable via a prop.
- Change `hr` representation to use atomic block and entity instead of custom block type. #1
- `mediaControls`, `dialogControls` and `modelPickerOptions` are now a single `entityTypes` array. #26
- `sources` and `decorators` are now declared directly in the `entityTypes` array items.
- `INLINE_STYLES` property is now `inlineStyles`.
- `BLOCK_TYPES` property is now `blockTypes`.
- Inline styles and block types now use the `type` attribute instead of `style`.
- `imageFormats` are now assigned directly on the `IMAGE` entity type. #33
- All options are now direct props of `DraftailEditor` instead of attributes of the `options` prop. #21

### Fixed

- Fix erratic behavior of list nesting changes with tab and shift+tab shortcuts. #34
- Fix keyboard shortcuts giving access to unallowed formatting. #32
- Fix tooltip not opening when clicking decorator icon. #5

### Removed

- draftail no longer depends on jQuery.
- draftail no longer depends on the Wagtail font icon.

## [[v0.3.3]](https://github.com/wagtail/draftail/releases/tag/v0.3.3)

### Added

- Allow customisation of block style function & block render map.

## [[v0.3.2]](https://github.com/wagtail/draftail/releases/tag/v0.3.2)

### Added

- Pressing return on an empty list item should un-indent it until it is not nested, and then remove it.
- Pressing return at the end of a block should create an empty unstyled block.

## [[v0.3.1]](https://github.com/wagtail/draftail/releases/tag/v0.3.1)

### Fixed

- Buttons do not trigger a form submit

## [[v0.3.0]](https://github.com/wagtail/draftail/releases/tag/v0.3.0)

> This release contains **breaking changes**.

### Added

- Keyboard shortcuts documentation

### Changed

- Expose onSave hook instead of auto field saving (https://github.com/wagtail/draftail/issues/23)

### Fixed

- https://github.com/wagtail/draftail/issues/2
- https://github.com/wagtail/draftail/issues/3
- https://github.com/wagtail/draftail/issues/28

## [[v0.2.0]](https://github.com/wagtail/draftail/releases/tag/v0.2.0)

### Changed

- Reworking most of the editor codebase to make it more maintainable.
- Configurable block types and inline styles.

## [[v0.1.0]](https://github.com/wagtail/draftail/releases/tag/v0.1.0)

First usable release!

---

Template from http://keepachangelog.com/

## [[vx.y.z]](https://github.com/wagtail/draftail/releases/tag/vx.y.z)

### Added

- Something was added to the API / a new feature was introduced.

### Changed

### Fixed

### Removed
