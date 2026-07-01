# 🌐 Task 2 — Social Media Platform

Mini social media app: profiles, posts, likes, comments, and a follow system.

**Stack:** Node.js, Express.js, MongoDB (Mongoose), Vanilla HTML/CSS/JS frontend.

## Folder Structure
```
Task2_SocialMedia/
├── backend/
│   ├── models/        (User, Post)
│   ├── routes/        (auth, posts, users)
│   ├── middleware/     (auth.js)
│   ├── server.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── index.html
    ├── style.css
    └── app.js
```

## How to Run

### 1. Backend
```bash
cd backend
npm install
npm run dev
```
Runs on **http://localhost:5001** (different port from Task 1 so both can run together).

### 2. Frontend
Open `frontend/index.html` in your browser, or use Live Server / `npx serve frontend`.

### 3. Test it
1. Register two or more accounts (use different browsers/incognito to test follow & comments between users).
2. Create posts on the Feed page.
3. Like and comment on posts.
4. Follow suggested users from the sidebar.
5. Visit your Profile page to see your stats and posts.

## Key API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET | /api/posts | Get feed (all posts) |
| POST | /api/posts | Create post |
| PUT | /api/posts/:id/like | Like/unlike a post |
| POST | /api/posts/:id/comment | Add comment |
| GET | /api/users | List users (for suggestions) |
| GET | /api/users/me | Current profile |
| PUT | /api/users/:id/follow | Follow/unfollow |

## Notes
- Each task uses a **separate MongoDB database** (`socialmedia`) and **separate port** (5001) so you can run all 4 tasks simultaneously without conflicts.
- localStorage keys are prefixed (`t2_token`, `t2_user`) to avoid clashing with other tasks if opened in the same browser.
