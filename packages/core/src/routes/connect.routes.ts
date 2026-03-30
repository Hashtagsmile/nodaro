import { Router } from "express";
import { connect, getStatus } from "../controllers/connect.controller";

const connectRouter = Router();

connectRouter.post("/", connect);
connectRouter.get("/status", getStatus);

export default connectRouter;
