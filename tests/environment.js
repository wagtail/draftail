// Shim unimplemented DOM method.
window.open = () => {};

// Set by Webpack during the Storybook build.
global.SVG_ICONS = "";
global.PKG_VERSION = "";

// stats-js relies on canvas, which does not work with jsdom in Jest.
window.DISABLE_STATSGRAPH = true;

// Shim CSSStyleSheet and replaceSync
// See https://github.com/jsdom/jsdom/issues/3766
class CSSStyleSheet {
  // eslint-disable-next-line class-methods-use-this
  replaceSync() {
    // No-op
  }
}
window.CSSStyleSheet = CSSStyleSheet;

document.adoptedStyleSheets = [];
