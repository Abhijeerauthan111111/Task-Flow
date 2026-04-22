# Todo (MERN + Google Auth) — Local Practice

Two routes only:
- `/login` (Google sign-in / sign-out)
- `/tasks` (CRUD todos + filters)

## Prereqs
- Node.js 18+ (recommended)
- MongoDB Atlas connection string
- Google OAuth client (Web application)

## 1) Google OAuth settings
Create OAuth Client ID (Web application) and set:
- Authorized JavaScript origins: `http://localhost:5173`
- Authorized redirect URIs: `http://localhost:4000/auth/google/callback`

## 2) Server setup
From `todo-mern-google-auth/server`:
1. Copy env:
   - `Copy-Item .env.example .env`
2. Fill `.env` values.
3. Install + run:
   - `npm install`
   - `npm run dev`

Server runs on `http://localhost:4000`.

## 3) Client setup
From `todo-mern-google-auth/client`:
1. Install + run:
   - `npm install`
   - `npm run dev`

Client runs on `http://localhost:5173`.

## Quick success checklist
- Visit `http://localhost:5173/login` → click “Continue with Google”
- After callback you land on `/tasks`
- Create / edit / toggle / delete todos
- Filter All / Active / Done
- Refresh page → todos still there (MongoDB)
- Click “Sign out” → returns to `/login`

