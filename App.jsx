import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import useChats from './hooks/useChats';
import useTheme from './hooks/useTheme';
import useApi from './hooks/useApi';
import { uid, MODELS } from './utils/helpers';
import styles from './App.module.css';

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme();
  const [model, setModel] = useState(MODELS[1].id);
  const [input, setInput] = useState('');
  const {
    chats, activeChatId, activeChat,
    newChat, selectChat, deleteChat,
    addMessage, updateMessage, setActiveChatId,
  } = useChats();
  const { loading, sendMessage, abort } = useApi();

  const handleSend = useCallback(async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput('');

    // Ensure we have an active chat
    let chatId = activeChatId;
    if (!chatId || !chats.find(c => c.id === chatId)) {
      chatId = newChat();
    }

    const userMsg = { id: uid(), role: 'user', content, ts: Date.now() };
    const assistantMsg = { id: uid(), role: 'assistant', content: '', ts: Date.now() };

    addMessage(chatId, userMsg);
    addMessage(chatId, assistantMsg);

    const history = [
      ...(chats.find(c => c.id === chatId)?.messages || [])
        .filter(m => m.content)
        .map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content },
    ];

    await sendMessage({
      model,
      messages: history,
      onChunk: (text) => updateMessage(chatId, assistantMsg.id, { content: text }),
      onDone:  (text) => updateMessage(chatId, assistantMsg.id, { content: text }),
      onError: (err)  => updateMessage(chatId, assistantMsg.id, {
        content: `⚠️ Error: ${err}. Please try again.`,
      }),
    });
  }, [input, loading, activeChatId, chats, newChat, addMessage, updateMessage, sendMessage, model]);

  const handleNew = useCallback(() => {
    newChat();
    setInput('');
  }, [newChat]);

  return (
    <div className={styles.app}>
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelect={selectChat}
        onNew={handleNew}
        onDelete={deleteChat}
        model={model}
        onModelChange={setModel}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      <main className={styles.main}>
        <Header
          model={model}
          chatTitle={activeChat?.title || ''}
        />

        <div className={styles.chatArea}>
          <MessageList
            messages={activeChat?.messages || []}
            loading={loading}
            model={model}
            onSuggestion={handleSend}
          />

          <ChatInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            onStop={abort}
            loading={loading}
            disabled={false}
          />
        </div>
      </main>
    </div>
  );
}
