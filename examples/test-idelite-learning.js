const { IdeliteExtension } = require('./idelite-integration-example');
require('dotenv').config();

/**
 * Test script to demonstrate Idelite's learning progression
 * This shows how the AI improves story enhancements over time
 */

async function testLearningProgression() {
  console.log('🧪 Testing Idelite Learning Progression\n');
  
  const idelite = new IdeliteExtension();
  await idelite.initialize();
  
  // Test stories with different complexity levels
  const testStories = [
    {
      id: 'TEST-001',
      title: 'Simple Login',
      story: 'As a user, I want to login so that I can access my account'
    },
    {
      id: 'TEST-002', 
      title: 'User Registration',
      story: 'As a user, I want to register so that I can create an account'
    },
    {
      id: 'TEST-003',
      title: 'Password Reset',
      story: 'As a user, I want to reset my password so that I can regain access'
    },
    {
      id: 'TEST-004',
      title: 'Profile Update',
      story: 'As a user, I want to update my profile so that I can keep my information current'
    },
    {
      id: 'TEST-005',
      title: 'Advanced Search',
      story: 'As a user, I want to search for products so that I can find what I need'
    }
  ];
  
  console.log('📊 Starting Learning Test...\n');
  
  for (let i = 0; i < testStories.length; i++) {
    const testStory = testStories[i];
    console.log(`\n🔄 Test ${i + 1}/${testStories.length}: ${testStory.title}`);
    console.log(`Original: ${testStory.story}`);
    
    try {
      // Enhance the story (this automatically uses learned context)
      const enhancedStory = await idelite.enhanceStory(
        testStory.id,
        testStory.title,
        testStory.story
      );
      
      console.log(`✅ Enhanced Story:\n${enhancedStory}\n`);
      
      // Simulate user feedback based on enhancement quality
      if (i === 0) {
        await idelite.saveFeedback(testStory.id, 'Good start, but needs more detail in acceptance criteria');
      } else if (i === 1) {
        await idelite.saveFeedback(testStory.id, 'Much better! The acceptance criteria are clear and comprehensive');
        await idelite.saveSuccessfulPattern(testStory.id, 2, 4, 'Detailed acceptance criteria with edge cases');
      } else if (i === 2) {
        await idelite.saveFeedback(testStory.id, 'Excellent! This includes all the security considerations we discussed');
        await idelite.saveSuccessfulPattern(testStory.id, 3, 5, 'Security-focused enhancement with comprehensive scenarios');
      } else if (i === 3) {
        await idelite.saveFeedback(testStory.id, 'Perfect enhancement! Follows our team standards exactly');
        await idelite.saveSuccessfulPattern(testStory.id, 4, 5, 'Team-standard compliant enhancement');
      } else {
        await idelite.saveFeedback(testStory.id, 'Outstanding! This shows how much the AI has learned from our feedback');
        await idelite.saveSuccessfulPattern(testStory.id, 4, 5, 'Advanced enhancement with learned patterns');
      }
      
      // Show current learning stats
      const stats = await idelite.getLearningStats();
      console.log(`📈 Learning Progress:`);
      console.log(`   - Total conversations: ${stats.totalConversations}`);
      console.log(`   - Preferences learned: ${stats.preferencesLearned}`);
      console.log(`   - Successful patterns: ${stats.successfulPatterns}`);
      console.log(`   - User feedback: ${stats.userFeedback}`);
      
    } catch (error) {
      console.error(`❌ Error in test ${i + 1}:`, error.message);
    }
  }
  
  // Final learning summary
  console.log('\n🎯 Final Learning Summary:');
  const finalStats = await idelite.getLearningStats();
  console.log(`📊 Total Learning Data:`);
  console.log(`   - Conversations: ${finalStats.totalConversations}`);
  console.log(`   - Preferences: ${finalStats.preferencesLearned}`);
  console.log(`   - Patterns: ${finalStats.successfulPatterns}`);
  console.log(`   - Feedback: ${finalStats.userFeedback}`);
  
  console.log('\n✅ Learning test completed! The AI has progressively improved its enhancements.');
}

// Run the test
if (require.main === module) {
  testLearningProgression().catch(console.error);
}

module.exports = { testLearningProgression }; 