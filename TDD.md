//optimize: The main goal here is we start out with failed test first
<!-- ```javascript 
// test/mission.test.js
const request = require("supertest");
const app = require("../index");
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
    describe("POST /api/missions", () => {
        let missionId;
        let id = new Date().getMilliseconds();

        it("should create a new mission", async () => {
            const mission = {
                name: "Rescue Princess Leia" + id,
                description: "Rescue Princess Leia from the Death Star.",
                status: "pending",
                commander: "Luke Skywalker",
            };

            const response = await request(app).post("/api/missions").send(mission);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("name", "Rescue Princess Leia" + id);
            missionId = response.body._id;
        });
    });
});
```

#### Running Tests

Run the tests:

```bash
npm test
``` -->

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
const app = require("../index");
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
    describe("POST /api/missions", () => {
        let missionId;
        let id = new Date().getMilliseconds();

        it("should create a new mission", async () => {
            const mission = {
                name: "Rescue Princess Leia" + id,
                description: "Rescue Princess Leia from the Death Star.",
                status: "pending",
                commander: "Luke Skywalker",
            };

            const response = await request(app).post("/api/missions").send(mission);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("name", "Rescue Princess Leia" + id);
            missionId = response.body._id;
        });
    });
});
```

#### Running Tests

Run the tests:

```bash
npm test
```

