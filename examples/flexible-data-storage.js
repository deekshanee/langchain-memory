const { createLocalMemoryManager } = require('../dist/index');

/**
 * Flexible Data Storage Example
 * 
 * Shows how our memory utility can store ANY type of data
 * for ANY project - it's completely flexible!
 */

class FlexibleDataStorage {
  constructor() {
    this.memoryManager = null;
  }

  async initialize() {
    console.log('🚀 Initializing Flexible Data Storage...');
    this.memoryManager = createLocalMemoryManager('./flexible-data.json');
    await this.memoryManager.initialize();
    console.log('✅ Flexible Data Storage initialized');
  }

  /**
   * Store any type of data for any project
   */
  async storeData(projectId, dataType, content, metadata = {}) {
    const sessionId = `project-${projectId}`;
    await this.memoryManager.startSession(sessionId, `Project: ${projectId}`);
    
    // Store with custom metadata
    const fullContent = `${dataType}: ${content}`;
    await this.memoryManager.saveSystemMessage(fullContent, metadata);
    
    console.log(`💾 Stored [${dataType}] for ${projectId}: ${content.substring(0, 50)}...`);
  }

  /**
   * Get data by type for a project
   */
  async getData(projectId, dataType) {
    const sessionId = `project-${projectId}`;
    const history = await this.memoryManager.getSessionHistory(sessionId);
    
    return history.filter(msg => 
      msg.role === 'system' && msg.content.startsWith(dataType)
    );
  }
}

/**
 * Demonstrate storing completely different types of data
 */
async function demonstrateFlexibleStorage() {
  console.log('🎯 Flexible Data Storage Demonstration\n');
  
  const storage = new FlexibleDataStorage();
  await storage.initialize();
  
  // ========================================
  // E-COMMERCE PROJECT
  // ========================================
  console.log('\n🛒 E-COMMERCE PROJECT DATA');
  
  await storage.storeData('ecommerce', 'PRODUCT_CATEGORIES', 'Electronics, Clothing, Books, Home & Garden');
  await storage.storeData('ecommerce', 'PAYMENT_METHODS', 'Credit Card, PayPal, Apple Pay, Google Pay');
  await storage.storeData('ecommerce', 'SHIPPING_OPTIONS', 'Standard (3-5 days), Express (1-2 days), Overnight');
  await storage.storeData('ecommerce', 'CUSTOMER_SEGMENTS', 'New customers, Returning customers, VIP customers');
  await storage.storeData('ecommerce', 'PROMOTION_RULES', 'Buy 2 get 1 free, 20% off first purchase, Free shipping over $50');
  await storage.storeData('ecommerce', 'INVENTORY_ALERTS', 'Low stock threshold: 10 items, Out of stock: 0 items');
  await storage.storeData('ecommerce', 'RETURN_POLICY', '30-day return window, Free returns for defective items');
  await storage.storeData('ecommerce', 'CUSTOMER_FEEDBACK', 'Users love fast checkout process, want more payment options');
  
  // ========================================
  // HEALTHCARE PROJECT
  // ========================================
  console.log('\n🏥 HEALTHCARE PROJECT DATA');
  
  await storage.storeData('healthcare', 'PATIENT_TYPES', 'Pediatric, Adult, Geriatric, Emergency');
  await storage.storeData('healthcare', 'MEDICAL_SPECIALTIES', 'Cardiology, Neurology, Orthopedics, Psychiatry');
  await storage.storeData('healthcare', 'APPOINTMENT_TYPES', 'Consultation, Follow-up, Emergency, Surgery');
  await storage.storeData('healthcare', 'INSURANCE_PROVIDERS', 'Blue Cross, Aetna, Cigna, Medicare');
  await storage.storeData('healthcare', 'PRESCRIPTION_DRUGS', 'Antibiotics, Pain relievers, Blood pressure meds, Insulin');
  await storage.storeData('healthcare', 'LAB_TESTS', 'Blood work, X-rays, MRI, CT scans, Ultrasounds');
  await storage.storeData('healthcare', 'HIPAA_COMPLIANCE', 'Patient data encryption, Access controls, Audit trails');
  await storage.storeData('healthcare', 'EMERGENCY_PROTOCOLS', 'Code Blue, Code Red, Code Yellow, Triage system');
  
  // ========================================
  // EDUCATION PROJECT
  // ========================================
  console.log('\n🎓 EDUCATION PROJECT DATA');
  
  await storage.storeData('education', 'COURSE_TYPES', 'Online, In-person, Hybrid, Self-paced');
  await storage.storeData('education', 'SUBJECT_AREAS', 'Math, Science, History, Literature, Computer Science');
  await storage.storeData('education', 'GRADE_LEVELS', 'Elementary, Middle School, High School, College');
  await storage.storeData('education', 'ASSESSMENT_TYPES', 'Quizzes, Essays, Projects, Presentations, Exams');
  await storage.storeData('education', 'LEARNING_STYLES', 'Visual, Auditory, Kinesthetic, Reading/Writing');
  await storage.storeData('education', 'TECHNOLOGY_TOOLS', 'LMS, Video conferencing, Interactive whiteboards, Tablets');
  await storage.storeData('education', 'STUDENT_PROGRESS', 'Attendance tracking, Grade book, Performance analytics');
  await storage.storeData('education', 'PARENT_COMMUNICATION', 'Progress reports, Parent portal, Email notifications');
  
  // ========================================
  // FINANCE PROJECT
  // ========================================
  console.log('\n💰 FINANCE PROJECT DATA');
  
  await storage.storeData('finance', 'ACCOUNT_TYPES', 'Checking, Savings, Investment, Retirement, Business');
  await storage.storeData('finance', 'TRANSACTION_CATEGORIES', 'Food, Transportation, Entertainment, Utilities, Shopping');
  await storage.storeData('finance', 'INVESTMENT_OPTIONS', 'Stocks, Bonds, Mutual Funds, ETFs, Real Estate');
  await storage.storeData('finance', 'BUDGET_CATEGORIES', 'Housing, Food, Transportation, Healthcare, Entertainment');
  await storage.storeData('finance', 'TAX_DEDUCTIONS', 'Mortgage interest, Charitable donations, Business expenses');
  await storage.storeData('finance', 'CREDIT_SCORE_FACTORS', 'Payment history, Credit utilization, Length of credit');
  await storage.storeData('finance', 'FRAUD_ALERTS', 'Unusual transactions, Geographic anomalies, Amount thresholds');
  await storage.storeData('finance', 'FINANCIAL_GOALS', 'Emergency fund, Retirement savings, Debt payoff, Investment');
  
  // ========================================
  // GAMING PROJECT
  // ========================================
  console.log('\n🎮 GAMING PROJECT DATA');
  
  await storage.storeData('gaming', 'GAME_GENRES', 'Action, Adventure, RPG, Strategy, Sports, Puzzle');
  await storage.storeData('gaming', 'PLATFORMS', 'PC, PlayStation, Xbox, Nintendo Switch, Mobile');
  await storage.storeData('gaming', 'PLAYER_TYPES', 'Casual, Hardcore, Competitive, Social, Solo');
  await storage.storeData('gaming', 'ACHIEVEMENT_SYSTEM', 'Points, Badges, Leaderboards, Unlockables');
  await storage.storeData('gaming', 'MONETIZATION', 'Free-to-play, Premium, Subscription, Microtransactions');
  await storage.storeData('gaming', 'MULTIPLAYER_MODES', 'Co-op, PvP, Battle Royale, Team Deathmatch');
  await storage.storeData('gaming', 'PROGRESSION_SYSTEM', 'Levels, Experience points, Skill trees, Equipment');
  await storage.storeData('gaming', 'SOCIAL_FEATURES', 'Friends list, Chat, Guilds, Trading, Leaderboards');
  
  // ========================================
  // REAL ESTATE PROJECT
  // ========================================
  console.log('\n🏠 REAL ESTATE PROJECT DATA');
  
  await storage.storeData('realestate', 'PROPERTY_TYPES', 'Single-family, Condo, Townhouse, Apartment, Commercial');
  await storage.storeData('realestate', 'LOCATION_FEATURES', 'School district, Crime rate, Walkability, Public transit');
  await storage.storeData('realestate', 'AMENITIES', 'Pool, Gym, Parking, Balcony, Fireplace, Garage');
  await storage.storeData('realestate', 'PRICE_RANGES', 'Under $200k, $200k-$500k, $500k-$1M, Over $1M');
  await storage.storeData('realestate', 'FINANCING_OPTIONS', 'Conventional loan, FHA, VA, Cash, Investment loan');
  await storage.storeData('realestate', 'MARKET_TRENDS', 'Price appreciation, Days on market, Inventory levels');
  await storage.storeData('realestate', 'INSPECTION_ITEMS', 'Roof, HVAC, Plumbing, Electrical, Foundation');
  await storage.storeData('realestate', 'CLOSING_COSTS', 'Title insurance, Appraisal, Survey, Attorney fees');
  
  // ========================================
  // DEMONSTRATE RETRIEVAL
  // ========================================
  console.log('\n🔍 DEMONSTRATING DATA RETRIEVAL');
  
  // Get e-commerce data
  const ecommerceData = await storage.getData('ecommerce', 'PAYMENT_METHODS');
  console.log('\n💳 E-commerce Payment Methods:');
  ecommerceData.forEach(item => {
    console.log(`  - ${item.content.replace('PAYMENT_METHODS:', '').trim()}`);
  });
  
  // Get healthcare data
  const healthcareData = await storage.getData('healthcare', 'MEDICAL_SPECIALTIES');
  console.log('\n👨‍⚕️ Healthcare Specialties:');
  healthcareData.forEach(item => {
    console.log(`  - ${item.content.replace('MEDICAL_SPECIALTIES:', '').trim()}`);
  });
  
  // Get education data
  const educationData = await storage.getData('education', 'LEARNING_STYLES');
  console.log('\n📚 Education Learning Styles:');
  educationData.forEach(item => {
    console.log(`  - ${item.content.replace('LEARNING_STYLES:', '').trim()}`);
  });
  
  // Get finance data
  const financeData = await storage.getData('finance', 'INVESTMENT_OPTIONS');
  console.log('\n📈 Finance Investment Options:');
  financeData.forEach(item => {
    console.log(`  - ${item.content.replace('INVESTMENT_OPTIONS:', '').trim()}`);
  });
  
  // Get gaming data
  const gamingData = await storage.getData('gaming', 'GAME_GENRES');
  console.log('\n🎮 Gaming Genres:');
  gamingData.forEach(item => {
    console.log(`  - ${item.content.replace('GAME_GENRES:', '').trim()}`);
  });
  
  // Get real estate data
  const realEstateData = await storage.getData('realestate', 'PROPERTY_TYPES');
  console.log('\n🏘️ Real Estate Property Types:');
  realEstateData.forEach(item => {
    console.log(`  - ${item.content.replace('PROPERTY_TYPES:', '').trim()}`);
  });
  
  console.log('\n✅ Flexible Data Storage Demonstration Complete!');
  console.log('\n🎯 Key Points:');
  console.log('  - Can store ANY type of data for ANY project');
  console.log('  - Each project has its own isolated data');
  console.log('  - Data is organized by type and project');
  console.log('  - Easy to retrieve project-specific information');
  console.log('  - Completely flexible - no restrictions on data types!');
}

// Run the demonstration
if (require.main === module) {
  demonstrateFlexibleStorage().catch(console.error);
}

module.exports = { FlexibleDataStorage, demonstrateFlexibleStorage }; 