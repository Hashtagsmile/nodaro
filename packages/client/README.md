# nodaro-client

React frontend for Nodaro.

The UI is backend-driven and consumes relative API paths. In embed mode, API base is injected at runtime via `window.__NODARO_API_BASE__`.

## Development

```bash
cd packages/client
npm run dev
```

## Build

```bash
cd packages/client
npm run build
```

Build output goes to `packages/core/public` so `setupNodaro` can serve the UI.
