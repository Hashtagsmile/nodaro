export type SortDirection = "asc" | "desc";

export interface SortInput {
  field: string;
  direction: SortDirection;
}

export interface FilterRow {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export interface ApiFilter {
  field: string;
  operator: string;
  value: unknown;
}

export interface QueryPayload {
  collection: string;
  filters: ApiFilter[];
  limit: number;
  skip: number;
  sort?: SortInput;
}

export interface MongoDocument {
  _id: string;
  [key: string]: unknown;
}

export interface QueryResult {
  documents: MongoDocument[];
  total: number;
  limit: number;
  skip: number;
  sort: SortInput | null;
}

export interface ConnectionStatus {
  connected: boolean;
  host: string | null;
  name: string | null;
}
