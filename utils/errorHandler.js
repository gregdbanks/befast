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