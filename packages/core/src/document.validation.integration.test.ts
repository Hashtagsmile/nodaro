import request from "supertest";
import { describe, expect, it } from "vitest";
import { createTestApp } from "../test/helpers";

describe("Document & collection API (validation, no DB)", () => {
  const app = createTestApp();

  it("POST /documents/query rejects missing collection", async () => {
    const res = await request(app)
      .post("/nodaro/api/documents/query")
      .send({})
      .expect(400);
    expect(res.body.error).toContain("collection");
  });

  it("POST /documents/query rejects non-array filters", async () => {
    const res = await request(app)
      .post("/nodaro/api/documents/query")
      .send({ collection: "x", filters: "not-array" })
      .expect(400);
    expect(res.body.error).toContain("filters");
  });

  it("POST /documents/query rejects invalid sort.field", async () => {
    const res = await request(app)
      .post("/nodaro/api/documents/query")
      .send({
        collection: "x",
        filters: [],
        sort: { field: "", direction: "asc" },
      })
      .expect(400);
    expect(res.body.error).toContain("sort.field");
  });

  it("POST /documents/query rejects invalid sort.direction", async () => {
    const res = await request(app)
      .post("/nodaro/api/documents/query")
      .send({
        collection: "x",
        filters: [],
        sort: { field: "a", direction: "sideways" },
      })
      .expect(400);
    expect(res.body.error).toContain("sort.direction");
  });

  it("POST /documents/search rejects missing collection", async () => {
    const res = await request(app)
      .post("/nodaro/api/documents/search")
      .send({ query: "x" })
      .expect(400);
    expect(res.body.error).toContain("collection");
  });

  it("POST /documents/search rejects missing query", async () => {
    const res = await request(app)
      .post("/nodaro/api/documents/search")
      .send({ collection: "x" })
      .expect(400);
    expect(res.body.error).toContain("query");
  });

  it("POST /documents rejects missing collection", async () => {
    const res = await request(app)
      .post("/nodaro/api/documents")
      .send({ data: {} })
      .expect(400);
    expect(res.body.error).toContain("collection");
  });

  it("POST /documents rejects non-object data", async () => {
    const res = await request(app)
      .post("/nodaro/api/documents")
      .send({ collection: "x", data: [] })
      .expect(400);
    expect(res.body.error).toContain("data");
  });

  it("PUT /documents/:id rejects missing collection", async () => {
    const res = await request(app)
      .put("/nodaro/api/documents/507f1f77bcf86cd799439011")
      .send({ data: { a: 1 } })
      .expect(400);
    expect(res.body.error).toContain("collection");
  });

  it("DELETE /documents/:id rejects missing collection query param", async () => {
    const res = await request(app)
      .delete("/nodaro/api/documents/507f1f77bcf86cd799439011")
      .expect(400);
    expect(res.body.error).toContain("collection");
  });
});
