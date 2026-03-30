# Releasing to npm

This monorepo publishes **two** packages:

| Package   | npm name    | Purpose                          |
|-----------|-------------|----------------------------------|
| Core      | `nodaro`    | `setupNodaro`, API, bundled UI in `public/` |
| CLI       | `@nodaro/cli` | `npx nodaro` binary            |

## Before you publish

1. **Changelog** — Add a dated section for the new version in [`CHANGELOG.md`](CHANGELOG.md) and move items out of `[Unreleased]` as appropriate.
2. **Version** — Bump **`packages/core/package.json`** `version` and **`packages/cli/package.json`** `version` together (e.g. `0.1.1`). In **`packages/cli/package.json`**, keep **`nodaro`** in `dependencies` aligned with that line (e.g. `"nodaro": "^0.1.1"` when you release `0.1.1`) so `npx @nodaro/cli` installs a compatible `nodaro` from the registry.
3. **Build the UI into core** — The `nodaro` tarball must include **`packages/core/public/`** (built React app). From the **repository root**:

   ```bash
   npm install
   npm run build
   ```

   That runs `packages/core` TypeScript and `packages/client` Vite output → `packages/core/public`.

4. **Sanity checks** (recommended):

   ```bash
   npm test
   npm run build:examples
   ```

## Publish order

Publish **`nodaro` first**, then **`@nodaro/cli`** (the CLI lists `nodaro` as a dependency).

From the repository root, using npm 9+:

```bash
npm publish --workspace=nodaro --access public
npm publish --workspace=@nodaro/cli --access public
```

(`--access public` is required for scoped packages like `@nodaro/cli`; `nodaro` is unscoped but the flag is harmless.)

Dry-run without uploading:

```bash
npm pack --workspace=nodaro
npm pack --workspace=@nodaro/cli
```

Inspect the tarballs (especially that `nodaro` contains `public/index.html`, `dist/`, and `LICENSE`).

Each published package includes a **`LICENSE`** file at the package root (same text as the repository root). If you change the root `LICENSE`, update `packages/core/LICENSE` and `packages/cli/LICENSE` in the same commit.

## Optional: npm provenance

To attach **cryptographic provenance** to a release (supply-chain transparency on npm), publish from a **trusted CI workflow** or use a supported environment and add `--provenance`:

```bash
npm publish --workspace=nodaro --access public --provenance
npm publish --workspace=@nodaro/cli --access public --provenance
```

You must [connect the npm package to GitHub Actions](https://docs.npmjs.com/trusted-publishers) (or another OIDC provider npm supports) so the registry accepts provenance. Local publishes may not support provenance depending on your npm version and login.

## Optional: release automation

Manual version bumps and `npm publish` are fine for small cadence. When releases get frequent, consider:

- **[Changesets](https://github.com/changesets/changesets)** — changelog + coordinated version bumps in monorepos.
- **[release-please](https://github.com/googleapis/release-please)** — conventional commits → release PRs.
- A **private workflow** that only runs `npm pack` / smoke tests on tags (you still publish by hand until you trust automation).

Renaming the core package to something like `@nodaro/core` would be a **breaking change** for embed imports; only do it with a major version and a migration note.

## After publishing

- Tag the repo: `git tag v0.1.1 && git push origin v0.1.1`
- Create a [GitHub Release](https://github.com/Hashtagsmile/nodaro/releases) with notes matching the changelog.

## Troubleshooting

- **`prepublishOnly` fails on missing `public/index.html`** — You skipped the client build. Run `npm run build` from the repo root.
- **CLI install can’t find `nodaro`** — Publish `nodaro` before `@nodaro/cli`, and ensure version ranges match.
