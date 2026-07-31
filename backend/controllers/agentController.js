const Agent = require('../models/Agent');

// @desc    Get all agents
// @route   GET /api/agents
const getAgents = async (req, res) => {
    try {
        const agents = await Agent.find();
        res.status(200).json({ success: true, data: agents });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a new agent
// @route   POST /api/agents
const createAgent = async (req, res) => {
    try {
        const agent = await Agent.create(req.body);
        res.status(201).json({ success: true, data: agent });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete an agent
// @route   DELETE /api/agents/:id
const deleteAgent = async (req, res) => {
    try {
        const agent = await Agent.findByIdAndDelete(req.params.id);
        
        if (!agent) {
            return res.status(404).json({ success: false, message: 'Agent not found' });
        }
        
        res.status(200).json({ success: true, message: 'Agent deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAgents, createAgent, deleteAgent };
