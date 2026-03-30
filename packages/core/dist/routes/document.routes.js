"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const document_controller_1 = require("../controllers/document.controller");
const documentRouter = (0, express_1.Router)();
documentRouter.post("/query", document_controller_1.queryCollectionDocuments);
documentRouter.post("/search", document_controller_1.searchCollectionDocuments);
documentRouter.post("/", document_controller_1.createCollectionDocument);
documentRouter.put("/:id", document_controller_1.updateDocument);
documentRouter.delete("/:id", document_controller_1.deleteDocument);
exports.default = documentRouter;
//# sourceMappingURL=document.routes.js.map