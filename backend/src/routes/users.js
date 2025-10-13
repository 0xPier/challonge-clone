const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Tournament = require('../models/Tournament');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile/:userId
// @desc    Get user profile by ID
// @access  Public
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('displayName avatar role stats createdAt lastLogin');

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Get user's tournaments
    const tournaments = await Tournament.find({
      'participants.user': req.params.userId
    })
      .select('name game format status startDate')
      .sort({ startDate: -1 })
      .limit(10);

    res.json({
      user: user.profile,
      recentTournaments: tournaments
    });

  } catch (error) {
    console.error('Get user profile error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid user ID'
      });
    }

    res.status(500).json({
      error: 'Failed to fetch user profile'
    });
  }
});

// @route   GET /api/users/leaderboard
// @desc    Get users leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 50, minMatches } = req.query;
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const minMatchesNumber = parseInt(minMatches, 10);

    const pipeline = [
      {
        $match: {
          isActive: true,
          ...(Number.isFinite(minMatchesNumber) && minMatchesNumber > 0
            ? { 'stats.matchesPlayed': { $gte: minMatchesNumber } }
            : {})
        }
      },
      {
        $project: {
          displayName: 1,
          avatar: 1,
          role: 1,
          stats: 1,
          createdAt: 1,
          winRate: {
            $round: ['$stats.winRate', 2]
          }
        }
      },
      {
        $sort: {
          winRate: -1,
          'stats.matchesWon': -1,
          createdAt: 1
        }
      },
      {
        $limit: limitNumber
      }
    ];

    const raw = await User.aggregate(pipeline);
    const leaderboard = raw.map((entry, index) => ({
      id: entry._id,
      displayName: entry.displayName,
      avatar: entry.avatar,
      role: entry.role,
      stats: entry.stats,
      createdAt: entry.createdAt,
      winRate: entry.winRate,
      rank: index + 1
    }));

    res.json({ leaderboard });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      error: 'Failed to fetch leaderboard'
    });
  }
});

// @route   GET /api/users/search
// @desc    Search users by display name
// @access  Private
router.get('/search',
  authenticate,
  async (req, res) => {
    try {
      const { q, limit = 10 } = req.query;

      if (!q || q.length < 2) {
        return res.status(400).json({
          error: 'Search query must be at least 2 characters'
        });
      }

      const users = await User.find({
        displayName: new RegExp(q, 'i'),
        isActive: true
      })
        .select('displayName avatar role')
        .limit(parseInt(limit));

      res.json({ users });

    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({
        error: 'Failed to search users'
      });
    }
  }
);

// @route   GET /api/users/me/tournaments
// @desc    Get current user's tournaments
// @access  Private
router.get('/me/tournaments',
  authenticate,
  async (req, res) => {
    try {
      const { status, limit = 20, skip = 0 } = req.query;

      const filter = {
        'participants.user': req.user._id
      };

      if (status) {
        filter.status = status;
      }

      const tournaments = await Tournament.find(filter)
        .populate('organizer', 'displayName avatar')
        .sort({ startDate: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

      const total = await Tournament.countDocuments(filter);

      res.json({
        tournaments,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: total > parseInt(skip) + parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Get user tournaments error:', error);
      res.status(500).json({
        error: 'Failed to fetch user tournaments'
      });
    }
  }
);

// @route   GET /api/users/me/stats
// @desc    Get current user's statistics
// @access  Private
router.get('/me/stats',
  authenticate,
  async (req, res) => {
    try {
      // Get detailed tournament statistics
      const tournamentStats = await Tournament.aggregate([
        {
          $match: {
            'participants.user': req.user._id
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get match statistics
      const matchStats = await require('../models/Match').aggregate([
        {
          $match: {
            'players.user': req.user._id
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        stats: req.user.stats,
        tournamentBreakdown: tournamentStats,
        matchBreakdown: matchStats
      });

    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        error: 'Failed to fetch user statistics'
      });
    }
  }
);

// @route   PUT /api/users/me/preferences
// @desc    Update user preferences
// @access  Private
router.put('/me/preferences',
  authenticate,
  [
    body('notifications.email')
      .optional()
      .isBoolean()
      .withMessage('Email notification preference must be boolean'),
    body('notifications.push')
      .optional()
      .isBoolean()
      .withMessage('Push notification preference must be boolean'),
    body('timezone')
      .optional()
      .isString()
      .withMessage('Timezone must be a string'),
    body('language')
      .optional()
      .isIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'])
      .withMessage('Invalid language code')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { notifications, timezone, language } = req.body;

      const user = req.user;

      // Update preferences
      if (notifications) {
        user.preferences.notifications = {
          ...user.preferences.notifications,
          ...notifications
        };
      }

      if (timezone) {
        user.preferences.timezone = timezone;
      }

      if (language) {
        user.preferences.language = language;
      }

      await user.save();

      res.json({
        message: 'Preferences updated successfully',
        preferences: user.preferences
      });

    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({
        error: 'Failed to update preferences'
      });
    }
  }
);

// @route   GET /api/users/organizers
// @desc    Get tournament organizers
// @access  Public
router.get('/organizers', async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query;

    const organizers = await User.aggregate([
      {
        $match: {
          role: { $in: ['admin', 'moderator', 'superuser'] },
          isActive: true
        }
      },
      {
        $lookup: {
          from: 'tournaments',
          localField: '_id',
          foreignField: 'organizer',
          as: 'organizedTournaments'
        }
      },
      {
        $addFields: {
          tournamentsOrganized: { $size: '$organizedTournaments' }
        }
      },
      {
        $project: {
          displayName: 1,
          avatar: 1,
          role: 1,
          stats: 1,
          tournamentsOrganized: 1,
          createdAt: 1
        }
      },
      {
        $sort: { tournamentsOrganized: -1, 'stats.tournamentsCreated': -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $skip: parseInt(skip)
      }
    ]);

    const total = await User.countDocuments({
      role: { $in: ['admin', 'moderator', 'superuser'] },
      isActive: true
    });

    res.json({
      organizers,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get organizers error:', error);
    res.status(500).json({
      error: 'Failed to fetch organizers'
    });
  }
});

// @route   GET /api/users/me/achievements
// @desc    Get user achievements (placeholder for future feature)
// @access  Private
router.get('/me/achievements',
  authenticate,
  async (req, res) => {
    try {
      // Placeholder for achievements system
      const achievements = [
        {
          id: 'first-tournament',
          name: 'First Tournament',
          description: 'Participate in your first tournament',
          unlocked: req.user.stats.tournamentsParticipated > 0,
          unlockedAt: req.user.stats.tournamentsParticipated > 0 ? req.user.createdAt : null
        },
        {
          id: 'tournament-organizer',
          name: 'Tournament Organizer',
          description: 'Create your first tournament',
          unlocked: req.user.stats.tournamentsCreated > 0,
          unlockedAt: req.user.stats.tournamentsCreated > 0 ? req.user.createdAt : null
        },
        {
          id: 'winner',
          name: 'Champion',
          description: 'Win a tournament',
          unlocked: req.user.stats.matchesWon > 0,
          unlockedAt: req.user.stats.matchesWon > 0 ? req.user.createdAt : null
        }
      ];

      res.json({ achievements });

    } catch (error) {
      console.error('Get achievements error:', error);
      res.status(500).json({
        error: 'Failed to fetch achievements'
      });
    }
  }
);

module.exports = router;
