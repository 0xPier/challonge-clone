const express = require('express');
const { body, validationResult } = require('express-validator');
const Match = require('../models/Match');
const Tournament = require('../models/Tournament');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/matches/:matchId
// @desc    Get match details
// @access  Public
router.get('/:matchId', async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId)
      .populate('players.user', 'displayName avatar stats')
      .populate('winner', 'displayName avatar')
      .populate('tournament', 'name game format status')
      .populate('reportedBy', 'displayName')
      .populate('verifiedBy', 'displayName');

    if (!match) {
      return res.status(404).json({
        error: 'Match not found'
      });
    }

    res.json({ match });

  } catch (error) {
    console.error('Get match error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid match ID'
      });
    }

    res.status(500).json({
      error: 'Failed to fetch match'
    });
  }
});

// @route   PUT /api/matches/:matchId/result
// @desc    Update match result
// @access  Private (Organizer, Admin, or Player)
router.put('/:matchId/result',
  authenticate,
  [
    body('winnerId')
      .notEmpty()
      .withMessage('Winner ID is required')
      .isMongoId()
      .withMessage('Invalid winner ID'),
    body('score.player1')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Player 1 score must be a non-negative integer'),
    body('score.player2')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Player 2 score must be a non-negative integer'),
    body('notes')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters')
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { winnerId, score, notes } = req.body;

      // Find match
      const match = await Match.findById(req.params.matchId)
        .populate('tournament', 'organizer status')
        .populate('players.user', '_id displayName');

      if (!match) {
        return res.status(404).json({
          error: 'Match not found'
        });
      }

      // Authorization check
      const isOrganizer = match.tournament.organizer.toString() === req.user._id.toString();
      const isAdmin = ['admin', 'moderator', 'superuser'].includes(req.user.role);
      const isParticipant = match.players.some(p => p.user._id.toString() === req.user._id.toString());

      if (!isOrganizer && !isAdmin && !isParticipant) {
        return res.status(403).json({
          error: 'Not authorized to update this match'
        });
      }

      // Validate tournament is active
      if (match.tournament.status !== 'active') {
        return res.status(400).json({
          error: 'Cannot update match results for inactive tournaments'
        });
      }

      // Validate match can be updated
      if (match.status === 'completed' && !isOrganizer && !isAdmin) {
        return res.status(400).json({
          error: 'Match is already completed. Only organizers can modify completed matches.'
        });
      }

      if (match.status === 'cancelled') {
        return res.status(400).json({
          error: 'Cannot update cancelled match'
        });
      }

      // Validate winner is a participant
      const winnerPlayer = match.players.find(p => p.user._id.toString() === winnerId);
      if (!winnerPlayer) {
        return res.status(400).json({
          error: 'Winner must be a participant in the match'
        });
      }

      // Start match if scheduled
      if (match.status === 'scheduled') {
        await match.startMatch();
      }

      // Update match result
      match.winner = winnerId;
      match.status = 'completed';
      match.endTime = new Date();
      match.reportedBy = req.user._id;
      
      if (score) {
        match.results.finalScore = {
          player1: score.player1 || 0,
          player2: score.player2 || 0
        };

        // Update player scores
        if (match.players[0]) {
          match.players[0].score = score.player1 || 0;
        }
        if (match.players[1]) {
          match.players[1].score = score.player2 || 0;
        }
      }

      if (notes) {
        match.reportNotes = notes;
      }

      // Mark players as completed
      match.players.forEach(player => {
        player.status = 'completed';
      });

      await match.save();

      // Update user statistics
      const winner = await User.findById(winnerId);
      const loser = match.players.find(p => p.user._id.toString() !== winnerId);

      if (winner) {
        winner.stats.matchesPlayed += 1;
        winner.stats.matchesWon += 1;
        winner.stats.winRate = (winner.stats.matchesWon / winner.stats.matchesPlayed) * 100;
        await winner.save();
      }

      if (loser && loser.user) {
        const loserUser = await User.findById(loser.user._id);
        if (loserUser) {
          loserUser.stats.matchesPlayed += 1;
          loserUser.stats.winRate = (loserUser.stats.matchesWon / loserUser.stats.matchesPlayed) * 100;
          await loserUser.save();
        }
      }

      // Reload match with populated fields
      const updatedMatch = await Match.findById(match._id)
        .populate('players.user', 'displayName avatar stats')
        .populate('winner', 'displayName avatar')
        .populate('tournament', 'name game format status')
        .populate('reportedBy', 'displayName');

      res.json({
        message: 'Match result updated successfully',
        match: updatedMatch
      });

    } catch (error) {
      console.error('Update match result error:', error);

      if (error.message.includes('Can only')) {
        return res.status(400).json({
          error: error.message
        });
      }

      res.status(500).json({
        error: 'Failed to update match result'
      });
    }
  }
);

// @route   POST /api/matches/:matchId/start
// @desc    Start a match
// @access  Private (Organizer or Admin)
router.post('/:matchId/start',
  authenticate,
  async (req, res) => {
    try {
      const match = await Match.findById(req.params.matchId)
        .populate('tournament', 'organizer status');

      if (!match) {
        return res.status(404).json({
          error: 'Match not found'
        });
      }

      // Authorization check
      const isOrganizer = match.tournament.organizer.toString() === req.user._id.toString();
      const isAdmin = ['admin', 'moderator', 'superuser'].includes(req.user.role);

      if (!isOrganizer && !isAdmin) {
        return res.status(403).json({
          error: 'Not authorized to start this match'
        });
      }

      if (match.status !== 'scheduled') {
        return res.status(400).json({
          error: 'Can only start scheduled matches'
        });
      }

      await match.startMatch();

      const updatedMatch = await Match.findById(match._id)
        .populate('players.user', 'displayName avatar')
        .populate('tournament', 'name game format');

      res.json({
        message: 'Match started successfully',
        match: updatedMatch
      });

    } catch (error) {
      console.error('Start match error:', error);
      res.status(500).json({
        error: error.message || 'Failed to start match'
      });
    }
  }
);

// @route   POST /api/matches/:matchId/dispute
// @desc    Dispute a match result
// @access  Private (Players)
router.post('/:matchId/dispute',
  authenticate,
  [
    body('reason')
      .notEmpty()
      .withMessage('Dispute reason is required')
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Dispute reason cannot exceed 500 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { reason } = req.body;

      const match = await Match.findById(req.params.matchId)
        .populate('players.user', '_id displayName');

      if (!match) {
        return res.status(404).json({
          error: 'Match not found'
        });
      }

      // Check if user is a participant
      const isParticipant = match.players.some(p => p.user._id.toString() === req.user._id.toString());

      if (!isParticipant) {
        return res.status(403).json({
          error: 'Only match participants can dispute results'
        });
      }

      if (match.status !== 'completed') {
        return res.status(400).json({
          error: 'Can only dispute completed matches'
        });
      }

      if (match.isDisputed) {
        return res.status(400).json({
          error: 'Match is already disputed'
        });
      }

      match.isDisputed = true;
      match.disputeReason = reason;
      await match.save();

      res.json({
        message: 'Match result disputed successfully. An admin will review.',
        match
      });

    } catch (error) {
      console.error('Dispute match error:', error);
      res.status(500).json({
        error: 'Failed to dispute match'
      });
    }
  }
);

// @route   GET /api/matches/tournament/:tournamentId
// @desc    Get all matches for a tournament
// @access  Public
router.get('/tournament/:tournamentId', async (req, res) => {
  try {
    const { round, status } = req.query;

    const filter = {
      tournament: req.params.tournamentId
    };

    if (round) {
      filter.round = parseInt(round);
    }

    if (status) {
      filter.status = status;
    }

    const matches = await Match.find(filter)
      .populate('players.user', 'displayName avatar')
      .populate('winner', 'displayName avatar')
      .sort({ round: 1, matchNumber: 1 });

    res.json({ matches });

  } catch (error) {
    console.error('Get tournament matches error:', error);
    res.status(500).json({
      error: 'Failed to fetch tournament matches'
    });
  }
});

// @route   GET /api/matches/user/:userId
// @desc    Get all matches for a user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const { status, limit = 20, skip = 0 } = req.query;

    const filter = {
      'players.user': req.params.userId
    };

    if (status) {
      filter.status = status;
    }

    const matches = await Match.find(filter)
      .populate('players.user', 'displayName avatar')
      .populate('winner', 'displayName avatar')
      .populate('tournament', 'name game format')
      .sort({ scheduledDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Match.countDocuments(filter);

    res.json({
      matches,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get user matches error:', error);
    res.status(500).json({
      error: 'Failed to fetch user matches'
    });
  }
});

module.exports = router;
