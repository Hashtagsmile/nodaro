"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNodaroRouter = createNodaroRouter;
const express_1 = require("express");
const connect_routes_1 = __importDefault(require("./routes/connect.routes"));
const collection_routes_1 = __importDefault(require("./routes/collection.routes"));
const document_routes_1 = __importDefault(require("./routes/document.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
function createNodaroRouter() {
    const router = (0, express_1.Router)();
    router.get("/health", (_req, res) => {
        res.status(200).json({ status: "ok" });
    });
    router.use("/connect", connect_routes_1.default);
    router.use("/collections", collection_routes_1.default);
    router.use("/documents", document_routes_1.default);
    // Scoped to nodaro routes only — doesn't affect the host app
    router.use(error_middleware_1.errorHandler);
    return router;
}
//# sourceMappingURL=router.js.map