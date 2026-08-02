const Communication = require('../models/Communication');

const getAllCommunications = async (req, res) => {
    try {
        const communications = await Communication.find().sort({ createdAt: -1 });
        res.json({ success: true, data: communications });
    } catch (error) {
        console.error('Get communications error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const createCommunication = async (req, res) => {
    try {
        const { title, content, category, priority, author } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title and content'
            });
        }

        const communication = await Communication.create({
            title,
            content,
            category: category || 'Announcement',
            priority: priority || 'Normal',
            author: author || 'King Solomon'
        });

        res.status(201).json({ success: true, data: communication });
    } catch (error) {
        console.error('Create communication error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteCommunication = async (req, res) => {
    try {
        const communication = await Communication.findByIdAndDelete(req.params.id);
        
        if (!communication) {
            return res.status(404).json({ 
                success: false, 
                message: 'Communication not found' 
            });
        }

        res.json({ success: true, message: 'Communication deleted successfully' });
    } catch (error) {
        console.error('Delete communication error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAllCommunications, createCommunication, deleteCommunication };
