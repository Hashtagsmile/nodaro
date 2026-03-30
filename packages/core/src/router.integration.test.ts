import request from "supertest";
import { describe, expect, it } from "vitest";
import { createTestApp } from "../test/helpers";

describe("Nodaro API (integration)", () => {
  it("GET /health returns ok", async () => {
    const res = await request(createTestApp())
      .get("/nodaro/api/health")
      .expect(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("GET /connect/status returns shape when not connected", async () => {
    const res = await request(createTestApp())
      .get("/nodaro/api/connect/status")
      .expect(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        connected: false,
      }),
    );
  });

  it("POST /connect without uri returns 400", async () => {
    const res = await request(createTestApp())
      .post("/nodaro/api/connect")
      .send({})
      .expect(400);
    expect(res.body).toMatchObject({ error: expect.any(String) });
  });
});
