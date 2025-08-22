const mongoose = require('mongoose');

const agentSuggestionSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  predictedCategory: {
    type: String,
    enum: ['billing', 'tech', 'shipping', 'other'],
    required: true
  },
  articleIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  draftReply: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  autoClosed: {
    type: Boolean,
    default: false
  },
  modelInfo: {
    provider: String,
    model: String,
    promptVersion: String,
    latencyMs: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AgentSuggestion', agentSuggestionSchema);