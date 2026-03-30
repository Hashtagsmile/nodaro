# `nodaro-client`

React + Vite frontend for the Nodaro admin UI.

## Build output

Production builds write static assets to **`packages/core/public`**, which the `nodaro` package serves in both CLI and embed modes.

From the monorepo root:

```bash
npm --workspace packages/client run build
```

## Development

```bash
npm --workspace packages/client run dev
```

Point the dev server at a running Nodaro API (see root [README](../../README.md) and `examples/express-app`).
