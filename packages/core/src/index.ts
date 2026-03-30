import cors from "cors";
import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { connectToMongo } from "./services/mongo.service";
import { createNodaroRouter } from "./router";

export interface NodaroOptions {
  /**
   * Path where the admin UI is served.
   * Default: "/nodaro"
   * Use "/" for standalone/CLI mode.
   */
  basePath?: string;

  /**
   * Path prefix for all API routes.
   * Default: "/nodaro/api"
   * Use "/" for standalone/CLI mode.
   */
  apiPath?: string;

  /**
   * Optionally auto-connect to MongoDB on setup.
   * The /connect endpoint is always available regardless.
   */
  mongoUri?: string;
}

const PUBLIC_DIR = path.join(__dirname, "../public");

export function setupNodaro(app: Express, options: NodaroOptions = {}): void {
  const {
    basePath = "/nodaro",
    apiPath = "/nodaro/api",
    mongoUri,
  } = options;

  if (mongoUri) {
    void connectToMongo(mongoUri);
  }

  const isStandalone = apiPath === "/";

  // Shared request parsing — safe to call even if the host app already has these
  app.use(express.json({ limit: "1mb" }));
  app.use(cors());

  // Mount API router
  if (isStandalone) {
    app.use(createNodaroRouter());
  } else {
    app.use(apiPath, createNodaroRouter());
  }

  if (!fs.existsSync(PUBLIC_DIR)) {
    console.warn(
      "[nodaro] UI static files not found at packages/core/public.\n" +
      "         Run `cd packages/client && npm run build` to generate them.",
    );
    return;
  }

  const indexPath = path.join(PUBLIC_DIR, "index.html");

  if (isStandalone) {
    // Serve static files at root — API routes already mounted above take priority
    app.use(express.static(PUBLIC_DIR));
    app.use((_req, res) => res.sendFile(indexPath));
  } else {
    // Embed mode: serve UI under basePath, inject runtime API base into index.html
    // Disable default index serving so requests to /nodaro always go through
    // the injected HTML response below (sets window.__NODARO_API_BASE__).
    app.use(basePath, express.static(PUBLIC_DIR, { index: false }));
    app.use(basePath, (_req, res) => {
      const html = fs
        .readFileSync(indexPath, "utf8")
        .replace(
          "</head>",
          `<script>window.__NODARO_API_BASE__="${apiPath}"</script></head>`,
        );
      res.send(html);
    });
  }
}

// Named exports for advanced usage
export { createNodaroRouter } from "./router";
export {
  connectToMongo,
  disconnectFromMongo,
  getConnectionStatus,
  getDb,
} from "./services/mongo.service";
