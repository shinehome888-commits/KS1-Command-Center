const express = require('express');
const router = express.Router();
const { getAgents } = require('../controllers/agentController');

router.route('/').get(getAgents);

module.exports = router;
