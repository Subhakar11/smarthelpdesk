const AgentService = require('../services/agentService');
const Ticket = require('../models/Ticket');
const AgentSuggestion = require('../models/AgentSuggestion');

// @desc    Trigger triage for a ticket
// @route   POST /api/agent/triage/:ticketId
// @access  Private/System
const triageTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    const agentService = new AgentService();
    const result = await agentService.triageTicket(ticketId);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get agent suggestion for a ticket
// @route   GET /api/agent/suggestion/:ticketId
// @access  Private
const getSuggestion = async (req, res) => {
  try {
    const suggestion = await AgentSuggestion.findOne({ ticketId: req.params.ticketId })
      .populate('articleIds');

    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    res.json(suggestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  triageTicket,
  getSuggestion
};