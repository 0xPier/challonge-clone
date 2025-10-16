const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        error: 'Token is not valid. User not found.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account is deactivated. Please contact support.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token is not valid.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token has expired.'
      });
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      error: 'Authentication failed.'
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Tournament organizer authorization
const authorizeTournamentOrganizer = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required.'
      });
    }

    const tournamentId = req.params.id || req.params.tournamentId || req.body.tournamentId;

    if (!tournamentId) {
      return res.status(400).json({
        error: 'Tournament ID is required.'
      });
    }

    const Tournament = require('../models/Tournament');
    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
      return res.status(404).json({
        error: 'Tournament not found.'
      });
    }

    // Check if user is the organizer or a moderator
    const isOrganizer = tournament.organizer.toString() === req.user._id.toString();
    const isModerator = tournament.moderators.some(mod =>
      mod.toString() === req.user._id.toString()
    );

    if (!isOrganizer && !isModerator && req.user.role !== 'admin' && req.user.role !== 'superuser') {
      return res.status(403).json({
        error: 'Access denied. Only tournament organizers can perform this action.'
      });
    }

    req.tournament = tournament;
    next();
  } catch (error) {
    console.error('Tournament authorization error:', error);
    res.status(500).json({
      error: 'Authorization failed.'
    });
  }
};

// League authorization middleware
const authorizeLeagueModerator = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required.'
      });
    }

    const leagueId = req.params.leagueId || req.body.leagueId;

    if (!leagueId) {
      return res.status(400).json({
        error: 'League ID is required.'
      });
    }

    const League = require('../models/League');
    const league = await League.findById(leagueId);

    if (!league) {
      return res.status(404).json({
        error: 'League not found.'
      });
    }

    // Check if user is a league moderator or admin
    const isModerator = league.moderators.some(mod =>
      mod.user.toString() === req.user._id.toString()
    );

    if (!isModerator && req.user.role !== 'admin' && req.user.role !== 'superuser') {
      return res.status(403).json({
        error: 'Access denied. Only league moderators can perform this action.'
      });
    }

    req.league = league;
    next();
  } catch (error) {
    console.error('League authorization error:', error);
    res.status(500).json({
      error: 'Authorization failed.'
    });
  }
};

// Optional authentication (for routes that work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};

// Rate limiting for auth routes
const authRateLimit = require('express-rate-limit');

const authLimiter = authRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth routes
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = authRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authenticate,
  authorize,
  authorizeTournamentOrganizer,
  authorizeLeagueModerator,
  optionalAuth,
  authLimiter,
  generalLimiter
};
