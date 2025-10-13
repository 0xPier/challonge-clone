const express = require('express');
const { body, validationResult } = require('express-validator');
const Tournament = require('../models/Tournament');
const BracketGenerator = require('../services/bracketGenerator');
const { authenticate, authorize, authorizeTournamentOrganizer } = require('../middleware/auth');

const router = express.Router();

// Input validation rules
const createTournamentValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Tournament name must be between 3 and 100 characters'),
  body('game')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Game/sport name must be between 2 and 50 characters'),
  body('format')
    .isIn(['single-elimination', 'double-elimination', 'round-robin', 'swiss', 'free-for-all'])
    .withMessage('Invalid tournament format'),
  body('maxParticipants')
    .isInt({ min: 2, max: 512 })
    .withMessage('Maximum participants must be between 2 and 512'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('registrationDeadline')
    .isISO8601()
    .withMessage('Registration deadline must be a valid date')
];

// @route   GET /api/tournaments
// @desc    Get all tournaments with optional filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      status,
      game,
      format,
      league,
      organizer,
      limit = 20,
      skip = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (game) {
      filter.game = new RegExp(game, 'i');
    }

    if (format) {
      filter.format = format;
    }

    if (league) {
      filter.league = league;
    }

    if (organizer) {
      filter.organizer = organizer;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tournaments = await Tournament.find(filter)
      .populate('organizer', 'displayName avatar')
      .populate('league', 'name type')
      .sort(sort)
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
    console.error('Get tournaments error:', error);
    res.status(500).json({
      error: 'Failed to fetch tournaments'
    });
  }
});

// @route   GET /api/tournaments/active
// @desc    Get active tournaments
// @access  Public
router.get('/active', async (req, res) => {
  try {
    const tournaments = await Tournament.findActive();
    res.json({ tournaments });

  } catch (error) {
    console.error('Get active tournaments error:', error);
    res.status(500).json({
      error: 'Failed to fetch active tournaments'
    });
  }
});

// @route   GET /api/tournaments/:id
// @desc    Get tournament by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('organizer', 'displayName avatar')
      .populate('moderators', 'displayName avatar')
      .populate('league', 'name type')
      .populate('participants.user', 'displayName avatar');

    if (!tournament) {
      return res.status(404).json({
        error: 'Tournament not found'
      });
    }

    res.json({ tournament });

  } catch (error) {
    console.error('Get tournament error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid tournament ID'
      });
    }

    res.status(500).json({
      error: 'Failed to fetch tournament'
    });
  }
});

// @route   POST /api/tournaments
// @desc    Create a new tournament
// @access  Private (Admin/Mod/Superuser only)
router.post('/',
  authenticate,
  authorize('admin', 'moderator', 'superuser'),
  createTournamentValidation,
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

      const {
        name,
        description,
        game,
        format,
        maxParticipants,
        startDate,
        endDate,
        registrationDeadline,
        settings,
        rules,
        league,
        tags,
        visibility
      } = req.body;

      // Validate dates
      const start = new Date(startDate);
      const registrationEnd = new Date(registrationDeadline);

      if (start <= registrationEnd) {
        return res.status(400).json({
          error: 'Start date must be after registration deadline'
        });
      }

      if (endDate && new Date(endDate) <= start) {
        return res.status(400).json({
          error: 'End date must be after start date'
        });
      }

      // Create tournament
      const tournament = new Tournament({
        name,
        description,
        game,
        format,
        maxParticipants,
        startDate: start,
        endDate: endDate ? new Date(endDate) : null,
        registrationDeadline: registrationEnd,
        settings,
        rules,
        league,
        tags,
        visibility,
        organizer: req.user._id
      });

      await tournament.save();

      // Update user stats
      await req.user.updateStats({ tournamentsCreated: 1 });

      // Populate the tournament for response
      await tournament.populate('organizer', 'displayName avatar');
      await tournament.populate('league', 'name type');

      res.status(201).json({
        message: 'Tournament created successfully',
        tournament
      });

    } catch (error) {
      console.error('Create tournament error:', error);
      res.status(500).json({
        error: 'Failed to create tournament'
      });
    }
  }
);

// @route   PUT /api/tournaments/:id
// @desc    Update tournament
// @access  Private (Tournament organizer or admin)
router.put('/:id',
  authenticate,
  authorizeTournamentOrganizer,
  async (req, res) => {
    try {
      const updates = req.body;
      const tournament = req.tournament;

      // Don't allow status changes through this route
      delete updates.status;

      // Update allowed fields
      const allowedUpdates = [
        'name', 'description', 'game', 'maxParticipants',
        'startDate', 'endDate', 'registrationDeadline',
        'settings', 'rules', 'tags', 'visibility'
      ];

      allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
          tournament[field] = updates[field];
        }
      });

      await tournament.save();

      res.json({
        message: 'Tournament updated successfully',
        tournament
      });

    } catch (error) {
      console.error('Update tournament error:', error);
      res.status(500).json({
        error: 'Failed to update tournament'
      });
    }
  }
);

// @route   DELETE /api/tournaments/:id
// @desc    Delete tournament
// @access  Private (Tournament organizer or admin)
router.delete('/:id',
  authenticate,
  authorizeTournamentOrganizer,
  async (req, res) => {
    try {
      const tournament = req.tournament;

      // Only allow deletion of draft tournaments
      if (tournament.status !== 'draft') {
        return res.status(400).json({
          error: 'Can only delete draft tournaments'
        });
      }

      await Tournament.findByIdAndDelete(tournament._id);

      res.json({
        message: 'Tournament deleted successfully'
      });

    } catch (error) {
      console.error('Delete tournament error:', error);
      res.status(500).json({
        error: 'Failed to delete tournament'
      });
    }
  }
);

// @route   POST /api/tournaments/:id/register
// @desc    Register for tournament
// @access  Private
router.post('/:id/register',
  authenticate,
  async (req, res) => {
    try {
      const tournament = await Tournament.findById(req.params.id);

      if (!tournament) {
        return res.status(404).json({
          error: 'Tournament not found'
        });
      }

      // Check if user is already registered
      const isAlreadyRegistered = tournament.participants.some(
        p => p.user.toString() === req.user._id.toString()
      );

      if (isAlreadyRegistered) {
        return res.status(400).json({
          error: 'Already registered for this tournament'
        });
      }

      // Add participant
      await tournament.addParticipant(req.user._id);

      // Update user stats
      await req.user.updateStats({ tournamentsParticipated: 1 });

      res.json({
        message: 'Successfully registered for tournament'
      });

    } catch (error) {
      console.error('Tournament registration error:', error);

      if (error.message.includes('already registered') ||
          error.message.includes('full') ||
          error.message.includes('deadline')) {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({
        error: 'Failed to register for tournament'
      });
    }
  }
);

// @route   DELETE /api/tournaments/:id/register
// @desc    Unregister from tournament
// @access  Private
router.delete('/:id/register',
  authenticate,
  async (req, res) => {
    try {
      const tournament = await Tournament.findById(req.params.id);

      if (!tournament) {
        return res.status(404).json({
          error: 'Tournament not found'
        });
      }

      // Check if user is registered
      const isRegistered = tournament.participants.some(
        p => p.user.toString() === req.user._id.toString()
      );

      if (!isRegistered) {
        return res.status(400).json({
          error: 'Not registered for this tournament'
        });
      }

      // Remove participant
      await tournament.removeParticipant(req.user._id);

      res.json({
        message: 'Successfully unregistered from tournament'
      });

    } catch (error) {
      console.error('Tournament unregistration error:', error);

      if (error.message.includes('not registered')) {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({
        error: 'Failed to unregister from tournament'
      });
    }
  }
);

// @route   POST /api/tournaments/:id/start
// @desc    Start tournament
// @access  Private (Tournament organizer or admin)
router.post('/:id/start',
  authenticate,
  authorizeTournamentOrganizer,
  async (req, res) => {
    try {
      const tournament = req.tournament;

      // Check if tournament can be started
      if (tournament.status !== 'draft' && tournament.status !== 'open') {
        return res.status(400).json({
          error: 'Tournament cannot be started in its current state'
        });
      }

      if (tournament.currentParticipants < 2) {
        return res.status(400).json({
          error: 'Tournament needs at least 2 participants to start'
        });
      }

      // Generate tournament bracket
      const bracketData = await BracketGenerator.generateBracket(
        tournament,
        tournament.participants
      );

      // Create actual match documents
      const matches = await BracketGenerator.createMatches(tournament, bracketData);

      // Update tournament status and bracket data
      tournament.status = 'in-progress';
      tournament.bracketData = bracketData;
      await tournament.save();

      // Emit real-time update
      const io = req.app.get('io');
      io.emit('tournament-started', {
        tournamentId: tournament._id,
        bracketData,
        matches: matches.length
      });

      res.json({
        message: 'Tournament started successfully',
        tournament,
        bracketData,
        matchesCreated: matches.length
      });

    } catch (error) {
      console.error('Start tournament error:', error);
      res.status(500).json({
        error: 'Failed to start tournament'
      });
    }
  }
);

// @route   GET /api/tournaments/:id/bracket
// @desc    Get tournament bracket
// @access  Public
router.get('/:id/bracket', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        error: 'Tournament not found'
      });
    }

    // Generate bracket data if not exists
    if (!tournament.bracketData.rounds || tournament.bracketData.rounds.length === 0) {
      // TODO: Generate bracket based on tournament format and participants
      return res.json({
        message: 'Bracket not yet generated',
        bracket: null
      });
    }

    res.json({
      bracket: tournament.bracketData
    });

  } catch (error) {
    console.error('Get bracket error:', error);
    res.status(500).json({
      error: 'Failed to fetch tournament bracket'
    });
  }
});

// @route   GET /api/tournaments/by-game/:game
// @desc    Get tournaments by game
// @access  Public
router.get('/by-game/:game', async (req, res) => {
  try {
    const tournaments = await Tournament.findByGame(req.params.game);
    res.json({ tournaments });

  } catch (error) {
    console.error('Get tournaments by game error:', error);
    res.status(500).json({
      error: 'Failed to fetch tournaments'
    });
  }
});

// @route   POST /api/tournaments/:id/check-in
// @desc    Check in for tournament
// @access  Private
router.post('/:id/check-in',
  authenticate,
  async (req, res) => {
    try {
      const tournament = await Tournament.findById(req.params.id);

      if (!tournament) {
        return res.status(404).json({
          error: 'Tournament not found'
        });
      }

      // Check if check-in is enabled
      if (!tournament.checkInEnabled) {
        return res.status(400).json({
          error: 'Check-in is not enabled for this tournament'
        });
      }

      // Check if user is registered
      const participant = tournament.participants.find(
        p => p.user.toString() === req.user._id.toString()
      );

      if (!participant) {
        return res.status(400).json({
          error: 'Not registered for this tournament'
        });
      }

      // Check if check-in period is active
      const now = new Date();
      if (tournament.checkInStart && now < tournament.checkInStart) {
        return res.status(400).json({
          error: 'Check-in period has not started yet'
        });
      }

      if (tournament.checkInEnd && now > tournament.checkInEnd) {
        return res.status(400).json({
          error: 'Check-in period has ended'
        });
      }

      // Update check-in status
      participant.checkedIn = true;
      await tournament.save();

      res.json({
        message: 'Checked in successfully'
      });

    } catch (error) {
      console.error('Check-in error:', error);
      res.status(500).json({
        error: 'Failed to check in'
      });
    }
  }
);

module.exports = router;
