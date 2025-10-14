# Quick Reference Card

## 🚀 Quick Start (5 Minutes)

```bash
# 1. Start MongoDB
brew services start mongodb-community

# 2. Backend Setup
cd backend
npm install
npm run seed          # Creates admin & test users
npm run dev           # Starts on http://localhost:5000

# 3. Frontend Setup (new terminal)
cd frontend
npm install
npm start             # Starts on http://localhost:3000
```

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@challonge.local | admin123 |
| **Test User** | user@test.com | test123 |

⚠️ **Change admin password in production!**

## 📍 Important URLs

| Page | URL | Access |
|------|-----|--------|
| **Home** | http://localhost:3000 | Public |
| **Login** | http://localhost:3000/login | Public |
| **Register** | http://localhost:3000/register | Public |
| **Dashboard** | http://localhost:3000/dashboard | Authenticated |
| **Create Tournament** | http://localhost:3000/create-tournament | Authenticated |
| **Admin Panel** | http://localhost:3000/admin | Admin Only |
| **Tournaments** | http://localhost:3000/tournaments | Public |
| **API Health** | http://localhost:5000/api/health | Public |

## 🎮 Testing Tournament Creation

```
1. Login → user@test.com / test123
2. Click "Create Tournament"
3. Fill required fields:
   - Name: "Summer Showdown"
   - Game: "Valorant"
   - Format: "Single Elimination"
   - Max Participants: 16
   - Registration Deadline: [future date]
   - Start Date: [after registration]
4. Submit → Status: "pending-approval"
5. Logout → Login as admin
6. Go to /admin → Approve tournament
7. Status changes to "open"
```

## 🛠️ Common Commands

### Backend
```bash
npm run dev          # Development server
npm start           # Production server
npm run seed        # Seed admin user
npm test            # Run tests
```

### Frontend
```bash
npm start           # Development server
npm run build       # Production build
npm test            # Run tests
```

### Database
```bash
# Start MongoDB
brew services start mongodb-community

# Stop MongoDB
brew services stop mongodb-community

# Check status
brew services list | grep mongodb

# Connect to MongoDB
mongo challonge-clone

# Reset database
mongo challonge-clone --eval "db.dropDatabase()"
```

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| **Port in use** | `lsof -ti:5000 \| xargs kill -9` |
| **MongoDB not running** | `brew services start mongodb-community` |
| **Cannot create tournament** | Check `.env` file, restart servers |
| **Admin page 403** | Login as admin user |
| **Frontend can't reach API** | Verify `REACT_APP_API_URL=http://localhost:5000/api` in `frontend/.env` |

## 📊 Tournament Status Flow

```
draft → pending-approval → open → in-progress → completed
                     ↓
                 rejected
```

## 🏗️ Project Structure

```
challonge-clone/
├── backend/
│   ├── src/
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Auth, validation
│   │   ├── scripts/         # Utility scripts
│   │   └── server.js        # Entry point
│   ├── .env                 # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Redux store
│   │   ├── services/        # API services
│   │   └── App.tsx          # Main app
│   ├── .env                 # Environment variables
│   └── package.json
│
└── Documentation/
    ├── README.md            # Main readme
    ├── DEPLOYMENT.md        # Deployment guide
    ├── TESTING.md           # Testing guide
    ├── FIXES_SUMMARY.md     # What was fixed
    └── QUICK_REFERENCE.md   # This file
```

## 🔐 API Endpoints (Quick Reference)

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Tournaments
- `GET /api/tournaments` - List tournaments
- `GET /api/tournaments/:id` - Get tournament
- `POST /api/tournaments` - Create tournament
- `POST /api/tournaments/:id/register` - Register for tournament
- `POST /api/tournaments/:id/start` - Start tournament

### Admin
- `GET /api/admin/pending-tournaments` - Get pending tournaments
- `POST /api/admin/tournaments/:id/approve` - Approve tournament
- `POST /api/admin/tournaments/:id/reject` - Reject tournament

## 🎯 Key Features

✅ **Authentication**
- JWT-based auth
- Role-based access (admin, user)
- Protected routes

✅ **Tournament Management**
- 5 formats: Single/Double Elimination, Round Robin, Swiss, Free-for-all
- Approval workflow
- Participant registration
- Match tracking

✅ **Admin Dashboard**
- Approve/reject tournaments
- User management
- Statistics

✅ **Bracket Visualization**
- Interactive bracket display
- Round-by-round view
- Match status indicators

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/challonge-clone
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚨 Important Notes

1. **Always start MongoDB first** before backend
2. **Seed database once** with `npm run seed`
3. **Change admin password** in production
4. **Use HTTPS** in production
5. **Regular backups** of MongoDB

## 📚 Documentation Files

- `README.md` - Overview and setup
- `DEPLOYMENT.md` - Production deployment
- `TESTING.md` - Testing guide
- `PRODUCTION_CHECKLIST.md` - Pre-deployment checklist
- `FIXES_SUMMARY.md` - What was fixed
- `QUICK_REFERENCE.md` - This file

## 🎨 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript |
| **State** | Redux Toolkit |
| **Styling** | Tailwind CSS |
| **Backend** | Node.js + Express |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT + Passport |
| **Real-time** | Socket.IO |

## 🐛 Debug Mode

```bash
# Backend with debug logs
DEBUG=* npm run dev

# Check MongoDB
mongo --eval "db.serverStatus()"

# View backend logs
tail -f backend.log

# Browser console
F12 → Console
```

## 📊 Health Checks

```bash
# Backend health
curl http://localhost:5000/api/health

# MongoDB
mongo --eval "db.version()"

# Check processes
ps aux | grep node
ps aux | grep mongo
```

## 🔄 Reset Everything

```bash
# Stop all services
brew services stop mongodb-community
pkill -f node

# Drop database
mongo challonge-clone --eval "db.dropDatabase()"

# Start fresh
brew services start mongodb-community
cd backend && npm run seed && npm run dev
cd frontend && npm start
```

## 💡 Pro Tips

1. **Use PM2** for production: `pm2 start src/server.js`
2. **Enable MongoDB auth** in production
3. **Set up monitoring** (UptimeRobot, Sentry)
4. **Regular backups** with `mongodump`
5. **Use environment-specific configs**

## 📞 Need Help?

1. Check `FIXES_SUMMARY.md` for what was fixed
2. Review `TESTING.md` for test scenarios
3. See `DEPLOYMENT.md` for deployment help
4. Check browser console for frontend errors
5. Check backend terminal for server errors

---

**Last Updated**: October 14, 2025
**Version**: 1.0.0 (Production Ready)
**Status**: ✅ All Systems Go
