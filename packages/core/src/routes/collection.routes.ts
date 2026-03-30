import { Router } from "express";
import {
  getCollectionCounts,
  getCollections,
} from "../controllers/collection.controller";
import { getCollectionSchema } from "../controllers/document.controller";

const collectionRouter = Router();

collectionRouter.get("/", getCollections);
collectionRouter.get("/counts", getCollectionCounts);
collectionRouter.get("/:collection/schema", getCollectionSchema);

export default collectionRouter;
