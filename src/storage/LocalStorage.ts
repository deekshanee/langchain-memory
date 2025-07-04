import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { IMemoryStorage } from '../interfaces/MemoryInterface';
import { 
  ConversationMessage, 
  ConversationSession, 
  LocalStorageConfig, 
  MemoryQueryOptions, 
  MemorySearchResult, 
  MemoryStats 
} from '../types';

interface StorageData {
  messages: ConversationMessage[];
  sessions: ConversationSession[];
  lastUpdated: Date;
}

export class LocalStorage implements IMemoryStorage {
  private config: LocalStorageConfig;
  private data: StorageData;
  private ready: boolean = false;
  private dataPath: string;

  constructor(config: LocalStorageConfig) {
    this.config = config;
    this.dataPath = path.resolve(config.filePath);
    this.data = {
      messages: [],
      sessions: [],
      lastUpdated: new Date()
    };
  }

  async initialize(): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.dataPath);
      await fs.ensureDir(dir);

      // Load existing data if file exists
      if (await fs.pathExists(this.dataPath)) {
        const fileContent = await fs.readFile(this.dataPath, this.config.encoding || 'utf8');
        this.data = JSON.parse(fileContent);
        
        // Convert string dates back to Date objects
        this.data.messages.forEach(msg => {
          msg.timestamp = new Date(msg.timestamp);
        });
        this.data.sessions.forEach(session => {
          session.createdAt = new Date(session.createdAt);
          session.updatedAt = new Date(session.updatedAt);
        });
        this.data.lastUpdated = new Date(this.data.lastUpdated);
      }

      this.ready = true;
    } catch (error) {
      throw new Error(`Failed to initialize local storage: ${error}`);
    }
  }

  async saveMessage(message: ConversationMessage): Promise<void> {
    if (!this.ready) throw new Error('Storage not initialized');

    // Generate ID if not provided
    if (!message.id) {
      message.id = uuidv4();
    }

    // Update or add message
    const existingIndex = this.data.messages.findIndex(m => m.id === message.id);
    if (existingIndex >= 0) {
      this.data.messages[existingIndex] = message;
    } else {
      this.data.messages.push(message);
    }

    // Update session
    await this.updateSessionInternal(message.sessionId, {
      updatedAt: new Date(),
      messageCount: this.data.messages.filter(m => m.sessionId === message.sessionId).length
    });

    await this.saveToFile();
  }

  async saveMessages(messages: ConversationMessage[]): Promise<void> {
    for (const message of messages) {
      await this.saveMessage(message);
    }
  }

  async getMessages(options: MemoryQueryOptions = {}): Promise<MemorySearchResult> {
    if (!this.ready) throw new Error('Storage not initialized');

    let filteredMessages = [...this.data.messages];

    // Apply filters
    if (options.sessionId) {
      filteredMessages = filteredMessages.filter(m => m.sessionId === options.sessionId);
    }

    if (options.role) {
      filteredMessages = filteredMessages.filter(m => m.role === options.role);
    }

    if (options.startDate) {
      filteredMessages = filteredMessages.filter(m => m.timestamp >= options.startDate!);
    }

    if (options.endDate) {
      filteredMessages = filteredMessages.filter(m => m.timestamp <= options.endDate!);
    }

    // Sort by timestamp
    filteredMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const total = filteredMessages.length;
    const offset = options.offset || 0;
    const limit = options.limit || total;

    const paginatedMessages = filteredMessages.slice(offset, offset + limit);

    return {
      messages: paginatedMessages,
      total,
      hasMore: offset + limit < total
    };
  }

  async getMessage(messageId: string): Promise<ConversationMessage | null> {
    if (!this.ready) throw new Error('Storage not initialized');
    return this.data.messages.find(m => m.id === messageId) || null;
  }

  async getSessions(): Promise<ConversationSession[]> {
    if (!this.ready) throw new Error('Storage not initialized');
    return [...this.data.sessions].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getSession(sessionId: string): Promise<ConversationSession | null> {
    if (!this.ready) throw new Error('Storage not initialized');
    return this.data.sessions.find(s => s.id === sessionId) || null;
  }

  async updateSession(sessionId: string, updates: Partial<ConversationSession>): Promise<void> {
    if (!this.ready) throw new Error('Storage not initialized');
    await this.updateSessionInternal(sessionId, updates);
    await this.saveToFile();
  }

  async deleteMessage(messageId: string): Promise<void> {
    if (!this.ready) throw new Error('Storage not initialized');
    
    const messageIndex = this.data.messages.findIndex(m => m.id === messageId);
    if (messageIndex >= 0) {
      const message = this.data.messages[messageIndex];
      this.data.messages.splice(messageIndex, 1);
      
      // Update session message count
      await this.updateSessionInternal(message.sessionId, {
        messageCount: this.data.messages.filter(m => m.sessionId === message.sessionId).length
      });
      
      await this.saveToFile();
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!this.ready) throw new Error('Storage not initialized');
    
    // Remove all messages for this session
    this.data.messages = this.data.messages.filter(m => m.sessionId !== sessionId);
    
    // Remove session
    this.data.sessions = this.data.sessions.filter(s => s.id !== sessionId);
    
    await this.saveToFile();
  }

  async getStats(): Promise<MemoryStats> {
    if (!this.ready) throw new Error('Storage not initialized');

    const totalSessions = this.data.sessions.length;
    const totalMessages = this.data.messages.length;
    
    const timestamps = this.data.messages.map(m => m.timestamp.getTime());
    const oldestMessage = timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null;
    const newestMessage = timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null;
    
    const averageMessagesPerSession = totalSessions > 0 ? totalMessages / totalSessions : 0;

    return {
      totalSessions,
      totalMessages,
      oldestMessage,
      newestMessage,
      averageMessagesPerSession
    };
  }

  async clear(): Promise<void> {
    if (!this.ready) throw new Error('Storage not initialized');
    
    this.data = {
      messages: [],
      sessions: [],
      lastUpdated: new Date()
    };
    
    await this.saveToFile();
  }

  isReady(): boolean {
    return this.ready;
  }

  private async updateSessionInternal(sessionId: string, updates: Partial<ConversationSession>): Promise<void> {
    const sessionIndex = this.data.sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex >= 0) {
      this.data.sessions[sessionIndex] = {
        ...this.data.sessions[sessionIndex],
        ...updates,
        updatedAt: new Date()
      };
    } else {
      // Create new session
      const newSession: ConversationSession = {
        id: sessionId,
        createdAt: new Date(),
        updatedAt: new Date(),
        messageCount: 1,
        ...updates
      };
      this.data.sessions.push(newSession);
    }
  }

  private async saveToFile(): Promise<void> {
    this.data.lastUpdated = new Date();
    
    const content = this.config.prettyPrint 
      ? JSON.stringify(this.data, null, 2)
      : JSON.stringify(this.data);
    
    await fs.writeFile(this.dataPath, content, this.config.encoding || 'utf8');
  }
} 