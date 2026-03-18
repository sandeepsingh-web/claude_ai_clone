import { useState, useRef, useEffect, useCallback } from "react";

const MODELS = [
  { id: "claude-opus-4-5", label: "Claude Opus", sub: "Most powerful" },
  { id: "claude-sonnet-4-5", label: "Claude Sonnet", sub: "Balanced" },
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku", sub: "Fastest" },
];

const SUGGESTIONS = [
  "Explain quantum entanglement simply",
  "Write a poem about monsoon rain",
  "Help me debug my React code",
  "Plan a 3-day trip to Udaipur",
];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function TypingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center", height: 20 }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: "50%", background: "#8b8b8b",
          animation: "bounce 1.2s infinite",
          animationDelay: `${i * 0.2}s`,
          display: "inline-block"
        }} />
      ))}
    </span>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 20,
      gap: 12,
      alignItems: "flex-start",
      animation: "fadeUp 0.25s ease"
    }}>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "linear-gradient(135deg, #cc785c, #d4a57a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, fontSize: 14, color: "#fff", fontWeight: 600, marginTop: 2
        }}>C</div>
      )}
      <div style={{
        maxWidth: "72%",
        background: isUser ? "#2f2f2f" : "transparent",
        borderRadius: isUser ? "18px 18px 4px 18px" : 0,
        padding: isUser ? "12px 16px" : "4px 0",
        fontSize: 15, lineHeight: 1.7,
        color: isUser ? "#f0f0f0" : "#e8e8e8",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}>
        {msg.content || <TypingDots />}
      </div>
    </div>
  );
}

function Sidebar({ chats, activeChatId, onSelectChat, onNewChat, dark, onToggleDark, model, onModelChange }) {
  return (
    <div style={{
      width: 260, flexShrink: 0,
      background: dark ? "#171717" : "#f0ede8",
      borderRight: `1px solid ${dark ? "#2a2a2a" : "#ddd"}`,
      display: "flex", flexDirection: "column",
      height: "100vh", overflow: "hidden",
      transition: "background 0.2s"
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 16px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "linear-gradient(135deg, #cc785c, #d4a57a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, color: "#fff", fontWeight: 700
        }}>C</div>
        <span style={{ fontWeight: 600, fontSize: 15, color: dark ? "#e8e8e8" : "#1a1a1a", letterSpacing: "-0.3px" }}>Claude</span>
        <button onClick={onToggleDark} style={{
          marginLeft: "auto", background: "none", border: "none", cursor: "pointer",
          fontSize: 16, color: dark ? "#aaa" : "#666", padding: 4, borderRadius: 6,
          transition: "background 0.15s"
        }} title="Toggle dark mode">{dark ? "☀️" : "🌙"}</button>
      </div>

      {/* New Chat */}
      <div style={{ padding: "0 10px 12px" }}>
        <button onClick={onNewChat} style={{
          width: "100%", padding: "9px 14px", borderRadius: 10,
          background: dark ? "#2a2a2a" : "#e5e0d9",
          border: `1px solid ${dark ? "#3a3a3a" : "#ccc"}`,
          color: dark ? "#d0d0d0" : "#333", fontSize: 13, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8, fontWeight: 500,
          transition: "background 0.15s"
        }}>
          <span style={{ fontSize: 17 }}>✏️</span> New chat
        </button>
      </div>

      {/* Model selector */}
      <div style={{ padding: "0 10px 16px" }}>
        <select value={model} onChange={e => onModelChange(e.target.value)} style={{
          width: "100%", padding: "8px 12px", borderRadius: 10,
          background: dark ? "#1e1e1e" : "#e8e3db",
          border: `1px solid ${dark ? "#333" : "#ccc"}`,
          color: dark ? "#ccc" : "#333", fontSize: 12, cursor: "pointer",
          outline: "none"
        }}>
          {MODELS.map(m => (
            <option key={m.id} value={m.id}>{m.label} — {m.sub}</option>
          ))}
        </select>
      </div>

      <div style={{ padding: "0 12px 6px" }}>
        <span style={{ fontSize: 11, color: dark ? "#555" : "#999", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.6px" }}>Recents</span>
      </div>

      {/* Chat list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 6px" }}>
        {chats.map(chat => (
          <div key={chat.id} onClick={() => onSelectChat(chat.id)} style={{
            padding: "9px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 2,
            background: activeChatId === chat.id
              ? (dark ? "#2f2f2f" : "#ddd8d0")
              : "transparent",
            color: dark ? "#ccc" : "#444",
            fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            transition: "background 0.12s",
          }}>
            {chat.title || "New conversation"}
          </div>
        ))}
        {chats.length === 0 && (
          <div style={{ padding: "12px", fontSize: 12, color: dark ? "#555" : "#aaa", textAlign: "center" }}>
            No chats yet
          </div>
        )}
      </div>

      {/* User footer */}
      <div style={{
        padding: "12px 14px", borderTop: `1px solid ${dark ? "#2a2a2a" : "#ddd"}`,
        display: "flex", alignItems: "center", gap: 10
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          background: dark ? "#3a3a3a" : "#c8c0b4",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, color: dark ? "#ccc" : "#555", fontWeight: 600
        }}>U</div>
        <span style={{ fontSize: 13, color: dark ? "#888" : "#666", flex: 1 }}>You</span>
      </div>
    </div>
  );
}

export default function App() {
  const [dark, setDark] = useState(true);
  const [model, setModel] = useState(MODELS[1].id);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const activeChat = chats.find(c => c.id === activeChatId);
  const messages = activeChat?.messages || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const createNewChat = useCallback(() => {
    const id = generateId();
    setChats(prev => [{ id, title: "", messages: [] }, ...prev]);
    setActiveChatId(id);
    setInput("");
  }, []);

  useEffect(() => {
    createNewChat();
  }, []);

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput("");

    let chatId = activeChatId;
    let isNewChat = false;

    if (!chatId || !chats.find(c => c.id === chatId)) {
      chatId = generateId();
      isNewChat = true;
    }

    const userMsg = { role: "user", content, id: generateId() };
    const assistantMsg = { role: "assistant", content: "", id: generateId() };

    setChats(prev => {
      const existing = prev.find(c => c.id === chatId);
      if (existing) {
        return prev.map(c => c.id === chatId
          ? {
            ...c,
            title: c.title || content.slice(0, 36) + (content.length > 36 ? "…" : ""),
            messages: [...c.messages, userMsg, assistantMsg]
          }
          : c
        );
      } else {
        return [{
          id: chatId,
          title: content.slice(0, 36) + (content.length > 36 ? "…" : ""),
          messages: [userMsg, assistantMsg]
        }, ...prev];
      }
    });

    if (isNewChat) setActiveChatId(chatId);
    setLoading(true);

    try {
      const currentMessages = (chats.find(c => c.id === chatId)?.messages || [])
        .filter(m => m.role === "user" || (m.role === "assistant" && m.content));
      const apiMessages = [...currentMessages, userMsg].map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          messages: apiMessages,
        }),
      });

      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't get a response.";

      setChats(prev => prev.map(c => c.id === chatId
        ? { ...c, messages: c.messages.map(m => m.id === assistantMsg.id ? { ...m, content: reply } : m) }
        : c
      ));
    } catch (e) {
      setChats(prev => prev.map(c => c.id === chatId
        ? { ...c, messages: c.messages.map(m => m.id === assistantMsg.id ? { ...m, content: "⚠️ Failed to get a response. Please try again." } : m) }
        : c
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const bg = dark ? "#212121" : "#faf8f5";
  const inputBg = dark ? "#2f2f2f" : "#f0ede8";
  const textColor = dark ? "#e8e8e8" : "#1a1a1a";
  const placeholderColor = dark ? "#666" : "#aaa";

  return (
    <div style={{ display: "flex", height: "100vh", background: bg, fontFamily: "'Georgia', serif", overflow: "hidden" }}>
      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        textarea::placeholder { color: ${placeholderColor}; }
        textarea { color: ${textColor}; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
        select option { background: ${dark ? "#1e1e1e" : "#fff"}; }
      `}</style>

      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={createNewChat}
        dark={dark}
        onToggleDark={() => setDark(d => !d)}
        model={model}
        onModelChange={setModel}
      />

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 0" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>

            {messages.length === 0 ? (
              <div style={{ textAlign: "center", paddingTop: 80 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: "linear-gradient(135deg, #cc785c, #d4a57a)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px", fontSize: 22, color: "#fff", fontWeight: 700
                }}>C</div>
                <div style={{ fontSize: 26, fontWeight: 600, color: textColor, marginBottom: 8 }}>
                  How can I help you today?
                </div>
                <div style={{ fontSize: 14, color: dark ? "#666" : "#999", marginBottom: 40 }}>
                  {MODELS.find(m => m.id === model)?.label} · {MODELS.find(m => m.id === model)?.sub}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 480, margin: "0 auto" }}>
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => sendMessage(s)} style={{
                      padding: "12px 14px", borderRadius: 12, textAlign: "left",
                      background: dark ? "#2a2a2a" : "#ede8e1",
                      border: `1px solid ${dark ? "#333" : "#d8d2c8"}`,
                      color: dark ? "#ccc" : "#444", fontSize: 13, cursor: "pointer",
                      transition: "background 0.15s", lineHeight: 1.4
                    }}>{s}</button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <MessageBubble key={msg.id || i} msg={msg} />
              ))
            )}

            {loading && messages.at(-1)?.role !== "assistant" && (
              <MessageBubble msg={{ role: "assistant", content: "" }} />
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div style={{ padding: "12px 24px 20px", background: bg }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{
              display: "flex", alignItems: "flex-end", gap: 10,
              background: inputBg,
              border: `1px solid ${dark ? "#3a3a3a" : "#d8d2c8"}`,
              borderRadius: 16, padding: "10px 12px",
              transition: "border-color 0.2s",
              boxShadow: dark ? "0 0 0 1px transparent" : "0 1px 4px rgba(0,0,0,0.06)"
            }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px"; }}
                onKeyDown={handleKeyDown}
                placeholder="Message Claude…"
                rows={1}
                style={{
                  flex: 1, resize: "none", border: "none", outline: "none",
                  background: "transparent", fontSize: 15, lineHeight: 1.6,
                  fontFamily: "'Georgia', serif", minHeight: 28, maxHeight: 160,
                  overflow: "auto"
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                style={{
                  width: 34, height: 34, borderRadius: 10, border: "none",
                  background: input.trim() && !loading ? "#cc785c" : (dark ? "#3a3a3a" : "#d0c8be"),
                  color: input.trim() && !loading ? "#fff" : (dark ? "#555" : "#aaa"),
                  cursor: input.trim() && !loading ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, transition: "background 0.2s, color 0.2s", flexShrink: 0
                }}>
                ↑
              </button>
            </div>
            <div style={{ fontSize: 11, color: dark ? "#444" : "#bbb", textAlign: "center", marginTop: 8 }}>
              Claude can make mistakes. Consider checking important information.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
