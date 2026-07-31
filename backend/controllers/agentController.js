const Agent = require('../models/Agent');

const getAgents = async (req, res) => {
    try {
        const agents = await Agent.find();
        res.status(200).json({ success: true, data: agents });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAgents };
