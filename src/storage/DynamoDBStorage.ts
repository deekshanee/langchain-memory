import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { IMemoryStorage } from '../interfaces/MemoryInterface';
import { 
  ConversationMessage, 
  ConversationSession, 
  DynamoDBStorageConfig, 
  MemoryQueryOptions, 
  MemorySearchResult, 
  MemoryStats 
} from '../types';

export class DynamoDBStorage implements IMemoryStorage {
  private config: DynamoDBStorageConfig;
  private client: DynamoDBClient;
  private docClient: DynamoDBDocumentClient;
  private ready: boolean = false;

  constructor(config: DynamoDBStorageConfig) {
    this.config = config;
    
    this.client = new DynamoDBClient({
      region: config.region,
      endpoint: config.endpoint,
      credentials: config.accessKeyId && config.secretAccessKey ? {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
        sessionToken: config.sessionToken
      } : undefined
    });

    this.docClient = DynamoDBDocumentClient.from(this.client);
  }

  async initialize(): Promise<void> {
    try {
      // Test connection by trying to describe the table
      await this.docClient.send(new ScanCommand({
        TableName: this.config.tableName,
        Limit: 1
      }));

      this.ready = true;
    } catch (error) {
      throw new Error(`Failed to initialize DynamoDB storage: ${error}`);
    }
  }

  async saveMessage(message: ConversationMessage): Promise<void> {
    if (!this.ready) throw new Error('Storage not initialized');

    // Generate ID if not provided
    if (!message.id) {
      message.id = uuidv4();
    }

    // Save message
    await this.docClient.send(new PutCommand({
      TableName: this.config.tableName,
      Item: {
        PK: `MESSAGE#${message.id}`,
        SK: `SESSION#${message.sessionId}`,
        type: 'message',
        id: message.id,
        sessionId: message.sessionId,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp.toISOString(),
        metadata: message.metadata ? JSON.stringify(message.metadata) : undefined,
        createdAt: new Date().toISOString()
      }
    }));

    // Update session
    await this.updateSessionInternal(message.sessionId);
  }

  async saveMessages(messages: ConversationMessage[]): Promise<void> {
    for (const message of messages) {
      await this.saveMessage(message);
    }
  }

  async getMessages(options: MemoryQueryOptions = {}): Promise<MemorySearchResult> {
    if (!this.ready) throw new Error('Storage not initialized');

    let messages: ConversationMessage[] = [];

    if (options.sessionId) {
      // Get messages for specific session
      const response = await this.docClient.send(new QueryCommand({
        TableName: this.config.tableName,
        KeyConditionExpression: 'SK = :sessionId AND begins_with(PK, :messagePrefix)',
        ExpressionAttributeValues: {
          ':sessionId': `SESSION#${options.sessionId}`,
          ':messagePrefix': 'MESSAGE#'
        },
        ScanIndexForward: false // Most recent first
      }));

      messages = (response.Items || []).map(item => ({
        id: item.id,
        sessionId: item.sessionId,
        role: item.role,
        content: item.content,
        timestamp: new Date(item.timestamp),
        metadata: item.metadata ? JSON.parse(item.metadata) : undefined
      }));
    } else {
      // Get all messages
      const response = await this.docClient.send(new ScanCommand({
        TableName: this.config.tableName,
        FilterExpression: 'begins_with(PK, :messagePrefix)',
        ExpressionAttributeValues: {
          ':messagePrefix': 'MESSAGE#'
        }
      }));

      messages = (response.Items || []).map(item => ({
        id: item.id,
        sessionId: item.sessionId,
        role: item.role,
        content: item.content,
        timestamp: new Date(item.timestamp),
        metadata: item.metadata ? JSON.parse(item.metadata) : undefined
      }));
    }

    // Apply additional filters
    if (options.role) {
      messages = messages.filter(m => m.role === options.role);
    }

    if (options.startDate) {
      messages = messages.filter(m => m.timestamp >= options.startDate!);
    }

    if (options.endDate) {
      messages = messages.filter(m => m.timestamp <= options.endDate!);
    }

    // Sort by timestamp
    messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const total = messages.length;
    const offset = options.offset || 0;
    const limit = options.limit || total;

    const paginatedMessages = messages.slice(offset, offset + limit);

    return {
      messages: paginatedMessages,
      total,
      hasMore: offset + limit < total
    };
  }

  async getMessage(messageId: string): Promise<ConversationMessage | null> {
    if (!this.ready) throw new Error('Storage not initialized');

    const response = await this.docClient.send(new GetCommand({
      TableName: this.config.tableName,
      Key: {
        PK: `MESSAGE#${messageId}`,
        SK: `MESSAGE#${messageId}`
      }
    }));

    if (!response.Item) return null;

    return {
      id: response.Item.id,
      sessionId: response.Item.sessionId,
      role: response.Item.role,
      content: response.Item.content,
      timestamp: new Date(response.Item.timestamp),
      metadata: response.Item.metadata ? JSON.parse(response.Item.metadata) : undefined
    };
  }

  async getSessions(): Promise<ConversationSession[]> {
    if (!this.ready) throw new Error('Storage not initialized');

    const response = await this.docClient.send(new ScanCommand({
      TableName: this.config.tableName,
      FilterExpression: 'begins_with(PK, :sessionPrefix)',
      ExpressionAttributeValues: {
        ':sessionPrefix': 'SESSION#'
      }
    }));

    return (response.Items || []).map(item => ({
      id: item.id,
      title: item.title,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
      messageCount: item.messageCount || 0,
      metadata: item.metadata ? JSON.parse(item.metadata) : undefined
    })).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getSession(sessionId: string): Promise<ConversationSession | null> {
    if (!this.ready) throw new Error('Storage not initialized');

    const response = await this.docClient.send(new GetCommand({
      TableName: this.config.tableName,
      Key: {
        PK: `SESSION#${sessionId}`,
        SK: `SESSION#${sessionId}`
      }
    }));

    if (!response.Item) return null;

    return {
      id: response.Item.id,
      title: response.Item.title,
      createdAt: new Date(response.Item.createdAt),
      updatedAt: new Date(response.Item.updatedAt),
      messageCount: response.Item.messageCount || 0,
      metadata: response.Item.metadata ? JSON.parse(response.Item.metadata) : undefined
    };
  }

  async updateSession(sessionId: string, updates: Partial<ConversationSession>): Promise<void> {
    if (!this.ready) throw new Error('Storage not initialized');

    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const updatedSession = { ...session, ...updates, updatedAt: new Date() };

    await this.docClient.send(new PutCommand({
      TableName: this.config.tableName,
      Item: {
        PK: `SESSION#${sessionId}`,
        SK: `SESSION#${sessionId}`,
        type: 'session',
        id: sessionId,
        title: updatedSession.title,
        createdAt: updatedSession.createdAt.toISOString(),
        updatedAt: updatedSession.updatedAt.toISOString(),
        messageCount: updatedSession.messageCount,
        metadata: updatedSession.metadata ? JSON.stringify(updatedSession.metadata) : undefined
      }
    }));
  }

  async deleteMessage(messageId: string): Promise<void> {
    if (!this.ready) throw new Error('Storage not initialized');

    const message = await this.getMessage(messageId);
    if (!message) return;

    await this.docClient.send(new DeleteCommand({
      TableName: this.config.tableName,
      Key: {
        PK: `MESSAGE#${messageId}`,
        SK: `SESSION#${message.sessionId}`
      }
    }));

    // Update session message count
    await this.updateSessionInternal(message.sessionId);
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!this.ready) throw new Error('Storage not initialized');

    // Get all messages for this session
    const messages = await this.getMessages({ sessionId });

    // Delete all messages
    for (const message of messages.messages) {
      await this.docClient.send(new DeleteCommand({
        TableName: this.config.tableName,
        Key: {
          PK: `MESSAGE#${message.id}`,
          SK: `SESSION#${sessionId}`
        }
      }));
    }

    // Delete session
    await this.docClient.send(new DeleteCommand({
      TableName: this.config.tableName,
      Key: {
        PK: `SESSION#${sessionId}`,
        SK: `SESSION#${sessionId}`
      }
    }));
  }

  async getStats(): Promise<MemoryStats> {
    if (!this.ready) throw new Error('Storage not initialized');

    const sessions = await this.getSessions();
    const messages = await this.getMessages();

    const timestamps = messages.messages.map(m => m.timestamp.getTime());
    const oldestMessage = timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null;
    const newestMessage = timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null;
    
    const averageMessagesPerSession = sessions.length > 0 ? messages.total / sessions.length : 0;

    return {
      totalSessions: sessions.length,
      totalMessages: messages.total,
      oldestMessage,
      newestMessage,
      averageMessagesPerSession
    };
  }

  async clear(): Promise<void> {
    if (!this.ready) throw new Error('Storage not initialized');

    // Get all items
    const response = await this.docClient.send(new ScanCommand({
      TableName: this.config.tableName
    }));

    // Delete all items
    for (const item of response.Items || []) {
      await this.docClient.send(new DeleteCommand({
        TableName: this.config.tableName,
        Key: {
          PK: item.PK,
          SK: item.SK
        }
      }));
    }
  }

  isReady(): boolean {
    return this.ready;
  }

  private async updateSessionInternal(sessionId: string): Promise<void> {
    // Count messages for this session
    const messages = await this.getMessages({ sessionId });
    
    // Get or create session
    let session = await this.getSession(sessionId);
    if (!session) {
      session = {
        id: sessionId,
        createdAt: new Date(),
        updatedAt: new Date(),
        messageCount: 0
      };
    }

    // Update session
    await this.updateSession(sessionId, {
      messageCount: messages.total,
      updatedAt: new Date()
    });
  }
} 