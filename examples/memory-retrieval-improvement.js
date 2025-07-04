const { ChatOpenAI } = require('@langchain/openai');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');
const { createLocalMemoryManager, LangChainMemory } = require('../dist/index');
require('dotenv').config();

/**
 * Memory Retrieval & Text Improvement Example
 * 
 * Shows how to retrieve relevant memory and pass it to LLM
 * to improve text quality based on learned patterns and preferences.
 */

class MemoryRetrievalImprover {
  constructor() {
    this.memoryManager = null;
    this.llm = null;
    this.langchainMemory = null;
  }

  async initialize() {
    console.log('🚀 Initializing Memory Retrieval Improver...');
    
    this.memoryManager = createLocalMemoryManager('./memory-improvement.json');
    await this.memoryManager.initialize();
    
    this.langchainMemory = new LangChainMemory(this.memoryManager);
    
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY
    });
    
    this.llm.bind({ memory: this.langchainMemory });
    
    console.log('✅ Memory Retrieval Improver initialized');
  }

  /**
   * Store learning data for text improvement
   */
  async storeLearningData(projectId, dataType, content) {
    const sessionId = `project-${projectId}`;
    await this.memoryManager.startSession(sessionId, `Project: ${projectId}`);
    await this.memoryManager.saveSystemMessage(`${dataType}: ${content}`);
    console.log(`💾 Stored ${dataType} for ${projectId}`);
  }

  /**
   * Retrieve relevant memory for text improvement
   */
  async retrieveRelevantMemory(projectId, textType) {
    const sessionId = `project-${projectId}`;
    const history = await this.memoryManager.getSessionHistory(sessionId);
    
    // Get relevant patterns and preferences
    const patterns = history.filter(msg => 
      msg.role === 'system' && msg.content.includes('PATTERN')
    );
    
    const preferences = history.filter(msg => 
      msg.role === 'system' && msg.content.includes('PREFERENCE')
    );
    
    const feedback = history.filter(msg => 
      msg.role === 'system' && msg.content.includes('FEEDBACK')
    );
    
    return {
      patterns: patterns.map(p => p.content.replace(/^.*?: /, '')),
      preferences: preferences.map(p => p.content.replace(/^.*?: /, '')),
      feedback: feedback.map(f => f.content.replace(/^.*?: /, ''))
    };
  }

  /**
   * Improve text using retrieved memory
   */
  async improveTextWithMemory(projectId, originalText, textType) {
    console.log(`\n🔄 Improving ${textType} for project ${projectId}`);
    console.log(`Original: ${originalText}`);
    
    // Retrieve relevant memory
    const memory = await this.retrieveRelevantMemory(projectId, textType);
    
    // Create improvement prompt with memory context
    const improvementPrompt = this.createImprovementPrompt(
      originalText, 
      textType, 
      memory
    );
    
    try {
      // Use LLM with memory context to improve text
      const response = await this.llm.invoke([
        new HumanMessage(improvementPrompt)
      ]);
      
      const improvedText = response.content;
      console.log(`✅ Improved text using ${memory.patterns.length} patterns and ${memory.preferences.length} preferences`);
      
      return improvedText;
    } catch (error) {
      console.error('❌ Error improving text:', error.message);
      throw error;
    }
  }

  /**
   * Create improvement prompt with memory context
   */
  createImprovementPrompt(originalText, textType, memory) {
    let context = '';
    
    if (memory.preferences.length > 0) {
      context += '\n📋 Project Preferences:\n';
      memory.preferences.forEach(pref => {
        context += `- ${pref}\n`;
      });
    }
    
    if (memory.patterns.length > 0) {
      context += '\n🎯 Successful Patterns:\n';
      memory.patterns.forEach(pattern => {
        context += `- ${pattern}\n`;
      });
    }
    
    if (memory.feedback.length > 0) {
      context += '\n💬 User Feedback:\n';
      memory.feedback.forEach(fb => {
        context += `- ${fb}\n`;
      });
    }
    
    return `Improve this ${textType} based on the project context and learned patterns.

Original ${textType}:
"${originalText}"

${context ? `Project Context:${context}` : ''}

Please improve this ${textType} by:
1. Applying the project preferences and patterns
2. Incorporating successful approaches from previous work
3. Addressing any user feedback patterns
4. Making it more effective and aligned with project standards

Provide the improved ${textType}.`;
  }
}

/**
 * Demonstrate memory retrieval and text improvement
 */
async function demonstrateMemoryImprovement() {
  console.log('🎯 Memory Retrieval & Text Improvement Demo\n');
  
  const improver = new MemoryRetrievalImprover();
  await improver.initialize();
  
  // ========================================
  // SETUP: Store learning data for different projects
  // ========================================
  console.log('\n📚 SETTING UP LEARNING DATA');
  
  // Project 1: Documentation Writing
  console.log('\n📝 Project: Documentation Writing');
  await improver.storeLearningData('docs', 'PREFERENCE', 'Use clear, concise language with examples');
  await improver.storeLearningData('docs', 'PREFERENCE', 'Include step-by-step instructions');
  await improver.storeLearningData('docs', 'PREFERENCE', 'Add code snippets for technical concepts');
  await improver.storeLearningData('docs', 'PATTERN', 'Adding diagrams improves understanding by 40%');
  await improver.storeLearningData('docs', 'PATTERN', 'Starting with overview then details works best');
  await improver.storeLearningData('docs', 'FEEDBACK', 'Users prefer practical examples over theory');
  await improver.storeLearningData('docs', 'FEEDBACK', 'Troubleshooting sections are highly valued');
  
  // Project 2: Email Writing
  console.log('\n📧 Project: Email Writing');
  await improver.storeLearningData('email', 'PREFERENCE', 'Keep emails concise and action-oriented');
  await improver.storeLearningData('email', 'PREFERENCE', 'Use bullet points for multiple items');
  await improver.storeLearningData('email', 'PREFERENCE', 'Include clear call-to-action');
  await improver.storeLearningData('email', 'PATTERN', 'Subject lines with action words get 30% more opens');
  await improver.storeLearningData('email', 'PATTERN', 'Emails under 150 words have highest response rates');
  await improver.storeLearningData('email', 'FEEDBACK', 'Professional but friendly tone works best');
  await improver.storeLearningData('email', 'FEEDBACK', 'Include deadlines and next steps clearly');
  
  // Project 3: Code Comments
  console.log('\n💻 Project: Code Comments');
  await improver.storeLearningData('code', 'PREFERENCE', 'Explain WHY not WHAT the code does');
  await improver.storeLearningData('code', 'PREFERENCE', 'Use JSDoc format for functions');
  await improver.storeLearningData('code', 'PREFERENCE', 'Include examples for complex logic');
  await improver.storeLearningData('code', 'PATTERN', 'Comments that explain business logic are most helpful');
  await improver.storeLearningData('code', 'PATTERN', 'Avoid obvious comments, focus on complex parts');
  await improver.storeLearningData('code', 'FEEDBACK', 'Comments should help future developers understand');
  await improver.storeLearningData('code', 'FEEDBACK', 'Include context about why certain approaches were chosen');
  
  // ========================================
  // DEMONSTRATE: Text improvement with memory
  // ========================================
  console.log('\n🚀 DEMONSTRATING TEXT IMPROVEMENT WITH MEMORY');
  
  // Improve documentation
  console.log('\n📝 IMPROVING DOCUMENTATION');
  const originalDoc = 'This function processes user data. It takes input and returns output.';
  const improvedDoc = await improver.improveTextWithMemory('docs', originalDoc, 'documentation');
  console.log(`\nImproved Documentation:\n${improvedDoc}`);
  
  // Improve email
  console.log('\n📧 IMPROVING EMAIL');
  const originalEmail = 'Hi, I wanted to let you know about the meeting tomorrow. We will discuss the project. Please come.';
  const improvedEmail = await improver.improveTextWithMemory('email', originalEmail, 'email');
  console.log(`\nImproved Email:\n${improvedEmail}`);
  
  // Improve code comment
  console.log('\n💻 IMPROVING CODE COMMENT');
  const originalComment = '// This function adds two numbers';
  const improvedComment = await improver.improveTextWithMemory('code', originalComment, 'code comment');
  console.log(`\nImproved Code Comment:\n${improvedComment}`);
  
  // ========================================
  // SHOW: Memory retrieval details
  // ========================================
  console.log('\n🔍 MEMORY RETRIEVAL DETAILS');
  
  // Show what memory was retrieved for docs
  const docsMemory = await improver.retrieveRelevantMemory('docs', 'documentation');
  console.log('\n📚 Documentation Memory Retrieved:');
  console.log(`  - Preferences: ${docsMemory.preferences.length}`);
  console.log(`  - Patterns: ${docsMemory.patterns.length}`);
  console.log(`  - Feedback: ${docsMemory.feedback.length}`);
  
  // Show what memory was retrieved for email
  const emailMemory = await improver.retrieveRelevantMemory('email', 'email');
  console.log('\n📧 Email Memory Retrieved:');
  console.log(`  - Preferences: ${emailMemory.preferences.length}`);
  console.log(`  - Patterns: ${emailMemory.patterns.length}`);
  console.log(`  - Feedback: ${emailMemory.feedback.length}`);
  
  // Show what memory was retrieved for code
  const codeMemory = await improver.retrieveRelevantMemory('code', 'code comment');
  console.log('\n💻 Code Memory Retrieved:');
  console.log(`  - Preferences: ${codeMemory.preferences.length}`);
  console.log(`  - Patterns: ${codeMemory.patterns.length}`);
  console.log(`  - Feedback: ${codeMemory.feedback.length}`);
  
  console.log('\n✅ Memory Retrieval & Text Improvement Demo Complete!');
  console.log('\n🎯 Key Points:');
  console.log('  - Retrieve relevant memory based on project and text type');
  console.log('  - Pass memory context to LLM for better improvements');
  console.log('  - Apply learned patterns and preferences automatically');
  console.log('  - Get progressively better results as memory grows');
}

// Run the demonstration
if (require.main === module) {
  demonstrateMemoryImprovement().catch(console.error);
}

module.exports = { MemoryRetrievalImprover, demonstrateMemoryImprovement }; 