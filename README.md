# 📋 Task 3 — Project Management Tool

Trello/Asana-style collaborative tool: projects, Kanban task boards, comments, and real-time updates via WebSockets (Socket.io).

**Stack:** Node.js, Express.js, Socket.io, MongoDB (Mongoose), Vanilla HTML/CSS/JS frontend.

## Folder Structure
```
Task3_ProjectManagement/
├── backend/
│   ├── models/        (User, Project, Task)
│   ├── routes/        (auth, projects, tasks)
│   ├── middleware/     (auth.js)
│   ├── server.js       (includes Socket.io setup)
│   ├── package.json
│   └── .env
└── frontend/
    ├── index.html
    ├── style.css
    └── app.js           (includes Socket.io client logic)
```

## How to Run

### 1. Backend
```bash
cd backend
npm install
npm run dev
```
Runs on **http://localhost:5002**

### 2. Frontend
Open `frontend/index.html` in browser, or `npx serve frontend`.
Note: it loads Socket.io client from a CDN, so you need internet access in the browser tab.

### 3. Test it
1. Register/login.
2. Click **+ New Project**, give it a name and color.
3. Click into the project — you get a 4-column Kanban board (To Do / In Progress / Review / Done).
4. Click **+ Add Task** in any column to create tasks with priority and due dates.
5. Click a task card to open details, change its status, or add comments.
6. **Real-time test:** Open the same project in two browser tabs (or two different logged-in users) — moving a task or adding a comment in one tab instantly updates the other via WebSockets.
7. Use **+ Member** to invite another registered user by email to collaborate on the project.

## Key API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register, /login | Auth |
| GET/POST | /api/projects | List / create projects |
| POST | /api/projects/:id/members | Add member by email |
| GET | /api/tasks/project/:projectId | Get tasks for a project |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task (status, etc.) |
| POST | /api/tasks/:id/comment | Comment on task |

## WebSocket Events
- `join-project` — joins a Socket.io room per project
- `task-update` / `task-updated` — broadcasts task changes
- `new-comment` / `comment-added` — broadcasts new comments

## Notes
- Runs on port 5002 / DB `projectmanagement` — independent from other tasks.
