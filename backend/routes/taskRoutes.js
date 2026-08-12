const express = require('express');
const router = express.Router();
const { 
    getUserTasks, 
    getAgentTasks, 
    createAndExecuteTask,
    deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// All task routes require authentication
router.use(protect);

router.get('/', getUserTasks);
router.get('/agent/:agentId', getAgentTasks);
router.post('/', createAndExecuteTask);
router.delete('/:id', deleteTask);

module.exports = router;
