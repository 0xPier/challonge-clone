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
- Bracket generation algorithms
- Real-time match updates
- League system implementation

### 📋 Planned Features
- Multiple tournament formats (Single/Double Elimination, Round Robin, Swiss)
- User registration for tournaments
- Match reporting and dispute system
- Real-time notifications
- Admin panel
- Mobile-responsive design

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Passport.js** - OAuth strategy
- **Socket.IO** - Real-time communication

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd challonge-clone
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**

   Update `backend/.env`:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/challonge-clone
   JWT_SECRET=your-super-secret-jwt-key-here
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   FRONTEND_URL=http://localhost:3000
   ```

   Update `frontend/.env` (if needed):
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

### Running the Application

1. **Start MongoDB** (if not already running)
   ```bash
   mongod
   ```

2. **Start Backend**
   ```bash
   cd backend
   npm run dev
   ```

3. **Start Frontend**
   ```bash
   cd frontend
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## Project Structure

```
challonge-clone/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utilities
│   │   └── server.js       # Application entry point
│   ├── tests/              # Test files
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/       # API services
│   │   ├── store/         # Redux store
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utilities
│   ├── public/            # Static assets
│   └── package.json
└── docker-compose.yml     # Docker configuration
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user profile

### Tournament Endpoints
- `GET /api/tournaments` - Get all tournaments
- `POST /api/tournaments` - Create tournament (Admin/Mod only)
- `GET /api/tournaments/:id` - Get tournament details
- `POST /api/tournaments/:id/register` - Register for tournament
- `POST /api/tournaments/:id/start` - Start tournament

### User Endpoints
- `GET /api/users/profile/:id` - Get user profile
- `GET /api/users/leaderboard` - Get leaderboard
- `GET /api/users/me/tournaments` - Get user's tournaments

## Development

### Available Scripts

**Backend:**
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests

**Frontend:**
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

### Code Style
- Backend: ESLint + Prettier
- Frontend: ESLint + Prettier + TypeScript

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [Challonge](https://challonge.com)
- Built with modern web technologies
- Thanks to the open-source community for amazing tools and libraries
