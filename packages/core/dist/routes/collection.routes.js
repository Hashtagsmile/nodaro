"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const collection_controller_1 = require("../controllers/collection.controller");
const document_controller_1 = require("../controllers/document.controller");
const collectionRouter = (0, express_1.Router)();
collectionRouter.get("/", collection_controller_1.getCollections);
collectionRouter.get("/counts", collection_controller_1.getCollectionCounts);
collectionRouter.get("/:collection/schema", document_controller_1.getCollectionSchema);
exports.default = collectionRouter;
//# sourceMappingURL=collection.routes.js.map