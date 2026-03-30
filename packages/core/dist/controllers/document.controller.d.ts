import type { NextFunction, Request, Response } from "express";
import { type FilterRequestInput } from "../utils/parseFilter";
import { type SortInput } from "../services/document.service";
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
export declare const queryCollectionDocuments: (req: Request<unknown, unknown, QueryBody>, res: Response, next: NextFunction) => Promise<void>;
export declare const createCollectionDocument: (req: Request<unknown, unknown, MutateBody>, res: Response, next: NextFunction) => Promise<void>;
export declare const updateDocument: (req: Request<{
    id: string;
}, unknown, MutateBody>, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteDocument: (req: Request<{
    id: string;
}>, res: Response, next: NextFunction) => Promise<void>;
interface SearchBody {
    collection?: string;
    query?: string;
}
export declare const searchCollectionDocuments: (req: Request<unknown, unknown, SearchBody>, res: Response, next: NextFunction) => Promise<void>;
export declare const getCollectionSchema: (req: Request<{
    collection: string;
}>, res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=document.controller.d.ts.map