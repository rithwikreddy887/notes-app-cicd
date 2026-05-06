const request = require("supertest");
const app = require("../server");

describe("Backend Service Basic Tests", () => {
  test("GET /notes should reject missing user", async () => {
    const res = await request(app)
      .get("/notes");

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("User required");
  });
});