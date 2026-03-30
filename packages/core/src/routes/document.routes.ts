import { Router } from "express";
import {
  createCollectionDocument,
  deleteDocument,
  queryCollectionDocuments,
  searchCollectionDocuments,
  updateDocument,
} from "../controllers/document.controller";

const documentRouter = Router();

documentRouter.post("/query", queryCollectionDocuments);
documentRouter.post("/search", searchCollectionDocuments);
documentRouter.post("/", createCollectionDocument);
documentRouter.put("/:id", updateDocument);
documentRouter.delete("/:id", deleteDocument);

export default documentRouter;
