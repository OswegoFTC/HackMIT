require('dotenv').config();
const { ClaudeTradesMatchingAgent } = require('./claude-matching-agent');

async function debugClaudeResponse() {
  const matchingAgent = new ClaudeTradesMatchingAgent(process.env.ANTHROPIC_API_KEY);
  
  const prompt = "my microwave sparked and there was a storm last night";
  
  console.log('=== DEBUGGING CLAUDE RAW RESPONSE ===');
  
  try {
    // Get the raw response from Claude
    const response = await matchingAgent.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: `Analyze this home repair problem: "${prompt}"

You are an expert trades matching system. Analyze the customer's problem description and determine what trade professionals are needed.

AVAILABLE TRADES: Electrician, Plumber, HVAC, Carpenter, Painter, Roofer, Appliance Repair, Handyman, Locksmith, Cleaner

URGENCY LEVELS:
- Emergency: "sparking", "flooding", "gas leak", "no heat", "emergency", "urgent", "asap"
- Soon: "today", "tomorrow", "soon", "quickly", "not working"
- Flexible: "when convenient", "sometime", "planning", "upgrade"

RESPONSE FORMAT:
Provide your analysis in this exact JSON format:

{
  "trades": [
    {
      "trade": "[trade name]",
      "confidence": [0.0-1.0],
      "specialties": ["[specific skills needed]"],
      "reasoning": "[why this trade is needed]"
    }
  ],
  "urgency": "[emergency/soon/flexible]",
  "urgencyReasoning": "[why this urgency level]",
  "problemDetails": {
    "category": "[electrical/plumbing/mechanical/etc]",
    "complexity": "[simple/moderate/complex]",
    "location": "[where the problem is]",
    "symptoms": ["[list of symptoms]"],
    "possibleCauses": ["[likely causes]"],
    "materialEstimate": "[materials that might be needed]",
    "timeEstimate": "[estimated duration]"
  },
  "location": {
    "extracted": "[any location info from description]",
    "needed": [true/false if more location info needed]
  },
  "missingInfo": ["[what additional info would help]"],
  "followUpQuestions": ["[specific questions to ask customer for materials, time, complexity]"],
  "needsMoreInfo": [true/false - whether to ask follow-up questions before matching],
  "safetyIssues": ["[any immediate safety concerns]"],
  "summary": "[brief summary for customer]",
  "confidence": [0.0-1.0]
}

Think through this step-by-step:
1. What trade skills are needed for this problem?
2. How urgent is this based on safety and functionality?
3. What specific details can I extract?
4. What information is missing that would help?
5. What questions should I ask the customer?

Be thorough but practical in your analysis.`
      }]
    });

    console.log('=== RAW CLAUDE RESPONSE ===');
    console.log(response.content[0].text);
    
    console.log('\n=== EXTRACTING JSON ===');
    const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      console.log('Found JSON:', jsonMatch[0]);
      
      console.log('\n=== PARSING JSON ===');
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('needsMoreInfo field:', parsed.needsMoreInfo);
      console.log('Type of needsMoreInfo:', typeof parsed.needsMoreInfo);
      console.log('Full parsed object keys:', Object.keys(parsed));
    } else {
      console.log('No JSON found in response!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugClaudeResponse();
