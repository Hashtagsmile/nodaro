import type { NextFunction, Request, Response } from "express";
import {
  connectToMongo,
  getConnectionStatus,
} from "../services/mongo.service";

interface ConnectBody {
  uri?: string;
}

export const connect = async (
  req: Request<unknown, unknown, ConnectBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { uri } = req.body;

    if (!uri || typeof uri !== "string" || !uri.trim()) {
      res.status(400).json({ error: "uri is required." });
      return;
    }

    await connectToMongo(uri);

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const getStatus = (
  _req: Request,
  res: Response,
): void => {
  res.status(200).json(getConnectionStatus());
};
