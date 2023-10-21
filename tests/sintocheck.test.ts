import request from "supertest";
import app from "../app";

describe("API endpoints", () => {
  // let token;
  // let patientId;
  // let healthDataId;
  let token: string;
  let patientId: string;
  let healthDataId: string;

  beforeAll(async () => {
    // Sign up to create a new user
    await request(app).post("/signup/patient").send({
      name: "Test User",
      phone: "0129837501",
      password: "testpassword",
    });

    // Log in to obtain JWT token
    const response = await request(app).post("/login/patient").send({
      phone: "0129837501",
      password: "testpassword",
    });
    token = response.body.token;
    patientId = response.body.id;

    console.log("user: ", response.body);
  });

  afterAll(async () => {
    // Delete the created user
    await request(app)
      .delete(`/patient/${patientId}`)
      .set("Authorization", `${token}`);
  });

  describe("GET /healthData", () => {
    it("should return a list of common health data", async () => {
      const response = await request(app)
        .get("/healthData")
        .set("Authorization", `${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.any(Array));
    });

    it("should return 401 if no token is provided", async () => {
      const response = await request(app).get("/healthData");
      expect(response.status).toBe(401);
    }, 10000);
  });

  describe("POST /personalizedHealthData", () => {
    it("should create a new personalized health data for a patient", async () => {
      const response = await request(app)
        .post("/personalizedHealthData")
        .set("Authorization", `${token}`)
        .send({
          name: "Test Health Data",
          quantitative: true,
          patientId: patientId,
          rangeMin: 0,
          rangeMax: 100,
          unit: "bpm",
        });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      healthDataId = response.body.id;

      console.log("health data: ", response.body);
    });

    afterAll(async () => {
      // Delete the created health data
      await request(app)
        .delete(`/personalizedHealthData/${healthDataId}`)
        .set("Authorization", `${token}`);
    });
  });

  describe("GET /personalizedHealthData/:id", () => {
    it("should return a list of personalized health data for a patient", async () => {
      const response = await request(app)
        .get(`/personalizedHealthData/${patientId}`)
        .set("Authorization", `${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.any(Array));
    });
  });

  describe("GET /trackedHealthData/:id", () => {
    it("should return a list of tracked health data for a patient", async () => {
      const response = await request(app)
        .get(`/trackedHealthData/${patientId}`)
        .set("Authorization", `${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.any(Array));
    });
  });

  describe("GET /HealthDataRecords/:patientId/:healthDataId", () => {
    it("should return a list of specific data for the given patient", async () => {
      const response = await request(app)
        .get(`/HealthDataRecords/${patientId}/${healthDataId}`)
        .set("Authorization", `${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.any(Array));
    });
  });
});
