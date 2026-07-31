const ActivityLog = require('../models/ActivityLog');

// @desc    Get all activity logs (newest first)
// @route   GET /api/logs
const getLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(20);
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a new activity log
// @route   POST /api/logs
const createLog = async (req, res) => {
    try {
        const { actor, action, status } = req.body;
        const log = await ActivityLog.create({ actor, action, status });
        res.status(201).json({ success: true, data: log });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = { getLogs, createLog };
