import mongoose from "mongoose";

let activeUri: string | null = null;

export const connectToMongo = async (
  mongoUri: string,
): Promise<typeof mongoose> => {
  if (!mongoUri || typeof mongoUri !== "string") {
    throw new Error("A valid MongoDB URI is required.");
  }

  const trimmedUri = mongoUri.trim();
  if (!trimmedUri) throw new Error("MongoDB URI cannot be empty.");

  if (mongoose.connection.readyState === 1 && activeUri === trimmedUri) {
    return mongoose;
  }

  if (mongoose.connection.readyState === 2) {
    await new Promise<void>((resolve, reject) => {
      mongoose.connection.once("connected", () => resolve());
      mongoose.connection.once("error", (error) => reject(error));
    });
    return mongoose;
  }

  if (mongoose.connection.readyState === 1 && activeUri !== trimmedUri) {
    await mongoose.disconnect();
  }

  try {
    await mongoose.connect(trimmedUri, { autoIndex: false });
    activeUri = trimmedUri;
    return mongoose;
  } catch (error) {
    activeUri = null;
    const message =
      error instanceof Error ? error.message : "Unknown MongoDB connection error";
    throw new Error(`Failed to connect to MongoDB: ${message}`);
  }
};

export const disconnectFromMongo = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    activeUri = null;
  }
};

export const getConnectionStatus = () => ({
  connected: mongoose.connection.readyState === 1,
  host: mongoose.connection.host ?? null,
  name: mongoose.connection.name ?? null,
});

export const getDb = () => {
  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB is not connected.");
  return db;
};
