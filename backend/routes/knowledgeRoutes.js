const express = require('express');
const router = express.Router();
const Knowledge = require('../models/Knowledge');

// GET all knowledge articles
router.get('/', async (req, res) => {
    try {
        const knowledge = await Knowledge.find().sort({ createdAt: -1 });
        res.json({ success: true, data: knowledge });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST create new knowledge article
router.post('/', async (req, res) => {
    try {
        const { title, category, content } = req.body;
        
        if (!title || !category || !content) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide title, category, and content' 
            });
        }

        const knowledge = await Knowledge.create({
            title,
            category,
            content
        });

        res.status(201).json({ success: true, data: knowledge });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE knowledge article
router.delete('/:id', async (req, res) => {
    try {
        const knowledge = await Knowledge.findByIdAndDelete(req.params.id);
        
        if (!knowledge) {
            return res.status(404).json({ success: false, message: 'Knowledge article not found' });
        }

        res.json({ success: true, message: 'Knowledge article deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
