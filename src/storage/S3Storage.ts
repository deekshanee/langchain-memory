import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { IMemoryStorage } from '../interfaces/MemoryInterface';
import { 
  ConversationMessage, 
  ConversationSession, 
  S3StorageConfig, 
  MemoryQueryOptions, 
  MemorySearchResult, 
  MemoryStats 
} from '../types';

interface StorageData {
  messages: ConversationMessage[];
  sessions: ConversationSession[];
  lastUpdated: Date;
}

export class S3Storage implements IMemoryStorage {
  private config: S3StorageConfig;
  private s3Client: S3Client;
  private data: StorageData;
  private ready: boolean = false;
  private dataKey: string;

  constructor(config: S3StorageConfig) {
    this.config = config;
    this.dataKey = `${config.prefix || 'langchain-memory'}/data.json`;
    
    this.s3Client = new S3Client({
      region: config.region,
      credentials: config.accessKeyId && config.secretAccessKey ? {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
        sessionToken: config.sessionToken
      } : undefined
    });

    this.data = {
      messages: [],
      sessions: [],
      lastUpdated: new Date()
    };
  }

  async initialize(): Promise<void> {
    try {
      // Try to load existing data
      try {
        const response = await this.s3Client.send(new GetObjectCommand({
          Bucket: this.config.bucketName,
          Key: this.dataKey
        }));

        if (response.Body) {
          const bodyContents = await response.Body.transformToString();
          this.data = JSON.parse(bodyContents);
          
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
      } catch (error: any) {
        // If file doesn't exist, that's fine - we'll create it
        if (error.name !== 'NoSuchKey') {
          throw error;
        }
      }

      this.ready = true;
    } catch (error) {
      throw new Error(`Failed to initialize S3 storage: ${error}`);
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

    await this.saveToS3();
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
    await this.saveToS3();
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
      
      await this.saveToS3();
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!this.ready) throw new Error('Storage not initialized');
    
    // Remove all messages for this session
    this.data.messages = this.data.messages.filter(m => m.sessionId !== sessionId);
    
    // Remove session
    this.data.sessions = this.data.sessions.filter(s => s.id !== sessionId);
    
    await this.saveToS3();
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
    
    await this.saveToS3();
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

  private async saveToS3(): Promise<void> {
    this.data.lastUpdated = new Date();
    
    const content = JSON.stringify(this.data);
    
    await this.s3Client.send(new PutObjectCommand({
      Bucket: this.config.bucketName,
      Key: this.dataKey,
      Body: content,
      ContentType: 'application/json',
      ServerSideEncryption: this.config.encryption
    }));
  }
} 