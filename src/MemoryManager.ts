import { v4 as uuidv4 } from 'uuid';
import { IMemoryStorage } from './interfaces/MemoryInterface';
import { LocalStorage } from './storage/LocalStorage';
import { S3Storage } from './storage/S3Storage';
import { DynamoDBStorage } from './storage/DynamoDBStorage';
import { 
  MemoryConfig, 
  ConversationMessage, 
  ConversationSession, 
  MemoryQueryOptions, 
  MemorySearchResult, 
  MemoryStats 
} from './types';

export class MemoryManager {
  private storage: IMemoryStorage;
  private currentSessionId: string | null = null;
  private ready: boolean = false;

  constructor(config: MemoryConfig) {
    this.storage = this.createStorage(config);
  }

  /**
   * Initialize the memory manager
   */
  async initialize(): Promise<void> {
    await this.storage.initialize();
    this.ready = true;
  }

  /**
   * Start a new conversation session
   */
  startSession(sessionId?: string, title?: string): string {
    if (!this.ready) throw new Error('Memory manager not initialized');

    const id = sessionId || uuidv4();
    this.currentSessionId = id;

    // Create session if it doesn't exist
    this.storage.getSession(id).then(session => {
      if (!session) {
        this.storage.updateSession(id, {
          title,
          messageCount: 0
        });
      }
    });

    return id;
  }

  /**
   * Get the current session ID
   */
  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  /**
   * Set the current session ID
   */
  setCurrentSession(sessionId: string): void {
    this.currentSessionId = sessionId;
  }

  /**
   * Save a user message
   */
  async saveUserMessage(content: string, metadata?: Record<string, any>): Promise<string> {
    if (!this.currentSessionId) {
      throw new Error('No active session. Call startSession() first.');
    }

    const message: ConversationMessage = {
      id: uuidv4(),
      sessionId: this.currentSessionId,
      role: 'user',
      content,
      timestamp: new Date(),
      metadata
    };

    await this.storage.saveMessage(message);
    return message.id;
  }

  /**
   * Save an assistant message
   */
  async saveAssistantMessage(content: string, metadata?: Record<string, any>): Promise<string> {
    if (!this.currentSessionId) {
      throw new Error('No active session. Call startSession() first.');
    }

    // Add a small delay to ensure proper ordering
    await new Promise(resolve => setTimeout(resolve, 1));

    const message: ConversationMessage = {
      id: uuidv4(),
      sessionId: this.currentSessionId,
      role: 'assistant',
      content,
      timestamp: new Date(),
      metadata
    };

    await this.storage.saveMessage(message);
    return message.id;
  }

  /**
   * Save a system message
   */
  async saveSystemMessage(content: string, metadata?: Record<string, any>): Promise<string> {
    if (!this.currentSessionId) {
      throw new Error('No active session. Call startSession() first.');
    }

    const message: ConversationMessage = {
      id: uuidv4(),
      sessionId: this.currentSessionId,
      role: 'system',
      content,
      timestamp: new Date(),
      metadata
    };

    await this.storage.saveMessage(message);
    return message.id;
  }

  /**
   * Get conversation history for the current session
   */
  async getCurrentSessionHistory(limit?: number): Promise<ConversationMessage[]> {
    if (!this.currentSessionId) {
      throw new Error('No active session. Call startSession() first.');
    }

    const result = await this.storage.getMessages({
      sessionId: this.currentSessionId,
      limit
    });

    return result.messages;
  }

  /**
   * Get conversation history for a specific session
   */
  async getSessionHistory(sessionId: string, limit?: number): Promise<ConversationMessage[]> {
    const result = await this.storage.getMessages({
      sessionId,
      limit
    });

    return result.messages;
  }

  /**
   * Get all sessions
   */
  async getSessions(): Promise<ConversationSession[]> {
    return await this.storage.getSessions();
  }

  /**
   * Get a specific session
   */
  async getSession(sessionId: string): Promise<ConversationSession | null> {
    return await this.storage.getSession(sessionId);
  }

  /**
   * Update session metadata
   */
  async updateSession(sessionId: string, updates: Partial<ConversationSession>): Promise<void> {
    await this.storage.updateSession(sessionId, updates);
  }

  /**
   * Search messages with filters
   */
  async searchMessages(options: MemoryQueryOptions = {}): Promise<MemorySearchResult> {
    return await this.storage.getMessages(options);
  }

  /**
   * Get a specific message
   */
  async getMessage(messageId: string): Promise<ConversationMessage | null> {
    return await this.storage.getMessage(messageId);
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<void> {
    await this.storage.deleteMessage(messageId);
  }

  /**
   * Delete a session and all its messages
   */
  async deleteSession(sessionId: string): Promise<void> {
    await this.storage.deleteSession(sessionId);
    
    // Clear current session if it's the one being deleted
    if (this.currentSessionId === sessionId) {
      this.currentSessionId = null;
    }
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<MemoryStats> {
    return await this.storage.getStats();
  }

  /**
   * Clear all data
   */
  async clear(): Promise<void> {
    await this.storage.clear();
    this.currentSessionId = null;
  }

  /**
   * Check if the memory manager is ready
   */
  isReady(): boolean {
    return this.ready && this.storage.isReady();
  }

  /**
   * Get the underlying storage instance
   */
  getStorage(): IMemoryStorage {
    return this.storage;
  }

  /**
   * Create a LangChain-compatible memory object
   */
  createLangChainMemory() {
    return {
      memoryKeys: ['history'],
      // Save messages to our storage
      saveContext: async (inputValues: Record<string, any>, outputValues: Record<string, any>) => {
        try {
          console.log('Saving context - Input:', inputValues);
          console.log('Saving context - Output:', outputValues);
          
          // Save user message first
          if (inputValues.input) {
            await this.saveUserMessage(inputValues.input);
          }
          
          // Handle different possible output formats from LangChain
          const output = outputValues.output || outputValues.response || outputValues.text || outputValues.result;
          if (output) {
            // Add a small delay to ensure proper ordering
            await new Promise(resolve => setTimeout(resolve, 10));
            await this.saveAssistantMessage(output);
          }
        } catch (error) {
          console.error('Error saving context:', error);
        }
      },

      // Load conversation history
      loadMemoryVariables: async (variables: Record<string, any>) => {
        const history = await this.getCurrentSessionHistory();
        const formattedHistory = history
          .map(msg => `${msg.role}: ${msg.content}`)
          .join('\n');
        
        return {
          history: formattedHistory,
          messages: history
        };
      },

      // Clear memory
      clear: async () => {
        await this.clear();
      }
    };
  }

  private createStorage(config: MemoryConfig): IMemoryStorage {
    switch (config.type) {
      case 'local':
        return new LocalStorage(config.options as any);
      case 's3':
        return new S3Storage(config.options as any);
      case 'dynamodb':
        return new DynamoDBStorage(config.options as any);
      default:
        throw new Error(`Unsupported storage type: ${config.type}`);
    }
  }
} 