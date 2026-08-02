const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');

// GET all agents
router.get('/', async (req, res) => {
    try {
        const agents = await Agent.find().sort({ createdAt: -1 });
        res.json({ success: true, data: agents });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST create new agent
router.post('/', async (req, res) => {
    try {
        const { name, role, status } = req.body;
        
        if (!name || !role) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide name and role' 
            });
        }

        const agent = await Agent.create({
            name,
            role,
            status: status || 'Standby'
        });

        res.status(201).json({ success: true, data: agent });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE agent
router.delete('/:id', async (req, res) => {
    try {
        const agent = await Agent.findByIdAndDelete(req.params.id);
        
        if (!agent) {
            return res.status(404).json({ success: false, message: 'Agent not found' });
        }

        res.json({ success: true, message: 'Agent deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
