const { createLocalMemoryManager } = require('../dist/index');

/**
 * Memory Key Strategies Example
 * 
 * Shows different approaches for choosing memory keys based on use case.
 */

class MemoryKeyStrategies {
  constructor() {
    this.memoryManager = null;
  }

  async initialize() {
    console.log('🚀 Initializing Memory Key Strategies...');
    this.memoryManager = createLocalMemoryManager('./memory-keys.json');
    await this.memoryManager.initialize();
    console.log('✅ Memory Key Strategies initialized');
  }

  /**
   * Strategy 1: Jira Story ID (for story-specific memory)
   */
  async useJiraStoryKey(jiraId, storyTitle) {
    const sessionId = `jira-${jiraId}`;
    await this.memoryManager.startSession(sessionId, `Jira Story: ${storyTitle}`);
    
    // Store story-specific data
    await this.memoryManager.saveSystemMessage(`STORY_CONTEXT: ${storyTitle}`);
    await this.memoryManager.saveSystemMessage(`STORY_TYPE: User Story`);
    await this.memoryManager.saveSystemMessage(`STORY_PRIORITY: High`);
    
    console.log(`📝 Created session for Jira story: ${jiraId} - ${storyTitle}`);
    return sessionId;
  }

  /**
   * Strategy 2: Project ID (for project-wide memory)
   */
  async useProjectKey(projectId, projectName) {
    const sessionId = `project-${projectId}`;
    await this.memoryManager.startSession(sessionId, `Project: ${projectName}`);
    
    // Store project-wide data
    await this.memoryManager.saveSystemMessage(`PROJECT_CONTEXT: ${projectName}`);
    await this.memoryManager.saveSystemMessage(`TECH_STACK: React + Node.js + PostgreSQL`);
    await this.memoryManager.saveSystemMessage(`TEAM_PREFERENCES: Detailed acceptance criteria`);
    
    console.log(`🏗️ Created session for project: ${projectId} - ${projectName}`);
    return sessionId;
  }

  /**
   * Strategy 3: User ID (for user-specific memory)
   */
  async useUserKey(userId, userName) {
    const sessionId = `user-${userId}`;
    await this.memoryManager.startSession(sessionId, `User: ${userName}`);
    
    // Store user-specific data
    await this.memoryManager.saveSystemMessage(`USER_CONTEXT: ${userName}`);
    await this.memoryManager.saveSystemMessage(`USER_ROLE: Product Manager`);
    await this.memoryManager.saveSystemMessage(`USER_PREFERENCES: Concise documentation`);
    
    console.log(`👤 Created session for user: ${userId} - ${userName}`);
    return sessionId;
  }

  /**
   * Strategy 4: Team ID (for team-wide memory)
   */
  async useTeamKey(teamId, teamName) {
    const sessionId = `team-${teamId}`;
    await this.memoryManager.startSession(sessionId, `Team: ${teamName}`);
    
    // Store team-wide data
    await this.memoryManager.saveSystemMessage(`TEAM_CONTEXT: ${teamName}`);
    await this.memoryManager.saveSystemMessage(`TEAM_SIZE: 8 developers`);
    await this.memoryManager.saveSystemMessage(`TEAM_PROCESS: Agile with 2-week sprints`);
    
    console.log(`👥 Created session for team: ${teamId} - ${teamName}`);
    return sessionId;
  }

  /**
   * Strategy 5: Feature ID (for feature-specific memory)
   */
  async useFeatureKey(featureId, featureName) {
    const sessionId = `feature-${featureId}`;
    await this.memoryManager.startSession(sessionId, `Feature: ${featureName}`);
    
    // Store feature-specific data
    await this.memoryManager.saveSystemMessage(`FEATURE_CONTEXT: ${featureName}`);
    await this.memoryManager.saveSystemMessage(`FEATURE_TYPE: Authentication`);
    await this.memoryManager.saveSystemMessage(`FEATURE_COMPLEXITY: High`);
    
    console.log(`🔧 Created session for feature: ${featureId} - ${featureName}`);
    return sessionId;
  }

  /**
   * Strategy 6: Sprint ID (for sprint-specific memory)
   */
  async useSprintKey(sprintId, sprintName) {
    const sessionId = `sprint-${sprintId}`;
    await this.memoryManager.startSession(sessionId, `Sprint: ${sprintName}`);
    
    // Store sprint-specific data
    await this.memoryManager.saveSystemMessage(`SPRINT_CONTEXT: ${sprintName}`);
    await this.memoryManager.saveSystemMessage(`SPRINT_DURATION: 2 weeks`);
    await this.memoryManager.saveSystemMessage(`SPRINT_GOALS: User authentication implementation`);
    
    console.log(`🏃 Created session for sprint: ${sprintId} - ${sprintName}`);
    return sessionId;
  }

  /**
   * Strategy 7: Composite Key (for complex scenarios)
   */
  async useCompositeKey(projectId, userId, featureId) {
    const sessionId = `composite-${projectId}-${userId}-${featureId}`;
    await this.memoryManager.startSession(sessionId, `Composite: Project ${projectId}, User ${userId}, Feature ${featureId}`);
    
    // Store composite data
    await this.memoryManager.saveSystemMessage(`COMPOSITE_CONTEXT: Project ${projectId}, User ${userId}, Feature ${featureId}`);
    await this.memoryManager.saveSystemMessage(`SCOPE: User-specific feature work`);
    
    console.log(`🔗 Created composite session: ${sessionId}`);
    return sessionId;
  }

  /**
   * Strategy 8: Time-based Key (for temporal memory)
   */
  async useTimeBasedKey(baseId, timePeriod) {
    const sessionId = `time-${baseId}-${timePeriod}`;
    await this.memoryManager.startSession(sessionId, `Time-based: ${baseId} - ${timePeriod}`);
    
    // Store time-based data
    await this.memoryManager.saveSystemMessage(`TIME_CONTEXT: ${timePeriod}`);
    await this.memoryManager.saveSystemMessage(`BASE_ID: ${baseId}`);
    
    console.log(`⏰ Created time-based session: ${sessionId}`);
    return sessionId;
  }

  /**
   * Get session history by key
   */
  async getSessionHistory(sessionId) {
    return await this.memoryManager.getSessionHistory(sessionId);
  }

  /**
   * Search across all sessions
   */
  async searchAllSessions(query) {
    return await this.memoryManager.searchMessages({ content: query });
  }
}

/**
 * Demonstrate different key strategies
 */
async function demonstrateKeyStrategies() {
  console.log('🎯 Memory Key Strategies Demonstration\n');
  
  const strategies = new MemoryKeyStrategies();
  await strategies.initialize();
  
  // ========================================
  // DEMONSTRATE DIFFERENT KEY STRATEGIES
  // ========================================
  
  console.log('\n📋 STRATEGY 1: Jira Story ID');
  const jiraSession = await strategies.useJiraStoryKey('PROJ-123', 'User Login Feature');
  const jiraHistory = await strategies.getSessionHistory(jiraSession);
  console.log(`  Session ID: ${jiraSession}`);
  console.log(`  Messages: ${jiraHistory.length}`);
  
  console.log('\n🏗️ STRATEGY 2: Project ID');
  const projectSession = await strategies.useProjectKey('ecommerce-app', 'E-commerce Platform');
  const projectHistory = await strategies.getSessionHistory(projectSession);
  console.log(`  Session ID: ${projectSession}`);
  console.log(`  Messages: ${projectHistory.length}`);
  
  console.log('\n👤 STRATEGY 3: User ID');
  const userSession = await strategies.useUserKey('user-456', 'John Doe');
  const userHistory = await strategies.getSessionHistory(userSession);
  console.log(`  Session ID: ${userSession}`);
  console.log(`  Messages: ${userHistory.length}`);
  
  console.log('\n👥 STRATEGY 4: Team ID');
  const teamSession = await strategies.useTeamKey('team-frontend', 'Frontend Team');
  const teamHistory = await strategies.getSessionHistory(teamSession);
  console.log(`  Session ID: ${teamSession}`);
  console.log(`  Messages: ${teamHistory.length}`);
  
  console.log('\n🔧 STRATEGY 5: Feature ID');
  const featureSession = await strategies.useFeatureKey('auth-feature', 'Authentication System');
  const featureHistory = await strategies.getSessionHistory(featureSession);
  console.log(`  Session ID: ${featureSession}`);
  console.log(`  Messages: ${featureHistory.length}`);
  
  console.log('\n🏃 STRATEGY 6: Sprint ID');
  const sprintSession = await strategies.useSprintKey('sprint-2024-01', 'Sprint 1 - 2024');
  const sprintHistory = await strategies.getSessionHistory(sprintSession);
  console.log(`  Session ID: ${sprintSession}`);
  console.log(`  Messages: ${sprintHistory.length}`);
  
  console.log('\n🔗 STRATEGY 7: Composite Key');
  const compositeSession = await strategies.useCompositeKey('ecommerce-app', 'user-456', 'auth-feature');
  const compositeHistory = await strategies.getSessionHistory(compositeSession);
  console.log(`  Session ID: ${compositeSession}`);
  console.log(`  Messages: ${compositeHistory.length}`);
  
  console.log('\n⏰ STRATEGY 8: Time-based Key');
  const timeSession = await strategies.useTimeBasedKey('ecommerce-app', '2024-Q1');
  const timeHistory = await strategies.getSessionHistory(timeSession);
  console.log(`  Session ID: ${timeSession}`);
  console.log(`  Messages: ${timeHistory.length}`);
  
  // ========================================
  // SHOW SEARCH CAPABILITIES
  // ========================================
  console.log('\n🔍 SEARCHING ACROSS ALL SESSIONS');
  
  const allSessions = await strategies.searchAllSessions('CONTEXT');
  console.log(`\nFound ${allSessions.length} messages containing 'CONTEXT' across all sessions:`);
  
  allSessions.forEach((msg, index) => {
    console.log(`  ${index + 1}. [${msg.sessionId}] ${msg.content.substring(0, 50)}...`);
  });
  
  console.log('\n✅ Memory Key Strategies Demo Complete!');
  console.log('\n🎯 KEY RECOMMENDATIONS:');
  console.log('\n📝 For Idelite (Jira Story Enhancement):');
  console.log('  - Use JIRA STORY ID: `jira-${storyId}`');
  console.log('  - Example: `jira-PROJ-123`');
  console.log('  - Benefits: Story-specific context, easy to find');
  
  console.log('\n🏗️ For Project-wide Learning:');
  console.log('  - Use PROJECT ID: `project-${projectId}`');
  console.log('  - Example: `project-ecommerce-app`');
  console.log('  - Benefits: Team preferences, technical context');
  
  console.log('\n👤 For User-specific Experience:');
  console.log('  - Use USER ID: `user-${userId}`');
  console.log('  - Example: `user-john-doe`');
  console.log('  - Benefits: Personal preferences, usage patterns');
  
  console.log('\n🔗 For Complex Scenarios:');
  console.log('  - Use COMPOSITE KEY: `${projectId}-${userId}-${featureId}`');
  console.log('  - Example: `ecommerce-app-john-doe-auth-feature`');
  console.log('  - Benefits: Granular control, specific context');
}

// Run the demonstration
if (require.main === module) {
  demonstrateKeyStrategies().catch(console.error);
}

module.exports = { MemoryKeyStrategies, demonstrateKeyStrategies }; 