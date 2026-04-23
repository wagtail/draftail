import React, { Component, ReactNode } from "react";

type Props = {
  children: ReactNode;
};
type State = {
  error: Error | null | undefined;
  reloads: number;
};

class SentryBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      error: null,
      reloads: 0,
    };
    this.onAttemptReload = this.onAttemptReload.bind(this);
  }

  componentDidCatch(error: Error) {
    this.setState({
      error,
    });
  }

  onAttemptReload() {
    const { reloads } = this.state;

    if (reloads > 2) {
      window.location.reload();
    } else {
      this.setState({
        error: null,
        reloads: reloads + 1,
      });
    }
  }

  render() {
    const { children } = this.props;
    const { reloads, error } = this.state;
    return error ? (
      <div className="editor">
        <div className="editor__toolbar">
          <div className="toolbar-group">
            <button
              type="button"
              className="toolbar-button"
              disabled
              aria-label="Placeholder"
            >
              &nbsp;
            </button>
          </div>
        </div>
        <div className="DraftEditor-root">
          <div className="DraftEditor-editorContainer">
            <div className="public-DraftEditor-content">
              <div className="u-text-center">
                <p>Oops. The editor just crashed.</p>
                <p>
                  Our team has been notified. You can provide us with more
                  information if you want to.
                </p>
                <div>
                  <a
                    href="https://github.com/wagtail/draftail/issues"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      textDecoration: "underline",
                    }}
                  >
                    Open a GitHub issue
                  </a>
                  <span> or </span>
                  <button type="button" onClick={this.onAttemptReload}>
                    {reloads > 2 ? "Reload the page" : "Reload the editor"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : (
      children
    );
  }
}

export default SentryBoundary;
