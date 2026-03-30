# Nodaro

A zero-config MongoDB admin panel for local development and small internal tools.

---

## What it is

Nodaro is a simple web UI on top of MongoDB.

You can run it in two ways:

- **CLI** — `npx nodaro`
- **Embedded** — `setupNodaro(app)` inside your existing Express app

**Stack**

- Backend: Express + Mongoose
- Frontend: React

### Positioning

Nodaro sits between **opening Compass (or Studio) for every small check** and **shipping a custom admin**. It is **intentionally small**: one embed (`setupNodaro`), no separate service, no ambition to match full database GUIs feature-for-feature. Use it when you want **fast, repeatable** inspect/edit/delete in the app you’re already running—especially with **embed mode** so the UI lives next to your API.

**Open source** — MIT. Bugfixes and doc improvements are welcome; bigger features should stay aligned with _small tool, low ceremony_.

---

## Why it exists

When you're building an MVP or a small app, you still need some way to look at your data.

Maybe to:

- check if something saved correctly
- fix a broken record
- clean up test data

You can use MongoDB Compass, but it’s slow for this kind of quick, repeated work.

You can build an admin panel — but that’s extra code, routes, and UI you probably don’t want to spend time on. 

There are tools that solve this too, but they usually come with setup, configuration, and more overhead than most MVPs need.

Nodaro is built for that middle ground:

> open it → connect → inspect → update → move on

---

## What you can do

- connect to any MongoDB URI at runtime
- browse collections
- query documents (filters, pagination, sorting)
- search by `_id` or text
- create, edit, and delete documents
- inspect documents in a side panel
- edit fields inline

---

## Quick start

### Requirements

- Node.js 18+ (see root `package.json` `engines`; `.nvmrc` pins **22** for local parity with CI)
- npm 9+
- MongoDB (local or Atlas)

---

### CLI

```bash
npx nodaro
```

Optional environment variables:

- `NODARO_PORT` (default: 4000)
- `NODARO_URI` (or `MONGO_URI`)

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

Example: [`examples/express-app`](examples/express-app). More samples and **how to contribute new examples** are described in [`examples/README.md`](examples/README.md).

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

- `http://localhost:3000/api/hello` (host app route)
- `http://localhost:3000/nodaro` (Nodaro UI)

If you skip `MONGO_URI`, connect from the Nodaro UI via `/connect`.

With `MONGO_URI` and an **empty** database, the example seeds demo collections (`users`, `categories`, `products`, `orders`, plus `wide_records` for wide tables). See `examples/express-app/README.md` for `FORCE_SEED` / `NODARO_SEED`.

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

- MVPs
- internal tools
- side projects
- backend debugging

**Probably not a fit**

- large multi-tenant admin platforms
- apps needing auth/roles/audit out of the box
- analytics-heavy dashboards

---

## What it is not

Nodaro is intentionally small.

It is not:

- a full admin framework
- a BI tool
- a schema migration system
- an auth/permissions layer

---

## Security

There is **no built-in authentication or roles**. Treat Nodaro like direct database access: fine for **local dev** and **trusted internal networks**; for anything else, **put it behind your app’s auth**, a VPN, or reverse-proxy rules. **Do not** expose an open instance to the public internet.

For reporting vulnerabilities, see [`SECURITY.md`](SECURITY.md).

---

## Roadmap, feedback & community

- **Planned work & scope** — [`ROADMAP.md`](ROADMAP.md) (near-term plans, what we will not build here, and how to suggest changes).
- **Ideas & wishes** — use the [**Feature request / idea** issue template](https://github.com/Hashtagsmile/nodaro/issues/new/choose). If **GitHub Discussions** is enabled on the repo, you can also use that for open-ended brainstorming.
- **Contributing** — [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).
- **Doc index** — [`docs/README.md`](docs/README.md) links all top-level docs and package READMEs.
- **Example apps** — [`examples/README.md`](examples/README.md) lists demos and explains how to add your own integration example.

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
├── docs/         documentation index (links to all guides)
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
GET    /collections/counts
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

From repo root:

```bash
npm install
npm --workspace packages/core run build
npm --workspace packages/client run build
```

Client build output goes to `packages/core/public`.

### Tests

```bash
npm test
```

Integration tests live in `packages/core` (Vitest + Supertest). One suite spins up an **in-memory MongoDB** via `mongodb-memory-server`; the **first run** may download a MongoDB server binary (then it is cached on your machine and in CI).

---

## Changelog & releases

- **Changelog** — [`CHANGELOG.md`](CHANGELOG.md) follows [Keep a Changelog](https://keepachangelog.com/) and [SemVer](https://semver.org/).
- **CI** — Pull requests and pushes to `main` run core + client build, integration tests, and **`npm run build:examples`** (every `examples/*` workspace with a `build` script). See `.github/workflows/ci.yml`.
- **Tags** — Create a Git tag when you publish (`v0.1.0`, …) and add a GitHub Release (or publish to npm) so the changelog links and history stay aligned.
- **npm** — Maintainer steps for publishing are in [`RELEASING.md`](RELEASING.md).

---

## How to contribute

See **[`CONTRIBUTING.md`](CONTRIBUTING.md)** for the full workflow (tests, changelog, PR expectations).

---

## License

MIT — see `LICENSE`
