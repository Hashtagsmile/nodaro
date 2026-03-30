# Roadmap & plans

This file is a **living snapshot** of what maintainers intend to work on next and what is **not** committed yet. It is not a guarantee of dates—releases follow [SemVer](https://semver.org/) and [`CHANGELOG.md`](CHANGELOG.md).

## Planned (near term)

Items we expect to tackle in upcoming releases when time allows:

- **Stability** — expand integration tests around edge cases (filters, errors, large payloads) without bloating the runtime.
- **Docs** — keep package READMEs and the root README aligned with the API and embed options.
- **Releases** — predictable tags and npm publishes with notes in the changelog.

## Under consideration

Ideas that fit the “small admin panel” scope but need design or prioritization:

- **Community example apps** — additional demos under `examples/` (see [`examples/README.md`](examples/README.md)); CI builds each example that exposes a `build` script (`npm run build:examples`).
- Optional **Docker** example or documented image for local demos (not a required deployment path).
- Clearer **embed** cookbook patterns (path prefixes, reverse proxies).
- Light **accessibility** pass on the React UI (keyboard, focus, contrast).

## What we are unlikely to build here

To avoid scope creep, these belong in **your app** or a different product—not in core Nodaro:

- Built-in **authentication / RBAC** (put Nodaro behind your gateway or app auth).
- Full **schema migration** or BI/analytics stacks.
- Multi-tenant **hosted** admin as a service.

## Suggest an improvement

We use GitHub to track work:

1. **Quick ideas & wishes** — open a [**Feature request**](https://github.com/Hashtagsmile/nodaro/issues/new/choose) issue (or start a [**Discussion**](https://github.com/Hashtagsmile/nodaro/discussions) if the repository has Discussions enabled).
2. **Bugs** — use the **Bug report** template.
3. **Security-sensitive issues** — see [`SECURITY.md`](SECURITY.md); do not post exploit details in public issues.

Votes and detailed use cases on issues help us prioritize. Thank you for helping shape the project.
