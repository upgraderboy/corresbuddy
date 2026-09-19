import React, { useEffect, useState, useRef } from 'react';
import Icon from '../common/Icon';
import { PageHead, Avatar, Empty } from '../common/CommonUI';
import { chatApi } from '../../services/api';
import { useSocket } from '../../context/SocketContext';

export function ChatScreen({ user, screenData }) {
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const bodyRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await chatApi.listConversations();
        if (res.data.success && res.data.conversations.length > 0) {
          setConversations(res.data.conversations);

          // If navigated with specific participantId
          if (screenData?.participantId) {
            const existing = res.data.conversations.find(
              (c) => c.participantId === screenData.participantId
            );
            if (existing) {
              setActiveId(existing.id);
            } else {
              // Open new conversation
              const openRes = await chatApi.openConversation({
                participantId: screenData.participantId,
              });
              if (openRes.data.success) {
                setActiveId(openRes.data.conversation.id);
                // Reload
                const updated = await chatApi.listConversations();
                setConversations(updated.data.conversations);
              }
            }
          } else {
            setActiveId(res.data.conversations[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setLoading(false);
      }
    };
    loadConversations();
  }, [screenData?.participantId]);

  // Fetch messages and join conversation room on socket
  useEffect(() => {
    if (!activeId) return;

    const loadMessages = async () => {
      try {
        const res = await chatApi.getMessages(activeId);
        if (res.data.success) {
          setMessages(res.data.messages);
          await chatApi.markRead(activeId);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };
    loadMessages();

    if (socket) {
      socket.emit('join_conversation', { conversationId: activeId });
    }
  }, [activeId, socket]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (msg.conversationId === activeId) {
        setMessages((prev) => [...prev, { ...msg, me: false }]);
        socket.emit('message_read', { conversationId: activeId });
      }
    };

    const handleMessageSent = (msg) => {
      if (msg.conversationId === activeId) {
        setMessages((prev) => [...prev, { ...msg, me: true }]);
      }
    };

    const handleUserTyping = ({ conversationId, typing }) => {
      if (conversationId === activeId) {
        setTypingUser(typing ? 'Typing' : null);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_sent', handleMessageSent);
    socket.on('user_typing', handleUserTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_sent', handleMessageSent);
      socket.off('user_typing', handleUserTyping);
    };
  }, [socket, activeId]);

  // Auto scroll to bottom
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, typingUser]);

  const handleInputChange = (e) => {
    setDraft(e.target.value);

    if (socket && activeId) {
      socket.emit('typing_start', { conversationId: activeId });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', { conversationId: activeId });
      }, 1500);
    }
  };

  const handleSend = () => {
    if (!draft.trim() || !activeId) return;

    if (socket) {
      socket.emit('send_message', {
        conversationId: activeId,
        content: draft.trim(),
      });
      socket.emit('typing_stop', { conversationId: activeId });
    }

    setDraft('');
  };

  const activeConv = conversations.find((c) => c.id === activeId) || {
    name: 'Priya Menon',
    role: 'Your Corres',
  };

  return (
    <div>
      <PageHead title="Chat" subhead="Direct line to your assigned Corres." />

      <div className="chat-shell">
        {/* Conversation List */}
        <div className="conv-list">
          {conversations.length === 0 ? (
            <div style={{ padding: 20, color: 'var(--text-600)', fontSize: 13 }}>
              No active conversations yet.
            </div>
          ) : (
            conversations.map((c) => (
              <div
                className={`conv-item ${c.id === activeId ? 'active' : ''}`}
                key={c.id}
                onClick={() => setActiveId(c.id)}
              >
                <Avatar initials={c.initials || 'PM'} size={40} tone="var(--ink-900)" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="conv-name">{c.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-400)' }}>{c.time}</span>
                  </div>
                  <div className="conv-preview">{c.last}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Chat Window */}
        <div className="chat-window">
          <div className="chat-head">
            <Avatar
              initials={activeConv.initials || activeConv.name.slice(0, 2).toUpperCase()}
              size={38}
              tone="var(--ink-900)"
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>{activeConv.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-600)' }}>
                {activeConv.role || 'Your Corres'}
              </div>
            </div>
          </div>

          <div className="chat-body" ref={bodyRef}>
            {messages.length === 0 ? (
              <Empty
                icon="message"
                title="Start a conversation with your Corres."
                body="Say hello — they were assigned to help."
              />
            ) : (
              messages.map((m, i) => (
                <div key={m.id || i} className={`bubble ${m.me ? 'me' : 'them'}`}>
                  {m.text || m.content}
                  <div className="bubble-time">{m.time}</div>
                </div>
              ))
            )}

            {typingUser && (
              <div className="typing-row">{activeConv.name.split(' ')[0]} is typing…</div>
            )}
          </div>

          <div className="chat-input">
            <input
              placeholder="Type a message..."
              value={draft}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              className="btn btn-primary"
              style={{
                borderRadius: 99,
                width: 42,
                height: 42,
                padding: 0,
                justifyContent: 'center',
              }}
              onClick={handleSend}
              aria-label="Send message"
            >
              <Icon name="send" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatScreen;

