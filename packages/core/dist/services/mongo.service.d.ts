import mongoose from "mongoose";
export declare const connectToMongo: (mongoUri: string) => Promise<typeof mongoose>;
export declare const disconnectFromMongo: () => Promise<void>;
export declare const getConnectionStatus: () => {
    connected: boolean;
    host: string;
    name: string;
};
export declare const getDb: () => mongoose.mongo.Db;
//# sourceMappingURL=mongo.service.d.ts.map