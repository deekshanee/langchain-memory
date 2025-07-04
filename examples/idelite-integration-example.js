const { ChatOpenAI } = require('@langchain/openai');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');
const { createLocalMemoryManager, LangChainMemory } = require('../dist/index');
require('dotenv').config();

/**
 * Idelite VS Code Extension - Memory Integration Example
 * 
 * This example demonstrates how Idelite would integrate our persistent memory utility
 * to automatically improve Jira story enhancements over time.
 */

class IdeliteExtension {
  constructor() {
    this.llm = null;
    this.memoryManager = null;
    this.langchainMemory = null;
    this.sessionId = null;
  }

  /**
   * Initialize the extension with memory support
   */
  async initialize() {
    console.log('🚀 Initializing Idelite Extension with Memory...');
    
    // Create memory manager for persistent storage
    this.memoryManager = createLocalMemoryManager('./idelite-memory.json');
    await this.memoryManager.initialize();
    
    // Create LangChain memory that automatically handles conversation saving
    this.langchainMemory = new LangChainMemory(this.memoryManager);
    
    // Initialize LLM with memory binding
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY
    });
    
    // Bind memory to LLM - this enables automatic conversation saving
    this.llm.bind({ memory: this.langchainMemory });
    
    console.log('✅ Idelite Extension initialized with memory support');
  }

  /**
   * Start a new session for a Jira story
   */
  async startStorySession(storyId, storyTitle) {
    this.sessionId = `jira-${storyId}`;
    await this.memoryManager.startSession(this.sessionId, `Story: ${storyTitle}`);
    console.log(`📝 Started session for story: ${storyId} - ${storyTitle}`);
  }

  /**
   * Enhance a Jira story with automatic memory learning
   */
  async enhanceStory(storyId, storyTitle, originalStory) {
    console.log(`\n🔄 Enhancing story: ${storyId}`);
    console.log(`Original: ${originalStory}`);
    
    // Start session for this story
    await this.startStorySession(storyId, storyTitle);
    
    // Get project context and learning from previous enhancements
    const context = await this.getEnhancementContext();
    
    // Create enhancement prompt with context
    const enhancementPrompt = this.createEnhancementPrompt(originalStory, context);
    
    try {
      // The LLM automatically saves this conversation to memory
      const response = await this.llm.invoke([
        new HumanMessage(enhancementPrompt)
      ]);
      
      const enhancedStory = response.content;
      console.log(`✅ Enhanced story saved to memory`);
      
      return enhancedStory;
    } catch (error) {
      console.error('❌ Error enhancing story:', error.message);
      throw error;
    }
  }

  /**
   * Get context from previous enhancements to improve current enhancement
   */
  async getEnhancementContext() {
    const context = [];
    
    // Get project preferences
    const preferences = await this.memoryManager.searchMessages({
      role: 'system',
      content: 'PREFERENCE',
      limit: 5
    });
    
    if (preferences.length > 0) {
      context.push('📋 Project Preferences:');
      preferences.forEach(pref => {
        context.push(`- ${pref.content.replace('PREFERENCE:', '').trim()}`);
      });
    }
    
    // Get successful enhancement patterns
    const patterns = await this.memoryManager.searchMessages({
      role: 'assistant',
      content: 'SUCCESS',
      limit: 3
    });
    
    if (patterns.length > 0) {
      context.push('\n🎯 Successful Patterns:');
      patterns.forEach(pattern => {
        context.push(`- ${pattern.content.replace('SUCCESS:', '').trim()}`);
      });
    }
    
    // Get recent user feedback
    const feedback = await this.memoryManager.searchMessages({
      role: 'user',
      content: 'feedback',
      limit: 3
    });
    
    if (feedback.length > 0) {
      context.push('\n💬 Recent Feedback:');
      feedback.forEach(fb => {
        context.push(`- ${fb.content.replace('feedback:', '').trim()}`);
      });
    }
    
    return context.join('\n');
  }

  /**
   * Create enhancement prompt with learned context
   */
  createEnhancementPrompt(originalStory, context) {
    return `Enhance this Jira user story to make it more detailed, actionable, and valuable.

Original Story: "${originalStory}"

${context ? `\nContext from previous enhancements:\n${context}\n` : ''}

Please enhance this story by:
1. Making the "so that" part more specific and valuable
2. Adding detailed acceptance criteria in Given-When-Then format
3. Including edge cases and error scenarios
4. Following the team's preferred enhancement style

Provide the enhanced story with clear acceptance criteria.`;
  }

  /**
   * Save user feedback for learning
   */
  async saveFeedback(storyId, feedback) {
    await this.memoryManager.saveUserMessage(`feedback: ${feedback}`);
    console.log(`💬 Feedback saved: ${feedback}`);
  }

  /**
   * Save successful enhancement pattern
   */
  async saveSuccessfulPattern(storyId, originalScore, newScore, pattern) {
    const improvement = newScore - originalScore;
    if (improvement > 0) {
      await this.memoryManager.saveSystemMessage(
        `SUCCESS: Story ${storyId} improved by +${improvement} points using pattern: ${pattern}`
      );
      console.log(`🎯 Success pattern saved: +${improvement} points improvement`);
    }
  }

  /**
   * Save project preference
   */
  async savePreference(preference) {
    await this.memoryManager.saveSystemMessage(`PREFERENCE: ${preference}`);
    console.log(`📋 Preference saved: ${preference}`);
  }

  /**
   * Get conversation history for a story
   */
  async getStoryHistory(storyId) {
    const sessionId = `jira-${storyId}`;
    const history = await this.memoryManager.getSessionHistory(sessionId);
    return history;
  }

  /**
   * Get learning statistics
   */
  async getLearningStats() {
    const totalMessages = await this.memoryManager.searchMessages({});
    const preferences = await this.memoryManager.searchMessages({
      role: 'system',
      content: 'PREFERENCE'
    });
    const patterns = await this.memoryManager.searchMessages({
      role: 'system',
      content: 'SUCCESS'
    });
    const feedback = await this.memoryManager.searchMessages({
      role: 'user',
      content: 'feedback'
    });
    
    return {
      totalConversations: totalMessages.length,
      preferencesLearned: preferences.length,
      successfulPatterns: patterns.length,
      userFeedback: feedback.length
    };
  }
}

/**
 * Demo: Show how Idelite would work with memory over time
 */
async function runIdeliteDemo() {
  console.log('🎯 Idelite Memory Integration Demo\n');
  
  const idelite = new IdeliteExtension();
  await idelite.initialize();
  
  // Week 1: Initial setup and first enhancements
  console.log('\n📅 Week 1: Initial Setup');
  
  // Save initial project preferences
  await idelite.savePreference('Team prefers user stories with detailed acceptance criteria');
  await idelite.savePreference('Include edge cases and error scenarios');
  await idelite.savePreference('Use Given-When-Then format for acceptance criteria');
  
  // First story enhancement
  const story1 = await idelite.enhanceStory(
    'PROJ-101',
    'User Login',
    'As a user, I want to login so that I can access my account'
  );
  console.log(`Enhanced Story 1:\n${story1}\n`);
  
  // Save feedback
  await idelite.saveFeedback('PROJ-101', 'Good enhancement, but could include more edge cases');
  
  // Second story enhancement
  const story2 = await idelite.enhanceStory(
    'PROJ-102', 
    'User Registration',
    'As a user, I want to register so that I can create an account'
  );
  console.log(`Enhanced Story 2:\n${story2}\n`);
  
  // Save successful pattern
  await idelite.saveSuccessfulPattern('PROJ-102', 2, 4, 'Adding detailed acceptance criteria');
  
  // Week 2: Learning from previous enhancements
  console.log('\n📅 Week 2: Learning from Experience');
  
  const story3 = await idelite.enhanceStory(
    'PROJ-103',
    'Password Reset',
    'As a user, I want to reset my password so that I can regain access'
  );
  console.log(`Enhanced Story 3:\n${story3}\n`);
  
  // Save feedback
  await idelite.saveFeedback('PROJ-103', 'Perfect! This enhancement includes all the edge cases we discussed');
  
  // Week 3: Advanced learning
  console.log('\n📅 Week 3: Advanced Learning');
  
  const story4 = await idelite.enhanceStory(
    'PROJ-104',
    'Profile Update',
    'As a user, I want to update my profile so that I can keep my information current'
  );
  console.log(`Enhanced Story 4:\n${story4}\n`);
  
  // Show learning statistics
  console.log('\n📊 Learning Statistics:');
  const stats = await idelite.getLearningStats();
  console.log(`- Total conversations: ${stats.totalConversations}`);
  console.log(`- Preferences learned: ${stats.preferencesLearned}`);
  console.log(`- Successful patterns: ${stats.successfulPatterns}`);
  console.log(`- User feedback: ${stats.userFeedback}`);
  
  // Show story history
  console.log('\n📚 Story History Example (PROJ-101):');
  const history = await idelite.getStoryHistory('PROJ-101');
  history.forEach((message, index) => {
    console.log(`${index + 1}. [${message.role}] ${message.content.substring(0, 100)}...`);
  });
  
  console.log('\n✅ Demo completed! The AI has learned and improved over time.');
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runIdeliteDemo().catch(console.error);
}

module.exports = { IdeliteExtension }; 