<!-- // optimize tested: 10 times -->
<!--// todo Some goals:
// todo: Convert to typescript and modules
// todo: Teach this in tdd using supertest -->

![Description](befast.png)

Below is a basic star wars missions app with an MVC-like file structure and using Mongoose for MongoDB integration.

### Step 1: Initialize the Project

First, create a new directory for your project and initialize it:

```bash
mkdir star-wars-missions
cd star-wars-missions
npm init -y
git init
```

### Step 2: Install Dependencies

Install the required dependencies:

```bash
npm install express mongoose body-parser dotenv jest
```

For development and testing:

```bash
npm install --save-dev nodemon
```

### Step 3: Set Up File Structure

Create the following directories and files:

```
star-wars-missions/
│
├── models/
│   └── Mission.js
│
├── controllers/
│   └── missionController.js
│
├── routes/
│   └── missionRoutes.js
│
├── test/
│   └── mission.test.js
│
├── config/
│   └── db.js
│
├── index.js
├── package.json
└── README.md
```

_command to make file structure_

```bash
mkdir -p models controllers routes test config
touch models/Mission.js controllers/missionController.js routes/missionRoutes.js test/mission.test.js config/db.js config/config.env index.js .gitignore
```

Add node modules and sensitive env variables

```gitignore
node_modules/
config/config.env
```

Add config/config.env environment variables file

```env
NODE_ENV=development
PORT=4000

MONGO_URI=<your mongo uri from mongoDb>
```

### Step 4: Make model

Create a simple Mission schema:

```javascript
// /model/Mission.js
const mongoose = require("mongoose");

const MissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "in progress", "completed"],
    default: "pending",
  },
  commander: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Mission", MissionSchema);
```

### Step 5: Create a controller for Mission operations:

```javascript
// /controllers/missionController.js
const Mission = require("../models/Mission");

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

exports.createMission = handleAsyncErrors(async (req, res) => {
  const { name, description, status, commander } = req.body;
  let mission = new Mission({ name, description, status, commander });
  await mission.save();
  res.status(201).json(mission);
});

exports.getMissions = handleAsyncErrors(async (req, res) => {
  const missions = await Mission.find();
  res.status(200).json(missions);
});

exports.deleteMission = handleAsyncErrors(async (req, res) => {
  const { id } = req.params;
  const mission = await Mission.findByIdAndDelete(id);
  if (!mission) {
    return res.status(404).json({ error: "Mission not found" });
  }
  res.status(200).json({ message: "Mission deleted successfully" });
});

exports.updateMission = handleAsyncErrors(async (req, res) => {
  const { id } = req.params;
  const { name, description, status, commander } = req.body;
  const mission = await Mission.findByIdAndUpdate(
    id,
    { name, description, status, commander },
    { new: true, runValidators: true }
  );
  if (!mission) {
    return res.status(404).json({ error: "Mission not found" });
  }
  res.status(200).json(mission);
});

exports.getMission = handleAsyncErrors(async (req, res) => {
  const { id } = req.params;
  const mission = await Mission.findById(id);
  if (!mission) {
    return res.status(404).json({ error: "Mission not found" });
  }
  res.status(200).json(mission);
});
```

### Step 6: Create routes for the Mission operations:

```javascript
// /routes/missionRoutes.js
const express = require("express");
const router = express.Router();
const missionController = require("../controllers/missionController");

router
  .route("/missions")
  .post(missionController.createMission)
  .get(missionController.getMissions);

router
  .route("/missions/:id")
  .get(missionController.getMission)
  .put(missionController.updateMission)
  .delete(missionController.deleteMission);

module.exports = router;
```

### Step 7: Set up the MongoDB connection:

```javascript
// /config/db.js
const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to the database");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

const disconnectDb = async () => {
  await mongoose.disconnect();
};

module.exports = { connectDb, disconnectDb };
```

### Step 8: Set up the Express application:

```javascript
// index.js
const express = require("express");
const bodyParser = require("body-parser");
const { connectDb } = require("./config/db");
const dotenv = require("dotenv");

dotenv.config({ path: "./config/config.env" }); // Load env vars

const app = express();

connectDb(); 

app.use(bodyParser.json()); // Middleware

app.use("/api", require("./routes/missionRoutes")); 

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on PORT: ${port}`)); // Start the server

module.exports = app;
```

### Step 10: Run the Application

Add a start script to `package.json`:

```json
"scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest"
},
```

### Step 11: Start the application:

```bash
npm run dev
```

### Step 12: Test the Application 

<!-- //!optimize, this could be broken up into modules, look at test10app -->

<!-- ```js
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
``` -->

<!-- ```js
// example of module for incidentTest.js
const request = require('supertest');
const app = require('../app');

module.exports = function () {
    describe("Incidents", () => {
      // test here
    });
};
``` -->

Update the test file to use Jest and Supertest:

```javascript
// test/mission.test.js
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
```

#### Running Tests

Run the tests:

```bash
npm test
```

With this setup, you have a basic Express app with an MVC-like structure, using Mongoose for MongoDB integration, and a testing setup using Jest and Supertest, all tailored for handling Star Wars missions.
