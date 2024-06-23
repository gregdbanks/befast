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
