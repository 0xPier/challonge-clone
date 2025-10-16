const express = require('express');
const Tournament = require('../models/Tournament');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/pending-tournaments
// @desc    Get all pending tournament approvals
// @access  Private (Admin only)
router.get('/pending-tournaments',
  authenticate,
  authorize('admin', 'superuser'),
  async (req, res) => {
    try {
      const tournaments = await Tournament.find({ status: 'pending-approval' })
        .populate('organizer', 'displayName email avatar')
        .sort({ createdAt: -1 });

      res.json({ tournaments });
    } catch (error) {
      console.error('Get pending tournaments error:', error);
      res.status(500).json({ error: 'Failed to fetch pending tournaments' });
    }
  }
);

// @route   GET /api/admin/tournaments/pending (legacy support)
// @desc    Get all pending tournament approvals
// @access  Private (Admin only)
router.get('/tournaments/pending',
  authenticate,
  authorize('admin', 'superuser'),
  async (req, res) => {
    try {
      const tournaments = await Tournament.find({ status: 'pending-approval' })
        .populate('organizer', 'displayName email avatar')
        .sort({ createdAt: -1 });

      res.json({ tournaments });
    } catch (error) {
      console.error('Get pending tournaments error:', error);
      res.status(500).json({ error: 'Failed to fetch pending tournaments' });
    }
  }
);

// @route   POST /api/admin/tournaments/:id/approve
// @desc    Approve a tournament
// @access  Private (Admin only)
router.post('/tournaments/:id/approve',
  authenticate,
  authorize('admin', 'superuser'),
  async (req, res) => {
    try {
      const tournament = await Tournament.findById(req.params.id);

      if (!tournament) {
        return res.status(404).json({ error: 'Tournament not found' });
      }

      if (tournament.status !== 'pending-approval') {
        return res.status(400).json({ error: 'Tournament is not pending approval' });
      }

      tournament.status = 'open';
      await tournament.save();

      res.json({
        message: 'Tournament approved successfully',
        tournament
      });
    } catch (error) {
      console.error('Approve tournament error:', error);
      res.status(500).json({ error: 'Failed to approve tournament' });
    }
  }
);

// @route   POST /api/admin/tournaments/:id/reject
// @desc    Reject a tournament
// @access Private (Admin only)
router.post('/tournaments/:id/reject',
  authenticate,
  authorize('admin', 'superuser'),
  async (req, res) => {
    try {
      const tournament = await Tournament.findById(req.params.id);

      if (!tournament) {
        return res.status(404).json({ error: 'Tournament not found' });
      }

      if (tournament.status !== 'pending-approval') {
        return res.status(400).json({ error: 'Tournament is not pending approval' });
      }

      tournament.status = 'rejected';
      await tournament.save();

      res.json({
        message: 'Tournament rejected successfully',
        tournament
      });
    } catch (error) {
      console.error('Reject tournament error:', error);
      res.status(500).json({ error: 'Failed to reject tournament' });
    }
  }
);

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private (Admin only)
router.get('/users',
  authenticate,
  authorize('admin', 'superuser'),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        role
      } = req.query;

      const filter = {};
      
      if (search) {
        filter.$or = [
          { displayName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      if (role) {
        filter.role = role;
      }

      const users = await User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await User.countDocuments(filter);

      res.json({
        users,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
);

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin only)
router.put('/users/:id/role',
  authenticate,
  authorize('admin', 'superuser'),
  async (req, res) => {
    try {
      const { role } = req.body;
      
      if (!['user', 'moderator', 'admin', 'superuser'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.role = role;
      await user.save();

      res.json({
        message: 'User role updated successfully',
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  }
);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private (Admin only)
router.get('/dashboard',
  authenticate,
  authorize('admin', 'superuser'),
  async (req, res) => {
    try {
      const [
        totalUsers,
        totalTournaments,
        pendingTournaments,
        activeTournaments
      ] = await Promise.all([
        User.countDocuments(),
        Tournament.countDocuments(),
        Tournament.countDocuments({ status: 'pending-approval' }),
        Tournament.countDocuments({ status: { $in: ['open', 'in-progress'] } })
      ]);

      res.json({
        stats: {
          totalUsers,
          totalTournaments,
          pendingTournaments,
          activeTournaments
        }
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  }
);

// @route   PUT /api/admin/tournaments/:id
// @desc    Edit tournament as admin
// @access  Private (Admin only)
router.put('/tournaments/:id',
  authenticate,
  authorize('admin', 'superuser'),
  async (req, res) => {
    try {
      const tournament = await Tournament.findById(req.params.id);

      if (!tournament) {
        return res.status(404).json({ error: 'Tournament not found' });
      }

      const allowedUpdates = [
        'name', 'description', 'game', 'format', 'maxParticipants',
        'startDate', 'endDate', 'status', 'isPublic', 'requireApproval'
      ];

      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          tournament[field] = req.body[field];
        }
      });

      await tournament.save();

      res.json({
        message: 'Tournament updated successfully',
        tournament
      });
    } catch (error) {
      console.error('Update tournament error:', error);
      res.status(500).json({ error: 'Failed to update tournament' });
    }
  }
);

// @route   DELETE /api/admin/tournaments/:id
// @desc    Delete tournament as admin
// @access  Private (Admin only)
router.delete('/tournaments/:id',
  authenticate,
  authorize('admin', 'superuser'),
  async (req, res) => {
    try {
      const tournament = await Tournament.findById(req.params.id);

      if (!tournament) {
        return res.status(404).json({ error: 'Tournament not found' });
      }

      // Delete associated matches
      await require('../models/Match').deleteMany({ tournament: tournament._id });

      await tournament.deleteOne();

      res.json({
        message: 'Tournament deleted successfully'
      });
    } catch (error) {
      console.error('Delete tournament error:', error);
      res.status(500).json({ error: 'Failed to delete tournament' });
    }
  }
);

// @route   POST /api/admin/tournaments/:id/start-early
// @desc    Start tournament early (bypass scheduled start time)
// @access  Private (Admin only)
router.post('/tournaments/:id/start-early',
  authenticate,
  authorize('admin', 'superuser'),
  async (req, res) => {
    try {
      const tournament = await Tournament.findById(req.params.id);

      if (!tournament) {
        return res.status(404).json({ error: 'Tournament not found' });
      }

      if (tournament.status === 'in-progress') {
        return res.status(400).json({ error: 'Tournament is already in progress' });
      }

      if (tournament.status === 'completed') {
        return res.status(400).json({ error: 'Tournament is already completed' });
      }

      // Check if there are enough participants
      if (tournament.participants.length < 2) {
        return res.status(400).json({ error: 'At least 2 participants required to start tournament' });
      }

      // Generate bracket if not already generated
      if (!tournament.bracketData || !tournament.bracketData.rounds || tournament.bracketData.rounds.length === 0) {
        const BracketGenerator = require('../services/bracketGenerator');
        const bracketData = await BracketGenerator.generateBracket(tournament, tournament.participants);
        tournament.bracketData = bracketData;
        
        // Create match documents
        await BracketGenerator.createMatches(tournament, bracketData);
      }

      tournament.status = 'in-progress';
      tournament.startDate = new Date(); // Override start date to now
      
      await tournament.save();

      res.json({
        message: 'Tournament started successfully',
        tournament
      });
    } catch (error) {
      console.error('Start tournament early error:', error);
      res.status(500).json({ error: 'Failed to start tournament early' });
    }
  }
);

// @route   POST /api/admin/tournaments/:id/participants/add
// @desc    Add participant to tournament as admin
// @access  Private (Admin only)
router.post('/tournaments/:id/participants/add',
  authenticate,
  authorize('admin', 'superuser'),
  async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const tournament = await Tournament.findById(req.params.id);
      const user = await User.findById(userId);

      if (!tournament) {
        return res.status(404).json({ error: 'Tournament not found' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if user is already registered
      const existingParticipant = tournament.participants.find(p => 
        p.user.toString() === userId.toString()
      );

      if (existingParticipant) {
        return res.status(400).json({ error: 'User is already registered for this tournament' });
      }

      // Check if tournament is full
      if (tournament.currentParticipants >= tournament.maxParticipants) {
        return res.status(400).json({ error: 'Tournament is full' });
      }

      // Add participant
      tournament.participants.push({
        user: userId,
        registeredAt: new Date(),
        status: 'registered'
      });

      tournament.currentParticipants += 1;
      await tournament.save();

      res.json({
        message: 'Participant added successfully',
        tournament
      });
    } catch (error) {
      console.error('Add participant error:', error);
      res.status(500).json({ error: 'Failed to add participant to tournament' });
    }
 }
);

// @route   DELETE /api/admin/tournaments/:id/participants/remove
// @desc    Remove participant from tournament as admin
// @access  Private (Admin only)
router.delete('/tournaments/:id/participants/remove',
  authenticate,
  authorize('admin', 'superuser'),
  async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const tournament = await Tournament.findById(req.params.id);
      const user = await User.findById(userId);

      if (!tournament) {
        return res.status(404).json({ error: 'Tournament not found' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Find participant index
      const participantIndex = tournament.participants.findIndex(p => 
        p.user.toString() === userId.toString()
      );

      if (participantIndex === -1) {
        return res.status(400).json({ error: 'User is not registered for this tournament' });
      }

      // Remove participant
      tournament.participants.splice(participantIndex, 1);
      tournament.currentParticipants -= 1;
      await tournament.save();

      res.json({
        message: 'Participant removed successfully',
        tournament
      });
    } catch (error) {
      console.error('Remove participant error:', error);
      res.status(500).json({ error: 'Failed to remove participant from tournament' });
    }
  }
);

// @route   GET /api/admin/tournaments
// @desc    Get all tournaments for admin management
// @access  Private (Admin only)
router.get('/tournaments',
  authenticate,
  authorize('admin', 'superuser'),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, status, search } = req.query;

      const filter = {};
      
      if (status) {
        filter.status = status;
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { game: { $regex: search, $options: 'i' } }
        ];
      }

      const tournaments = await Tournament.find(filter)
        .populate('organizer', 'displayName email avatar')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Tournament.countDocuments(filter);

      res.json({
        tournaments,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get tournaments error:', error);
      res.status(500).json({ error: 'Failed to fetch tournaments' });
    }
  }
);

module.exports = router;
