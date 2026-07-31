const express = require('express');
const router = express.Router();
const { getLogs, createLog } = require('../controllers/activityController');

router.route('/')
    .get(getLogs)       // GET /api/logs
    .post(createLog);   // POST /api/logs

module.exports = router;
