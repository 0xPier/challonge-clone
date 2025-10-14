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

module.exports = router;
