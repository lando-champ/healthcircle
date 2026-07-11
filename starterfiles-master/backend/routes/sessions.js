// ✏️ WRITE YOUR CODE IN THIS FILE.
// Create the 4 routes described below. Right now this file has NO routes —
// the frontend will get 404s until you write them.
//
// A session looks like this:
//   { id, playerName, elapsedMinutes, status: "active" | "completed", badges: [] }
//
// Badge rules (the SERVER gives badges automatically as time passes):
//   30 game minutes  -> "Bronze"
//   50 game minutes  -> "Silver"
//   70 game minutes  -> "Gold" (last one, nothing after this)
//
// Remember: 1 real second = 1 game minute.
//
// Tips:
//   - Active sessions stay in memory. Only completed sessions are saved to data.json.
//   - Keep each session's timer in a Map (id -> timer), so you can stop it later.
//   - Use >= for badge checks, not ===. If you use ===, badges will be skipped
//     when Add Time jumps over a number (example: 25 -> 75).
//   - data.json may be missing or empty. Your read code should not crash on that.

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto'); // crypto.randomUUID() gives you a unique id

const router = express.Router();
const DATA_FILE = path.join(__dirname, '..', 'data.json');

// ---------------------------------------------------------------
// SESSION MANAGEMENT — uncomment this code to use it.
// ---------------------------------------------------------------
const activeSessions = new Map(); // id -> session object
const timers = new Map();         // id -> timer (returned by setInterval)

// ---------------------------------------------------------------
// BADGE THRESHOLDS — uncomment this code to use it.
// ---------------------------------------------------------------
const BADGE_THRESHOLDS = [
   { minutes: 30, badge: 'Bronze' },
   { minutes: 50, badge: 'Silver' },
   { minutes: 70, badge: 'Gold' },
 ];

// ---------------------------------------------------------------
// 1. Create a POST route called "start"  (POST /sessions/start)
//    Body: { "playerName": "Ravi" }
//
//    Steps:
//    - If playerName is missing, send back an error (status 400).
//    - Make a new session: elapsedMinutes 0, status "active", badges [].
//    - Start a timer (setInterval, every 1000ms) that:
//        adds 1 to elapsedMinutes, and gives badges when reached.
//    - Send back the new session.
// ---------------------------------------------------------------
// TODO: write the "start" route here
router.post('sessions/start', (req, res) => {
  const { playerName } = req.body;
  if (!playerName) {
    return res.status(400).json({ error: 'Player name is required' });
  }
  const session = { id: crypto.randomUUID(), playerName, elapsedMinutes: 0, status: 'active', badges: [] };
  activeSessions.set(session.id, session);
  timers.set(session.id, setInterval(() => {
    session.elapsedMinutes++;
    BADGE_THRESHOLDS.forEach(threshold => {
      if (session.elapsedMinutes >= threshold.minutes) {
        session.badges.push(threshold.badge);
      }
    });
  }, 1000));
  res.json(session);
});
// ---------------------------------------------------------------
// 2. Create a POST route called ":id/stop"  (POST /sessions/:id/stop)
//
//    Steps:
//    - Find the active session. If not found, send an error (status 404).
//    - Stop its timer.
//    - Change status to "completed".
//    - Save it into data.json using fs.
//    - Send back the session.
// ---------------------------------------------------------------
// TODO: write the "stop" route here

router.post('sessions/:id/stop', (req, res) => {
  const { id } = req.params;
  const session = activeSessions.get(id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  clearInterval(timers.get(id));
  activeSessions.delete(id);
  timers.delete(id);
  session.status = 'completed';
  fs.writeFileSync(DATA_FILE, JSON.stringify(activeSessions.values(), null, 2));
  res.json(session);
});
// ---------------------------------------------------------------
// 3. Create a POST route called ":id/add-time"  (POST /sessions/:id/add-time)
//    Body: { "minutes": 30 }
//
//    Steps:
//    - Works only on ACTIVE sessions. If the session is completed,
//      send back an error.
//    - Add the minutes to elapsedMinutes in one jump.
//    - Give ALL badges that were passed by the jump.
//      Example: 25 -> 75 gives Bronze, Silver AND Gold together.
//    - Send back the updated session.
// ---------------------------------------------------------------
// TODO: write the "add-time" route here
router.post('sessions/:id/add-time', (req, res) => {
  const { id } = req.params;
  const { minutes } = req.body;
  const session = activeSessions.get(id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  session.elapsedMinutes += minutes;
  BADGE_THRESHOLDS.forEach(threshold => {
    if (session.elapsedMinutes >= threshold.minutes) {
      session.badges.push(threshold.badge);
    }
  });
  res.json(session);
});
// ---------------------------------------------------------------
// 4. Create a GET route on "/"  (GET /sessions)
//
//    Return one list with:
//    - active sessions (from memory)
//    - completed sessions (from data.json)
// ---------------------------------------------------------------
// TODO: write the "list sessions" route here
router.get('sessions', (req, res) => {
  const sessions = Array.from(activeSessions.values()).concat(JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')));
  res.json(sessions);
});
module.exports = router;
