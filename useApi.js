import { useCallback, useState, useRef } from 'react';

// ── Point to your NestJS backend ─────────────────────────────
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const STREAM_URL  = `${BASE_URL}/api/chat/stream`;
const CHAT_URL    = `${BASE_URL}/api/chat`;

export default function useApi() {
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  const sendMessage = useCallback(async ({
    model,
    messages,
    onChunk,
    onDone,
    onError,
  }) => {
    setLoading(true);
    abortRef.current = new AbortController();

    const body = JSON.stringify({ model, messages, stream: true });

    try {
      /* ── Try streaming first ───────────────────────────────── */
      const response = await fetch(STREAM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
        body,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || `HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (!trimmed.startsWith('data: ')) continue;

          try {
            const parsed = JSON.parse(trimmed.slice(6));

            // Check for server-side error forwarded in stream
            if (parsed.error) {
              throw new Error(parsed.error);
            }

            // Anthropic delta format
            const text = parsed?.delta?.text || '';
            if (text) {
              fullText += text;
              onChunk?.(fullText);
            }
          } catch (parseErr) {
            if (parseErr.message !== 'Unexpected end of JSON input') {
              throw parseErr;
            }
          }
        }
      }

      onDone?.(fullText);

    } catch (err) {
      if (err.name === 'AbortError') {
        // User stopped — not an error
        return;
      }

      /* ── Fallback: non-streaming ───────────────────────────── */
      try {
        const res = await fetch(CHAT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, messages }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || `HTTP ${res.status}`);
        }

        const text = data.content || 'No response received.';
        onChunk?.(text);
        onDone?.(text);

      } catch (fallbackErr) {
        onError?.(fallbackErr.message || 'Request failed. Is the backend running?');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
  }, []);

  return { loading, sendMessage, abort };
}
