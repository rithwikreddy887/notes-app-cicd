const request = require("supertest");
const app = require("../server");

describe("Auth Service Basic Tests", () => {
  test("POST /register should reject empty body", async () => {
    const res = await request(app)
      .post("/register")
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Username and password required");
  });
});