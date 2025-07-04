const { ChatOpenAI } = require('@langchain/openai');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');
const { createLocalMemoryManager, LangChainMemory } = require('../dist/index');
require('dotenv').config();

/**
 * Multi-Project Memory Example
 * 
 * Demonstrates how our memory utility can store different types of data
 * for different projects - it's completely flexible!
 */

class MultiProjectMemory {
  constructor() {
    this.memoryManager = null;
    this.llm = null;
    this.langchainMemory = null;
  }

  async initialize() {
    console.log('🚀 Initializing Multi-Project Memory System...');
    
    // Single memory manager can handle multiple projects
    this.memoryManager = createLocalMemoryManager('./multi-project-memory.json');
    await this.memoryManager.initialize();
    
    this.langchainMemory = new LangChainMemory(this.memoryManager);
    
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY
    });
    
    this.llm.bind({ memory: this.langchainMemory });
    
    console.log('✅ Multi-Project Memory System initialized');
  }

  /**
   * Store project-specific data
   */
  async storeProjectData(projectId, dataType, content) {
    const sessionId = `project-${projectId}`;
    await this.memoryManager.startSession(sessionId, `Project: ${projectId}`);
    
    // Store as system message for project context
    await this.memoryManager.saveSystemMessage(`${dataType}: ${content}`);
    
    console.log(`💾 Stored ${dataType} for project ${projectId}: ${content.substring(0, 50)}...`);
  }

  /**
   * Get project-specific context
   */
  async getProjectContext(projectId, dataType = null) {
    const sessionId = `project-${projectId}`;
    const history = await this.memoryManager.getSessionHistory(sessionId);
    
    if (dataType) {
      return history.filter(msg => 
        msg.role === 'system' && msg.content.startsWith(dataType)
      );
    }
    
    return history;
  }

  /**
   * Search across all projects
   */
  async searchAllProjects(query) {
    return await this.memoryManager.searchMessages({
      content: query
    });
  }
}

/**
 * Example: Different types of projects using the same memory system
 */
async function demonstrateMultiProjectUsage() {
  console.log('🎯 Multi-Project Memory Demonstration\n');
  
  const memory = new MultiProjectMemory();
  await memory.initialize();
  
  // ========================================
  // PROJECT 1: Idelite (Jira Story Enhancement)
  // ========================================
  console.log('\n📋 PROJECT 1: Idelite (Jira Story Enhancement)');
  
  await memory.storeProjectData('idelite', 'PREFERENCE', 'Team prefers user stories with Given-When-Then format');
  await memory.storeProjectData('idelite', 'PREFERENCE', 'Include edge cases and error scenarios');
  await memory.storeProjectData('idelite', 'SUCCESS_PATTERN', 'Adding acceptance criteria improves story score by +3');
  await memory.storeProjectData('idelite', 'USER_FEEDBACK', 'User liked detailed acceptance criteria');
  await memory.storeProjectData('idelite', 'TECH_STACK', 'React + Node.js + PostgreSQL');
  await memory.storeProjectData('idelite', 'CODING_STANDARDS', 'ESLint + Prettier + TypeScript');
  
  // ========================================
  // PROJECT 2: Code Review Assistant
  // ========================================
  console.log('\n🔍 PROJECT 2: Code Review Assistant');
  
  await memory.storeProjectData('code-review', 'REVIEW_STYLE', 'Focus on security vulnerabilities first');
  await memory.storeProjectData('code-review', 'REVIEW_STYLE', 'Check for performance bottlenecks');
  await memory.storeProjectData('code-review', 'SUCCESS_PATTERN', 'Security reviews catch 90% of issues');
  await memory.storeProjectData('code-review', 'USER_FEEDBACK', 'Detailed explanations help developers learn');
  await memory.storeProjectData('code-review', 'LANGUAGE_PREFERENCES', 'Python, JavaScript, TypeScript');
  await memory.storeProjectData('code-review', 'FRAMEWORK_PREFERENCES', 'React, Django, FastAPI');
  
  // ========================================
  // PROJECT 3: Documentation Generator
  // ========================================
  console.log('\n📚 PROJECT 3: Documentation Generator');
  
  await memory.storeProjectData('docs-gen', 'DOC_STYLE', 'Use clear, concise language');
  await memory.storeProjectData('docs-gen', 'DOC_STYLE', 'Include code examples for each feature');
  await memory.storeProjectData('docs-gen', 'SUCCESS_PATTERN', 'Adding diagrams improves understanding by 40%');
  await memory.storeProjectData('docs-gen', 'USER_FEEDBACK', 'Step-by-step tutorials are most helpful');
  await memory.storeProjectData('docs-gen', 'FORMAT_PREFERENCES', 'Markdown with Mermaid diagrams');
  await memory.storeProjectData('docs-gen', 'TEMPLATE_PREFERENCES', 'API docs with OpenAPI spec');
  
  // ========================================
  // PROJECT 4: Bug Analysis Assistant
  // ========================================
  console.log('\n🐛 PROJECT 4: Bug Analysis Assistant');
  
  await memory.storeProjectData('bug-analysis', 'ANALYSIS_STYLE', 'Start with stack trace analysis');
  await memory.storeProjectData('bug-analysis', 'ANALYSIS_STYLE', 'Check for common patterns first');
  await memory.storeProjectData('bug-analysis', 'SUCCESS_PATTERN', 'Root cause analysis reduces recurrence by 70%');
  await memory.storeProjectData('bug-analysis', 'USER_FEEDBACK', 'Quick fixes are appreciated but explain the root cause');
  await memory.storeProjectData('bug-analysis', 'TOOLS_PREFERENCES', 'Chrome DevTools, Postman, Logs');
  await memory.storeProjectData('bug-analysis', 'DEBUGGING_STYLE', 'Step-by-step debugging approach');
  
  // ========================================
  // PROJECT 5: Test Case Generator
  // ========================================
  console.log('\n🧪 PROJECT 5: Test Case Generator');
  
  await memory.storeProjectData('test-gen', 'TEST_STYLE', 'Use descriptive test names');
  await memory.storeProjectData('test-gen', 'TEST_STYLE', 'Include edge cases and boundary conditions');
  await memory.storeProjectData('test-gen', 'SUCCESS_PATTERN', 'Comprehensive test coverage reduces bugs by 60%');
  await memory.storeProjectData('test-gen', 'USER_FEEDBACK', 'Integration tests are more valuable than unit tests');
  await memory.storeProjectData('test-gen', 'FRAMEWORK_PREFERENCES', 'Jest, PyTest, JUnit');
  await memory.storeProjectData('test-gen', 'COVERAGE_PREFERENCES', 'Aim for 80%+ coverage');
  
  // ========================================
  // Demonstrate Project-Specific Retrieval
  // ========================================
  console.log('\n🔍 DEMONSTRATING PROJECT-SPECIFIC RETRIEVAL');
  
  // Get Idelite preferences
  const idelitePrefs = await memory.getProjectContext('idelite', 'PREFERENCE');
  console.log('\n📋 Idelite Preferences:');
  idelitePrefs.forEach(pref => {
    console.log(`  - ${pref.content.replace('PREFERENCE:', '').trim()}`);
  });
  
  // Get Code Review patterns
  const codeReviewPatterns = await memory.getProjectContext('code-review', 'SUCCESS_PATTERN');
  console.log('\n🎯 Code Review Success Patterns:');
  codeReviewPatterns.forEach(pattern => {
    console.log(`  - ${pattern.content.replace('SUCCESS_PATTERN:', '').trim()}`);
  });
  
  // Get Documentation feedback
  const docsFeedback = await memory.getProjectContext('docs-gen', 'USER_FEEDBACK');
  console.log('\n💬 Documentation User Feedback:');
  docsFeedback.forEach(feedback => {
    console.log(`  - ${feedback.content.replace('USER_FEEDBACK:', '').trim()}`);
  });
  
  // ========================================
  // Demonstrate Cross-Project Search
  // ========================================
  console.log('\n🔍 CROSS-PROJECT SEARCH EXAMPLES');
  
  // Search for all success patterns across projects
  const allSuccessPatterns = await memory.searchAllProjects('SUCCESS_PATTERN');
  console.log('\n🎯 All Success Patterns Across Projects:');
  allSuccessPatterns.forEach(pattern => {
    const projectId = pattern.sessionId.replace('project-', '');
    console.log(`  [${projectId}] ${pattern.content.replace('SUCCESS_PATTERN:', '').trim()}`);
  });
  
  // Search for all user feedback across projects
  const allFeedback = await memory.searchAllProjects('USER_FEEDBACK');
  console.log('\n💬 All User Feedback Across Projects:');
  allFeedback.forEach(feedback => {
    const projectId = feedback.sessionId.replace('project-', '');
    console.log(`  [${projectId}] ${feedback.content.replace('USER_FEEDBACK:', '').trim()}`);
  });
  
  // ========================================
  // Demonstrate Project-Specific AI Usage
  // ========================================
  console.log('\n🤖 PROJECT-SPECIFIC AI USAGE');
  
  // Use AI with Idelite context
  console.log('\n📝 Idelite Story Enhancement:');
  const ideliteContext = await memory.getProjectContext('idelite');
  const idelitePrompt = `Based on the project context, enhance this story: "As a user, I want to logout"`
  console.log(`Context: ${ideliteContext.length} items loaded`);
  
  // Use AI with Code Review context
  console.log('\n🔍 Code Review Analysis:');
  const codeReviewContext = await memory.getProjectContext('code-review');
  const codeReviewPrompt = `Based on the project context, review this code for security issues`
  console.log(`Context: ${codeReviewContext.length} items loaded`);
  
  // Use AI with Documentation context
  console.log('\n📚 Documentation Generation:');
  const docsContext = await memory.getProjectContext('docs-gen');
  const docsPrompt = `Based on the project context, generate API documentation`
  console.log(`Context: ${docsContext.length} items loaded`);
  
  console.log('\n✅ Multi-Project Memory Demonstration Complete!');
  console.log('\n🎯 Key Takeaways:');
  console.log('  - Single memory system can handle multiple projects');
  console.log('  - Each project has its own session and context');
  console.log('  - Can search across all projects or within specific projects');
  console.log('  - AI can use project-specific context for better responses');
  console.log('  - Completely flexible - store any type of data for any project!');
}

// Run the demonstration
if (require.main === module) {
  demonstrateMultiProjectUsage().catch(console.error);
}

module.exports = { MultiProjectMemory, demonstrateMultiProjectUsage }; 