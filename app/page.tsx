'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Conversation, Message, User } from '@/types';
import Sidebar from '@/components/chat/Sidebar';
import ChatArea from '@/components/chat/ChatArea';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MessengerPage() {
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  
  const { data: conversationsData, mutate: mutateConversations } = useSWR(
    '/api/v1/conversations',
    fetcher,
    { refreshInterval: 5000 }
  );
  
  const { data: userData } = useSWR(
    '/api/v1/users/me',
    fetcher
  );
  
  const conversations = conversationsData?.conversations || [];
  const currentUser = userData?.user;

  // WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log('🔌 WebSocket connected');
      websocket.send(JSON.stringify({
        type: 'authenticate',
        userId: 'U.001'
      }));
    };
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('📨 WebSocket message:', data.type);
      
      if (data.type === 'new_message' || data.type === 'message') {
        mutateConversations();
      }
    };
    
    websocket.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };
    
    websocket.onclose = () => {
      console.log('📴 WebSocket disconnected');
    };
    
    setWs(websocket);
    
    return () => {
      websocket.close();
    };
  }, [mutateConversations]);

  const handleSelectConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    
    // Mark as read
    if (conversation.unread_count > 0) {
      fetch(`/api/v1/conversations/${conversation.id}/read`, {
        method: 'POST'
      }).then(() => {
        mutateConversations();
      });
    }
  };

  return (
    <div className="flex h-screen w-screen bg-bg-base">
      <Sidebar
        conversations={conversations}
        currentUser={currentUser}
        currentConversation={currentConversation}
        onSelectConversation={handleSelectConversation}
      />
      <ChatArea
        conversation={currentConversation}
        currentUser={currentUser}
        websocket={ws}
        onMessageSent={mutateConversations}
      />
    </div>
  );
}
