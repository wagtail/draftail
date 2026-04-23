# Roadmap

This file provides an overview of the direction this project is heading. It contains both likely and more aspirational changes. For more granular improvements, see the [project's issues backlog](https://github.com/wagtail/draftail/issues).

## Planned

> Specific, well-scoped changes that have concrete time-bound implementation plans.

### Dependency refresh and audit automation

Implement automated dependency updates via Dependabot or Renovate with grouped updates for minor/patch versions. Add `npm audit` to CI with fail-on-critical policy and establish a monthly cadence for reviewing and updating major dependencies.

### Strict CSP support

See [CSP-compatible editor #460](https://github.com/wagtail/draftail/issues/460).

### Automated release workflow

Add a GitHub Actions workflow for tagged releases that runs the full test suite, builds distribution files, publishes to npm, creates GitHub releases with changelogs, and updates documentation site references automatically. SBOM generation.

### Security review process

Set up an automated review process including dependency vulnerability scans, CodeQL static analysis integration, and updates to `SECURITY.md` with disclosure timelines and supported version policies.

## Ready

> Feasible, near-term improvement ideas that are clear in scope.

### Modernize build toolchain

Replace the current Rollup + webpack + Sass pipeline with modern tooling. Consider Vite for both library builds and Storybook, and evaluate esbuild/swc for faster TypeScript compilation. Target build time reduction of 50% and smaller bundle sizes via improved tree-shaking.

## Experimental

> Possible changes that require R&D, and high-risk ideas that could bring large benefits but with likely trade-offs.

### Table support

See [Table support #198](https://github.com/wagtail/draftail/issues/198).

### Migration path from Draft.js

See [Draft.js no longer maintained #456](https://github.com/wagtail/draftail/issues/456). Draft.js is archived and no longer maintained. Research and prototype migration strategies: evaluate Lexical as a replacement engine, or explore a compatibility layer that allows gradual migration of content and plugins. Document migration complexity and timeline estimates.

## Backlog

> Likely useful but lower-priority or "filler" tasks.

### ESM-only distribution

Evaluate dropping CommonJS support in a future major version to simplify the build pipeline and enable better tree-shaking. Document migration path for CJS consumers.

### Pre-commit hooks modernization

Replace shell-based git hooks with prek. Add commit message linting and branch naming conventions.

### Performance regression testing in CI

Establish baseline metrics for editor initialization time, re-render performance, and memory usage. Integrate `react-benchmark` results and bundle size tracking into CI to fail builds on significant regressions. Store historical performance data for trend analysis.

### TypeScript strict mode migration

Gradually enable stricter TypeScript compiler options (strictNullChecks, noImplicitAny, strictFunctionTypes) across the codebase. Add type coverage tracking and establish conventions for type definitions in public APIs.
