// Keep these imports:
const Ticket = require('../models/Ticket');
const AgentSuggestion = require('../models/AgentSuggestion');
const AuditLog = require('../models/AuditLog');

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res) => {
  try {
    const { status, assignedToMe } = req.query;
    let filter = {};

    // Make sure req.user exists
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user info found' });
    }

    // Regular users can only see their own tickets
    if (req.user.role === 'user') {
      filter.createdBy = req.user.id;
    }

    // Agents can see tickets assigned to them
    if (req.user.role === 'agent' && assignedToMe === 'true') {
      filter.assignee = req.user.id;
    }

    // Filter by status if provided
    if (status && status !== 'all') {
      filter.status = status;
    }

    const tickets = await Ticket.find(filter)
      .populate('createdBy', 'name email')
      .populate('assignee', 'name email')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    console.error('Error in getTickets:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
const getTicket = async (req, res) => {
  try {
    console.log('Getting ticket with ID:', req.params.id);
    
    // Add validation for ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid ticket ID format' });
    }

    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignee', 'name email')
      .populate('agentSuggestion');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if user has access to this ticket
    if (req.user.role === 'user' && ticket.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Error in getTicket:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = async (req, res) => {
  try {
    console.log('Creating ticket with data:', req.body);
    console.log('User ID:', req.user.id);

    const ticketData = {
      title: req.body.title?.trim(),
      description: req.body.description?.trim(),
      category: req.body.category || 'other',
      createdBy: req.user.id
    };

    const ticket = await Ticket.create(ticketData);

    // Populate createdBy field
    await ticket.populate('createdBy', 'name email');

    // Add to audit log
    await AuditLog.create({
      ticketId: ticket._id,
      traceId: `ticket-${ticket._id}`,
      actor: 'user',
      action: 'TICKET_CREATED',
      meta: {
        title: ticket.title,
        category: ticket.category
      }
    });

    // Process triage immediately (no queue)
    setTimeout(async () => {
      try {
        const AgentService = require('../services/agentService');
        const agentService = new AgentService();
        await agentService.triageTicket(ticket._id.toString());
      } catch (error) {
        console.error('Triage error:', error);
      }
    }, 100);

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error in createTicket:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to create ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private
const updateTicket = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user info found' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (req.user.role === 'user' && ticket.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('assignee', 'name email');

    res.json(updatedTicket);
  } catch (error) {
    console.error('Error in updateTicket:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send reply to ticket
// @route   POST /api/tickets/:id/reply
// @access  Private/Agent
const sendReply = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user info found' });
    }

    const { message, useSuggestion } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (!['agent', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    ticket.status = req.body.status || 'resolved';
    ticket.assignee = req.user.id;
    await ticket.save();

    await AuditLog.create({
      ticketId: ticket._id,
      traceId: `ticket-${ticket._id}`,
      actor: req.user.role,
      action: 'REPLY_SENT',
      meta: {
        agentId: req.user.id,
        agentName: req.user.name,
        usedSuggestion: useSuggestion || false,
        message: message || 'No message provided'
      }
    });

    res.json({ message: 'Reply sent successfully', ticket });
  } catch (error) {
    console.error('Error in sendReply:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  sendReply
};
