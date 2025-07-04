import { 
  ConversationMessage, 
  ConversationSession, 
  MemoryQueryOptions, 
  MemorySearchResult, 
  MemoryStats 
} from '../types';

export interface IMemoryStorage {
  /**
   * Initialize the storage system
   */
  initialize(): Promise<void>;

  /**
   * Save a message to storage
   */
  saveMessage(message: ConversationMessage): Promise<void>;

  /**
   * Save multiple messages to storage
   */
  saveMessages(messages: ConversationMessage[]): Promise<void>;

  /**
   * Get messages based on query options
   */
  getMessages(options?: MemoryQueryOptions): Promise<MemorySearchResult>;

  /**
   * Get a specific message by ID
   */
  getMessage(messageId: string): Promise<ConversationMessage | null>;

  /**
   * Get all sessions
   */
  getSessions(): Promise<ConversationSession[]>;

  /**
   * Get a specific session by ID
   */
  getSession(sessionId: string): Promise<ConversationSession | null>;

  /**
   * Update session metadata
   */
  updateSession(sessionId: string, updates: Partial<ConversationSession>): Promise<void>;

  /**
   * Delete a message
   */
  deleteMessage(messageId: string): Promise<void>;

  /**
   * Delete a session and all its messages
   */
  deleteSession(sessionId: string): Promise<void>;

  /**
   * Get storage statistics
   */
  getStats(): Promise<MemoryStats>;

  /**
   * Clear all data
   */
  clear(): Promise<void>;

  /**
   * Check if storage is ready
   */
  isReady(): boolean;
} 