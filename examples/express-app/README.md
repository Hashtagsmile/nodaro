# Nodaro Embed Example (Express)

Minimal Express integration for embed mode.

## Run

```bash
cd examples/express-app
npm run dev
```

Set `MONGO_URI` if you want auto-connect on startup. On first run with an **empty** database, the app seeds demo collections (`users`, `categories`, `products`, `orders`, plus **`wide_records`** with many top-level fields for wide-table / horizontal-scroll testing). Seeding is skipped if `users` already has documents. Set `FORCE_SEED=1` to drop those collections and reseed; set `NODARO_SEED=0` to never seed.

```bash
MONGO_URI=mongodb://localhost:27017/mydb npm run dev
```

Open:

- App route: `http://localhost:3000/api/hello`
- Nodaro UI: `http://localhost:3000/nodaro`
- Nodaro API base: `http://localhost:3000/nodaro/api`
