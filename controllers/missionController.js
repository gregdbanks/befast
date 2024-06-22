const Mission = require("../models/Mission");

exports.createMission = async (req, res) => {
    const { name, description, status, commander } = req.body;

    try {
        let mission = new Mission({ name, description, status, commander });
        await mission.save();
        res.status(201).json(mission);
    } catch (err) {
        if (err.code === 11000) {
            // Handle duplicate key error
            res.status(400).json({ error: "Mission with this name already exists" });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
};

exports.getMissions = async (req, res) => {
    try {
        const missions = await Mission.find();
        res.status(200).json(missions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteMission = async (req, res) => {
    const { id } = req.params;

    try {
        const mission = await Mission.findByIdAndDelete(id);
        if (!mission) {
            return res.status(404).json({ error: "Mission not found" });
        }
        res.status(200).json({ message: "Mission deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateMission = async (req, res) => {
    const { id } = req.params;
    const { name, description, status, commander } = req.body;

    try {
        const mission = await Mission.findByIdAndUpdate(
            id,
            { name, description, status, commander },
            { new: true, runValidators: true }
        );
        if (!mission) {
            return res.status(404).json({ error: "Mission not found" });
        }
        res.status(200).json(mission);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMission = async (req, res) => {
    const { id } = req.params;

    try {
        const mission = await Mission.findById(id);
        if (!mission) {
            return res.status(404).json({ error: "Mission not found" });
        }
        res.status(200).json(mission);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};