# 🛍️ Task 1 — Simple E-commerce Store

Full-stack e-commerce site: product listings, cart, checkout, order tracking, and JWT auth.

**Stack:** Node.js, Express.js, MongoDB (Mongoose), Vanilla HTML/CSS/JS frontend.

## Folder Structure
```
Task1_EcommerceStore/
├── backend/
│   ├── models/        (User, Product, Order)
│   ├── routes/         (auth, products, cart, orders)
│   ├── middleware/      (auth.js — JWT protect/admin)
│   ├── server.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── index.html
    ├── style.css
    └── app.js
```

## How to Run

### 1. Install MongoDB
Install MongoDB Community Server locally, OR create a free cluster on MongoDB Atlas and copy your connection string.

### 2. Backend setup
```bash
cd backend
npm install
```
Edit `.env` if using Atlas — replace `MONGO_URI` with your Atlas connection string.

```bash
npm run dev
```
Backend runs on **http://localhost:5000**

### 3. Frontend setup
No build step needed — it's plain HTML/CSS/JS.
- Open `frontend/index.html` directly in your browser, OR
- Right-click → "Open with Live Server" (VS Code extension), OR
- Run `npx serve frontend` from the project root

### 4. Test it
1. Register a new account
2. To add products, you need an admin account. In MongoDB, manually update a user's `role` field to `"admin"` (use MongoDB Compass or `mongosh`), then use Postman/Thunder Client to POST to `/api/products` with that admin's token.
3. Browse products, add to cart, checkout, view order history.

## Key API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET | /api/products | List/search/filter products |
| POST | /api/products | Add product (admin only) |
| GET | /api/cart | View cart |
| POST | /api/cart/add | Add item to cart |
| POST | /api/orders | Place order |
| GET | /api/orders/my | My order history |

## Notes
- Passwords are hashed with bcrypt.
- JWT token stored in browser localStorage.
- For production: deploy backend on Render/Railway, frontend on Netlify/Vercel, and DB on MongoDB Atlas.
