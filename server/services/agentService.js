const { classify, draftReply } = require('../utils/llmStub');
const Article = require('../models/Article');
const AgentSuggestion = require('../models/AgentSuggestion');
const AuditLog = require('../models/AuditLog');
const Config = require('../models/Config');
const Ticket = require('../models/Ticket');
const { v4: uuidv4 } = require('uuid');

class AgentService {
  constructor() {
    this.traceId = uuidv4();
  }

  async triageTicket(ticketId) {
    try {
      const ticket = await Ticket.findById(ticketId).populate('createdBy');
      if (!ticket) throw new Error('Ticket not found');

      // Get system config with fallback to default values
      let config = await Config.findOne();
      if (!config) {
        // Create default config if none exists
        config = await Config.create({
          autoCloseEnabled: true,
          confidenceThreshold: 0.7,
          slahours: 24
        });
      }
      
      // Start triage process
      await this.logAudit(ticketId, 'TRIAGE_STARTED', { traceId: this.traceId });

      // Step 1: Classify ticket
      const classification = await this.classifyTicket(ticket);
      await this.logAudit(ticketId, 'TICKET_CLASSIFIED', classification);

      // Step 2: Retrieve relevant KB articles
      const relevantArticles = await this.retrieveKBArticles(ticket, classification);
      await this.logAudit(ticketId, 'KB_ARTICLES_RETRIEVED', { 
        articleIds: relevantArticles.map(a => a._id),
        count: relevantArticles.length
      });

      // Step 3: Draft reply
      const draft = await this.generateDraftReply(ticket, relevantArticles, classification);
      await this.logAudit(ticketId, 'DRAFT_REPLY_GENERATED', {
        draftLength: draft.draftReply.length,
        citations: draft.citations
      });

      // Step 4: Make decision
      const decision = await this.makeDecision(draft.confidence, config);
      await this.logAudit(ticketId, 'TRIAGE_DECISION_MADE', decision);

      // Step 5: Save suggestion and update ticket
      const suggestion = await this.saveSuggestion(
        ticketId, 
        classification, 
        relevantArticles, 
        draft, 
        decision
      );

      // Step 6: Execute decision
      await this.executeDecision(ticketId, suggestion, decision, config);

      return { success: true, suggestionId: suggestion._id };

    } catch (error) {
      await this.logAudit(ticketId, 'TRIAGE_FAILED', { error: error.message });
      throw error;
    }
  }

  async classifyTicket(ticket) {
    const text = `${ticket.title} ${ticket.description}`;
    return await classify(text);
  }

  async retrieveKBArticles(ticket, classification) {
    const query = {
      status: 'published',
      $or: [
        { tags: { $in: [classification.predictedCategory] } },
        { title: { $regex: classification.predictedCategory, $options: 'i' } },
        { body: { $regex: classification.predictedCategory, $options: 'i' } }
      ]
    };

    return await Article.find(query)
      .sort({ updatedAt: -1 })
      .limit(3);
  }

  async generateDraftReply(ticket, articles, classification) {
    const articleTexts = articles.map((article, index) => ({
      id: article._id.toString(),
      title: article.title,
      content: article.body.substring(0, 200) + '...' // First 200 chars
    }));

    return await draftReply(ticket, articleTexts, classification);
  }

  async makeDecision(confidence, config) {
    // Add null check and default values for config
    const autoCloseEnabled = config?.autoCloseEnabled ?? true;
    const confidenceThreshold = config?.confidenceThreshold ?? 0.7;
    
    const autoClose = autoCloseEnabled && confidence >= confidenceThreshold;
    return {
      autoClose,
      confidence,
      threshold: confidenceThreshold
    };
  }

  async saveSuggestion(ticketId, classification, articles, draft, decision) {
    return await AgentSuggestion.create({
      ticketId,
      predictedCategory: classification.predictedCategory,
      articleIds: articles.map(a => a._id),
      draftReply: draft.draftReply,
      confidence: draft.confidence,
      autoClosed: decision.autoClose,
      modelInfo: {
        provider: process.env.STUB_MODE ? 'stub' : 'openai',
        model: process.env.STUB_MODE ? 'stub-v1' : 'gpt-3.5-turbo',
        promptVersion: '1.0',
        latencyMs: 150 // Simulated latency
      }
    });
  }

  async executeDecision(ticketId, suggestion, decision, config) {
    const ticket = await Ticket.findById(ticketId);
    
    if (decision.autoClose) {
      ticket.status = 'resolved';
      ticket.agentSuggestion = suggestion._id;
      await ticket.save();
      
      await this.logAudit(ticketId, 'TICKET_AUTO_RESOLVED', {
        suggestionId: suggestion._id,
        confidence: decision.confidence
      });
    } else {
      ticket.status = 'waiting_human';
      ticket.agentSuggestion = suggestion._id;
      await ticket.save();
      
      await this.logAudit(ticketId, 'TICKET_ASSIGNED_TO_HUMAN', {
        suggestionId: suggestion._id,
        confidence: decision.confidence
      });
    }
  }

  async logAudit(ticketId, action, meta = {}) {
    return await AuditLog.create({
      ticketId,
      traceId: this.traceId,
      actor: 'system',
      action,
      meta: { ...meta, timestamp: new Date().toISOString() },
      timestamp: new Date()
    });
  }
}

module.exports = AgentService;