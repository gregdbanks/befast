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
    incidents: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Incident",
        },
    ],
});

module.exports = mongoose.model("Mission", MissionSchema);
