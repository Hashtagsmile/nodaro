# @nodaro/cli

CLI entrypoint for Nodaro.

Starts an Express server, mounts Nodaro at root, and optionally opens the browser automatically.

## Local development

```bash
cd packages/cli
npm run dev
```

## Environment variables

- `NODARO_PORT` (default: `4000`)
- `NODARO_URI` (preferred Mongo URI)
- `MONGO_URI` (fallback)

## Runtime flags

- `--no-open` disables auto-open browser behavior
