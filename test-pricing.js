// Test script for Claude AI Pricing Agent
const { ClaudePricingAgent } = require('./ai-pricing-agent');

async function testPricingScenarios() {
  console.log('🧪 Testing Claude AI Pricing Agent\n');
  
  // Test worker
  const testWorker = {
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
  };

  // Test scenarios
  const scenarios = [
    {
      name: 'Emergency Electrical Issue',
      problem: {
        description: 'sparking outlet in kitchen emergency',
        urgency: 'emergency',
        trades: [{ trade: 'electrician', confidence: 0.9 }]
      }
    },
    {
      name: 'Routine Light Installation',
      problem: {
        description: 'install ceiling light fixture',
        urgency: 'flexible',
        trades: [{ trade: 'electrician', confidence: 0.8 }]
      }
    },
    {
      name: 'Complex Panel Upgrade',
      problem: {
        description: 'upgrade electrical panel for new appliances',
        urgency: 'soon',
        trades: [{ trade: 'electrician', confidence: 0.95 }]
      }
    }
  ];

  const pricingAgent = new ClaudePricingAgent(); // Will use fallback without API key

  for (const scenario of scenarios) {
    console.log(`\n📋 Scenario: ${scenario.name}`);
    console.log(`Problem: "${scenario.problem.description}"`);
    console.log(`Urgency: ${scenario.problem.urgency}`);
    
    try {
      const pricing = await pricingAgent.calculatePrice(testWorker, scenario.problem, 2);
      
      console.log(`\n💰 Pricing Result:`);
      console.log(`Total: $${pricing.total}`);
      console.log(`Source: ${pricing.source}`);
      console.log(`Confidence: ${pricing.confidence}`);
      console.log(`Reasoning: ${pricing.reasoning}`);
      
      if (pricing.breakdown) {
        console.log(`\n📊 Breakdown:`);
        console.log(`- Base Rate: $${pricing.breakdown.baseRate}/hr`);
        console.log(`- Hours: ${pricing.breakdown.hours}`);
        console.log(`- Subtotal: $${pricing.breakdown.subtotal}`);
        
        if (pricing.breakdown.adjustments) {
          pricing.breakdown.adjustments.forEach(adj => {
            console.log(`- ${adj.factor}: ${adj.amount >= 0 ? '+' : ''}$${adj.amount} (${adj.percentage}%) - ${adj.rationale}`);
          });
        }
        
        if (pricing.breakdown.travelFee) {
          console.log(`- Travel Fee: $${pricing.breakdown.travelFee}`);
        }
      }
      
      if (pricing.alternatives) {
        console.log(`\n🎯 Alternatives:`);
        console.log(`- Budget Option: $${pricing.alternatives.budget}`);
        console.log(`- Premium Option: $${pricing.alternatives.premium}`);
      }
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(60));
  }
}

// Run tests
testPricingScenarios().catch(console.error);
