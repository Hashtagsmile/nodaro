"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const child_process_1 = require("child_process");
const nodaro_1 = require("nodaro");
const seed_1 = require("./seed");
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT ?? 3000);
const NO_OPEN = process.argv.includes("--no-open");
// Your existing app routes
app.get("/api/hello", (_req, res) => {
    res.json({ message: "Hello from my app!" });
});
async function bootstrap() {
    const mongoUri = process.env.MONGO_URI?.trim();
    if (mongoUri) {
        try {
            await (0, nodaro_1.connectToMongo)(mongoUri);
            await (0, seed_1.seedDemoData)();
        }
        catch (err) {
            console.error("[demo] MongoDB connect or seed failed:", err);
        }
    }
    // Mount Nodaro — no mongoUri here: we connect above when MONGO_URI is set,
    // otherwise the UI can connect via /connect.
    (0, nodaro_1.setupNodaro)(app, {
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
        if (!NO_OPEN)
            openBrowser(nodaroUrl);
    });
})
    .catch((err) => {
    console.error("[demo] Startup failed:", err);
    process.exit(1);
});
function openBrowser(url) {
    const cmd = process.platform === "darwin" ? `open "${url}"` :
        process.platform === "win32" ? `start "" "${url}"` :
            `xdg-open "${url}"`;
    (0, child_process_1.exec)(cmd, (err) => {
        if (err) {
            console.log("Could not open browser automatically.");
        }
    });
}
