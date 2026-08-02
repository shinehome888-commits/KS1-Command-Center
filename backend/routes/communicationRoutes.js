const express = require('express');
const router = express.Router();
const { getAllCommunications, createCommunication, deleteCommunication } = require('../controllers/communicationController');

router.get('/', getAllCommunications);
router.post('/', createCommunication);
router.delete('/:id', deleteCommunication);

module.exports = router;
