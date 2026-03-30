"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCollectionSchema = exports.searchCollectionDocuments = exports.deleteDocument = exports.updateDocument = exports.createCollectionDocument = exports.queryCollectionDocuments = void 0;
const parseFilter_1 = require("../utils/parseFilter");
const document_service_1 = require("../services/document.service");
const queryCollectionDocuments = async (req, res, next) => {
    try {
        const { collection, filters = [], limit = 50, skip = 0, sort } = req.body;
        if (!collection || typeof collection !== "string") {
            res.status(400).json({ error: "collection is required." });
            return;
        }
        if (!Array.isArray(filters)) {
            res.status(400).json({ error: "filters must be an array." });
            return;
        }
        if (sort !== undefined) {
            if (!sort.field || typeof sort.field !== "string") {
                res.status(400).json({ error: "sort.field must be a non-empty string." });
                return;
            }
            if (sort.direction !== "asc" && sort.direction !== "desc") {
                res.status(400).json({ error: "sort.direction must be 'asc' or 'desc'." });
                return;
            }
        }
        const query = (0, parseFilter_1.parseFilters)(filters);
        const result = await (0, document_service_1.queryDocuments)({ collection, query, limit, skip, sort });
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.queryCollectionDocuments = queryCollectionDocuments;
const createCollectionDocument = async (req, res, next) => {
    try {
        const { collection, data } = req.body;
        if (!collection || typeof collection !== "string") {
            res.status(400).json({ error: "collection is required." });
            return;
        }
        if (!data || typeof data !== "object" || Array.isArray(data)) {
            res.status(400).json({ error: "data must be an object." });
            return;
        }
        const insertedId = await (0, document_service_1.createDocument)({ collection, data });
        res.status(201).json({ insertedId });
    }
    catch (error) {
        next(error);
    }
};
exports.createCollectionDocument = createCollectionDocument;
const updateDocument = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { collection, data } = req.body;
        if (!collection || typeof collection !== "string") {
            res.status(400).json({ error: "collection is required." });
            return;
        }
        if (!data || typeof data !== "object" || Array.isArray(data)) {
            res.status(400).json({ error: "data must be an object." });
            return;
        }
        const result = await (0, document_service_1.updateDocumentById)({ collection, id, data });
        if (result.matchedCount === 0) {
            res.status(404).json({ error: "Document not found." });
            return;
        }
        res.status(200).json({
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateDocument = updateDocument;
const deleteDocument = async (req, res, next) => {
    try {
        const { id } = req.params;
        const collection = req.query.collection;
        if (!collection || typeof collection !== "string") {
            res.status(400).json({ error: "collection query param is required." });
            return;
        }
        const deleted = await (0, document_service_1.deleteDocumentById)(collection, id);
        if (!deleted) {
            res.status(404).json({ error: "Document not found." });
            return;
        }
        res.status(200).json({ deleted: true });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteDocument = deleteDocument;
const searchCollectionDocuments = async (req, res, next) => {
    try {
        const { collection, query } = req.body;
        if (!collection || typeof collection !== "string") {
            res.status(400).json({ error: "collection is required." });
            return;
        }
        if (!query || typeof query !== "string") {
            res.status(400).json({ error: "query is required." });
            return;
        }
        const result = await (0, document_service_1.searchDocuments)(collection, query);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.searchCollectionDocuments = searchCollectionDocuments;
const getCollectionSchema = async (req, res, next) => {
    try {
        const { collection } = req.params;
        const fields = await (0, document_service_1.inferSchema)(collection);
        res.status(200).json({ schema: fields });
    }
    catch (error) {
        next(error);
    }
};
exports.getCollectionSchema = getCollectionSchema;
//# sourceMappingURL=document.controller.js.map