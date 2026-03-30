# Examples

Runnable sample applications that show how to integrate Nodaro (embed, paths, env). **Contributions are welcome**—see [Contributing an example](#contributing-an-example) below.

| Example | Description |
|---------|-------------|
| [`express-app`](express-app/) | Minimal Express server with `setupNodaro` embed, optional seed data |

See each folder’s `README.md` for how to run it.

---

## Contributing an example

You can propose or add another app under `examples/<your-example>/` (e.g. another framework, Docker-only flow, or auth in front of the UI).

**Before a large or unusual example**, open a [feature request](https://github.com/Hashtagsmile/nodaro/issues/new/choose) or a short issue so maintainers can agree on scope—keeps the repo from growing too many overlapping demos.

**Conventions**

1. **Workspace** — Root [`package.json`](../package.json) already includes `"examples/*"` workspaces. Add a new folder with its own `package.json` so `npm install` at the repo root picks it up.
2. **Naming** — Prefer `examples/<kebab-name>/`. Set `"name": "@nodaro/example-<kebab-name>"`, `"private": true`, and a short `description`.
3. **Dependency on Nodaro** — Use the workspace protocol like the Express demo: `"nodaro": "*"` (resolves to `packages/core`). Build the `nodaro` package before running the example (`npm --workspace packages/core run build`, plus client if you need the UI bundle).
4. **README** — Required: what it demonstrates, how to run (`npm install` from repo root, then `npm --workspace @nodaro/example-<name> run dev`), env vars, and link to the main [README](../README.md) for global behavior.
5. **Keep it small** — Minimal deps, no secrets, no production-only services. Examples should be copy-paste friendly and easy to delete or fork.
6. **Index** — Add a row to the table at the top of this file in your PR.

**CI** — GitHub Actions runs `npm run build:examples` after core, client, and tests, which builds **every** `examples/*` workspace that defines a `build` script. Add or keep a `build` script if your example should be checked on each PR.
