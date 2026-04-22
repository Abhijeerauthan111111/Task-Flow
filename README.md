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
- Authorized redirect URIs: `http://localhost:4000/api/auth/google/callback`

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

## Deploy to Vercel
Recommended: deploy as a single Vercel project (static Vite app + serverless API).

### Vercel settings
- Root Directory: `todo-mern-google-auth` (if your repo root is different, point Vercel here)
- Build Command: `npm run vercel-build`
- Output Directory: `client/dist`

### Vercel Environment Variables
Set these in Vercel (Project → Settings → Environment Variables):
- `MONGODB_URI`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL` = `https://YOUR_VERCEL_DOMAIN/api/auth/google/callback`
- `SESSION_SECRET`
- `CLIENT_URL` = `https://YOUR_VERCEL_DOMAIN`

### Google OAuth settings for production
Update your Google OAuth client to include:
- Authorized JavaScript origins: `https://YOUR_VERCEL_DOMAIN`
- Authorized redirect URIs: `https://YOUR_VERCEL_DOMAIN/api/auth/google/callback`

## Deploy split (frontend + backend on different URLs)
If you deploy the backend separately (Render/Railway/Fly/Vercel project), do this:

### Vercel split (two Vercel projects from one repo)
Create 2 separate Vercel projects pointing to the same GitHub repo:

**Frontend project**
- Root Directory: `todo-mern-google-auth/client`
- Build Command: `npm run build`
- Output Directory: `dist`
- Env var: `VITE_API_URL=https://YOUR_BACKEND_DOMAIN`

**Backend project**
- Root Directory: `todo-mern-google-auth`
- No special build settings needed (serverless function is `api/[...all].js`)
- Env vars: `MONGODB_URI`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`, `CLIENT_URL`, `COOKIE_SAMESITE`, `GOOGLE_CALLBACK_URL`

### Backend
- Set `CLIENT_URL=https://YOUR_FRONTEND_DOMAIN`
- Set `GOOGLE_CALLBACK_URL=https://YOUR_BACKEND_DOMAIN/api/auth/google/callback`
- Set `COOKIE_SAMESITE=none` (required for cross-site cookies)
- Ensure HTTPS (cookies require `Secure` when SameSite is `none`)

### Frontend
- Set `VITE_API_URL=https://YOUR_BACKEND_DOMAIN` (see `todo-mern-google-auth/client/.env.example`)
- Login button will send the browser to `${VITE_API_URL}/api/auth/google`

## Quick success checklist
- Visit `http://localhost:5173/login` → click “Continue with Google”
- After callback you land on `/tasks`
- Create / edit / toggle / delete todos
- Filter All / Active / Done
- Refresh page → todos still there (MongoDB)
- Click “Sign out” → returns to `/login`
