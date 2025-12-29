import { Conversation, Message, User } from '@/types';

// Extended User type with tenant support
export interface TenantUser extends User {
  tenantId: string;
}

// Extended Conversation type with tenant support
export interface TenantConversation extends Conversation {
  tenantId: string;
}

// Extended Message type with tenant support
export interface TenantMessage extends Message {
  tenantId: string;
}

// In-memory storage (for demo purposes - in production use a database)
export const storage = {
  users: [] as TenantUser[],
  conversations: [] as TenantConversation[],
  messages: [] as TenantMessage[],
  typing: {} as Record<string, Record<string, string>>,

  // User methods
  createUser(user: Omit<TenantUser, 'last_seen'>): TenantUser {
    const newUser: TenantUser = {
      ...user,
      last_seen: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  },

  getUser(userId: string, tenantId: string): TenantUser | undefined {
    return this.users.find((u) => u.id === userId && u.tenantId === tenantId);
  },

  getUserByUsername(username: string, tenantId: string): TenantUser | undefined {
    return this.users.find((u) => u.username === username && u.tenantId === tenantId);
  },

  getUsers(tenantId: string): TenantUser[] {
    return this.users.filter((u) => u.tenantId === tenantId);
  },

  updateUserStatus(userId: string, tenantId: string, status: User['status']): void {
    const user = this.getUser(userId, tenantId);
    if (user) {
      user.status = status;
      user.last_seen = new Date().toISOString();
    }
  },

  // Conversation methods
  createConversation(conversation: TenantConversation): TenantConversation {
    this.conversations.push(conversation);
    return conversation;
  },

  getConversation(conversationId: string, tenantId: string): TenantConversation | undefined {
    return this.conversations.find((c) => c.id === conversationId && c.tenantId === tenantId);
  },

  getConversations(tenantId: string, userId?: string): TenantConversation[] {
    let conversations = this.conversations.filter((c) => c.tenantId === tenantId);
    if (userId) {
      conversations = conversations.filter((c) => c.participants.includes(userId));
    }
    return conversations;
  },

  updateConversationLastMessage(
    conversationId: string,
    tenantId: string,
    lastMessage: { text: string; timestamp: string; sender: string }
  ): void {
    const conversation = this.getConversation(conversationId, tenantId);
    if (conversation) {
      conversation.last_message = lastMessage;
    }
  },

  markConversationAsRead(conversationId: string, tenantId: string): void {
    const conversation = this.getConversation(conversationId, tenantId);
    if (conversation) {
      conversation.unread_count = 0;
    }
  },

  incrementUnreadCount(conversationId: string, tenantId: string): void {
    const conversation = this.getConversation(conversationId, tenantId);
    if (conversation) {
      conversation.unread_count = (conversation.unread_count || 0) + 1;
    }
  },

  // Message methods
  createMessage(message: TenantMessage): TenantMessage {
    this.messages.push(message);
    return message;
  },

  getMessages(conversationId: string, tenantId: string, limit?: number): TenantMessage[] {
    let messages = this.messages.filter(
      (m) => m.conversation_id === conversationId && m.tenantId === tenantId
    );
    
    messages = messages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    if (limit) {
      messages = messages.slice(-limit);
    }

    return messages;
  },
};

export function createTimestamp() {
  return new Date().toISOString();
}
