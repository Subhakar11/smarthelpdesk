const express = require('express');
const { getAuditLogs } = require('../controllers/auditController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/ticket/:ticketId', protect, getAuditLogs);

module.exports = router;