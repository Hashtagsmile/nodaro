import type { NextFunction, Request, Response } from "express";
import { parseFilters, type FilterRequestInput } from "../utils/parseFilter";
import {
  createDocument,
  deleteDocumentById,
  inferSchema,
  queryDocuments,
  searchDocuments,
  updateDocumentById,
  type SortInput,
} from "../services/document.service";

interface QueryBody {
  collection?: string;
  filters?: FilterRequestInput[];
  limit?: number;
  skip?: number;
  sort?: SortInput;
}

interface MutateBody {
  collection?: string;
  data?: Record<string, unknown>;
}

export const queryCollectionDocuments = async (
  req: Request<unknown, unknown, QueryBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { collection, filters = [], limit = 50, skip = 0, sort } = req.body;

    if (!collection || typeof collection !== "string") {
      res.status(400).json({ error: "collection is required." });
      return;
    }

    if (!Array.isArray(filters)) {
      res.status(400).json({ error: "filters must be an array." });
      return;
    }

    if (sort !== undefined) {
      if (!sort.field || typeof sort.field !== "string") {
        res.status(400).json({ error: "sort.field must be a non-empty string." });
        return;
      }
      if (sort.direction !== "asc" && sort.direction !== "desc") {
        res.status(400).json({ error: "sort.direction must be 'asc' or 'desc'." });
        return;
      }
    }

    const query = parseFilters(filters);
    const result = await queryDocuments({ collection, query, limit, skip, sort });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createCollectionDocument = async (
  req: Request<unknown, unknown, MutateBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { collection, data } = req.body;

    if (!collection || typeof collection !== "string") {
      res.status(400).json({ error: "collection is required." });
      return;
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      res.status(400).json({ error: "data must be an object." });
      return;
    }

    const insertedId = await createDocument({ collection, data });

    res.status(201).json({ insertedId });
  } catch (error) {
    next(error);
  }
};

export const updateDocument = async (
  req: Request<{ id: string }, unknown, MutateBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { collection, data } = req.body;

    if (!collection || typeof collection !== "string") {
      res.status(400).json({ error: "collection is required." });
      return;
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      res.status(400).json({ error: "data must be an object." });
      return;
    }

    const result = await updateDocumentById({ collection, id, data });

    if (result.matchedCount === 0) {
      res.status(404).json({ error: "Document not found." });
      return;
    }

    res.status(200).json({
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const collection = req.query.collection as string | undefined;

    if (!collection || typeof collection !== "string") {
      res.status(400).json({ error: "collection query param is required." });
      return;
    }

    const deleted = await deleteDocumentById(collection, id);

    if (!deleted) {
      res.status(404).json({ error: "Document not found." });
      return;
    }

    res.status(200).json({ deleted: true });
  } catch (error) {
    next(error);
  }
};

interface SearchBody {
  collection?: string;
  query?: string;
}

export const searchCollectionDocuments = async (
  req: Request<unknown, unknown, SearchBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { collection, query } = req.body;

    if (!collection || typeof collection !== "string") {
      res.status(400).json({ error: "collection is required." });
      return;
    }

    if (!query || typeof query !== "string") {
      res.status(400).json({ error: "query is required." });
      return;
    }

    const result = await searchDocuments(collection, query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getCollectionSchema = async (
  req: Request<{ collection: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { collection } = req.params;

    const fields = await inferSchema(collection);

    res.status(200).json({ schema: fields });
  } catch (error) {
    next(error);
  }
};
