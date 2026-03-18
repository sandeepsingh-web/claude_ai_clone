import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { SUGGESTIONS } from '../utils/helpers';
import styles from './MessageList.module.css';

export default function MessageList({ messages, loading, model, onSuggestion }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (messages.length === 0) {
    return <EmptyState model={model} onSuggestion={onSuggestion} />;
  }

  return (
    <div className={styles.list}>
      <div className={styles.inner}>
        {messages.map((msg, i) => (
          <Message key={msg.id || i} msg={msg} isLast={i === messages.length - 1} loading={loading} />
        ))}
        <div ref={bottomRef} style={{ height: 1 }} />
      </div>
    </div>
  );
}

function EmptyState({ model, onSuggestion }) {
  const modelName = {
    'claude-opus-4-5': 'Claude Opus',
    'claude-sonnet-4-5': 'Claude Sonnet',
    'claude-haiku-4-5-20251001': 'Claude Haiku',
  }[model] || 'Claude';

  return (
    <div className={styles.empty}>
      <div className={styles.emptyInner}>
        <div className={styles.emptyIcon}>C</div>
        <h1 className={styles.emptyTitle}>How can I help you today?</h1>
        <p className={styles.emptySub}>{modelName} · Ready to assist</p>
        <div className={styles.suggestions}>
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              className={styles.suggestionBtn}
              onClick={() => onSuggestion(s.text)}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <span className={styles.suggestionIcon}>{s.icon}</span>
              {s.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Message({ msg, isLast, loading }) {
  const isUser = msg.role === 'user';
  const isStreaming = isLast && !isUser && loading && msg.content;
  const isEmpty = isLast && !isUser && loading && !msg.content;

  return (
    <div className={`${styles.message} ${isUser ? styles.user : styles.assistant}`}>
      {!isUser && (
        <div className={styles.avatar}>C</div>
      )}
      <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}>
        {isEmpty ? (
          <TypingDots />
        ) : isUser ? (
          <span className={styles.userText}>{msg.content}</span>
        ) : (
          <div className={`${styles.markdown} ${isStreaming ? styles.streaming : ''}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <CodeBlock language={match[1]} value={String(children).replace(/\n$/, '')} />
                  ) : (
                    <code className={styles.inlineCode} {...props}>{children}</code>
                  );
                },
                a({ href, children }) {
                  return <a href={href} target="_blank" rel="noopener noreferrer" className={styles.link}>{children}</a>;
                },
              }}
            >
              {msg.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

function CodeBlock({ language, value }) {
  const [copied, setCopied] = React.useState(false);

  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeHeader}>
        <span className={styles.codeLang}>{language}</span>
        <button className={styles.copyBtn} onClick={copy}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: '0 0 8px 8px',
          fontSize: '13px',
          lineHeight: '1.6',
          background: '#1a1a1a',
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

function TypingDots() {
  return (
    <span className={styles.typingDots}>
      <span className={styles.dot} style={{ animationDelay: '0s' }} />
      <span className={styles.dot} style={{ animationDelay: '0.18s' }} />
      <span className={styles.dot} style={{ animationDelay: '0.36s' }} />
    </span>
  );
}
