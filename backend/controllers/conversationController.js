const Conversation = require('../models/Conversation');

// GET all conversations for the authenticated user
const getUserConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({ userId: req.user.id })
            .sort({ updatedAt: -1 })
            .select('title updatedAt createdAt')
            .limit(50);

        res.json({ success: true, data: conversations });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET a specific conversation with all messages
const getConversation = async (req, res) => {
    try {
        const conversation = await Conversation.findOne({ 
            _id: req.params.id, 
            userId: req.user.id 
        });

        if (!conversation) {
            return res.status(404).json({ 
                success: false, 
                message: 'Conversation not found' 
            });
        }

        res.json({ success: true, data: conversation });
    } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE a conversation
const deleteConversation = async (req, res) => {
    try {
        const conversation = await Conversation.findOneAndDelete({ 
            _id: req.params.id, 
            userId: req.user.id 
        });

        if (!conversation) {
            return res.status(404).json({ 
                success: false, 
                message: 'Conversation not found' 
            });
        }

        res.json({ success: true, message: 'Conversation deleted successfully' });
    } catch (error) {
        console.error('Delete conversation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE all conversations for the user
const clearAllConversations = async (req, res) => {
    try {
        const result = await Conversation.deleteMany({ userId: req.user.id });
        res.json({ 
            success: true, 
            message: `Deleted ${result.deletedCount} conversations`,
            data: { deletedCount: result.deletedCount }
        });
    } catch (error) {
        console.error('Clear conversations error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { 
    getUserConversations, 
    getConversation, 
    deleteConversation,
    clearAllConversations
};
