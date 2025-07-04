import 'dotenv/config';
import { ConversationChain } from 'langchain/chains';
import { OpenAI } from '@langchain/openai';
import * as Memory from './index';

async function runLangChainExample() {
  // Note: Set your OpenAI API key in .env file as OPENAI_API_KEY=your-api-key-here
  
  // Create and initialize the memory manager (local file example)
  const memoryManager = Memory.createLocalMemoryManager('./memory.json', { prettyPrint: true });
  await memoryManager.initialize();
  memoryManager.startSession('123', 'LangChain Integration Session');

  // Get LangChain-compatible memory object
  const memory = memoryManager.createLangChainMemory();

  // Set up your LLM and chain
  const llm = new OpenAI({ temperature: 0 });
  const chain = new ConversationChain({ llm, memory });

  // Interact with the chain
  const response1 = await chain.call({ input: 'what is 2+2' });
  console.log('Assistant:', response1.response || response1.text || response1);

  const response2 = await chain.call({ input: 'add 4 more to it' });
  console.log('Assistant:', response2.response || response2.text || response2);
  const response3 = await chain.call({ input: 'add 9 more to it' });
  console.log('Assistant:', response3.response || response3.text || response3);

  // Show the conversation history from persistent memory
  const history = await memoryManager.getCurrentSessionHistory();
  console.log('Persisted conversation history:');
  history.forEach(msg => {
    console.log(`[${msg.role}] ${msg.content}`);
  });
}

runLangChainExample().catch(console.error); 