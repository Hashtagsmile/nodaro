import { type Express } from "express";
export interface NodaroOptions {
    /**
     * Path where the admin UI is served.
     * Default: "/nodaro"
     * Use "/" for standalone/CLI mode.
     */
    basePath?: string;
    /**
     * Path prefix for all API routes.
     * Default: "/nodaro/api"
     * Use "/" for standalone/CLI mode.
     */
    apiPath?: string;
    /**
     * Optionally auto-connect to MongoDB on setup.
     * The /connect endpoint is always available regardless.
     */
    mongoUri?: string;
}
export declare function setupNodaro(app: Express, options?: NodaroOptions): void;
export { createNodaroRouter } from "./router";
export { connectToMongo, disconnectFromMongo, getConnectionStatus, getDb, } from "./services/mongo.service";
//# sourceMappingURL=index.d.ts.map