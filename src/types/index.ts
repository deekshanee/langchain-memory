export interface ConversationMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ConversationSession {
  id: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  metadata?: Record<string, any>;
}

export interface MemoryConfig {
  type: 'local' | 's3' | 'dynamodb';
  options: LocalStorageConfig | S3StorageConfig | DynamoDBStorageConfig;
}

export interface LocalStorageConfig {
  filePath: string;
  encoding?: 'utf8' | 'utf16le' | 'latin1';
  prettyPrint?: boolean;
}

export interface S3StorageConfig {
  bucketName: string;
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  prefix?: string;
  encryption?: 'AES256' | 'aws:kms';
}

export interface DynamoDBStorageConfig {
  tableName: string;
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  endpoint?: string;
}

export interface MemoryQueryOptions {
  sessionId?: string;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
  role?: 'user' | 'assistant' | 'system';
}

export interface MemorySearchResult {
  messages: ConversationMessage[];
  total: number;
  hasMore: boolean;
}

export interface MemoryStats {
  totalSessions: number;
  totalMessages: number;
  oldestMessage: Date | null;
  newestMessage: Date | null;
  averageMessagesPerSession: number;
} 