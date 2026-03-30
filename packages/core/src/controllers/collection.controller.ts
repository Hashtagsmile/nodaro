import type { NextFunction, Request, Response } from "express";
import { getDb } from "../services/mongo.service";

/** Estimated document counts for every collection (sidebar badges). */
export const getCollectionCounts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const db = getDb();
    const collections = await db.listCollections().toArray();
    const counts: Record<string, number> = {};
    await Promise.all(
      collections.map(async (c) => {
        counts[c.name] = await db.collection(c.name).estimatedDocumentCount();
      }),
    );
    res.status(200).json(counts);
  } catch (error) {
    next(error);
  }
};

export const getCollections = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const db = getDb();
    const collections = await db.listCollections().toArray();
    const names = collections.map((c) => c.name);

    res.status(200).json(names);
  } catch (error) {
    next(error);
  }
};
