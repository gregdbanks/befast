const request = require("supertest");
const mongoose = require("mongoose");
const { connectDb, disconnectDb } = require("../config/db");
const app = require("../app");

let server;

beforeAll(async () => {
    await connectDb();
    server = app.listen(4000);
});

afterAll(async () => {
    await server.close();
    await disconnectDb();
    await mongoose.connection.close();
});

describe("Missions and Incidents", () => {
    let missionId;
    let incidentId;

    describe("Missions", () => {
        describe("GET /api/missions", () => {
            it("should get all missions", async () => {
                const response = await request(app).get("/api/missions");
                expect(response.status).toBe(200);
                expect(Array.isArray(response.body)).toBe(true);
            });
        });

        describe("POST /api/missions", () => {
            it("should create a new mission", async () => {
                const mission = {
                    name: "Rescue Princess Luna",
                    description: "Rescue Princess Luna from the Death Star.",
                    status: "pending",
                    commander: "Luke Skywalker",
                };

                const response = await request(app).post("/api/missions").send(mission);
                expect(response.status).toBe(201);
                expect(response.body).toHaveProperty("name", "Rescue Princess Luna");
                missionId = response.body._id;
            });

            it("should not create a duplicate mission", async () => {
                const mission = {
                    name: "Rescue Princess Luna",
                    description: "Rescue Princess Luna from the Death Star.",
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

    describe("Incidents", () => {
        beforeAll(async () => {
            const mission = {
                name: "rescue the jedi",
                description: "rescue the jedi from Jabba the Hutt.",
                status: "pending",
                commander: "Leia Organa",
            };

            const missionResponse = await request(app).post("/api/missions").send(mission);
            missionId = missionResponse.body._id;
        });

        afterAll(async () => {
            await request(app).delete(`/api/missions/${missionId}`);
        });

        describe("POST /api/missions/:missionId/incidents", () => {
            it("should create a new incident for a mission", async () => {
                const incident = {
                    title: "Locate Luke Skywalker",
                    description: "Find out where Han Solo is being held.",
                    status: "pending",
                    mission: missionId,
                };

                const response = await request(app)
                    .post(`/api/missions/${missionId}/incidents`)
                    .send(incident);
                expect(response.status).toBe(201);
                expect(response.body).toHaveProperty("title", "Locate Luke Skywalker");
                incidentId = response.body._id;
            });
        });

        describe("GET /api/missions/:missionId/incidents", () => {
            it("should get all incidents for a mission", async () => {
                const response = await request(app).get(`/api/missions/${missionId}/incidents`);
                expect(response.status).toBe(200);
                expect(Array.isArray(response.body)).toBe(true);
            });
        });

        describe("GET /api/incidents/:id", () => {
            it("should get a single incident by id", async () => {
                const response = await request(app).get(`/api/incidents/${incidentId}`);
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("title", "Locate Luke Skywalker");
            });
        });

        describe("PUT /api/incidents/:id", () => {
            it("should update an existing incident", async () => {
                const updatedIncident = {
                    title: "Free Han Solo",
                    description: "Free Han Solo from his carbonite prison.",
                    status: "resolved",
                };

                const response = await request(app)
                    .put(`/api/incidents/${incidentId}`)
                    .send(updatedIncident);
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("title", "Free Han Solo");
                expect(response.body).toHaveProperty("status", "resolved");
            });
        });

        describe("DELETE /api/incidents/:id", () => {
            it("should delete an existing incident", async () => {
                const response = await request(app).delete(`/api/incidents/${incidentId}`);
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("message", "Incident deleted successfully");
            });

            it("should return 404 for a deleted incident", async () => {
                const response = await request(app).get(`/api/incidents/${incidentId}`);
                expect(response.status).toBe(404);
            });
        });
    });
});
