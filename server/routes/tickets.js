const express = require('express');
const { 
  getTickets, 
  getTicket, 
  createTicket, 
  updateTicket, 
  sendReply 
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/auth');
const { validate, ticketSchema } = require('../middleware/validation');

const router = express.Router();

// Add validation middleware to prevent invalid IDs
router.param('id', (req, res, next, id) => {
  // Check if the ID is a valid MongoDB ObjectId
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ 
      message: 'Invalid ticket ID format',
      details: 'Ticket ID must be a 24-character hexadecimal string'
    });
  }
  next();
});

// Debugging middleware
router.use((req, res, next) => {
  console.log('Tickets route:', req.method, req.originalUrl, 'Params:', req.params);
  next();
});

// Define routes
router.get('/', protect, getTickets);
router.post('/', protect, validate(ticketSchema), createTicket);
router.get('/:id', protect, getTicket);
router.put('/:id', protect, updateTicket);
router.post('/:id/reply', protect, authorize('agent', 'admin'), sendReply);

module.exports = router;