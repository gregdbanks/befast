const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const { connectDb, disconnectDb } = require("../config/db");

beforeAll(async () => {
    await connectDb();
});

afterAll(async () => {
    await disconnectDb();
    await mongoose.connection.close();
});

describe("Missions", () => {
    describe("GET /api/missions", () => {
        it("should get all missions", async () => {
            const response = await request(app).get("/api/missions");
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe("POST /api/missions", () => {
        let missionId;

        it("should create a new mission", async () => {
            const mission = {
                name: "Rescue Princess Leia",
                description: "Rescue Princess Leia from the Death Star.",
                status: "pending",
                commander: "Luke Skywalker",
            };

            const response = await request(app).post("/api/missions").send(mission);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("name", "Rescue Princess Leia");
            missionId = response.body._id;
        });

        it("should not create a duplicate mission", async () => {
            const mission = {
                name: "Rescue Princess Leia",
                description: "Rescue Princess Leia from the Death Star.",
                status: "pending",
                commander: "Luke Skywalker",
            };

            const response = await request(app).post("/api/missions").send(mission);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error", "Mission with this name already exists");
        });

        describe("PUT /api/missions/:id", () => {
            it("should update an existing mission", async () => {
                const updatedMission = {
                    name: "Destroy the Death Star",
                    description: "Destroy the Death Star using the Rebel fleet.",
                    status: "in progress",
                    commander: "Luke Skywalker",
                };

                const response = await request(app)
                    .put(`/api/missions/${missionId}`)
                    .send(updatedMission);
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("name", "Destroy the Death Star");
                expect(response.body).toHaveProperty("status", "in progress");
            });
        });

        describe("GET /api/missions/:id", () => {
            it("should get a single mission by id", async () => {
                const response = await request(app).get(`/api/missions/${missionId}`);
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("name", "Destroy the Death Star");
                expect(response.body).toHaveProperty("status", "in progress");
            });
        });

        describe("DELETE /api/missions/:id", () => {
            it("should delete an existing mission", async () => {
                const response = await request(app).delete(`/api/missions/${missionId}`);
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty(
                    "message",
                    "Mission deleted successfully"
                );
            });

            it("should return 404 for a deleted mission", async () => {
                const response = await request(app).get(`/api/missions/${missionId}`);
                expect(response.status).toBe(404);
            });
        });
    });
});
