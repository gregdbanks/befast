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

// Import and execute mission tests
const missionTests = require('./mission');
missionTests();

// Import and execute incident tests
const incidentTests = require('./incident');
incidentTests();
