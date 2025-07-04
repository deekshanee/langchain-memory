import * as Memory from './index';
import type { ConversationMessage } from './types';

async function runDynamoDBExample() {
  // Create and initialize the memory manager
  const memoryManager = Memory.createDynamoDBMemoryManager('your-table-name', 'us-east-1', {
    // accessKeyId, secretAccessKey, sessionToken, endpoint can be set here or via environment variables
  });
  await memoryManager.initialize();

  // Start a new session
  const sessionId = memoryManager.startSession(undefined, 'DynamoDB Example Session');
  console.log('Started session:', sessionId);

  // Save some messages
  await memoryManager.saveUserMessage('Hello, assistant!');
  await memoryManager.saveAssistantMessage('Hello, user! How can I help you?');
  await memoryManager.saveUserMessage('What is the meaning of life?');
  await memoryManager.saveAssistantMessage('42.');

  // Fetch and print conversation history
  const history = await memoryManager.getCurrentSessionHistory();
  console.log('Conversation history:');
  history.forEach((msg: ConversationMessage) => {
    console.log(`[${msg.role}] ${msg.content}`);
  });

  // Show all sessions
  const sessions = await memoryManager.getSessions();
  console.log('All sessions:', sessions);

  // Show stats
  const stats = await memoryManager.getStats();
  console.log('Stats:', stats);
}

runDynamoDBExample().catch(console.error); 