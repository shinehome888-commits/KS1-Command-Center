const express = require('express');
const router = express.Router();
const {
    getAgentMemories,
    getSimilarMemories,
    deleteMemory,
    clearAgentMemories,
    getMemoryStats
} = require('../controllers/memoryController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getMemoryStats);
router.get('/agent/:agentId', getAgentMemories);
router.post('/similar', getSimilarMemories);
router.delete('/:id', deleteMemory);
router.delete('/agent/:agentId/clear', clearAgentMemories);

module.exports = router;
