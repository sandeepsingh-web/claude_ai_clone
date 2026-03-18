import React, { useRef, useEffect } from 'react';
import styles from './ChatInput.module.css';

export default function ChatInput({ value, onChange, onSend, onStop, loading, disabled }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 180) + 'px';
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading && value.trim()) onSend();
    }
  };

  const canSend = value.trim() && !disabled;

  return (
    <div className={styles.wrap}>
      <div className={styles.container}>
        <div className={styles.inputBox}>
          {/* Attachment button */}
          <button className={styles.attachBtn} title="Attach file" disabled>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 7.5l-6 6a4 4 0 01-5.66-5.66l6.5-6.5a2.5 2.5 0 013.54 3.54L6.34 11a1 1 0 01-1.42-1.42L10 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Claude…"
            rows={1}
            disabled={disabled}
          />

          {/* Stop / Send button */}
          {loading ? (
            <button className={`${styles.sendBtn} ${styles.stopBtn}`} onClick={onStop}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="2" width="10" height="10" rx="2" fill="currentColor"/>
              </svg>
            </button>
          ) : (
            <button
              className={`${styles.sendBtn} ${canSend ? styles.active : ''}`}
              onClick={onSend}
              disabled={!canSend}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 12V2M2 7l5-5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>

        <p className={styles.notice}>
          Claude can make mistakes. Consider verifying important information.
        </p>
      </div>
    </div>
  );
}
