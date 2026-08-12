const express = require('express');
const router = express.Router();
const {
    exportProjects,
    exportAgents,
    exportKnowledge,
    exportCommunications,
    exportTasks,
    exportActivityLogs,
    exportAllData
} = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/projects', exportProjects);
router.get('/agents', exportAgents);
router.get('/knowledge', exportKnowledge);
router.get('/communications', exportCommunications);
router.get('/tasks', exportTasks);
router.get('/activity-logs', exportActivityLogs);
router.get('/all', exportAllData);

module.exports = router;
