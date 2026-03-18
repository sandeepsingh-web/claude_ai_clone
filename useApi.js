import { useCallback, useState } from 'react';

const API_URL = 'https://api.anthropic.com/v1/messages';
const API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY || '';

export default function useApi() {
  const [loading, setLoading] = useState(false);
  const abortRef = { current: null };

  const sendMessage = useCallback(async ({ model, messages, onChunk, onDone, onError }) => {
    setLoading(true);
    abortRef.current = new AbortController();

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY && { 'x-api-key': API_KEY }),
          'anthropic-version': '2023-06-01',
        },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          model,
          max_tokens: 2048,
          stream: true,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const text = parsed?.delta?.text || '';
            if (text) {
              fullText += text;
              onChunk?.(fullText);
            }
          } catch {}
        }
      }

      onDone?.(fullText);
    } catch (err) {
      if (err.name !== 'AbortError') {
        // Fallback to non-streaming if streaming fails
        try {
          const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            ...(API_KEY && { 'x-api-key': API_KEY }),
            'anthropic-version': '2023-06-01',
          },
            body: JSON.stringify({
              model,
              max_tokens: 2048,
              messages: messages.map(m => ({ role: m.role, content: m.content })),
            }),
          });
          const data = await res.json();
          const text = data.content?.[0]?.text || 'No response received.';
          onChunk?.(text);
          onDone?.(text);
        } catch (fallbackErr) {
          onError?.(fallbackErr.message || 'Request failed');
        }
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
