import React, { useState } from 'react';
import { MODELS, truncate } from '../utils/helpers';
import styles from './Sidebar.module.css';

export default function Sidebar({
  chats, activeChatId, onSelect, onNew, onDelete,
  model, onModelChange, theme, onThemeToggle,
}) {
  const [hoveredId, setHoveredId] = useState(null);

  const grouped = groupByDate(chats);

  return (
    <aside className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>C</div>
          <span className={styles.logoText}>Claude</span>
        </div>
        <button className={styles.themeBtn} onClick={onThemeToggle} title="Toggle theme">
          {theme === 'dark' ? '☀' : '☽'}
        </button>
      </div>

      {/* New Chat */}
      <div className={styles.newChatWrap}>
        <button className={styles.newChatBtn} onClick={onNew}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          New chat
        </button>
      </div>

      {/* Model selector */}
      <div className={styles.modelWrap}>
        <label className={styles.modelLabel}>Model</label>
        <select
          className={styles.modelSelect}
          value={model}
          onChange={e => onModelChange(e.target.value)}
        >
          {MODELS.map(m => (
            <option key={m.id} value={m.id}>{m.label} — {m.sub}</option>
          ))}
        </select>
      </div>

      {/* Chat list */}
      <div className={styles.chatList}>
        {chats.length === 0 ? (
          <div className={styles.empty}>No conversations yet</div>
        ) : (
          grouped.map(({ label, items }) => (
            <div key={label} className={styles.group}>
              <div className={styles.groupLabel}>{label}</div>
              {items.map(chat => (
                <div
                  key={chat.id}
                  className={`${styles.chatItem} ${chat.id === activeChatId ? styles.active : ''}`}
                  onClick={() => onSelect(chat.id)}
                  onMouseEnter={() => setHoveredId(chat.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <span className={styles.chatTitle}>
                    {chat.title || 'New conversation'}
                  </span>
                  {hoveredId === chat.id && (
                    <button
                      className={styles.deleteBtn}
                      onClick={e => { e.stopPropagation(); onDelete(chat.id); }}
                      title="Delete chat"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.userAvatar}>U</div>
        <span className={styles.userName}>You</span>
        <span className={styles.planBadge}>Free</span>
      </div>
    </aside>
  );
}

function groupByDate(chats) {
  const now = Date.now();
  const day = 86400000;
  const groups = { Today: [], Yesterday: [], 'Last 7 days': [], Older: [] };

  chats.forEach(c => {
    const age = now - (c.createdAt || now);
    if (age < day) groups['Today'].push(c);
    else if (age < 2 * day) groups['Yesterday'].push(c);
    else if (age < 7 * day) groups['Last 7 days'].push(c);
    else groups['Older'].push(c);
  });

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}
