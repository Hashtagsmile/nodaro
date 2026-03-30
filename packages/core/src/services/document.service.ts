import mongoose from "mongoose";
import { getDb } from "./mongo.service";

export type FilterOperator =
  | "eq"
  | "equals"
  | "ne"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "nin"
  | "regex"
  | "exists";

export interface FilterInput {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export type SortDirection = "asc" | "desc";

export interface SortInput {
  field: string;
  direction: SortDirection;
}

export interface QueryDocumentsInput {
  collection: string;
  query: Record<string, unknown>;
  limit?: number;
  skip?: number;
  sort?: SortInput;
}

export interface QueryDocumentsResult {
  documents: Record<string, unknown>[];
  total: number;
  limit: number;
  skip: number;
  sort: SortInput | null;
}

export interface UpdateDocumentInput {
  collection: string;
  id: string;
  data: Record<string, unknown>;
}

export interface UpdateDocumentResult {
  matchedCount: number;
  modifiedCount: number;
}

export interface CreateDocumentInput {
  collection: string;
  data: Record<string, unknown>;
}

export const queryDocuments = async ({
  collection,
  query,
  limit = 50,
  skip = 0,
  sort,
}: QueryDocumentsInput): Promise<QueryDocumentsResult> => {
  const db = getDb();
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
    documents: documents as Record<string, unknown>[],
    total,
    limit: clampedLimit,
    skip: clampedSkip,
    sort: sort ?? null,
  };
};

export const createDocument = async ({
  collection,
  data,
}: CreateDocumentInput): Promise<string> => {
  const db = getDb();
  const { insertedId } = await db.collection(collection).insertOne(data);
  return insertedId.toString();
};

export const updateDocumentById = async ({
  collection,
  id,
  data,
}: UpdateDocumentInput): Promise<UpdateDocumentResult> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid document id.");
  }

  const db = getDb();
  const objectId = new mongoose.Types.ObjectId(id);
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

export const deleteDocumentById = async (
  collection: string,
  id: string,
): Promise<boolean> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid document id.");
  }

  const db = getDb();
  const objectId = new mongoose.Types.ObjectId(id);
  const { deletedCount } = await db
    .collection(collection)
    .deleteOne({ _id: objectId });

  return deletedCount === 1;
};

export const inferSchema = async (
  collection: string,
): Promise<string[]> => {
  const db = getDb();
  const doc = await db.collection(collection).findOne({});
  if (!doc) return [];
  return Object.keys(doc);
};

export const searchDocuments = async (
  collection: string,
  query: string,
  limit = 20,
): Promise<QueryDocumentsResult> => {
  const db = getDb();
  const col = db.collection(collection);
  const trimmed = query.trim();

  const empty: QueryDocumentsResult = {
    documents: [],
    total: 0,
    limit,
    skip: 0,
    sort: null,
  };

  if (!trimmed) return empty;

  // ObjectId exact match
  if (mongoose.Types.ObjectId.isValid(trimmed) && trimmed.length === 24) {
    const doc = await col.findOne({
      _id: new mongoose.Types.ObjectId(trimmed),
    });
    const documents = doc ? [doc as Record<string, unknown>] : [];
    return { ...empty, documents, total: documents.length };
  }

  // Regex search across string fields — sample first doc to discover them
  const sample = await col.findOne({});
  if (!sample) return empty;

  const stringFields = Object.entries(sample)
    .filter(([key, val]) => key !== "_id" && typeof val === "string")
    .map(([key]) => key);

  if (stringFields.length === 0) return empty;

  // Escape user input to prevent regex injection
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const filter = {
    $or: stringFields.map((field) => ({
      [field]: { $regex: escaped, $options: "i" },
    })),
  };

  const documents = await col.find(filter).limit(limit).toArray();

  return {
    documents: documents as Record<string, unknown>[],
    total: documents.length,
    limit,
    skip: 0,
    sort: null,
  };
};
