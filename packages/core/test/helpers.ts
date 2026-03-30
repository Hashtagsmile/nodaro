import express from "express";
import { createNodaroRouter } from "../src/router";

export function createTestApp(apiPrefix = "/nodaro/api") {
  const app = express();
  app.use(express.json());
  app.use(apiPrefix, createNodaroRouter());
  return app;
}
