"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = exports.getConnectionStatus = exports.disconnectFromMongo = exports.connectToMongo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
let activeUri = null;
const connectToMongo = async (mongoUri) => {
    if (!mongoUri || typeof mongoUri !== "string") {
        throw new Error("A valid MongoDB URI is required.");
    }
    const trimmedUri = mongoUri.trim();
    if (!trimmedUri)
        throw new Error("MongoDB URI cannot be empty.");
    if (mongoose_1.default.connection.readyState === 1 && activeUri === trimmedUri) {
        return mongoose_1.default;
    }
    if (mongoose_1.default.connection.readyState === 2) {
        await new Promise((resolve, reject) => {
            mongoose_1.default.connection.once("connected", () => resolve());
            mongoose_1.default.connection.once("error", (error) => reject(error));
        });
        return mongoose_1.default;
    }
    if (mongoose_1.default.connection.readyState === 1 && activeUri !== trimmedUri) {
        await mongoose_1.default.disconnect();
    }
    try {
        await mongoose_1.default.connect(trimmedUri, { autoIndex: false });
        activeUri = trimmedUri;
        return mongoose_1.default;
    }
    catch (error) {
        activeUri = null;
        const message = error instanceof Error ? error.message : "Unknown MongoDB connection error";
        throw new Error(`Failed to connect to MongoDB: ${message}`);
    }
};
exports.connectToMongo = connectToMongo;
const disconnectFromMongo = async () => {
    if (mongoose_1.default.connection.readyState !== 0) {
        await mongoose_1.default.disconnect();
        activeUri = null;
    }
};
exports.disconnectFromMongo = disconnectFromMongo;
const getConnectionStatus = () => ({
    connected: mongoose_1.default.connection.readyState === 1,
    host: mongoose_1.default.connection.host ?? null,
    name: mongoose_1.default.connection.name ?? null,
});
exports.getConnectionStatus = getConnectionStatus;
const getDb = () => {
    const db = mongoose_1.default.connection.db;
    if (!db)
        throw new Error("MongoDB is not connected.");
    return db;
};
exports.getDb = getDb;
//# sourceMappingURL=mongo.service.js.map