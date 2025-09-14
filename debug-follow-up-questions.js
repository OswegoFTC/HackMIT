require('dotenv').config();
const { ClaudeTradesMatchingAgent } = require('./claude-matching-agent');

async function debugFollowUpQuestions() {
  const matchingAgent = new ClaudeTradesMatchingAgent(process.env.ANTHROPIC_API_KEY);
  
  // Test with vague prompts that should trigger follow-up questions
  const testPrompts = [
    "something's broken",
    "toilet not working", 
    "heating system making noise",
    "my sink is leaking"
  ];
  
  console.log('=== DEBUGGING FOLLOW-UP QUESTIONS ===\n');
  
  for (const prompt of testPrompts) {
    console.log(`Testing prompt: "${prompt}"`);
    
    try {
      const problem = await matchingAgent.analyzeProblem(prompt, [], null);
      
      console.log(`- needsMoreInfo: ${problem.needsMoreInfo}`);
      console.log(`- followUpQuestions length: ${problem.followUpQuestions?.length || 0}`);
      console.log(`- confidence: ${problem.confidence}`);
      console.log(`- trades found: ${problem.trades?.length || 0}`);
      
      if (problem.followUpQuestions && problem.followUpQuestions.length > 0) {
        console.log('- Follow-up questions:');
        problem.followUpQuestions.forEach((q, i) => {
          console.log(`  ${i + 1}. ${q}`);
        });
      } else {
        console.log('- No follow-up questions generated');
      }
      
      // Check the condition from server.js
      const shouldAskQuestions = problem.needsMoreInfo && problem.followUpQuestions && problem.followUpQuestions.length > 0;
      const shouldProceedToMatching = problem.confidence > 0.3 && problem.trades.length > 0;
      
      console.log(`- Should ask follow-up questions: ${shouldAskQuestions}`);
      console.log(`- Should proceed to matching: ${shouldProceedToMatching}`);
      
      console.log('---\n');
      
    } catch (error) {
      console.error(`Error with prompt "${prompt}":`, error.message);
      console.log('---\n');
    }
  }
}

debugFollowUpQuestions();
