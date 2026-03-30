# Contributing to Nodaro

Thanks for your interest. Nodaro is meant to stay a **small, low-ceremony** tool. Bugfixes, documentation, tests, and focused improvements are especially welcome.

## Principles

- Keep changes **scoped** to one concern per pull request when possible.
- **Match** existing naming, structure, and formatting in the code you touch.
- Prefer **tests** for behavior that could regress (see the root [README](README.md#tests)).

## Before you open a PR

1. From the repository root, run **`npm test`**, **`npm run build`**, and **`npm run build:examples`** (if you touched an example with a `build` script) so CI stays green.
2. For **user-facing changes**, add a line under **`[Unreleased]`** in [`CHANGELOG.md`](CHANGELOG.md) ([Keep a Changelog](https://keepachangelog.com/)).
3. For **large or risky changes** (new surfaces, auth, multi-tenant admin, etc.), open an **issue** first so we can agree on direction.

## Pull requests

- Describe **what** changed and **why** (a few sentences is enough).
- Link related **issues** when applicable.

## Where things live

| Area        | Path |
|------------|------|
| API & embed | `packages/core` |
| React UI    | `packages/client` |
| CLI entry   | `packages/cli` |
| Demo apps   | `examples/*` |

## Example apps

Extra **sample projects** (embed patterns, stacks, Docker, etc.) belong under `examples/`. See [`examples/README.md`](examples/README.md) for naming, workspace setup, and how to add a new example in a pull request.

## Questions

- **Ideas and wishes** — see [ROADMAP.md](ROADMAP.md) and use a [feature request](https://github.com/Hashtagsmile/nodaro/issues/new/choose) (or [Discussions](https://github.com/Hashtagsmile/nodaro/discussions) if enabled on the repo).
- **Bugs** — use the bug report template when opening an issue.
