# Gaming Café Session Tracker — Starter Pack

**Time limit: 45 minutes** · React + Tailwind (frontend), Node.js + Express (backend), `fs` module for storage (no database).

A player enters their name and clicks **Start Playing**. Their session runs live on the server and they unlock badges the longer they play. **Stop Playing** ends the session and saves it permanently. Time is compressed: **1 real second = 1 game minute**.

## Badge rules

| Play time (game minutes) | Badge |
|---|---|
| Reaches 30 | 🥉 Bronze |
| Reaches 50 | 🥈 Silver |
| Reaches 70 | 🥇 Gold (maximum — show a **MAX** indicator) |
| Stopped before 30 | No badge |

Badges must be generated **on the server, automatically, as time passes** — not on the frontend, and not only when the session stops.

## Getting started

Two terminals:

```bash
# Terminal 1 — backend (http://localhost:3001)
cd backend
npm install
npm start

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — the app will show an error at first, because the states and handlers the UI needs don't exist yet. Creating them is your first task (there are `// TODO` comments marking every spot). The dev server already proxies `/sessions` to the backend.

## What you write

Only two files:

### 1. `backend/routes/sessions.js` — the endpoints + tick logic

- `POST /sessions/start` — create an in-memory session, start a 1-second server timer that increments `elapsedMinutes` and unlocks badges as thresholds are crossed
- `POST /sessions/:id/stop` — stop the timer, mark `"completed"`, append to `data.json` with `fs`
- `POST /sessions/:id/add-time` — fast-forward an **active** session; all badges crossed by the jump must unlock (25 → 75 unlocks Bronze, Silver, AND Gold)
- `GET /sessions` — active sessions (memory) + completed sessions (`data.json`)

The file has **no routes yet** — you create all four. Each one has a `// TODO` comment with step-by-step details, and the in-memory session storage and badge thresholds are provided as commented code you can uncomment.

### 2. `frontend/src/App.jsx` — the states, hooks, and API wiring

- Create the `playerName` and `sessions` states the JSX expects, and poll `GET /sessions` every second
- Create the `startSession`, `stopSession`, `addTime` handlers calling the endpoints
- Replace `EXAMPLE_SESSIONS` with real data, active sessions listed first

Everything else is provided: the Express server bootstrap, the Vite/Tailwind setup, and the fully-styled `SessionCard` component (badges, MAX indicator, buttons, inputs — just pass it `session`, `onStop`, `onAddTime`).

## Hints

- Store timer references in a `Map` keyed by session id — you'll need them later to stop the right timer.
- Think about which sessions belong in memory and which belong in the file.
- Bronze unlocks *at* 30, not after it.
- If your badge check only tests `elapsedMinutes === 30`, Add Time will skip badges. Check *ranges crossed*, not exact values.
- Handle the case where `data.json` doesn't exist or is empty when reading.

## Rules

- Badge logic must live on the backend.
- No database, no external storage libraries — only the built-in `fs` module.
- No edit/delete, authentication, or validation beyond requiring a player name.
- It's fine if active sessions are lost when the server restarts.

## Bonus (only if you finish early — verbal answer is fine)

What happens to an active session if the server crashes? How would you redesign the timer logic so elapsed time survives a restart?
