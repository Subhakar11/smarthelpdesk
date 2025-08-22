const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  traceId: {
    type: String,
    required: true
  },
  actor: {
    type: String,
    enum: ['system', 'agent', 'user'],
    required: true
  },
  action: {
    type: String,
    required: true
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for querying by ticket and trace
auditLogSchema.index({ ticketId: 1, traceId: 1 });
auditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);