# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- GitHub Actions CI (build + integration tests on pull requests and pushes to `main`).
- Integration tests for the core HTTP API (`packages/core`): validation-only routes, disconnected-DB behavior, and an in-memory MongoDB smoke test for CRUD.
- Contributor-facing docs: `CONTRIBUTING.md`, `ROADMAP.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `docs/README.md`, `examples/README.md` (including how to add new example apps), package READMEs (`packages/cli`, `packages/client`), and GitHub issue / PR templates.
- CI builds all `examples/*` workspaces that define a `build` script (`npm run build:examples`). Root `engines.node` and `.nvmrc` document the Node version used in development and CI.
- [`RELEASING.md`](RELEASING.md) documents npm publish order and version alignment; `nodaro` and `@nodaro/cli` package manifests include `repository` / `bugs` / `homepage` for the registry.
- Published packages ship a **`LICENSE`** file; `nodaro` exposes an **`exports`** map. CI runs **`npm pack --dry-run`** for both publishable workspaces. [`RELEASING.md`](RELEASING.md) covers optional **`--provenance`** and release automation tools.

## [0.1.0] — 2026-03-30

### Added

- Initial release: Express + Mongoose backend, React admin UI, CLI (`npx nodaro`) and embed API (`setupNodaro`).
- MongoDB operations: connect, browse collections, query/search documents, CRUD, inline editing.
- Example Express app under `examples/express-app` with optional demo seed data.

[Unreleased]: https://github.com/Hashtagsmile/nodaro/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Hashtagsmile/nodaro/releases/tag/v0.1.0
