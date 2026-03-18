# Claude.ai Clone — React

A production-grade Claude.ai clone built with React. Features real Anthropic API integration, streaming responses, persistent chat history, markdown rendering, syntax highlighting, and full dark/light mode.

---

## 🚀 Quick Start

```bash
# 1. Clone or copy the project folder
cd claude-clone

# 2. Install dependencies
npm install

# 3. Add your Anthropic API key
cp .env.example .env
# Edit .env and paste your key

# 4. Start the dev server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 API Key Setup

Create a `.env` file in the project root:

```
REACT_APP_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

> ⚠️ **Important:** For production, never expose your API key in the frontend. Route all API calls through a backend (Node.js/Express, Next.js API routes, etc.).

---

## 📁 Project Structure

```
claude-clone/
├── public/
│   └── index.html              # Google Fonts (Lora + DM Sans)
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx         # Chat history, model selector, theme toggle
│   │   ├── Sidebar.module.css
│   │   ├── Header.jsx          # Top bar with chat title + model pill
│   │   ├── Header.module.css
│   │   ├── MessageList.jsx     # Message bubbles, markdown, code blocks
│   │   ├── MessageList.module.css
│   │   ├── ChatInput.jsx       # Auto-resizing textarea, send/stop buttons
│   │   └── ChatInput.module.css
│   ├── hooks/
│   │   ├── useChats.js         # Chat state + localStorage persistence
│   │   ├── useTheme.js         # Dark/light mode with persistence
│   │   └── useApi.js           # Anthropic API with streaming + fallback
│   ├── utils/
│   │   └── helpers.js          # Constants, model list, utility fns
│   ├── App.jsx                 # Root component, wires everything together
│   ├── App.module.css
│   ├── index.js                # React entry point
│   └── index.css               # CSS variables, animations, reset
├── .env.example
├── package.json
└── README.md
```

---

## ✨ Features

| Feature | Details |
|---|---|
| **Real AI responses** | Anthropic API (`claude-sonnet-4-5` default) |
| **Streaming** | Token-by-token streaming with live cursor |
| **Markdown rendering** | `react-markdown` + `remark-gfm` |
| **Syntax highlighting** | `react-syntax-highlighter` with one-dark theme |
| **Copy code** | One-click copy on every code block |
| **Persistent history** | Chats saved to `localStorage` |
| **Multi-turn context** | Full conversation history sent per request |
| **Model switching** | Opus / Sonnet / Haiku selector |
| **Dark / Light mode** | Persisted preference |
| **Stop generation** | Abort streaming mid-response |
| **Suggestion chips** | Quick-start prompts on empty state |
| **Date grouping** | Sidebar groups chats: Today / Yesterday / Last 7 days |
| **Delete chats** | Hover to reveal delete button |

---

## 🛠️ Tech Stack

- **React 18** — UI framework
- **CSS Modules** — Scoped styling, no CSS-in-JS
- **react-markdown** — Markdown rendering
- **remark-gfm** — Tables, strikethrough, task lists
- **react-syntax-highlighter** — Code block highlighting
- **Lora + DM Sans** — Typography (Google Fonts)

---

## 🔒 Production Notes

For a production deployment, proxy the API through a backend:

```js
// Example: Express proxy route
app.post('/api/chat', async (req, res) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(req.body),
  });
  response.body.pipe(res);
});
```

Then update `API_URL` in `src/hooks/useApi.js` to point to `/api/chat`.

---

## 📦 Build for Production

```bash
npm run build
```

Output goes to the `build/` folder — ready to deploy on Vercel, Netlify, or any static host.
