# Nodaro

A zero-config MongoDB admin panel for local development and small internal tools.

---

## What it is

Nodaro is a simple web UI on top of MongoDB.

You can run it in two ways:

* **CLI** — `npx nodaro`
* **Embedded** — `setupNodaro(app)` inside your existing Express app

**Stack**

* Backend: Express + Mongoose
* Frontend: React

---

## Why it exists

Typical workflow:

You’re building a feature.
You need to check a few documents, tweak a value, maybe clean up some test data.

MongoDB Compass works — but it’s not great for quick, repeatable flows.
Admin frameworks exist — but they’re usually too heavy for MVPs or internal tools.

Nodaro is built for that gap:

> open it → connect → inspect → update → move on

---

## What you can do

* connect to any MongoDB URI at runtime
* browse collections
* query documents (filters, pagination, sorting)
* search by `_id` or text
* create, edit, and delete documents
* inspect documents in a side panel
* edit fields inline

---

## Quick start

### Requirements

* Node.js 18+
* npm 9+
* MongoDB (local or Atlas)

---

### CLI

```bash
npx nodaro
```

Optional environment variables:

* `NODARO_PORT` (default: 4000)
* `NODARO_URI` (or `MONGO_URI`)

---

### Embed in Express

```ts
import express from "express";
import { setupNodaro } from "nodaro";

const app = express();

setupNodaro(app, {
  basePath: "/nodaro",
  apiPath: "/nodaro/api",
  mongoUri: process.env.MONGO_URI, // optional
});

app.listen(3000);
```

Example: `examples/express-app`

---

## Test build (demo app)

Run from repo root:

```bash
npm install
npm --workspace packages/core run build
npm --workspace packages/client run build
MONGO_URI="mongodb://localhost:27017/test" npm --workspace examples/express-app run dev
```

Open:

* `http://localhost:3000/api/hello` (host app route)
* `http://localhost:3000/nodaro` (Nodaro UI)

If you skip `MONGO_URI`, connect from the Nodaro UI via `/connect`.

Use `-- --no-open` to disable browser auto-open in the demo app:

```bash
MONGO_URI="mongodb://localhost:27017/test" npm --workspace examples/express-app run dev -- --no-open
```

### Quick local MongoDB checks

```bash
# check mongod is listening
lsof -iTCP:27017 -sTCP:LISTEN -n -P

# optional: test connection directly
mongosh "mongodb://localhost:27017/test" --eval "db.runCommand({ ping: 1 })"
```

### Troubleshooting

- **`Unexpected token '<', '<!DOCTYPE ...' is not valid JSON`**  
  This means the frontend called the wrong API path and got HTML back. Rebuild and restart:

  ```bash
  npm --workspace packages/core run build
  npm --workspace packages/client run build
  MONGO_URI="mongodb://localhost:27017/test" npm --workspace examples/express-app run dev
  ```

- **Mongo URI fails to connect**  
  Ensure MongoDB is running on `localhost:27017`, then retry `mongodb://localhost:27017/test`.

---

## When to use it

**Good fit**

* MVPs
* internal tools
* side projects
* backend debugging

**Probably not a fit**

* large multi-tenant admin platforms
* apps needing auth/roles/audit out of the box
* analytics-heavy dashboards

---

## What it is not

Nodaro is intentionally small.

It is not:

* a full admin framework
* a BI tool
* a schema migration system
* an auth/permissions layer

---

## How it works

### CLI mode

```text
npx nodaro
  → starts Express
  → mounts Nodaro API
  → serves Nodaro UI
  → connects to MongoDB
```

---

### Embed mode

```text
your Express app
  → setupNodaro(app, { basePath, apiPath })
  → UI at /nodaro
  → API at /nodaro/api/*
```

The frontend sends generic requests (`/collections`, `/documents/query`, etc.),
and the backend translates them into MongoDB operations.

---

## Project structure

```text
nodaro/
├── packages/
│   ├── core/     setupNodaro + API routes + Mongo services
│   ├── client/   React frontend (builds to packages/core/public)
│   └── cli/      npx nodaro entrypoint
└── examples/
    └── express-app/
```

---

## API (brief)

```text
POST   /connect
GET    /connect/status

GET    /collections
GET    /collections/:collection/schema

POST   /documents/query
POST   /documents/search
POST   /documents
PUT    /documents/:id
DELETE /documents/:id?collection=name

GET    /health
```

In embed mode, these are mounted under your configured `apiPath` (default `/nodaro/api`).

---

## Local build

```bash
npm install
cd packages/core && npm run build
cd ../client && npm run build
```

Client build output goes to `packages/core/public`.

---

## License

MIT — see `LICENSE`
