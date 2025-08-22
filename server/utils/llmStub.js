// Deterministic LLM stub implementation
function classify(text) {
  const lowerText = text.toLowerCase();
  let predictedCategory = 'other';
  let confidence = 0.3; // Base confidence for other
  
  // Keyword-based classification
  const billingKeywords = ['refund', 'invoice', 'payment', 'charge', 'billing', 'price', 'cost'];
  const techKeywords = ['error', 'bug', 'crash', 'login', 'password', 'technical', 'software', 'app'];
  const shippingKeywords = ['delivery', 'shipment', 'tracking', 'package', 'order', 'shipping', 'deliver'];
  
  const billingMatches = billingKeywords.filter(word => lowerText.includes(word)).length;
  const techMatches = techKeywords.filter(word => lowerText.includes(word)).length;
  const shippingMatches = shippingKeywords.filter(word => lowerText.includes(word)).length;
  
  const maxMatches = Math.max(billingMatches, techMatches, shippingMatches);
  
  if (maxMatches > 0) {
    if (billingMatches === maxMatches) {
      predictedCategory = 'billing';
      confidence = 0.3 + (billingMatches * 0.2); // 0.5, 0.7, 0.9 for 1,2,3+ matches
    } else if (techMatches === maxMatches) {
      predictedCategory = 'tech';
      confidence = 0.3 + (techMatches * 0.2);
    } else if (shippingMatches === maxMatches) {
      predictedCategory = 'shipping';
      confidence = 0.3 + (shippingMatches * 0.2);
    }
  }
  
  // Cap confidence at 0.95
  confidence = Math.min(confidence, 0.95);
  
  return {
    predictedCategory,
    confidence: parseFloat(confidence.toFixed(2))
  };
}

function draftReply(ticket, articles, classification) {
  let draftReply = `Thank you for contacting us about your issue: "${ticket.title}".\n\n`;
  
  if (articles.length > 0) {
    draftReply += "Based on our knowledge base, here are some solutions that might help:\n\n";
    
    articles.forEach((article, index) => {
      draftReply += `${index + 1}. ${article.title}: ${article.content}\n\n`;
    });
    
    draftReply += "We hope these suggestions resolve your issue. ";
  } else {
    draftReply += "We're looking into your issue and will get back to you shortly. ";
  }
  
  draftReply += "If you need further assistance, please don't hesitate to reply to this message.\n\nBest regards,\nSupport Team";
  
  return {
    draftReply,
    confidence: classification.confidence,
    citations: articles.map(a => a.id)
  };
}

module.exports = {
  classify,
  draftReply
};