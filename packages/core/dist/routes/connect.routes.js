"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const connect_controller_1 = require("../controllers/connect.controller");
const connectRouter = (0, express_1.Router)();
connectRouter.post("/", connect_controller_1.connect);
connectRouter.get("/status", connect_controller_1.getStatus);
exports.default = connectRouter;
//# sourceMappingURL=connect.routes.js.map