const AuditLog = require('../models/AuditLog');

// @desc    Get audit logs for a ticket
// @route   GET /api/audit/ticket/:ticketId
// @access  Private
const getAuditLogs = async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    const logs = await AuditLog.find({ ticketId })
      .sort({ timestamp: 1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAuditLogs
};