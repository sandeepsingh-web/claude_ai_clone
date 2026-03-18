import { useState, useCallback } from 'react';
import { uid, truncate } from '../utils/helpers';

const LOCAL_KEY = 'claude_clone_chats';

function loadChats() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveChats(chats) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(chats)); } catch {}
}

export default function useChats() {
  const [chats, setChats] = useState(() => loadChats());
  const [activeChatId, setActiveChatId] = useState(null);

  const persist = useCallback((updater) => {
    setChats(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveChats(next);
      return next;
    });
  }, []);

  const newChat = useCallback(() => {
    const id = uid();
    persist(prev => [{ id, title: '', messages: [], createdAt: Date.now() }, ...prev]);
    setActiveChatId(id);
    return id;
  }, [persist]);

  const selectChat = useCallback((id) => setActiveChatId(id), []);

  const deleteChat = useCallback((id) => {
    persist(prev => prev.filter(c => c.id !== id));
    setActiveChatId(prev => prev === id ? null : prev);
  }, [persist]);

  const addMessage = useCallback((chatId, msg) => {
    persist(prev => prev.map(c =>
      c.id === chatId
        ? {
            ...c,
            title: c.title || truncate(
              c.messages.find(m => m.role === 'user')?.content || msg.content, 38
            ),
            messages: [...c.messages, msg],
          }
        : c
    ));
  }, [persist]);

  const updateMessage = useCallback((chatId, msgId, patch) => {
    persist(prev => prev.map(c =>
      c.id === chatId
        ? { ...c, messages: c.messages.map(m => m.id === msgId ? { ...m, ...patch } : m) }
        : c
    ));
  }, [persist]);

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  return {
    chats, activeChatId, activeChat,
    newChat, selectChat, deleteChat, addMessage, updateMessage,
    setActiveChatId,
  };
}
