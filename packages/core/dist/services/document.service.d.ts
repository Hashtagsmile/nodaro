export type FilterOperator = "eq" | "equals" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "regex" | "exists";
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
export declare const queryDocuments: ({ collection, query, limit, skip, sort, }: QueryDocumentsInput) => Promise<QueryDocumentsResult>;
export declare const createDocument: ({ collection, data, }: CreateDocumentInput) => Promise<string>;
export declare const updateDocumentById: ({ collection, id, data, }: UpdateDocumentInput) => Promise<UpdateDocumentResult>;
export declare const deleteDocumentById: (collection: string, id: string) => Promise<boolean>;
export declare const inferSchema: (collection: string) => Promise<string[]>;
export declare const searchDocuments: (collection: string, query: string, limit?: number) => Promise<QueryDocumentsResult>;
//# sourceMappingURL=document.service.d.ts.map