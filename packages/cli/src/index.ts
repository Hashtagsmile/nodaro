#!/usr/bin/env node
import { exec } from "child_process";
import express from "express";
import { setupNodaro } from "nodaro";

const PORT = Number(process.env.NODARO_PORT ?? 4000);
const MONGO_URI = process.env.NODARO_URI ?? process.env.MONGO_URI;
const NO_OPEN = process.argv.includes("--no-open");

const app = express();

setupNodaro(app, {
  basePath: "/",
  apiPath: "/",
  mongoUri: MONGO_URI,
});

app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;

  process.stdout.write(
    `\n  nodaro  →  ${url}\n` +
    (MONGO_URI ? `  db      →  connected\n` : `  db      →  connect via UI\n`) +
    "\n",
  );

  if (!NO_OPEN) openBrowser(url);
});

function openBrowser(url: string): void {
  const cmd =
    process.platform === "darwin" ? `open "${url}"` :
    process.platform === "win32"  ? `start "" "${url}"` :
                                    `xdg-open "${url}"`;

  exec(cmd, (err) => {
    if (err) process.stdout.write("  (could not open browser automatically)\n");
  });
}
