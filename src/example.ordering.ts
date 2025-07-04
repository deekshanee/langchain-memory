import 'dotenv/config';
import * as Memory from './index';

async function testOrdering() {
  // Create and initialize the memory manager
  const memoryManager = Memory.createLocalMemoryManager('./ordering-test.json', { prettyPrint: true });
  await memoryManager.initialize();
  
  const sessionId = memoryManager.startSession('ordering-test', 'Ordering Test Session');
  console.log('Started session:', sessionId);

  // Save messages with explicit delays to test ordering
  console.log('Saving user message 1...');
  await memoryManager.saveUserMessage('First user message');
  
  console.log('Saving assistant message 1...');
  await memoryManager.saveAssistantMessage('First assistant response');
  
  console.log('Saving user message 2...');
  await memoryManager.saveUserMessage('Second user message');
  
  console.log('Saving assistant message 2...');
  await memoryManager.saveAssistantMessage('Second assistant response');

  // Fetch and display the conversation history
  const history = await memoryManager.getCurrentSessionHistory();
  console.log('\n=== Conversation History (should be in order) ===');
  history.forEach((msg, index) => {
    console.log(`${index + 1}. [${msg.role}] ${msg.content} (${msg.timestamp.toISOString()})`);
  });

  // Verify ordering
  let isOrdered = true;
  for (let i = 1; i < history.length; i++) {
    if (history[i].timestamp.getTime() <= history[i-1].timestamp.getTime()) {
      isOrdered = false;
      console.log(`\n❌ Ordering issue at position ${i}:`);
      console.log(`   Previous: ${history[i-1].timestamp.toISOString()}`);
      console.log(`   Current:  ${history[i].timestamp.toISOString()}`);
    }
  }
  
  if (isOrdered) {
    console.log('\n✅ Messages are properly ordered by timestamp');
  } else {
    console.log('\n❌ Messages are not properly ordered');
  }
}

testOrdering().catch(console.error); 