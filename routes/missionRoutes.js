const express = require("express");
const router = express.Router();
const missionController = require("../controllers/missionController");

router.post("/missions", missionController.createMission);
router.get("/missions", missionController.getMissions);
router.get("/missions/:id", missionController.getMission);
router.delete("/missions/:id", missionController.deleteMission);
router.put("/missions/:id", missionController.updateMission);

module.exports = router;