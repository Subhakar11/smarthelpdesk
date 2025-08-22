const express = require('express');
const { triageTicket, getSuggestion } = require('../controllers/agentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/triage/:ticketId', protect, authorize('admin', 'agent'), triageTicket);
router.get('/suggestion/:ticketId', protect, getSuggestion);

module.exports = router;