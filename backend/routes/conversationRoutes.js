const express = require('express');
const router = express.Router();
const { 
    getUserConversations, 
    getConversation, 
    deleteConversation,
    clearAllConversations
} = require('../controllers/conversationController');
const { protect } = require('../middleware/auth');

// All conversation routes require authentication
router.use(protect);

router.get('/', getUserConversations);
router.get('/:id', getConversation);
router.delete('/:id', deleteConversation);
router.delete('/clear/all', clearAllConversations);

module.exports = router;
