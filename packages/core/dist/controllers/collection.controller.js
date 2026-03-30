"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCollections = exports.getCollectionCounts = void 0;
const mongo_service_1 = require("../services/mongo.service");
/** Estimated document counts for every collection (sidebar badges). */
const getCollectionCounts = async (_req, res, next) => {
    try {
        const db = (0, mongo_service_1.getDb)();
        const collections = await db.listCollections().toArray();
        const counts = {};
        await Promise.all(collections.map(async (c) => {
            counts[c.name] = await db.collection(c.name).estimatedDocumentCount();
        }));
        res.status(200).json(counts);
    }
    catch (error) {
        next(error);
    }
};
exports.getCollectionCounts = getCollectionCounts;
const getCollections = async (_req, res, next) => {
    try {
        const db = (0, mongo_service_1.getDb)();
        const collections = await db.listCollections().toArray();
        const names = collections.map((c) => c.name);
        res.status(200).json(names);
    }
    catch (error) {
        next(error);
    }
};
exports.getCollections = getCollections;
//# sourceMappingURL=collection.controller.js.map