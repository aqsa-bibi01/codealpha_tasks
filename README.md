# 🎥 Task 4 — Real-Time Communication App (MeetSpace)

Video conferencing + collaboration tool: multi-user video calls (WebRTC), screen sharing, group chat, file sharing, and a shared whiteboard.

**Stack:** Node.js, Express.js, Socket.io (signaling), WebRTC (peer-to-peer media), MongoDB (Mongoose), Multer (file uploads), Vanilla HTML/CSS/JS frontend.

## Folder Structure
```
Task4_RealTimeCommunication/
├── backend/
│   ├── models/        (User, Room)
│   ├── routes/        (auth, rooms, messages)
│   ├── middleware/     (auth.js)
│   ├── uploads/         (created automatically — stores shared files)
│   ├── server.js        (Express + Socket.io signaling server)
│   ├── package.json
│   └── .env
└── frontend/
    ├── index.html
    ├── style.css
    └── app.js            (WebRTC peer connections + Socket.io client)
```

## How to Run

### 1. Backend
```bash
cd backend
npm install
npm run dev
```
Runs on **http://localhost:5003**

### 2. Frontend
Open `frontend/index.html` in your browser, or `npx serve frontend`.

⚠️ **Important:** Browsers only allow camera/microphone access on `https://` or `http://localhost`. If you serve the frontend with `npx serve`, it will be on `http://localhost:PORT`, which works fine. Opening the raw `file://` HTML may block camera access in some browsers — prefer Live Server or `npx serve`.

### 3. Test it (needs 2 browser windows/tabs to see video calling work)
1. Register/login in **Tab A**.
2. Click **Start New Meeting** → note the 6-character room code shown at the bottom.
3. Allow camera/microphone access when prompted.
4. In **Tab B** (incognito window, or a different browser), register a second account, then **Join Meeting** with that same room code.
5. Both tabs should now show each other's video feeds.
6. Try: muting mic, turning off camera, screen sharing, opening the whiteboard and drawing (should sync live between tabs), sending chat messages, and uploading a file.

## Key API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register, /login | Auth |
| POST | /api/rooms | Create a meeting room (returns room code) |
| GET | /api/rooms/:code | Look up a room by code |
| POST | /api/messages/upload | Upload a file (shared in meeting) |

## WebSocket / WebRTC Events
- `join-room` → triggers WebRTC offer/answer/ICE candidate exchange between peers
- `offer` / `answer` / `ice-candidate` → WebRTC signaling relay
- `chat-message` → group text chat
- `draw` / `clear-board` → shared whiteboard sync
- `screen-share-started` / `screen-share-stopped` → notify peers of screen share state

## Security Note
- "Data encryption" here refers to WebRTC's built-in DTLS-SRTP encryption for media streams (this is automatic/standard in all WebRTC connections — no extra setup needed) and JWT for authenticated REST calls. This is honest framing for a portfolio/internship project; it is **not** a production-grade end-to-end encrypted system audited for security.

## Notes
- Runs on port 5003 / DB `rtcapp` — independent from other tasks.
- Uses Google's free public STUN server for NAT traversal. For users behind strict corporate firewalls, you'd need a TURN server (e.g. via a free Twilio/Metered TURN service) — out of scope for this internship task but worth mentioning in your video/LinkedIn post as a "future improvement."
