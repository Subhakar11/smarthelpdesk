# Smart Helpdesk with Agentic Triage

A full-stack web application that provides intelligent support ticket management with AI-powered triage system. Users can raise support tickets, and an AI agent automatically classifies, retrieves relevant knowledge base articles, drafts replies, and either auto-resolves or assigns tickets to human agents.

## Architecture

### System Architecture Diagram
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ React Client │ │ Express API │ │ MongoDB │
│ (Vite) │◄──►│ Server │◄──►│ Database │
│ - Components │ │ - Controllers │ │ - Users │
│ - Context │ │ - Routes │ │ - Tickets │
│ - Services │ │ - Middleware │ │ - Articles │
└─────────────────┘ │ - Services │ │ - Audit Logs │
└─────────────────┘ └─────────────────┘
▲
│
┌─────────────────┐
│ Agent Service │
│ - Classification │
│ - KB Retrieval │
│ - Drafting │
│ - Decision │
└─────────────────┘


### Architecture Rationale

- **MERN Stack**: Chosen for its simplicity, full JavaScript compatibility, and rapid development capabilities
- **Monolithic Architecture**: Single codebase for easier maintenance and deployment
- **Service Layer**: Separated business logic (AgentService) from controllers for better testability
- **RESTful API**: Standardized API design for predictable endpoints and HTTP verbs
- **JWT Authentication**: Stateless authentication for scalability and mobile readiness

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- MongoDB 5.0+
- npm or yarn

### Environment Variables

Create a `.env` file in the server directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/helpdesk
// or you can use mongodb atlas
JWT_SECRET=your-super-secret-jwt-key-change-in-production
AUTO_CLOSE_ENABLED=true
CONFIDENCE_THRESHOLD=0.7
STUB_MODE=true
CLIENT_URL=http://localhost:3000
NODE_ENV=development

Workflow Overview
Ticket Creation → User submits a support ticket

Automatic Triage → System processes the ticket asynchronously

Classification → AI determines ticket category and confidence

KB Retrieval → Finds relevant knowledge base articles

Draft Generation → Creates suggested response with citations

Decision Making → Decides to auto-close or assign to human

Execution → Updates ticket status and creates audit trail



Agent Components
1. Classification Engine
Method: Keyword-based heuristic matching

Categories: billing, tech, shipping, other

Confidence Scoring: Based on keyword matches (0.3 - 0.95)

Stub Implementation:


// Keywords for each category
const billingKeywords = ['refund', 'invoice', 'payment', 'charge'];
const techKeywords = ['error', 'bug', 'login', 'password'];
const shippingKeywords = ['delivery', 'shipment', 'tracking', 'package'];


2. Knowledge Base Retrieval
Method: MongoDB regex search on title, body, and tags

Filters: Only published articles, category-based matching

Limit: Top 3 most relevant articles

Fallback: Empty result set handled gracefully

3. Response Drafting
Template: Structured response with gratitude, solutions, and closing

Citations: Numbered references to KB articles

Personalization: Includes ticket title and specific solutions

4. Decision Engine
Rules:

If autoCloseEnabled AND confidence ≥ threshold → Auto-resolve

Otherwise → Assign to human agent

Configurable: Thresholds adjustable via admin settings

Guardrails and Safety Measures
Input Validation: Zod schema validation for all inputs

Authentication: JWT-based role protection for all routes

Error Handling: Comprehensive error catching and logging

Rate Limiting: Express-rate-limit on authentication endpoints

SQL Injection Prevention: Mongoose built-in protection

XSS Prevention: Input sanitization and output encoding

Configurable Thresholds: Admin-controlled confidence levels

Audit Logging: Complete trail of all agent actions

Prompt Management
All AI prompts are versioned and stored in code:

Prompt Versioning: Each prompt includes version metadata

Deterministic Stubs: Fully functional without external APIs

Easy Extension: Simple interface to replace with real LLM calls


Test Structure
tests/
├── unit/
│   ├── services/
│   │   ├── agentService.test.js
│   │   └── kbService.test.js
│   └── utils/
│       └── llmStub.test.js
├── integration/
│   ├── auth.test.js
│   ├── tickets.test.js
│   └── kb.test.js
└── e2e/
    └── ticketWorkflow.test.js


    Key Test Scenarios
Authentication Flow: User registration, login, and token validation

Ticket Lifecycle: Creation, triage, assignment, and resolution

Agent Decision Making: Confidence threshold testing

KB Management: Article CRUD operations and search functionality

Error Handling: Validation errors and edge cases

Audit Logging: Complete action tracing

API Testing with Postman
Import the Postman collection from /postman/smart-helpdesk.postman_collection.json containing:

Auth endpoints (login, register, me)

Ticket management (create, list, update)

KB operations (search, create, update)

Agent endpoints (triage, suggestions)

Admin endpoints (config, audit logs)

Deployment
Production Considerations
Environment Variables: Set production values for JWT_SECRET and MongoDB URI

Database: Use MongoDB Atlas or managed MongoDB service

SSL: Enable HTTPS with proper certificates

Logging: Implement structured logging with rotation

Monitoring: Add health checks and performance monitoring

CORS: Restrict to production domain

Rate Limiting: Adjust limits for production traffic


# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/helpdesk
    depends_on:
      - mongo

  mongo:
    image: mongo:5
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:


  Troubleshooting
Common Issues
MongoDB Connection: Ensure MongoDB is running and accessible

Port Conflicts: Change ports in .env if 3000 or 5000 are busy

JWT Errors: Verify JWT_SECRET is set and consistent

CORS Issues: Check CLIENT_URL matches your frontend URL

Validation Errors: Review request payload formats

Getting Help
Check server logs for detailed error messages

Verify all environment variables are set

Ensure database is properly seeded

Test API endpoints directly with curl or Postman

License
MIT License - see LICENSE file for details

Contributing
Fork the repository

Create a feature branch

Follow existing code style and patterns

Add tests for new functionality

Submit a pull request with description