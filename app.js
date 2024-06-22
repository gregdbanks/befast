const express = require("express");
const bodyParser = require("body-parser");
const { connectDb } = require("./config/db");
const dotenv = require("dotenv");

// Load env vars
dotenv.config({ path: "./config/config.env" });

const app = express();

// Connect to the database
connectDb();

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/api", require("./routes/missionRoutes"));

// Start the server
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on PORT: ${port}`));

module.exports = app;