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
        it("should create a new user", async () => {
            const user = {
                name: "John Doe",
                email: "john@example.com",
                password: "123456",
            };
            const response = await request(app).post("/api/users").send(user);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("name", "John Doe");
        });
    });
});