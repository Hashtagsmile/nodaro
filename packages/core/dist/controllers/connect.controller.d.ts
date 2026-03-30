import type { NextFunction, Request, Response } from "express";
interface ConnectBody {
    uri?: string;
}
export declare const connect: (req: Request<unknown, unknown, ConnectBody>, res: Response, next: NextFunction) => Promise<void>;
export declare const getStatus: (_req: Request, res: Response) => void;
export {};
//# sourceMappingURL=connect.controller.d.ts.map