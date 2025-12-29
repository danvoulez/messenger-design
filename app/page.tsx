'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Conversation } from '@/types';
import Sidebar from '@/components/chat/Sidebar';
import ChatArea from '@/components/chat/ChatArea';
import { useAuth } from '@/lib/auth-context';

const fetcher = async (url: string) => {
  const token = localStorage.getItem('ubl_session_token');
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  
  if (response.status === 401) {
    throw new Error('Unauthorized');
  }
  
  return response.json();
};

export default function MessengerPage() {
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const { data: conversationsData, mutate: mutateConversations } = useSWR(
    isAuthenticated ? '/api/v1/conversations' : null,
    fetcher,
    { 
      refreshInterval: 5000,
      onError: (error) => {
        if (error.message === 'Unauthorized') {
          router.push('/login');
        }
      }
    }
  );
  
  const { data: userData } = useSWR(
    isAuthenticated ? '/api/v1/users/me' : null,
    fetcher
  );
  
  const conversations = conversationsData?.conversations || [];
  const currentUser = userData?.user;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // WebSocket connection
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const token = localStorage.getItem('ubl_session_token');
    if (!token) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log('🔌 WebSocket connected');
      websocket.send(JSON.stringify({
        type: 'authenticate',
        userId: user.id,
        token,
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
  }, [isAuthenticated, user, mutateConversations]);

  const handleSelectConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    
    // Mark as read
    if (conversation.unread_count > 0) {
      const token = localStorage.getItem('ubl_session_token');
      fetch(`/api/v1/conversations/${conversation.id}/read`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).then(() => {
        mutateConversations();
      });
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen bg-bg-base items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-light to-accent-default rounded-3xl shadow-glow mb-4 animate-pulse">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

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
