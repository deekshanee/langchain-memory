import 'dotenv/config';
import * as Memory from './index';

async function runSimpleExample() {
  // Create and initialize the memory manager
  const memoryManager = Memory.createLocalMemoryManager('./memory.json', { prettyPrint: true });
  await memoryManager.initialize();
  
  const sessionId = memoryManager.startSession('test-session', 'Simple Test Session');
  console.log('Started session:', sessionId);

  // Manually save some messages
  await memoryManager.saveUserMessage('Hello, assistant!');
  await memoryManager.saveAssistantMessage('Hello, user! How can I help you?');
  await memoryManager.saveUserMessage('What is 2+2?');
  await memoryManager.saveAssistantMessage('2+2 equals 4.');

  // Fetch and display the conversation history
  const history = await memoryManager.getCurrentSessionHistory();
  console.log('\n=== Conversation History ===');
  history.forEach(msg => {
    console.log(`[${msg.role}] ${msg.content}`);
  });

  // Show stats
  const stats = await memoryManager.getStats();
  console.log('\n=== Stats ===');
  console.log('Total sessions:', stats.totalSessions);
  console.log('Total messages:', stats.totalMessages);
  console.log('Average messages per session:', stats.averageMessagesPerSession);
}

runSimpleExample().catch(console.error); 