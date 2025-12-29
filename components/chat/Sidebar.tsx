'use client';

import { Conversation, User } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/lib/auth-context';

interface SidebarProps {
  conversations: Conversation[];
  currentUser?: User;
  currentConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
}

export default function Sidebar({
  conversations,
  currentUser,
  currentConversation,
  onSelectConversation,
}: SidebarProps) {
  const { logout } = useAuth();

  const formatTimeAgo = (timestamp?: string) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: false })
        .replace('about ', '')
        .replace(' minutes', 'm')
        .replace(' minute', 'm')
        .replace(' hours', 'h')
        .replace(' hour', 'h')
        .replace(' days', 'd')
        .replace(' day', 'd');
    } catch {
      return '';
    }
  };

  return (
    <aside className="w-[340px] h-full bg-bg-elevated border-r border-border-subtle flex flex-col flex-shrink-0">
      {/* Sidebar Header */}
      <div className="p-5 border-b border-border-subtle">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-hover cursor-pointer transition-colors">
          <div className="relative w-11 h-11 flex-shrink-0">
            {currentUser?.avatar_url && (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.display_name}
                className="w-full h-full rounded-xl object-cover border-2 border-border-default"
              />
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success border-3 border-bg-elevated rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-semibold text-text-primary truncate tracking-tight">
              {currentUser?.display_name || 'Loading...'}
            </div>
            <div className="text-xs font-medium text-accent mt-0.5">
              {currentUser?.username || 'user'}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 mt-4">
          <button
            className="w-9 h-9 flex items-center justify-center bg-accent text-text-inverse rounded-lg hover:bg-accent-hover transition-all hover:-translate-y-px"
            title="New Conversation"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button
            className="w-9 h-9 flex items-center justify-center text-text-tertiary hover:bg-bg-hover hover:text-text-primary rounded-lg transition-colors"
            title="Settings"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
          <button
            onClick={logout}
            className="w-9 h-9 flex items-center justify-center text-text-tertiary hover:bg-bg-hover hover:text-red-400 rounded-lg transition-colors"
            title="Logout"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 mb-4">
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 bg-bg-surface border border-border-subtle rounded-xl text-sm text-text-primary placeholder-text-tertiary outline-none focus:border-accent focus:ring-3 focus:ring-accent/10 transition-all"
            placeholder="Search conversations..."
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-3">
        {conversations.map((conv: Conversation) => {
          const isActive = currentConversation?.id === conv.id;
          const isGroup = conv.type === 'group';
          const timeAgo = formatTimeAgo(conv.last_message?.timestamp);

          return (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv)}
              className={`flex items-center gap-3 p-3 mb-1 rounded-xl cursor-pointer transition-all relative ${
                isActive ? 'bg-bg-active' : 'hover:bg-bg-hover'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-accent rounded-r-sm" />
              )}
              
              <div className="relative w-11 h-11 flex-shrink-0">
                {isGroup ? (
                  <div className="w-full h-full bg-info/10 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                ) : conv.avatar_url ? (
                  <img
                    src={conv.avatar_url}
                    alt={conv.name}
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-accent/10 to-cream/10 rounded-xl flex items-center justify-center">
                    <svg className="w-5.5 h-5.5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                )}
                {conv.unread_count > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-error rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                    {conv.unread_count}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-0.5">
                  <span className="text-sm font-semibold text-text-primary truncate">
                    {conv.name}
                  </span>
                  <span className="text-[11px] text-text-tertiary flex-shrink-0 ml-2">
                    {timeAgo}
                  </span>
                </div>
                <p className={`text-[13px] truncate ${
                  conv.unread_count > 0 ? 'text-text-primary font-medium' : 'text-text-secondary'
                }`}>
                  {conv.last_message?.text || 'No messages yet'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 px-5 border-t border-border-subtle flex items-center justify-between">
        <span className="text-[11px] font-medium text-text-tertiary font-mono">
          Messenger v3.0.0
        </span>
        <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
          <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
          <span>Connected</span>
        </div>
      </div>
    </aside>
  );
}
