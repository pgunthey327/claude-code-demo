const request = require("supertest");
const app = require("../src/app");

describe("POST /api/validate", () => {
  // ── 1. Valid amount within range ────────────────────────────────────────────
  describe("valid amount within range", () => {
    let response;

    beforeAll(async () => {
      response = await request(app)
        .post("/api/validate")
        .send({ amount: 50, constraints: { min: 10, max: 100 } });
    });

    it("returns HTTP 200", () => {
      expect(response.status).toBe(200);
    });

    it("returns success: true", () => {
      expect(response.body.success).toBe(true);
    });

    it("returns data.valid: true", () => {
      expect(response.body.data.valid).toBe(true);
    });

    it("returns an empty errors array", () => {
      expect(response.body.data.errors).toEqual([]);
    });
  });

  // ── 2. Amount below min ─────────────────────────────────────────────────────
  describe("amount below min", () => {
    let response;

    beforeAll(async () => {
      response = await request(app)
        .post("/api/validate")
        .send({ amount: 5, constraints: { min: 10 } });
    });

    it("returns HTTP 200", () => {
      expect(response.status).toBe(200);
    });

    it("returns success: true", () => {
      expect(response.body.success).toBe(true);
    });

    it("returns data.valid: false", () => {
      expect(response.body.data.valid).toBe(false);
    });

    it("errors contains the min violation message", () => {
      expect(response.body.data.errors).toContain("amount must be >= 10");
    });
  });

  // ── 3. Amount above max ─────────────────────────────────────────────────────
  describe("amount above max", () => {
    let response;

    beforeAll(async () => {
      response = await request(app)
        .post("/api/validate")
        .send({ amount: 200, constraints: { max: 100 } });
    });

    it("returns HTTP 200", () => {
      expect(response.status).toBe(200);
    });

    it("returns success: true", () => {
      expect(response.body.success).toBe(true);
    });

    it("returns data.valid: false", () => {
      expect(response.body.data.valid).toBe(false);
    });

    it("errors contains the max violation message", () => {
      expect(response.body.data.errors).toContain("amount must be <= 100");
    });
  });

  // ── 4. Empty string amount when required ───────────────────────────────────
  describe("empty string amount when required constraint is set", () => {
    let response;

    beforeAll(async () => {
      response = await request(app)
        .post("/api/validate")
        .send({ amount: "", constraints: { required: true } });
    });

    it("returns HTTP 200", () => {
      expect(response.status).toBe(200);
    });

    it("returns success: true", () => {
      expect(response.body.success).toBe(true);
    });

    it("returns data.valid: false", () => {
      expect(response.body.data.valid).toBe(false);
    });

    it("errors contains the required message", () => {
      expect(response.body.data.errors).toContain("amount is required");
    });
  });

  // ── 4b. Null amount → treated as missing field ─────────────────────────────
  describe("null amount in request body", () => {
    let response;

    beforeAll(async () => {
      response = await request(app)
        .post("/api/validate")
        .send({ amount: null, constraints: { required: true } });
    });

    it("returns HTTP 400", () => {
      expect(response.status).toBe(400);
    });

    it("returns success: false", () => {
      expect(response.body.success).toBe(false);
    });
  });

  // ── 4c. Boolean amount ──────────────────────────────────────────────────────
  describe("boolean amount", () => {
    let response;

    beforeAll(async () => {
      response = await request(app)
        .post("/api/validate")
        .send({ amount: true, constraints: {} });
    });

    it("returns HTTP 200", () => {
      expect(response.status).toBe(200);
    });

    it("returns data.valid: false", () => {
      expect(response.body.data.valid).toBe(false);
    });

    it("errors contains a 'valid number' message", () => {
      expect(response.body.data.errors).toContain("amount must be a valid number");
    });
  });

  // ── 4d. Whitespace-only amount ──────────────────────────────────────────────
  describe("whitespace-only amount", () => {
    let response;

    beforeAll(async () => {
      response = await request(app)
        .post("/api/validate")
        .send({ amount: "   ", constraints: {} });
    });

    it("returns HTTP 200", () => {
      expect(response.status).toBe(200);
    });

    it("returns data.valid: false", () => {
      expect(response.body.data.valid).toBe(false);
    });

    it("errors contains a 'valid number' message", () => {
      expect(response.body.data.errors).toContain("amount must be a valid number");
    });
  });

  // ── 4e. Null / non-object constraints ──────────────────────────────────────
  describe("invalid constraints type", () => {
    it("returns HTTP 400 for null constraints", async () => {
      const res = await request(app)
        .post("/api/validate")
        .send({ amount: 50, constraints: null });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns HTTP 400 for string constraints", async () => {
      const res = await request(app)
        .post("/api/validate")
        .send({ amount: 50, constraints: "min:10" });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns HTTP 400 for array constraints", async () => {
      const res = await request(app)
        .post("/api/validate")
        .send({ amount: 50, constraints: [{ min: 10 }] });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ── 5. Non-numeric amount ───────────────────────────────────────────────────
  describe("non-numeric amount", () => {
    let response;

    beforeAll(async () => {
      response = await request(app)
        .post("/api/validate")
        .send({ amount: "abc", constraints: {} });
    });

    it("returns HTTP 200", () => {
      expect(response.status).toBe(200);
    });

    it("returns success: true", () => {
      expect(response.body.success).toBe(true);
    });

    it("returns data.valid: false", () => {
      expect(response.body.data.valid).toBe(false);
    });

    it("errors contains a 'valid number' message", () => {
      expect(response.body.data.errors).toContain("amount must be a valid number");
    });
  });

  // ── 6. Missing `amount` field in body ──────────────────────────────────────
  describe("missing amount field in request body", () => {
    let response;

    beforeAll(async () => {
      response = await request(app)
        .post("/api/validate")
        .send({ constraints: { min: 0 } });
    });

    it("returns HTTP 400", () => {
      expect(response.status).toBe(400);
    });

    it("returns success: false", () => {
      expect(response.body.success).toBe(false);
    });

    it("returns the missing-fields error message", () => {
      expect(response.body.error).toBe(
        "Missing required fields: amount and constraints"
      );
    });
  });

  // ── 7. Missing `constraints` field in body ─────────────────────────────────
  describe("missing constraints field in request body", () => {
    let response;

    beforeAll(async () => {
      response = await request(app)
        .post("/api/validate")
        .send({ amount: 50 });
    });

    it("returns HTTP 400", () => {
      expect(response.status).toBe(400);
    });

    it("returns success: false", () => {
      expect(response.body.success).toBe(false);
    });

    it("returns the missing-fields error message", () => {
      expect(response.body.error).toBe(
        "Missing required fields: amount and constraints"
      );
    });
  });
});

// ── 8. GET /health ────────────────────────────────────────────────────────────
describe("GET /health", () => {
  let response;

  beforeAll(async () => {
    response = await request(app).get("/health");
  });

  it("returns HTTP 200", () => {
    expect(response.status).toBe(200);
  });

  it("returns { status: 'ok' }", () => {
    expect(response.body).toEqual({ status: "ok" });
  });
});
