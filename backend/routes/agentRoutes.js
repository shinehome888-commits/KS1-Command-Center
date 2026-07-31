const express = require('express');
const router = express.Router();
const { getAgents, createAgent, deleteAgent } = require('../controllers/agentController');

router.route('/')
    .get(getAgents)       // GET /api/agents
    .post(createAgent);   // POST /api/agents

router.route('/:id')
    .delete(deleteAgent); // DELETE /api/agents/:id

module.exports = router;
