import { Router, type Request, type Response } from "express";
import connectRouter from "./routes/connect.routes";
import collectionRouter from "./routes/collection.routes";
import documentRouter from "./routes/document.routes";
import { errorHandler } from "./middlewares/error.middleware";

export function createNodaroRouter(): Router {
  const router = Router();

  router.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  router.use("/connect", connectRouter);
  router.use("/collections", collectionRouter);
  router.use("/documents", documentRouter);

  // Scoped to nodaro routes only — doesn't affect the host app
  router.use(errorHandler);

  return router;
}
