const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// GET all projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST create new project
router.post('/', async (req, res) => {
    try {
        const { name, description, category, status } = req.body;
        
        if (!name || !description || !category) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide name, description, and category' 
            });
        }

        const project = await Project.create({
            name,
            description,
            category,
            status: status || 'Planning'
        });

        res.status(201).json({ success: true, data: project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE project
router.delete('/:id', async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
