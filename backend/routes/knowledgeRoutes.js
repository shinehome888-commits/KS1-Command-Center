const express = require('express');
const router = express.Router();
const { getKnowledge, createKnowledge, deleteKnowledge } = require('../controllers/knowledgeController');

router.route('/')
    .get(getKnowledge)       // GET /api/knowledge
    .post(createKnowledge);  // POST /api/knowledge

router.route('/:id')
    .delete(deleteKnowledge); // DELETE /api/knowledge/:id

module.exports = router;
