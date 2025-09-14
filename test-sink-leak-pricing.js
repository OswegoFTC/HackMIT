require('dotenv').config();
const { ClaudeTradesMatchingAgent } = require('./claude-matching-agent');
const { ClaudePricingAgent } = require('./ai-pricing-agent');

// Sample worker data (from server.js)
const sampleWorker = {
  id: 1,
  name: "Rick Martinez",
  trade: "Plumber",
  specialties: ["Leak repair", "Pipe installation", "Drain cleaning"],
  experience: 8,
  rating: 4.8,
  hourlyRate: 65,
  distance: 2.3,
  certifications: ["Licensed Plumber", "Backflow Prevention"],
  completedJobs: 342,
  availability: ["Available now"]
};

async function testSinkLeakPricing() {
  const matchingAgent = new ClaudeTradesMatchingAgent(process.env.ANTHROPIC_API_KEY);
  const pricingAgent = new ClaudePricingAgent(process.env.ANTHROPIC_API_KEY);
  
  const prompt = "my sink is leaking";
  
  console.log('=== TESTING SINK LEAK PRICING ===');
  console.log('Prompt:', prompt);
  
  try {
    // Step 1: Analyze problem
    console.log('\n1. Analyzing problem...');
    const problem = await matchingAgent.analyzeProblem(prompt, [], null);
    
    console.log('Problem analysis:');
    console.log('- Trades:', problem.trades.map(t => t.trade));
    console.log('- Urgency:', problem.urgency);
    console.log('- Confidence:', problem.confidence);
    console.log('- Time estimate:', problem.problemDetails?.timeEstimate);
    
    // Step 2: Calculate pricing
    console.log('\n2. Calculating pricing...');
    const startTime = Date.now();
    
    const pricing = await pricingAgent.calculatePrice(
      sampleWorker, 
      problem, 
      problem.problemDetails?.timeEstimate ? parseFloat(problem.problemDetails.timeEstimate) : 2
    );
    
    const endTime = Date.now();
    console.log(`Pricing calculation took: ${endTime - startTime}ms`);
    
    console.log('\n=== PRICING BREAKDOWN ===');
    console.log('Total Price:', pricing.total);
    console.log('Source:', pricing.source);
    console.log('Reasoning:', pricing.reasoning);
    
    if (pricing.breakdown) {
      console.log('\nDetailed Breakdown:');
      console.log('- Base Rate:', pricing.breakdown.baseRate);
      console.log('- Hours:', pricing.breakdown.hours);
      console.log('- Base Cost:', pricing.breakdown.baseCost);
      console.log('- Experience Multiplier:', pricing.breakdown.experienceMultiplier);
      console.log('- Rating Multiplier:', pricing.breakdown.ratingMultiplier);
      console.log('- Urgency Multiplier:', pricing.breakdown.urgencyMultiplier);
      console.log('- Travel Fee:', pricing.breakdown.travelFee);
      console.log('- Additional Fees:', pricing.breakdown.additionalFees);
    }
    
    if (pricing.alternatives) {
      console.log('\nAlternatives:');
      console.log('- Budget Option:', pricing.alternatives.budget);
      console.log('- Premium Option:', pricing.alternatives.premium);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSinkLeakPricing();
