"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchDocuments = exports.inferSchema = exports.deleteDocumentById = exports.updateDocumentById = exports.createDocument = exports.queryDocuments = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongo_service_1 = require("./mongo.service");
const queryDocuments = async ({ collection, query, limit = 50, skip = 0, sort, }) => {
    const db = (0, mongo_service_1.getDb)();
    const col = db.collection(collection);
    const clampedLimit = Math.min(Math.max(1, limit), 200);
    const clampedSkip = Math.max(0, skip);
    const cursor = col.find(query).skip(clampedSkip).limit(clampedLimit);
    if (sort) {
        cursor.sort([[sort.field, sort.direction === "asc" ? 1 : -1]]);
    }
    const [documents, total] = await Promise.all([
        cursor.toArray(),
        col.countDocuments(query),
    ]);
    return {
        documents: documents,
        total,
        limit: clampedLimit,
        skip: clampedSkip,
        sort: sort ?? null,
    };
};
exports.queryDocuments = queryDocuments;
const createDocument = async ({ collection, data, }) => {
    const db = (0, mongo_service_1.getDb)();
    const { insertedId } = await db.collection(collection).insertOne(data);
    return insertedId.toString();
};
exports.createDocument = createDocument;
const updateDocumentById = async ({ collection, id, data, }) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid document id.");
    }
    const db = (0, mongo_service_1.getDb)();
    const objectId = new mongoose_1.default.Types.ObjectId(id);
    const updateData = { ...data };
    delete updateData._id;
    if (Object.keys(updateData).length === 0) {
        throw new Error("Update data cannot be empty.");
    }
    const result = await db
        .collection(collection)
        .updateOne({ _id: objectId }, { $set: updateData });
    return result;
};
exports.updateDocumentById = updateDocumentById;
const deleteDocumentById = async (collection, id) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid document id.");
    }
    const db = (0, mongo_service_1.getDb)();
    const objectId = new mongoose_1.default.Types.ObjectId(id);
    const { deletedCount } = await db
        .collection(collection)
        .deleteOne({ _id: objectId });
    return deletedCount === 1;
};
exports.deleteDocumentById = deleteDocumentById;
const inferSchema = async (collection) => {
    const db = (0, mongo_service_1.getDb)();
    const doc = await db.collection(collection).findOne({});
    if (!doc)
        return [];
    return Object.keys(doc);
};
exports.inferSchema = inferSchema;
const searchDocuments = async (collection, query, limit = 20) => {
    const db = (0, mongo_service_1.getDb)();
    const col = db.collection(collection);
    const trimmed = query.trim();
    const empty = {
        documents: [],
        total: 0,
        limit,
        skip: 0,
        sort: null,
    };
    if (!trimmed)
        return empty;
    // ObjectId exact match
    if (mongoose_1.default.Types.ObjectId.isValid(trimmed) && trimmed.length === 24) {
        const doc = await col.findOne({
            _id: new mongoose_1.default.Types.ObjectId(trimmed),
        });
        const documents = doc ? [doc] : [];
        return { ...empty, documents, total: documents.length };
    }
    // Regex search across string fields — sample first doc to discover them
    const sample = await col.findOne({});
    if (!sample)
        return empty;
    const stringFields = Object.entries(sample)
        .filter(([key, val]) => key !== "_id" && typeof val === "string")
        .map(([key]) => key);
    if (stringFields.length === 0)
        return empty;
    // Escape user input to prevent regex injection
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const filter = {
        $or: stringFields.map((field) => ({
            [field]: { $regex: escaped, $options: "i" },
        })),
    };
    const documents = await col.find(filter).limit(limit).toArray();
    return {
        documents: documents,
        total: documents.length,
        limit,
        skip: 0,
        sort: null,
    };
};
exports.searchDocuments = searchDocuments;
//# sourceMappingURL=document.service.js.map