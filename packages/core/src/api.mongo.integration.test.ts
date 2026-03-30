import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestApp } from "../test/helpers";
import { disconnectFromMongo } from "./services/mongo.service";

describe("Nodaro API with MongoDB (memory server)", () => {
  let mongo: MongoMemoryServer;
  const app = createTestApp();

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await request(app).post("/nodaro/api/connect").send({ uri }).expect(200);
  }, 120_000);

  afterAll(async () => {
    await disconnectFromMongo();
    await mongo.stop();
  });

  it("GET /connect/status reports connected", async () => {
    const res = await request(app).get("/nodaro/api/connect/status").expect(200);
    expect(res.body.connected).toBe(true);
  });

  it("lists no collections on empty database", async () => {
    const res = await request(app).get("/nodaro/api/collections").expect(200);
    expect(res.body).toEqual([]);
  });

  it("GET /collections/counts returns empty object when there are no collections", async () => {
    const res = await request(app)
      .get("/nodaro/api/collections/counts")
      .expect(200);
    expect(res.body).toEqual({});
  });

  it("creates, reads, updates, deletes a document", async () => {
    const collection = "integration_items";

    const created = await request(app)
      .post("/nodaro/api/documents")
      .send({ collection, data: { title: "hello", n: 1 } })
      .expect(201);

    const insertedId = created.body.insertedId as string;
    expect(insertedId).toMatch(/^[a-f0-9]{24}$/);

    const names = await request(app).get("/nodaro/api/collections").expect(200);
    expect(names.body).toContain(collection);

    const counts = await request(app)
      .get("/nodaro/api/collections/counts")
      .expect(200);
    expect(counts.body[collection]).toBe(1);

    const queried = await request(app)
      .post("/nodaro/api/documents/query")
      .send({ collection, filters: [], limit: 10, skip: 0 })
      .expect(200);

    expect(queried.body.total).toBe(1);
    expect(queried.body.documents).toHaveLength(1);
    expect(queried.body.documents[0].title).toBe("hello");

    const schema = await request(app)
      .get(`/nodaro/api/collections/${collection}/schema`)
      .expect(200);
    expect(schema.body.schema).toEqual(
      expect.arrayContaining(["_id", "title", "n"]),
    );

    const searched = await request(app)
      .post("/nodaro/api/documents/search")
      .send({ collection, query: "hello" })
      .expect(200);
    expect(searched.body.documents.length).toBeGreaterThanOrEqual(1);

    await request(app)
      .put(`/nodaro/api/documents/${insertedId}`)
      .send({ collection, data: { title: "hello", n: 2 } })
      .expect(200);

    const afterUpdate = await request(app)
      .post("/nodaro/api/documents/query")
      .send({ collection, filters: [], limit: 10 })
      .expect(200);
    expect(afterUpdate.body.documents[0].n).toBe(2);

    await request(app)
      .delete(`/nodaro/api/documents/${insertedId}`)
      .query({ collection })
      .expect(200);

    const empty = await request(app)
      .post("/nodaro/api/documents/query")
      .send({ collection, filters: [] })
      .expect(200);
    expect(empty.body.total).toBe(0);
  });
});
