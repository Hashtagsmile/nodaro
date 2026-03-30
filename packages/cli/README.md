# `@nodaro/cli`

Command-line entrypoint for **`npx nodaro`**.

## What it does

Starts a small Express server, mounts the [`nodaro`](../core) API and static UI, and opens the admin panel in your browser (unless disabled).

## Development

From the monorepo root:

```bash
npm --workspace packages/core run build
npm --workspace packages/client run build
npm --workspace @nodaro/cli run build
```

On npm, the CLI depends on the **`nodaro`** package (`^0.1.0` range; bump in lockstep when releasing—see root [`RELEASING.md`](../../RELEASING.md)).
