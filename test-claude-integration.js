// Test script for integrated Claude AI Matching and Pricing
require('dotenv').config();
const { ClaudeTradesMatchingAgent } = require('./claude-matching-agent');
const { ClaudePricingAgent } = require('./ai-pricing-agent');

async function testIntegratedSystem() {
  console.log('🧪 Testing Integrated Claude AI System\n');
  
  const matchingAgent = new ClaudeTradesMatchingAgent(process.env.ANTHROPIC_API_KEY);
  const pricingAgent = new ClaudePricingAgent(process.env.ANTHROPIC_API_KEY);

  // Sample workers
  const workers = [
    {
      id: 'w1',
      name: 'Marcus Thompson',
      trade: 'Electrician',
      specialties: ['Residential Wiring', 'Panel Upgrades', 'Lighting Installation'],
      rating: 4.8,
      reviewCount: 167,
      distance: 1.2,
      hourlyRate: 85,
      experience: 12,
      completedJobs: 340,
      certifications: ['Master Electrician License', 'OSHA Certified'],
      availability: ['tomorrow', 'next-week']
    },
    {
      id: 'w2',
      name: 'Rick Williams',
      trade: 'Plumber',
      specialties: ['Pipe Repair', 'Water Heater Installation', 'Drain Cleaning'],
      rating: 4.7,
      reviewCount: 203,
      distance: 2.8,
      hourlyRate: 75,
      experience: 8,
      completedJobs: 285,
      certifications: ['Licensed Plumber', 'Backflow Prevention'],
      availability: ['today', 'tomorrow']
    }
  ];

  // Test scenarios
  const testCases = [
    {
      name: 'Emergency Electrical Issue',
      message: 'My kitchen outlet is sparking and I smell burning - this is an emergency!'
    },
    {
      name: 'Plumbing Leak',
      message: 'I have a pipe leak under my kitchen sink, water is dripping slowly'
    },
    {
      name: 'Car Repair',
      message: 'My car door won\'t lock properly, need someone to fix it'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🔍 Testing: ${testCase.name}`);
    console.log(`Message: "${testCase.message}"`);
    console.log('=' .repeat(60));

    try {
      // Step 1: Analyze problem with Claude
      console.log('\n📋 PROBLEM ANALYSIS:');
      const problem = await matchingAgent.analyzeProblem(testCase.message, [], null);
      
      console.log(`Trades Identified: ${problem.trades.map(t => `${t.trade} (${Math.round(t.confidence * 100)}%)`).join(', ')}`);
      console.log(`Urgency: ${problem.urgency}`);
      console.log(`Summary: ${problem.summary}`);
      
      if (problem.followUpQuestions && problem.followUpQuestions.length > 0) {
        console.log(`Follow-up Questions: ${problem.followUpQuestions.slice(0, 2).join(', ')}`);
      }

      // Step 2: Find matching workers
      if (problem.trades.length > 0) {
        console.log('\n👥 WORKER MATCHING:');
        const matching = await matchingAgent.findWorkers(problem, workers, null, {});
        
        console.log(`Found ${matching.matches.length} matches`);
        console.log(`Summary: ${matching.summary}`);

        // Step 3: Calculate pricing for each match
        if (matching.matches.length > 0) {
          console.log('\n💰 PRICING ANALYSIS:');
          
          for (const worker of matching.matches.slice(0, 2)) {
            console.log(`\n--- ${worker.name} (${worker.trade}) ---`);
            console.log(`Match Score: ${Math.round(worker.matchScore * 100)}%`);
            console.log(`Reasoning: ${worker.reasoning}`);
            
            try {
              const pricing = await pricingAgent.calculatePrice(worker, problem, 2);
              console.log(`Price: $${pricing.total} (${pricing.source})`);
              console.log(`Confidence: ${Math.round(pricing.confidence * 100)}%`);
              console.log(`Reasoning: ${pricing.reasoning}`);
              
              if (pricing.alternatives) {
                console.log(`Alternatives: Budget $${pricing.alternatives.budget} | Premium $${pricing.alternatives.premium}`);
              }
            } catch (pricingError) {
              console.log(`Pricing Error: ${pricingError.message}`);
            }
          }
        }
      }

    } catch (error) {
      console.error(`❌ Test Error: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(80));
  }
}

// Run the integrated test
testIntegratedSystem().catch(console.error);
