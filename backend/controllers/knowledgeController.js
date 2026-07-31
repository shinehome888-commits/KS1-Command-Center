const Knowledge = require('../models/Knowledge');

// @desc    Get all knowledge articles
// @route   GET /api/knowledge
const getKnowledge = async (req, res) => {
    try {
        const knowledge = await Knowledge.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: knowledge });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a new knowledge article
// @route   POST /api/knowledge
const createKnowledge = async (req, res) => {
    try {
        const { title, category, content } = req.body;
        const knowledge = await Knowledge.create({ title, category, content });
        res.status(201).json({ success: true, data: knowledge });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete a knowledge article
// @route   DELETE /api/knowledge/:id
const deleteKnowledge = async (req, res) => {
    try {
        const knowledge = await Knowledge.findByIdAndDelete(req.params.id);
        
        if (!knowledge) {
            return res.status(404).json({ success: false, message: 'Knowledge article not found' });
        }
        
        res.status(200).json({ success: true, message: 'Knowledge article deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getKnowledge, createKnowledge, deleteKnowledge };
