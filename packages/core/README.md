# nodaro (core)

Reusable Nodaro runtime package.

This package provides the backend API, MongoDB connection layer, and static UI serving for both CLI and embed use cases.

## Exports

- `setupNodaro(app, options?)`
- `createNodaroRouter()`
- `connectToMongo()`, `disconnectFromMongo()`, `getConnectionStatus()`, `getDb()`

## `setupNodaro` options

```ts
interface NodaroOptions {
  basePath?: string; // default "/nodaro"
  apiPath?: string;  // default "/nodaro/api"
  mongoUri?: string; // optional auto-connect
}
```

## API routes mounted by core

- `POST /connect`
- `GET /connect/status`
- `GET /collections`
- `GET /collections/counts`
- `GET /collections/:collection/schema`
- `POST /documents/query`
- `POST /documents/search`
- `POST /documents`
- `PUT /documents/:id`
- `DELETE /documents/:id?collection=name`
- `GET /health`

## Build

```bash
cd packages/core
npm run build
```

Static UI files are served from `packages/core/public` and are produced by `packages/client`.

## Tests

See the root [README](../../README.md#tests). Integration tests live under `packages/core/src/**/*.integration.test.ts`.
