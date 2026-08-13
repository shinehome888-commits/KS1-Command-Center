const ActivityLog = require('../models/ActivityLog');

const getAllLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.find().sort({ createdAt: -1 });
        res.json({ success: true, data: logs });
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const createLog = async (req, res) => {
    try {
        const { actor, action, status } = req.body;
        
        if (!actor || !action) {
            return res.status(400).json({
                success: false,
                message: 'Please provide actor and action'
            });
        }

        const log = await ActivityLog.create({
            actor,
            action,
            status: status || 'Success'
        });

        res.status(201).json({ success: true, data: log });
    } catch (error) {
        console.error('Create log error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAllLogs, createLog };
