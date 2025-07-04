# LangChain Persistent Memory Utility (TypeScript)

A configurable, pluggable persistent memory utility for [LangChain](https://js.langchain.com/) in TypeScript. Supports local file, AWS S3, and DynamoDB backends for storing and retrieving conversation history, with easy integration into any LangChain workflow.

## Features

- **🔄 Pluggable Storage**: Local file, S3, or DynamoDB
- **🔗 LangChain Compatible**: Works with any LangChain memory interface
- **📝 Session Management**: Start, update, and delete conversation sessions
- **📊 History & Stats**: Fetch conversation history and usage statistics
- **⚙️ Configurable**: Use code or environment variables to select backend
- **🛡️ Persistent**: Conversations survive app restarts
- **🚀 Production Ready**: Supports multiple storage backends

## Installation

```bash
npm install
```

## Quick Start

### 1. Basic Usage

```typescript
import { createLocalMemoryManager } from './src';

// Initialize memory manager
const memoryManager = createLocalMemoryManager('./memory.json');
await memoryManager.initialize();

// Start a session
const sessionId = memoryManager.startSession('my-session', 'My Conversation');

// Save messages
await memoryManager.saveUserMessage('Hello, assistant!');
await memoryManager.saveAssistantMessage('Hello, user! How can I help you?');

// Get history
const history = await memoryManager.getCurrentSessionHistory();
console.log('History:', history);
```

### 2. LangChain Integration

```typescript
import { ConversationChain } from 'langchain/chains';
import { OpenAI } from '@langchain/openai';
import { createLocalMemoryManager } from './src';

// Setup memory manager
const memoryManager = createLocalMemoryManager('./memory.json');
await memoryManager.initialize();
memoryManager.startSession();

// Create LangChain-compatible memory
const memory = memoryManager.createLangChainMemory();

// Use with any LangChain chain
const llm = new OpenAI({ temperature: 0 });
const chain = new ConversationChain({ llm, memory });

// Interact - conversations are automatically persisted
const response = await chain.call({ input: 'What is the capital of France?' });
console.log(response);
```

## Storage Backends

### Local File Storage
```typescript
import { createLocalMemoryManager } from './src';

const memoryManager = createLocalMemoryManager('./memory.json', {
  prettyPrint: true,
  encoding: 'utf8'
});
```

### S3 Storage
```typescript
import { createS3MemoryManager } from './src';

const memoryManager = createS3MemoryManager('my-bucket', 'us-east-1', {
  prefix: 'langchain-memory',
  encryption: 'AES256'
});
```

### DynamoDB Storage
```typescript
import { createDynamoDBMemoryManager } from './src';

const memoryManager = createDynamoDBMemoryManager('my-table', 'us-east-1', {
  endpoint: 'https://dynamodb.us-east-1.amazonaws.com'
});
```

## LangChain Integration Examples

### 1. ConversationChain
```typescript
import { ConversationChain } from 'langchain/chains';
import { OpenAI } from '@langchain/openai';

const memory = memoryManager.createLangChainMemory();
const llm = new OpenAI({ temperature: 0 });
const chain = new ConversationChain({ llm, memory });

await chain.call({ input: 'Hello!' });
```

### 2. LLMChain with Custom Prompt
```typescript
import { LLMChain } from 'langchain/chains';
import { PromptTemplate } from 'langchain/prompts';

const memory = memoryManager.createLangChainMemory();
const prompt = PromptTemplate.fromTemplate(
  "Previous conversation: {history}\nHuman: {input}\nAssistant:"
);
const chain = new LLMChain({ llm, prompt, memory });
```

### 3. Agents with Memory
```typescript
import { initializeAgentExecutorWithOptions } from 'langchain/agents';

const memory = memoryManager.createLangChainMemory();
const executor = await initializeAgentExecutorWithOptions(tools, llm, {
  memory,
  returnIntermediateSteps: true,
});
```

### 4. Chat Models
```typescript
import { ChatOpenAI } from '@langchain/openai';

const memory = memoryManager.createLangChainMemory();
const chat = new ChatOpenAI({ temperature: 0 });
const chain = new ConversationChain({ llm: chat, memory });
```

## Environment Configuration

Create a `.env` file:
```bash
# OpenAI Configuration
OPENAI_API_KEY=your-api-key

# Memory Storage Configuration
MEMORY_STORAGE_TYPE=local

# Local Storage
MEMORY_FILE_PATH=./memory.json
MEMORY_FILE_ENCODING=utf8
MEMORY_FILE_PRETTY_PRINT=true

# S3 Storage (uncomment to use)
# MEMORY_S3_BUCKET=your-bucket-name
# MEMORY_S3_REGION=us-east-1
# MEMORY_S3_ACCESS_KEY_ID=your-access-key
# MEMORY_S3_SECRET_ACCESS_KEY=your-secret-key

# DynamoDB Storage (uncomment to use)
# MEMORY_DYNAMODB_TABLE=your-table-name
# MEMORY_DYNAMODB_REGION=us-east-1
```

Use environment-based configuration:
```typescript
import { createMemoryManagerFromEnv } from './src';

const memoryManager = createMemoryManagerFromEnv();
await memoryManager.initialize();
```

## API Reference

### MemoryManager Class

#### Core Methods
- `initialize()` - Initialize the storage system
- `startSession(sessionId?, title?)` - Start a new conversation session
- `saveUserMessage(content, metadata?)` - Save a user message
- `saveAssistantMessage(content, metadata?)` - Save an assistant message
- `getCurrentSessionHistory(limit?)` - Get conversation history for current session
- `getSessions()` - Get all sessions
- `getStats()` - Get storage statistics

#### LangChain Integration
- `createLangChainMemory()` - Returns LangChain-compatible memory object

### Factory Functions
- `createLocalMemoryManager(filePath, options?)` - Local file storage
- `createS3MemoryManager(bucketName, region, options?)` - S3 storage
- `createDynamoDBMemoryManager(tableName, region, options?)` - DynamoDB storage
- `createMemoryManagerFromEnv()` - Environment-based configuration

## Examples

### Basic Example
```bash
npx ts-node src/example.simple.ts
```

### LangChain Integration
```bash
npx ts-node src/example.langchain.ts
```

### Storage Examples
```bash
# Local storage
npx ts-node src/example.local.ts

# S3 storage (configure first)
npx ts-node src/example.s3.ts

# DynamoDB storage (configure first)
npx ts-node src/example.dynamodb.ts
```

### Ordering Test
```bash
npx ts-node src/example.ordering.ts
```

## Session Management

```typescript
// Start a new session
const sessionId = memoryManager.startSession('unique-id', 'Session Title');

// Switch to existing session
memoryManager.setCurrentSession('existing-session-id');

// Get current session
const currentSession = memoryManager.getCurrentSessionId();

// Get all sessions
const sessions = await memoryManager.getSessions();

// Delete a session
await memoryManager.deleteSession('session-id');
```

## History and Statistics

```typescript
// Get conversation history
const history = await memoryManager.getCurrentSessionHistory(10); // Last 10 messages

// Search messages with filters
const searchResult = await memoryManager.searchMessages({
  sessionId: 'my-session',
  role: 'user',
  startDate: new Date('2024-01-01'),
  limit: 50
});

// Get storage statistics
const stats = await memoryManager.getStats();
console.log('Total sessions:', stats.totalSessions);
console.log('Total messages:', stats.totalMessages);
console.log('Average messages per session:', stats.averageMessagesPerSession);
```

## Production Setup

### S3 Setup
1. Create an S3 bucket
2. Configure CORS if needed
3. Set up IAM permissions
4. Use environment variables for credentials

### DynamoDB Setup
1. Create a DynamoDB table with partition key `PK` and sort key `SK`
2. Configure IAM permissions
3. Set up auto-scaling if needed

### Environment Variables
```bash
# For S3
export MEMORY_STORAGE_TYPE=s3
export MEMORY_S3_BUCKET=your-bucket
export MEMORY_S3_REGION=us-east-1

# For DynamoDB
export MEMORY_STORAGE_TYPE=dynamodb
export MEMORY_DYNAMODB_TABLE=your-table
export MEMORY_DYNAMODB_REGION=us-east-1
```

## Troubleshooting

### Common Issues

1. **Messages out of order**: The utility includes automatic timestamp ordering with small delays
2. **Missing AI responses**: Ensure `createLangChainMemory()` is used correctly
3. **Storage errors**: Check permissions and configuration
4. **Import errors**: Install all dependencies with `npm install`

### Debug Mode
Enable debug logging in the memory manager:
```typescript
const memory = memoryManager.createLangChainMemory();
// Debug logs will show in console
```

## Requirements

- Node.js 18+
- TypeScript 5.2+
- AWS credentials (for S3/DynamoDB)
- [LangChain JS](https://js.langchain.com/) (for integration)

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request 