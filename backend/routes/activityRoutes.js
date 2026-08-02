const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');

// GET all activity logs (most recent first)
router.get('/', async (req, res) => {
    try {
        const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(50);
        res.json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST create new activity log
router.post('/', async (req, res) => {
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
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
