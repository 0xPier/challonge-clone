require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Import passport configuration
require('./utils/passport');

// Import routes
const authRoutes = require('./routes/auth');
const tournamentRoutes = require('./routes/tournaments');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
      "http://127.0.0.1:3002"
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/challonge-clone';

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-tournament', (tournamentId) => {
    socket.join(tournamentId);
    console.log(`User ${socket.id} joined tournament ${tournamentId}`);
  });

  socket.on('match-update', (data) => {
    socket.to(data.tournamentId).emit('match-updated', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use(errorHandler);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});


// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const DEFAULT_PORT = parseInt(process.env.PORT || process.env.BACKEND_PORT || '5000', 10);
const MAX_PORT_ATTEMPTS = 5;
let currentPort = DEFAULT_PORT;
let attempts = 0;

const startServer = (port) => {
  currentPort = port;
  attempts += 1;
  app.set('port', port);
  server.listen(port);
};

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    if (attempts >= MAX_PORT_ATTEMPTS) {
      console.error(`Port ${currentPort} is already in use and max attempts reached.`);
      process.exit(1);
    }

    const nextPort = currentPort + 1;
    console.warn(`Port ${currentPort} is already in use. Attempting to use port ${nextPort}...`);
    setTimeout(() => startServer(nextPort), 100);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

server.on('listening', () => {
  const address = server.address();
  const resolvedPort = typeof address === 'object' && address !== null ? address.port : currentPort;
  process.env.PORT = String(resolvedPort);
  console.log(`Server running on port ${resolvedPort}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

startServer(DEFAULT_PORT);

module.exports = { app, io };
