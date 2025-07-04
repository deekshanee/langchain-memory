import * as Memory from './index';
import type { ConversationMessage } from './types';

async function runS3Example() {
  // Create and initialize the memory manager
  const memoryManager = Memory.createS3MemoryManager('your-bucket-name', 'us-east-1', {
    prefix: 'langchain-demo',
    // accessKeyId, secretAccessKey, sessionToken can be set here or via environment variables
  });
  await memoryManager.initialize();

  // Start a new session
  const sessionId = memoryManager.startSession(undefined, 'S3 Example Session');
  console.log('Started session:', sessionId);

  // Save some messages
  await memoryManager.saveUserMessage('Hello, assistant!');
  await memoryManager.saveAssistantMessage('Hello, user! How can I help you?');
  await memoryManager.saveUserMessage('Tell me a joke.');
  await memoryManager.saveAssistantMessage('Why did the chicken cross the road? To get to the other side!');

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

runS3Example().catch(console.error); 