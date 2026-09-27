# SCJE Web Application

This repository contains the source code for the **SCJE/BSISM Student System** web application.

## Overview
- **Frontend**: React + TypeScript (Vite)
- **Backend**: Node.js + Express (TypeScript)
- **Database**: PostgreSQL (mock JSON for prototype, switchable to Postgres later)
- **Authentication**: Email/password with JWT
- **Hosting**: Free tier (Render / Railway)

## Project Structure
```
scje-web-app/
├─ README.md
├─ architecture.md          # Architecture overview (artifact)
├─ frontend/                # React SPA
│   ├─ package.json
│   ├─ tsconfig.json
│   ├─ vite.config.ts
│   └─ src/
│       ├─ main.tsx
│       ├─ App.tsx
│       ├─ index.html
│       ├─ routes/
│       ├─ components/
│       └─ services/
├─ backend/                 # Express API
│   ├─ package.json
│   ├─ tsconfig.json
│   └─ src/
│       ├─ index.ts
│       ├─ server.ts
│       ├─ routes/
│       ├─ controllers/
│       ├─ middleware/
│       └─ models/
├─ docker/
│   ├─ Dockerfile.frontend
│   ├─ Dockerfile.backend
│   └─ docker-compose.yml
└─ .gitignore
```

## Getting Started
1. Clone the repo.
2. Install dependencies for both frontend and backend:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
3. Run the development servers:
   ```bash
   # Frontend
   cd frontend && npm run dev
   # Backend
   cd backend && npm run dev
   ```
4. Open `http://localhost:5173` to view the app.

## Scripts
- `frontend`:
  - `dev` – Start Vite dev server.
  - `build` – Build production assets.
- `backend`:
  - `dev` – Start Express with ts-node-dev.
  - `build` – Compile TypeScript.

## Future Work
- Replace mock JSON store with PostgreSQL.
- Add CI/CD pipelines.
- Implement MIS Office API integration.
- Mobile packaging (Capacitor) for APK/IPA.
