import { MemoryManager } from '../MemoryManager';
import { MemoryConfig } from '../types';

/**
 * Create a memory manager with local file storage
 */
export function createLocalMemoryManager(filePath: string, options?: {
  encoding?: 'utf8' | 'utf16le' | 'latin1';
  prettyPrint?: boolean;
}): MemoryManager {
  const config: MemoryConfig = {
    type: 'local',
    options: {
      filePath,
      encoding: options?.encoding || 'utf8',
      prettyPrint: options?.prettyPrint || false
    }
  };

  return new MemoryManager(config);
}

/**
 * Create a memory manager with S3 storage
 */
export function createS3MemoryManager(bucketName: string, region: string, options?: {
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  prefix?: string;
  encryption?: 'AES256' | 'aws:kms';
}): MemoryManager {
  const config: MemoryConfig = {
    type: 's3',
    options: {
      bucketName,
      region,
      accessKeyId: options?.accessKeyId,
      secretAccessKey: options?.secretAccessKey,
      sessionToken: options?.sessionToken,
      prefix: options?.prefix || 'langchain-memory',
      encryption: options?.encryption
    }
  };

  return new MemoryManager(config);
}

/**
 * Create a memory manager with DynamoDB storage
 */
export function createDynamoDBMemoryManager(tableName: string, region: string, options?: {
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  endpoint?: string;
}): MemoryManager {
  const config: MemoryConfig = {
    type: 'dynamodb',
    options: {
      tableName,
      region,
      accessKeyId: options?.accessKeyId,
      secretAccessKey: options?.secretAccessKey,
      sessionToken: options?.sessionToken,
      endpoint: options?.endpoint
    }
  };

  return new MemoryManager(config);
}

/**
 * Create a memory manager from environment variables
 */
export function createMemoryManagerFromEnv(): MemoryManager {
  const storageType = process.env.MEMORY_STORAGE_TYPE || 'local';

  switch (storageType) {
    case 'local':
      return createLocalMemoryManager(
        process.env.MEMORY_FILE_PATH || './memory.json',
        {
          encoding: (process.env.MEMORY_FILE_ENCODING as any) || 'utf8',
          prettyPrint: process.env.MEMORY_FILE_PRETTY_PRINT === 'true'
        }
      );

    case 's3':
      if (!process.env.MEMORY_S3_BUCKET || !process.env.MEMORY_S3_REGION) {
        throw new Error('S3 storage requires MEMORY_S3_BUCKET and MEMORY_S3_REGION environment variables');
      }
      return createS3MemoryManager(
        process.env.MEMORY_S3_BUCKET,
        process.env.MEMORY_S3_REGION,
        {
          accessKeyId: process.env.MEMORY_S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.MEMORY_S3_SECRET_ACCESS_KEY,
          sessionToken: process.env.MEMORY_S3_SESSION_TOKEN,
          prefix: process.env.MEMORY_S3_PREFIX,
          encryption: (process.env.MEMORY_S3_ENCRYPTION as any)
        }
      );

    case 'dynamodb':
      if (!process.env.MEMORY_DYNAMODB_TABLE || !process.env.MEMORY_DYNAMODB_REGION) {
        throw new Error('DynamoDB storage requires MEMORY_DYNAMODB_TABLE and MEMORY_DYNAMODB_REGION environment variables');
      }
      return createDynamoDBMemoryManager(
        process.env.MEMORY_DYNAMODB_TABLE,
        process.env.MEMORY_DYNAMODB_REGION,
        {
          accessKeyId: process.env.MEMORY_DYNAMODB_ACCESS_KEY_ID,
          secretAccessKey: process.env.MEMORY_DYNAMODB_SECRET_ACCESS_KEY,
          sessionToken: process.env.MEMORY_DYNAMODB_SESSION_TOKEN,
          endpoint: process.env.MEMORY_DYNAMODB_ENDPOINT
        }
      );

    default:
      throw new Error(`Unsupported storage type: ${storageType}`);
  }
}

/**
 * Generic factory function
 */
export function createMemoryManager(config: MemoryConfig): MemoryManager {
  return new MemoryManager(config);
} 