import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createTestApp } from "../test/helpers";
import { disconnectFromMongo } from "./services/mongo.service";

describe("API when MongoDB is not connected", () => {
  const app = createTestApp();

  beforeEach(async () => {
    await disconnectFromMongo();
  });

  afterAll(async () => {
    await disconnectFromMongo();
  });

  it("GET /collections returns 500", async () => {
    const res = await request(app).get("/nodaro/api/collections").expect(500);
    expect(res.body.error).toBe("Internal server error.");
  });

  it("GET /collections/counts returns 500", async () => {
    const res = await request(app)
      .get("/nodaro/api/collections/counts")
      .expect(500);
    expect(res.body.error).toBe("Internal server error.");
  });

  it("POST /documents/query with valid body shape still fails without DB", async () => {
    const res = await request(app)
      .post("/nodaro/api/documents/query")
      .send({ collection: "any", filters: [] })
      .expect(500);
    expect(res.body.error).toBe("Internal server error.");
  });
});
