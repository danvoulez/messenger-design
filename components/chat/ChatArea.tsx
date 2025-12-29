'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { Conversation, Message, User } from '@/types';
import { format } from 'date-fns';

interface ChatAreaProps {
  conversation: Conversation | null;
  currentUser?: User;
  websocket: WebSocket | null;
  onMessageSent: () => void;
}

const fetcher = async (url: string) => {
  const token = localStorage.getItem('ubl_session_token');
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.json();
};

export default function ChatArea({
  conversation,
  currentUser,
  websocket,
  onMessageSent,
}: ChatAreaProps) {
  const [messageText, setMessageText] = useState('');
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messagesData, mutate: mutateMessages } = useSWR(
    conversation ? `/api/v1/conversations/${conversation.id}/messages` : null,
    fetcher
  );

  const messages = messagesData?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!websocket) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_message' && conversation && data.message?.conversation_id === conversation.id) {
        mutateMessages();
      }
    };

    websocket.addEventListener('message', handleMessage);
    return () => websocket.removeEventListener('message', handleMessage);
  }, [websocket, conversation, mutateMessages]);

  const handleSend = async () => {
    if (!conversation || !messageText.trim()) return;

    try {
      const token = localStorage.getItem('ubl_session_token');
      const response = await fetch(`/api/v1/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text: messageText.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessageText('');
        mutateMessages();
        onMessageSent();

        // Broadcast via WebSocket
        if (websocket && websocket.readyState === WebSocket.OPEN) {
          websocket.send(JSON.stringify({
            type: 'message',
            message: data.message,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = () => {
    if (!websocket || !conversation) return;

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    if (websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({
        type: 'typing',
        conversation_id: conversation.id,
        is_typing: true,
      }));
    }

    const timeout = setTimeout(() => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          type: 'typing',
          conversation_id: conversation.id,
          is_typing: false,
        }));
      }
    }, 3000);

    setTypingTimeout(timeout);
  };

  if (!conversation) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-bg-base p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-accent/10 to-cream/10 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(224,122,95,0.25)]">
          <svg className="w-9 h-9 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <h2 className="text-[28px] font-light text-text-primary tracking-tight mb-2">
          Welcome to <strong className="text-cream font-medium">UBL Messenger</strong>
        </h2>
        <p className="text-[15px] text-text-secondary max-w-md leading-relaxed">
          Select a conversation from the sidebar to start messaging
        </p>
      </main>
    );
  }

  const isGroup = conversation.type === 'group';

  return (
    <main className="flex-1 flex flex-col bg-bg-base">
      {/* Chat Header */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-border-subtle bg-bg-elevated flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent/10 to-cream/10 rounded-xl flex items-center justify-center">
              {isGroup ? (
                <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-text-primary tracking-tight">
                {conversation.name}
              </h2>
              <p className="text-xs text-text-secondary flex items-center gap-2 mt-0.5">
                {isGroup ? (
                  `${conversation.participants.length} participants`
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 bg-success rounded-full" />
                    Online
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 flex items-center justify-center text-text-tertiary hover:bg-bg-hover hover:text-text-primary rounded-lg transition-colors" title="Voice Call">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-text-tertiary hover:bg-bg-hover hover:text-text-primary rounded-lg transition-colors" title="Video Call">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-text-tertiary hover:bg-bg-hover hover:text-text-primary rounded-lg transition-colors" title="More">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {messages.map((msg: Message) => {
          const isOutgoing = msg.sender_id === currentUser?.id;
          const time = format(new Date(msg.timestamp), 'h:mm a');

          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[65%] animate-fade-in ${
                isOutgoing ? 'self-end' : 'self-start'
              }`}
            >
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  isOutgoing
                    ? 'bg-accent text-text-inverse rounded-br-lg'
                    : 'bg-bg-surface text-text-primary border border-border-subtle rounded-bl-lg'
                }`}
              >
                {msg.text}
              </div>
              <div className={`flex items-center gap-2 mt-1 px-1 ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                <span className="text-[11px] text-text-tertiary">{time}</span>
                {isOutgoing && (
                  <span className={`text-xs ${msg.status === 'read' ? 'text-info' : 'text-text-tertiary'}`}>
                    {msg.status === 'read' ? '✓✓' : '✓'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 px-6 bg-bg-elevated border-t border-border-subtle">
        <div className="flex items-end gap-3 bg-bg-surface border border-border-default rounded-2xl p-3 focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/10 transition-all">
          <div className="flex gap-1">
            <button className="w-9 h-9 flex items-center justify-center text-text-tertiary hover:bg-bg-hover hover:text-text-primary rounded-lg transition-colors" title="Attach File">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
            </button>
            <button className="w-9 h-9 flex items-center justify-center text-text-tertiary hover:bg-bg-hover hover:text-text-primary rounded-lg transition-colors" title="Emoji">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>
            </button>
          </div>
          
          <textarea
            className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary resize-none min-h-[24px] max-h-[120px] leading-relaxed font-sans placeholder-text-tertiary"
            placeholder="Type a message..."
            rows={1}
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
          />
          
          <button
            onClick={handleSend}
            disabled={!messageText.trim()}
            className="w-9 h-9 bg-accent text-text-inverse rounded-xl flex items-center justify-center hover:bg-accent-hover transition-all hover:-translate-y-px disabled:bg-bg-hover disabled:text-text-tertiary disabled:cursor-not-allowed disabled:hover:translate-y-0 flex-shrink-0"
            title="Send Message"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
}
