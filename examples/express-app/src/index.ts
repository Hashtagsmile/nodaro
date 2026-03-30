import express from "express";
import { exec } from "child_process";
import { connectToMongo, setupNodaro } from "nodaro";
import { seedDemoData } from "./seed";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);
const NO_OPEN = process.argv.includes("--no-open");

// Your existing app routes
app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from my app!" });
});

async function bootstrap(): Promise<void> {
  const mongoUri = process.env.MONGO_URI?.trim();

  if (mongoUri) {
    try {
      await connectToMongo(mongoUri);
      await seedDemoData();
    } catch (err) {
      console.error("[demo] MongoDB connect or seed failed:", err);
    }
  }

  // Mount Nodaro — no mongoUri here: we connect above when MONGO_URI is set,
  // otherwise the UI can connect via /connect.
  setupNodaro(app, {
    basePath: "/nodaro",
    apiPath: "/nodaro/api",
  });
}

void bootstrap()
  .then(() => {
    app.listen(PORT, () => {
      const appUrl = `http://localhost:${PORT}`;
      const nodaroUrl = `${appUrl}/nodaro`;
      console.log(`App running at ${appUrl}`);
      console.log(`Nodaro admin at ${nodaroUrl}`);
      if (!NO_OPEN) openBrowser(nodaroUrl);
    });
  })
  .catch((err) => {
    console.error("[demo] Startup failed:", err);
    process.exit(1);
  });

function openBrowser(url: string): void {
  const cmd =
    process.platform === "darwin" ? `open "${url}"` :
    process.platform === "win32"  ? `start "" "${url}"` :
                                    `xdg-open "${url}"`;

  exec(cmd, (err) => {
    if (err) {
      console.log("Could not open browser automatically.");
    }
  });
}
