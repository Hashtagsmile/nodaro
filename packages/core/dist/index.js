"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = exports.getConnectionStatus = exports.disconnectFromMongo = exports.connectToMongo = exports.createNodaroRouter = void 0;
exports.setupNodaro = setupNodaro;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mongo_service_1 = require("./services/mongo.service");
const router_1 = require("./router");
const PUBLIC_DIR = path_1.default.join(__dirname, "../public");
function setupNodaro(app, options = {}) {
    const { basePath = "/nodaro", apiPath = "/nodaro/api", mongoUri, } = options;
    if (mongoUri) {
        void (0, mongo_service_1.connectToMongo)(mongoUri);
    }
    const isStandalone = apiPath === "/";
    // Shared request parsing — safe to call even if the host app already has these
    app.use(express_1.default.json({ limit: "1mb" }));
    app.use((0, cors_1.default)());
    // Mount API router
    if (isStandalone) {
        app.use((0, router_1.createNodaroRouter)());
    }
    else {
        app.use(apiPath, (0, router_1.createNodaroRouter)());
    }
    if (!fs_1.default.existsSync(PUBLIC_DIR)) {
        console.warn("[nodaro] UI static files not found at packages/core/public.\n" +
            "         Run `cd packages/client && npm run build` to generate them.");
        return;
    }
    const indexPath = path_1.default.join(PUBLIC_DIR, "index.html");
    if (isStandalone) {
        // Serve static files at root — API routes already mounted above take priority
        app.use(express_1.default.static(PUBLIC_DIR));
        app.use((_req, res) => res.sendFile(indexPath));
    }
    else {
        // Embed mode: serve UI under basePath, inject runtime API base into index.html
        // Disable default index serving so requests to /nodaro always go through
        // the injected HTML response below (sets window.__NODARO_API_BASE__).
        app.use(basePath, express_1.default.static(PUBLIC_DIR, { index: false }));
        app.use(basePath, (_req, res) => {
            const html = fs_1.default
                .readFileSync(indexPath, "utf8")
                .replace("</head>", `<script>window.__NODARO_API_BASE__="${apiPath}"</script></head>`);
            res.send(html);
        });
    }
}
// Named exports for advanced usage
var router_2 = require("./router");
Object.defineProperty(exports, "createNodaroRouter", { enumerable: true, get: function () { return router_2.createNodaroRouter; } });
var mongo_service_2 = require("./services/mongo.service");
Object.defineProperty(exports, "connectToMongo", { enumerable: true, get: function () { return mongo_service_2.connectToMongo; } });
Object.defineProperty(exports, "disconnectFromMongo", { enumerable: true, get: function () { return mongo_service_2.disconnectFromMongo; } });
Object.defineProperty(exports, "getConnectionStatus", { enumerable: true, get: function () { return mongo_service_2.getConnectionStatus; } });
Object.defineProperty(exports, "getDb", { enumerable: true, get: function () { return mongo_service_2.getDb; } });
//# sourceMappingURL=index.js.map