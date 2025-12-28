import { Conversation, Message, User, Attachment } from '@/types';

// In-memory storage (for demo purposes - in production use a database)
export const storage = {
  users: [
    {
      id: "U.001",
      username: "dan",
      display_name: "Dan",
      avatar_url: "https://api.dicebear.com/7.x/notionists/svg?seed=dan&backgroundColor=f5f5f5",
      status: "online" as const,
      last_seen: new Date().toISOString()
    },
    {
      id: "U.002",
      username: "alex",
      display_name: "Alex (Advisor)",
      avatar_url: "https://api.dicebear.com/7.x/notionists/svg?seed=alex&backgroundColor=e0e0e0",
      status: "online" as const,
      last_seen: new Date().toISOString()
    },
    {
      id: "U.003",
      username: "sarah",
      display_name: "Sarah (Designer)",
      avatar_url: "https://api.dicebear.com/7.x/notionists/svg?seed=sarah&backgroundColor=c8e6c9",
      status: "away" as const,
      last_seen: new Date(Date.now() - 3600000).toISOString()
    }
  ] as User[],
  conversations: [
    {
      id: "conv_001",
      type: "direct" as const,
      name: "Alex (Advisor)",
      avatar_url: "https://api.dicebear.com/7.x/notionists/svg?seed=alex&backgroundColor=e0e0e0",
      participants: ["U.001", "U.002"],
      last_message: {
        text: "Let's sync on the investor deck",
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        sender: "U.002"
      },
      unread_count: 0,
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: "conv_002",
      type: "direct" as const,
      name: "Sarah (Designer)",
      avatar_url: "https://api.dicebear.com/7.x/notionists/svg?seed=sarah&backgroundColor=c8e6c9",
      participants: ["U.001", "U.003"],
      last_message: {
        text: "The new mockups are ready!",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        sender: "U.003"
      },
      unread_count: 2,
      created_at: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: "conv_003",
      type: "group" as const,
      name: "UBL 2.0 Sprint",
      avatar_url: null,
      participants: ["U.001", "U.002", "U.003"],
      last_message: {
        text: "Policy VM bytecode tests passing",
        timestamp: new Date(Date.now() - 720000).toISOString(),
        sender: "U.001"
      },
      unread_count: 0,
      created_at: new Date(Date.now() - 259200000).toISOString()
    }
  ] as Conversation[],
  messages: [
    {
      id: "msg_001",
      conversation_id: "conv_001",
      sender_id: "U.002",
      text: "Hey Dan, do you have time this week to review the investor deck?",
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      status: "read" as const,
      type: "text" as const
    },
    {
      id: "msg_002",
      conversation_id: "conv_001",
      sender_id: "U.001",
      text: "Sure! How about Thursday afternoon?",
      timestamp: new Date(Date.now() - 12600000).toISOString(),
      status: "read" as const,
      type: "text" as const
    },
    {
      id: "msg_003",
      conversation_id: "conv_001",
      sender_id: "U.002",
      text: "Perfect! I'll send over the deck by Wednesday.",
      timestamp: new Date(Date.now() - 11800000).toISOString(),
      status: "read" as const,
      type: "text" as const
    },
    {
      id: "msg_004",
      conversation_id: "conv_001",
      sender_id: "U.002",
      text: "Let's sync on the investor deck",
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      status: "read" as const,
      type: "text" as const
    }
  ] as Message[],
  typing: {} as Record<string, Record<string, string>>
};

export function createTimestamp() {
  return new Date().toISOString();
}
