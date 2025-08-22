const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters']
  },
  category: {
    type: String,
    enum: ['billing', 'tech', 'shipping', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['open', 'triaged', 'waiting_human', 'resolved', 'closed'],
    default: 'open'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  agentSuggestion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AgentSuggestion'
  }
}, {
  timestamps: true
});

// Index for better query performance
ticketSchema.index({ status: 1, createdAt: -1 });
ticketSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('Ticket', ticketSchema);