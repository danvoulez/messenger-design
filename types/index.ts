export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  name: string;
  size: number;
  mimeType?: string;
}

export interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  status: 'online' | 'away' | 'offline';
  last_seen: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name: string;
  avatar_url?: string | null;
  participants: string[];
  last_message?: {
    text: string;
    timestamp: string;
    sender: string;
  };
  unread_count: number;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  type: 'text';
  attachments?: Attachment[];
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface WSMessage {
  type: 'authenticate' | 'authenticated' | 'message' | 'new_message' | 'typing' | 'read_receipt';
  userId?: string;
  message?: Message;
  conversation_id?: string;
  is_typing?: boolean;
  message_id?: string;
  timestamp?: string;
}
