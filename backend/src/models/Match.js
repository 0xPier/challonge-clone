const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: [true, 'Match must belong to a tournament']
  },
  round: {
    type: Number,
    required: [true, 'Round number is required'],
    min: [1, 'Round must be at least 1']
  },
  matchNumber: {
    type: Number,
    required: [true, 'Match number is required']
  },
  // Players/competitors
  players: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    seed: {
      type: Number
    },
    score: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'ready', 'playing', 'completed', 'no-show', 'disqualified'],
      default: 'pending'
    }
  }],
  // For team-based tournaments
  teams: [{
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    score: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'ready', 'playing', 'completed', 'no-show', 'disqualified'],
      default: 'pending'
    }
  }],
  // Match result
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  winningTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'bye'],
    default: 'scheduled'
  },
  // Scheduling
  scheduledDate: {
    type: Date
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  // Match details
  format: {
    type: String,
    enum: ['single-game', 'best-of-3', 'best-of-5', 'best-of-7', 'custom'],
    default: 'single-game'
  },
  gameSettings: {
    timeLimit: {
      type: Number, // in minutes
    },
    maxScore: {
      type: Number
    },
    customRules: {
      type: String,
      maxlength: [1000, 'Custom rules cannot exceed 1000 characters']
    }
  },
  // Results and statistics
  results: {
    finalScore: {
      player1: { type: Number, default: 0 },
      player2: { type: Number, default: 0 }
    },
    gameScores: [{
      game: { type: Number, required: true },
      player1Score: { type: Number, default: 0 },
      player2Score: { type: Number, default: 0 },
      duration: { type: Number }, // in minutes
      notes: { type: String }
    }],
    statistics: {
      player1Stats: { type: mongoose.Schema.Types.Mixed },
      player2Stats: { type: mongoose.Schema.Types.Mixed }
    }
  },
  // Reporting and verification
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reportNotes: {
    type: String,
    maxlength: [500, 'Report notes cannot exceed 500 characters']
  },
  // Disputes and issues
  isDisputed: {
    type: Boolean,
    default: false
  },
  disputeReason: {
    type: String,
    maxlength: [500, 'Dispute reason cannot exceed 500 characters']
  },
  disputeResolved: {
    type: Boolean,
    default: false
  },
  // Streaming and media
  streamUrl: {
    type: String,
    trim: true
  },
  vodUrl: {
    type: String,
    trim: true
  },
  // Chat and comments
  allowChat: {
    type: Boolean,
    default: true
  },
  chatMessages: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isSystemMessage: {
      type: Boolean,
      default: false
    }
  }],
  // Bracket progression
  nextMatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  },
  previousMatches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  }],
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
matchSchema.index({ tournament: 1, round: 1 });
matchSchema.index({ tournament: 1, status: 1 });
matchSchema.index({ 'players.user': 1 });
matchSchema.index({ scheduledDate: 1 });
matchSchema.index({ status: 1, scheduledDate: 1 });

// Virtual for match duration
matchSchema.virtual('matchDuration').get(function() {
  if (this.startTime && this.endTime) {
    return Math.round((this.endTime - this.startTime) / (1000 * 60)); // in minutes
  }
  return this.duration || 0;
});

// Virtual for match progress
matchSchema.virtual('progress').get(function() {
  const now = new Date();
  if (this.status === 'completed') return 'completed';
  if (this.status === 'cancelled') return 'cancelled';
  if (this.status === 'bye') return 'bye';
  if (this.scheduledDate && now > this.scheduledDate) return 'overdue';
  if (this.startTime) return 'in-progress';
  return 'scheduled';
});

// Instance method to start match
matchSchema.methods.startMatch = function() {
  if (this.status !== 'scheduled') {
    throw new Error('Can only start scheduled matches');
  }

  this.status = 'in-progress';
  this.startTime = new Date();

  // Update player statuses
  this.players.forEach(player => {
    if (player.status === 'pending') {
      player.status = 'playing';
    }
  });

  return this.save();
};

// Instance method to complete match
matchSchema.methods.completeMatch = function(winnerId, finalScore, gameScores = []) {
  if (this.status !== 'in-progress') {
    throw new Error('Can only complete in-progress matches');
  }

  this.status = 'completed';
  this.endTime = new Date();
  this.duration = this.matchDuration;

  // Set winner
  if (winnerId) {
    this.winner = winnerId;
  }

  // Set final score
  if (finalScore) {
    this.results.finalScore = finalScore;
  }

  // Set game scores
  if (gameScores.length > 0) {
    this.results.gameScores = gameScores;
  }

  // Update player statuses
  this.players.forEach(player => {
    if (player.user.toString() === winnerId?.toString()) {
      player.status = 'completed';
    } else {
      player.status = 'completed';
    }
  });

  return this.save();
};

// Instance method to add chat message
matchSchema.methods.addChatMessage = function(userId, message, isSystemMessage = false) {
  if (!this.allowChat && !isSystemMessage) {
    throw new Error('Chat is disabled for this match');
  }

  this.chatMessages.push({
    user: userId,
    message: message,
    isSystemMessage: isSystemMessage
  });

  // Limit chat messages to last 100
  if (this.chatMessages.length > 100) {
    this.chatMessages = this.chatMessages.slice(-100);
  }

  return this.save();
};

// Instance method to report match result
matchSchema.methods.reportResult = function(reportedBy, winnerId, score, notes = '') {
  this.reportedBy = reportedBy;
  this.winner = winnerId;
  this.results.finalScore = score;
  this.reportNotes = notes;
  this.status = 'completed';

  return this.save();
};

// Static method to find matches by tournament and round
matchSchema.statics.findByTournamentAndRound = function(tournamentId, round) {
  return this.find({ tournament: tournamentId, round: round })
    .populate('players.user', 'displayName avatar')
    .populate('winner', 'displayName avatar')
    .sort({ matchNumber: 1 });
};

// Static method to find upcoming matches
matchSchema.statics.findUpcoming = function(limit = 10) {
  return this.find({
    status: 'scheduled',
    scheduledDate: { $gte: new Date() }
  })
    .populate('tournament', 'name game')
    .populate('players.user', 'displayName')
    .sort({ scheduledDate: 1 })
    .limit(limit);
};

// Static method to find matches requiring attention
matchSchema.statics.findRequiringAttention = function() {
  return this.find({
    $or: [
      { status: 'in-progress', endTime: { $exists: false } },
      { isDisputed: true, disputeResolved: false }
    ]
  })
    .populate('tournament', 'name')
    .populate('players.user', 'displayName');
};

module.exports = mongoose.model('Match', matchSchema);
