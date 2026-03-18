export const MODELS = [
  { id: 'claude-opus-4-5',           label: 'Claude Opus',   sub: 'Most powerful',  icon: '◆' },
  { id: 'claude-sonnet-4-5',         label: 'Claude Sonnet', sub: 'Balanced',        icon: '◈' },
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku',  sub: 'Fastest',         icon: '◇' },
];

export const SUGGESTIONS = [
  { icon: '✦', text: 'Explain quantum entanglement in simple terms' },
  { icon: '✦', text: 'Write a poem about monsoon rain in Rajasthan' },
  { icon: '✦', text: 'Help me plan a React app architecture' },
  { icon: '✦', text: 'Plan a 3-day trip to Udaipur' },
];

export function uid() {
  return Math.random().toString(36).slice(2, 11);
}

export function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function truncate(str, n = 38) {
  return str.length > n ? str.slice(0, n) + '…' : str;
}
