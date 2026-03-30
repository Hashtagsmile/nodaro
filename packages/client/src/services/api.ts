import type {
  ConnectionStatus,
  MongoDocument,
  QueryPayload,
  QueryResult,
} from "../types";

// In embed mode, setupNodaro injects window.__NODARO_API_BASE__ at runtime.
// In standalone/CLI mode it's not injected, so relative paths ("/connect", etc.) are used.
declare global {
  interface Window {
    __NODARO_API_BASE__?: string;
  }
}

const BASE: string =
  (typeof window !== "undefined" ? window.__NODARO_API_BASE__ : undefined) ??
  import.meta.env.VITE_API_URL ??
  "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  const data: unknown = await res.json();

  if (!res.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : "Request failed";
    throw new Error(message);
  }

  return data as T;
}

export const connect = (uri: string) =>
  request<{ success: boolean }>("/connect", {
    method: "POST",
    body: JSON.stringify({ uri }),
  });

export const getConnectionStatus = () =>
  request<ConnectionStatus>("/connect/status");

export const getCollections = () => request<string[]>("/collections");

export const getCollectionCounts = () =>
  request<Record<string, number>>("/collections/counts");

export const getSchema = (collection: string) =>
  request<{ schema: string[] }>(`/collections/${collection}/schema`);

export const queryDocuments = (payload: QueryPayload) =>
  request<QueryResult>("/documents/query", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const searchDocuments = (collection: string, query: string) =>
  request<QueryResult>("/documents/search", {
    method: "POST",
    body: JSON.stringify({ collection, query }),
  });

export const createDocument = (
  collection: string,
  data: Record<string, unknown>,
) =>
  request<{ insertedId: string }>("/documents", {
    method: "POST",
    body: JSON.stringify({ collection, data }),
  });

export const updateDocument = (
  collection: string,
  id: string,
  data: Record<string, unknown>,
) =>
  request<{ matchedCount: number; modifiedCount: number }>(
    `/documents/${id}`,
    {
      method: "PUT",
      body: JSON.stringify({ collection, data }),
    },
  );

export const deleteDocument = (collection: string, id: string) =>
  request<{ deleted: boolean }>(
    `/documents/${id}?collection=${encodeURIComponent(collection)}`,
    { method: "DELETE" },
  );

export const getHealth = () =>
  request<{ status: string }>("/health");

export type { MongoDocument, QueryResult };
