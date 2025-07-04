# Idelite Memory Integration Examples

This directory contains practical examples showing how Idelite would integrate our persistent memory utility to automatically improve Jira story enhancements over time.

## Files

- **`idelite-integration-example.js`** - Complete Idelite extension with memory integration
- **`test-idelite-learning.js`** - Test script demonstrating learning progression
- **`multi-project-example.js`** - Shows how to handle multiple projects with different data types
- **`flexible-data-storage.js`** - Demonstrates storing completely different data for different projects
- **`README.md`** - This file

## Prerequisites

1. **Environment Setup**:
   ```bash
   # Create .env file with your OpenAI API key
   echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
   ```

2. **Install Dependencies**:
   ```bash
   npm install @langchain/openai @langchain/core dotenv
   ```

3. **Build the Memory Utility**:
   ```bash
   # From the root directory
   npm run build
   ```

## Running the Examples

### 1. Full Integration Demo

Run the complete Idelite integration example:

```bash
node idelite-integration-example.js
```

This demonstrates:
- ✅ Automatic memory integration with LangChain
- ✅ Session management for Jira stories
- ✅ Context-aware story enhancement
- ✅ Learning from user feedback
- ✅ Pattern recognition and improvement
- ✅ Statistics and history tracking

### 2. Learning Progression Test

Test how the AI learns and improves over multiple enhancements:

```bash
node test-idelite-learning.js
```

This shows:
- 📈 Progressive improvement in story quality
- 🎯 Pattern learning and application
- 💬 Feedback integration
- 📊 Learning statistics tracking

### 3. Multi-Project Memory

See how the same memory system handles multiple projects:

```bash
node multi-project-example.js
```

This demonstrates:
- 🏗️ Single memory system for multiple projects
- 📋 Project-specific data isolation
- 🔍 Cross-project search capabilities
- 🤖 Context-aware AI responses per project

### 4. Flexible Data Storage

See how to store completely different types of data:

```bash
node flexible-data-storage.js
```

This shows:
- 💾 Store ANY type of data for ANY project
- 🛒 E-commerce: products, payments, shipping
- 🏥 Healthcare: patients, specialties, compliance
- 🎓 Education: courses, assessments, learning styles
- 💰 Finance: accounts, investments, budgets
- 🎮 Gaming: genres, platforms, monetization
- 🏠 Real Estate: properties, locations, financing

## Expected Output

### Integration Demo Output
```
🎯 Idelite Memory Integration Demo

🚀 Initializing Idelite Extension with Memory...
✅ Idelite Extension initialized with memory support

📅 Week 1: Initial Setup
📋 Preference saved: Team prefers user stories with detailed acceptance criteria
📋 Preference saved: Include edge cases and error scenarios
📋 Preference saved: Use Given-When-Then format for acceptance criteria

🔄 Enhancing story: PROJ-101
Original: As a user, I want to login so that I can access my account
✅ Enhanced story saved to memory

Enhanced Story 1:
As a user, I want to login so that I can securely access my personalized dashboard and manage my account settings

Acceptance Criteria:
Given I am on the login page
When I enter valid credentials
Then I should be redirected to my dashboard
And I should see my personalized content
And I should be able to access my account settings

💬 Feedback saved: Good enhancement, but could include more edge cases

📊 Learning Statistics:
- Total conversations: 8
- Preferences learned: 3
- Successful patterns: 1
- User feedback: 2
```

### Learning Test Output
```
🧪 Testing Idelite Learning Progression

📊 Starting Learning Test...

🔄 Test 1/5: Simple Login
Original: As a user, I want to login so that I can access my account
✅ Enhanced Story: [Enhanced version with basic acceptance criteria]

📈 Learning Progress:
   - Total conversations: 4
   - Preferences learned: 3
   - Successful patterns: 0
   - User feedback: 1

🔄 Test 5/5: Advanced Search
Original: As a user, I want to search for products so that I can find what I need
✅ Enhanced Story: [Highly detailed enhancement with learned patterns]

📈 Learning Progress:
   - Total conversations: 20
   - Preferences learned: 3
   - Successful patterns: 4
   - User feedback: 5

🎯 Final Learning Summary:
📊 Total Learning Data:
   - Conversations: 20
   - Preferences: 3
   - Patterns: 4
   - Feedback: 5

✅ Learning test completed! The AI has progressively improved its enhancements.
```

## Key Features Demonstrated

### 🔄 **Automatic Memory Integration**
- No manual message saving required
- LangChain automatically handles conversation persistence
- Session management for each Jira story

### 🧠 **Learning & Improvement**
- Context retrieval from previous enhancements
- Pattern recognition and application
- User feedback integration
- Progressive quality improvement

### 📊 **Analytics & Tracking**
- Learning statistics
- Conversation history
- Success pattern tracking
- Performance metrics

### 🎯 **Real-World Application**
- Jira story enhancement workflow
- Team preference learning
- Quality improvement over time
- Scalable architecture

### 🌟 **Multi-Project Flexibility**
- Single memory system for multiple projects
- Project-specific data isolation
- Cross-project search and analytics
- Context-aware AI responses
- Any data type for any project domain

## Customization

You can customize the examples by:

1. **Changing Storage Backend**:
   ```javascript
   // Use S3 instead of local storage
   this.memoryManager = createS3MemoryManager('bucket', 'region');
   ```

2. **Modifying Enhancement Prompts**:
   ```javascript
   // Customize the enhancement logic in createEnhancementPrompt()
   ```

3. **Adding Custom Learning Logic**:
   ```javascript
   // Add your own pattern recognition in saveSuccessfulPattern()
   ```

4. **Integrating with Real Jira API**:
   ```javascript
   // Replace demo stories with real Jira API calls
   ```

## Troubleshooting

### Common Issues

1. **OpenAI API Key Error**:
   - Ensure your `.env` file contains `OPENAI_API_KEY=your_key`
   - Verify the API key is valid and has sufficient credits

2. **Memory File Not Found**:
   - Run `npm run build` from the root directory first
   - Ensure the `dist/` folder exists with compiled files

3. **LangChain Import Errors**:
   - Install required dependencies: `npm install @langchain/openai @langchain/core`
   - Check that you're using the correct import paths

### Debug Mode

Enable debug logging by setting the environment variable:
```bash
DEBUG=* node idelite-integration-example.js
```

## Next Steps

1. **Integrate with Real Idelite Extension**:
   - Replace demo stories with actual Jira API integration
   - Add VS Code extension-specific UI components
   - Implement real-time enhancement suggestions

2. **Add Advanced Features**:
   - Multi-team memory isolation
   - Advanced pattern recognition
   - Performance analytics dashboard
   - A/B testing for enhancement strategies

3. **Production Deployment**:
   - Use S3 or DynamoDB for production storage
   - Add authentication and authorization
   - Implement monitoring and alerting
   - Add backup and recovery procedures 