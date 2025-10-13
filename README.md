# Challonge Clone - Tournament Management Platform

A modern, full-stack tournament management platform similar to Challonge, built with Node.js, React, and MongoDB.

## Features

### ✅ Completed
- **Backend Infrastructure**: Express.js server with MongoDB
- **Authentication System**: JWT-based auth with Google OAuth support
- **Database Models**: User, Tournament, Match, League models
- **API Routes**: Comprehensive REST API for all features
- **Frontend Structure**: React with TypeScript and Redux
- **Modern UI**: Tailwind CSS with custom components

### 🚧 In Progress
- Tournament creation and management
# Challonge Clone

A full-stack tournament management platform (Challonge-inspired) built with Node.js, Express, MongoDB and a React + TypeScript frontend.

Live repo: https://github.com/0xPier/challonge-clone

## Quickstart

Prerequisites
- Node.js v16+ (or newer)
- MongoDB (local or cloud)
- npm or yarn

Clone and install
```bash
git clone https://github.com/0xPier/challonge-clone.git
cd challonge-clone

# Backend
cd backend
npm install
cp .env.example .env
# edit backend/.env with your values (MONGODB_URI, JWT_SECRET, GOOGLE creds, etc.)

# Frontend (in a new terminal)
cd ../frontend
npm install
```

Environment (example - edit values in `backend/.env`)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/challonge-clone
JWT_SECRET=replace-with-a-secret
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FRONTEND_URL=http://localhost:3000
```

Running locally
- Start MongoDB (if running locally): mongod
- Start backend (from `backend/`):
```bash
npm run dev
```
- Start frontend (from `frontend/`):
```bash
npm start
```

Frontend: http://localhost:3000
Backend API base: http://localhost:5000/api

## What this repository contains

- backend/: Express server, models, routes, middleware and services
- frontend/: React + TypeScript app, Redux store and components
- memory-bank/: notes and project docs used during development

Project structure (top-level)
```
challonge-clone/
├─ backend/
├─ frontend/
└─ memory-bank/
```

## Development notes

- Auth: JWT + Google OAuth (Passport)
- DB: MongoDB with Mongoose models for User, Tournament, Match, League
- Realtime: Socket.IO planned/partially implemented
- Bracket generation: service logic under `backend/src/services`

## Available scripts

Backend (from `backend/`)
- `npm run dev` — start dev server with nodemon
- `npm start` — production start

Frontend (from `frontend/`)
- `npm start` — start dev server
- `npm run build` — build for production

## Contributing

1. Fork
2. Create branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "feat: add ..."`
4. Push: `git push origin feature/your-feature`
5. Open a PR

Please open issues or PRs for bugs, features or improvements.

## License

MIT — see `LICENSE`.

---
If you want, I can add a short CONTRIBUTING.md, a license file, or a GitHub Actions CI workflow next. Tell me which and I'll add it and push the changes.
