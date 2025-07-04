// Main exports
export { MemoryManager } from './MemoryManager';

// Storage implementations
export { LocalStorage } from './storage/LocalStorage';
export { S3Storage } from './storage/S3Storage';
export { DynamoDBStorage } from './storage/DynamoDBStorage';

// Interfaces
export { IMemoryStorage } from './interfaces/MemoryInterface';

// Types
export type {
  ConversationMessage,
  ConversationSession,
  MemoryConfig,
  LocalStorageConfig,
  S3StorageConfig,
  DynamoDBStorageConfig,
  MemoryQueryOptions,
  MemorySearchResult,
  MemoryStats
} from './types';

// Utility functions
export {
  createMemoryManager,
  createLocalMemoryManager,
  createS3MemoryManager,
  createDynamoDBMemoryManager,
  createMemoryManagerFromEnv
} from './utils/factory'; 