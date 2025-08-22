const { z } = require('zod');

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'agent', 'user']).optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

const ticketSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['billing', 'tech', 'shipping', 'other']).optional()
});

const articleSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  body: z.string().min(20, 'Body must be at least 20 characters'),
  tags: z.array(z.string()).or(z.string()).optional(),
  status: z.enum(['draft', 'published']).optional()
});

const configSchema = z.object({
  autoCloseEnabled: z.boolean().optional(),
  confidenceThreshold: z.number().min(0).max(1).optional(),
  slahours: z.number().min(1).optional()
});

// Validation middleware
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    const errors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
    
    res.status(400).json({
      message: 'Validation failed',
      errors: errors
    });
  }
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  ticketSchema,
  articleSchema,
  configSchema
};