require('dotenv').config();
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const { ClaudeTradesMatchingAgent } = require('./claude-matching-agent');

async function testMicrowavePrompt() {
  const matchingAgent = new ClaudeTradesMatchingAgent(process.env.ANTHROPIC_API_KEY);
  
  const prompt = "my microwave sparked and there was a storm last night";
  
  console.log('Testing prompt:', prompt);
  console.log('Starting analysis...');
  
  const startTime = Date.now();
  
  try {
    const problem = await matchingAgent.analyzeProblem(prompt, [], null);
    
    const endTime = Date.now();
    console.log(`Analysis took: ${endTime - startTime}ms`);
    
    console.log('\n=== ANALYSIS RESULT ===');
    console.log('Confidence:', problem.confidence);
    console.log('Trades:', problem.trades);
    console.log('Urgency:', problem.urgency);
    console.log('needsMoreInfo:', problem.needsMoreInfo);
    console.log('followUpQuestions:', problem.followUpQuestions);
    console.log('safetyIssues:', problem.safetyIssues);
    console.log('Summary:', problem.summary);
    
    if (problem.needsMoreInfo) {
      console.log('\n=== SHOULD ASK FOLLOW-UP QUESTIONS ===');
      problem.followUpQuestions.forEach((q, i) => {
        console.log(`${i + 1}. ${q}`);
      });
    } else {
      console.log('\n=== PROCEEDING TO MATCHING (No follow-up needed) ===');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testMicrowavePrompt();
