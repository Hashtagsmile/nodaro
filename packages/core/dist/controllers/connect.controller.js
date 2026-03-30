"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatus = exports.connect = void 0;
const mongo_service_1 = require("../services/mongo.service");
const connect = async (req, res, next) => {
    try {
        const { uri } = req.body;
        if (!uri || typeof uri !== "string" || !uri.trim()) {
            res.status(400).json({ error: "uri is required." });
            return;
        }
        await (0, mongo_service_1.connectToMongo)(uri);
        res.status(200).json({ success: true });
    }
    catch (error) {
        next(error);
    }
};
exports.connect = connect;
const getStatus = (_req, res) => {
    res.status(200).json((0, mongo_service_1.getConnectionStatus)());
};
exports.getStatus = getStatus;
//# sourceMappingURL=connect.controller.js.map