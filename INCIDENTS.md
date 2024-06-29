### Adding Incident Routes and Model to Missions Object

Now, let's add the `Incident` model and routes that are associated with the `Mission` object.
This will allow us to handle incidents that belong to specific missions

### Step 1: Create Incident Model

```bash
mkdir utils
touch models/Incident.js utils/errorHandler.js controllers/incidentController.js routes/incidentRoutes.js 
```

Create a simple `Incident` schema:

```javascript
// models/Incident.js
const mongoose = require("mongoose");

const IncidentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "resolved", "unresolved"],
    default: "pending",
  },
  reportedAt: {
    type: Date,
    default: Date.now,
  },
  mission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mission",
    required: true,
  },
});

module.exports = mongoose.model("Incident", IncidentSchema);
```

### Step 2: Add field to your Mission model to establish your relationship

```js
// /model/Mission.js

// ...
  incidents: [
      {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Incident",
      },
  ],
// ...
```

### Step 3: Create Utility for controllers to share

Add util for handleAsyncErrors and replace code in both controllers with imported function

```js
// utils/errorHandler.js
const handleAsyncErrors = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: "Mission with this name already exists" });
    } else if (err.kind === "ObjectId" && err.name === "CastError") {
      res.status(404).json({ error: "Mission not found" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = handleAsyncErrors;
```

### Step 4: Create a controller for Incident operations:

```javascript
// controllers/incidentController.js
const Incident = require("../models/Incident");
const handleAsyncErrors = require("../utils/errorHandler");

exports.createIncident = handleAsyncErrors(async (req, res) => {
  const { title, description, status, mission } = req.body;
  let incident = new Incident({ title, description, status, mission });
  await incident.save();
  res.status(201).json(incident);
});

exports.getIncidents = handleAsyncErrors(async (req, res) => {
  const incidents = await Incident.find({ mission: req.params.missionId });
  res.status(200).json(incidents);
});

exports.getIncident = handleAsyncErrors(async (req, res) => {
  const { id } = req.params;
  const incident = await Incident.findById(id);
  if (!incident) {
    return res.status(404).json({ error: "Incident not found" });
  }
  res.status(200).json(incident);
});

exports.updateIncident = handleAsyncErrors(async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;
  const incident = await Incident.findByIdAndUpdate(
    id,
    { title, description, status },
    { new: true, runValidators: true }
  );
  if (!incident) {
    return res.status(404).json({ error: "Incident not found" });
  }
  res.status(200).json(incident);
});

exports.deleteIncident = handleAsyncErrors(async (req, res) => {
  const { id } = req.params;
  const incident = await Incident.findByIdAndDelete(id);
  if (!incident) {
    return res.status(404).json({ error: "Incident not found" });
  }
  res.status(200).json({ message: "Incident deleted successfully" });
});
```

### Step 5: Create Incident Routes

```javascript
// routes/incidentRoutes.js
const express = require("express");
const router = express.Router();
const incidentController = require("../controllers/incidentController");

router
  .route("/missions/:missionId/incidents")
  .post(incidentController.createIncident)
  .get(incidentController.getIncidents);

router
  .route("/incidents/:id")
  .get(incidentController.getIncident)
  .put(incidentController.updateIncident)
  .delete(incidentController.deleteIncident);

module.exports = router;
```

### Step 6: Update Application to Use Incident Routes

Include the incident routes in the main application:

```javascript
// app.js
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
app.use("/api", require("./routes/incidentRoutes"));

// Start the server
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on PORT: ${port}`));

module.exports = app;
```

### Step 7: Test the Incident Functionality

<!-- // optimize: Need to break these up into own test file. Ran into issues doing this but i wasnt cleaning up test -->

```javascript
// test/mission.test.js
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
        expect(response.body).toHaveProperty(
          "error",
          "Mission with this name already exists"
        );
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
          expect(response.body).toHaveProperty(
            "name",
            "Destroy the Death Star"
          );
          expect(response.body).toHaveProperty("status", "in progress");
        });
      });

      describe("GET /api/missions/:id", () => {
        it("should get a single mission by id", async () => {
          const response = await request(app).get(`/api/missions/${missionId}`);
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty(
            "name",
            "Destroy the Death Star"
          );
          expect(response.body).toHaveProperty("status", "in progress");
        });
      });

      describe("DELETE /api/missions/:id", () => {
        it("should delete an existing mission", async () => {
          const response = await request(app).delete(
            `/api/missions/${missionId}`
          );
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

      const missionResponse = await request(app)
        .post("/api/missions")
        .send(mission);
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
        const response = await request(app).get(
          `/api/missions/${missionId}/incidents`
        );
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
        const response = await request(app).delete(
          `/api/incidents/${incidentId}`
        );
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty(
          "message",
          "Incident deleted successfully"
        );
      });

      it("should return 404 for a deleted incident", async () => {
        const response = await request(app).get(`/api/incidents/${incidentId}`);
        expect(response.status).toBe(404);
      });
    });
  });
});
```

#### Running Tests

Run the tests to ensure everything is working as expected:

```bash
npm test
```

With these steps, you have added the `Incident` model and routes associated with the `Mission` object. This allows you to manage incidents related to specific missions.