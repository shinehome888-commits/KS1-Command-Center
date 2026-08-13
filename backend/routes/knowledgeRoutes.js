const express = require('express');
const router = express.Router();
const { 
    getAllKnowledge, 
    createKnowledge, 
    updateKnowledge, 
    deleteKnowledge,
    incrementUsage,
    getKnowledgeInsights
} = require('../controllers/knowledgeController');

router.get('/', getAllKnowledge);
router.get('/insights', getKnowledgeInsights);
router.post('/', createKnowledge);
router.put('/:id', updateKnowledge);
router.delete('/:id', deleteKnowledge);
router.post('/:id/use', incrementUsage);

module.exports = router;
