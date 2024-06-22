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

describe("Users", () => {

    describe("GET /api/users", () => {
        it("should get all users", async () => {
            const response = await request(app).get("/api/users");
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe("POST /api/users", () => {
        let userId;

        it("should create a new user", async () => {
            const user = {
                name: "John Doe",
                email: "john@example.com",
                password: "123456",
            };

            const response = await request(app).post("/api/users").send(user);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("name", "John Doe");
            userId = response.body._id;
        });

        describe("PUT /api/users/:id", () => {
            it("should update an existing user", async () => {
                const updatedUser = {
                    name: "Jane Doe",
                    email: "jane@example.com",
                    password: "654321",
                };

                const response = await request(app).put(`/api/users/${userId}`).send(updatedUser);
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("name", "Jane Doe");
                expect(response.body).toHaveProperty("email", "jane@example.com");
            });
        });

        describe("GET /api/users/:id", () => {
            it("should get a single user by id", async () => {
                const response = await request(app).get(`/api/users/${userId}`);
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("name", "Jane Doe");
                expect(response.body).toHaveProperty("email", "jane@example.com");
            });
        });

        describe("DELETE /api/users/:id", () => {
            it("should delete an existing user", async () => {
                const response = await request(app).delete(`/api/users/${userId}`);
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("message", "User deleted successfully");
            });

            it("should return 404 for a deleted user", async () => {
                const response = await request(app).get(`/api/users/${userId}`);
                expect(response.status).toBe(404);
            });
        });
    });
});
