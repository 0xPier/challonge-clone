const mongoose = require('mongoose');

const leagueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'League name is required'],
    trim: true,
    maxlength: [100, 'League name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: ''
  },
  type: {
    type: String,
    enum: ['standard', 'limited', 'u14', 'u18', 'pro', 'amateur', 'casual', 'competitive'],
    required: [true, 'League type is required']
  },
  game: {
    type: String,
    required: [true, 'Game/sport is required'],
    trim: true,
    maxlength: [50, 'Game name cannot exceed 50 characters']
  },
  // League settings
  settings: {
    maxParticipants: {
      type: Number,
      default: 512,
      min: [2, 'Minimum 2 participants required'],
      max: [1000, 'Maximum 1000 participants allowed']
    },
    minParticipants: {
      type: Number,
      default: 8,
      min: [2, 'Minimum 2 participants required']
    },
    allowAutoRegistration: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    seasonDuration: {
      type: Number, // in weeks
      default: 12,
      min: [1, 'Season must be at least 1 week'],
      max: [52, 'Season cannot exceed 52 weeks']
    },
    tournamentFormat: {
      type: String,
      enum: ['single-elimination', 'double-elimination', 'round-robin', 'swiss'],
      default: 'single-elimination'
    },
    pointsSystem: {
      win: { type: Number, default: 3 },
      loss: { type: Number, default: 0 },
      draw: { type: Number, default: 1 }
    }
  },
  // Season information
  currentSeason: {
    number: { type: Number, default: 1 },
    name: { type: String, default: 'Season 1' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed'],
      default: 'upcoming'
    }
  },
  // League structure
  divisions: [{
    name: { type: String, required: true },
    level: { type: Number, required: true }, // 1 = highest division
    participants: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      joinedDate: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
      },
      stats: {
        matchesPlayed: { type: Number, default: 0 },
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        draws: { type: Number, default: 0 },
        points: { type: Number, default: 0 }
      }
    }],
    schedule: [{
      week: { type: Number, required: true },
      matches: [{
        player1: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        player2: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        scheduledDate: { type: Date },
        status: {
          type: String,
          enum: ['scheduled', 'completed', 'cancelled'],
          default: 'scheduled'
        },
        result: {
          winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          score: { type: String }
        }
      }]
    }]
  }],
  // Tournament series
  tournaments: [{
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament'
    },
    week: { type: Number },
    type: {
      type: String,
      enum: ['regular', 'playoffs', 'finals', 'special'],
      default: 'regular'
    },
    requiredParticipants: {
      type: Number,
      default: 0
    }
  }],
  // Ranking system
  ranking: {
    type: {
      type: String,
      enum: ['points', 'win-rate', 'elo', 'custom'],
      default: 'points'
    },
    lastUpdated: { type: Date, default: Date.now },
    standings: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rank: { type: Number, required: true },
      points: { type: Number, default: 0 },
      matchesPlayed: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      draws: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 }
    }]
  },
  // Prizes and rewards
  prizes: [{
    position: { type: Number, required: true },
    description: { type: String, required: true },
    value: { type: Number, default: 0 },
    type: {
      type: String,
      enum: ['cash', 'trophy', 'medal', 'certificate', 'other'],
      default: 'other'
    }
  }],
  // Rules and regulations
  rules: {
    type: String,
    maxlength: [10000, 'Rules cannot exceed 10000 characters'],
    default: ''
  },
  // Media and branding
  logo: {
    type: String,
    default: ''
  },
  banner: {
    type: String,
    default: ''
  },
  primaryColor: {
    type: String,
    default: '#3B82F6'
  },
  secondaryColor: {
    type: String,
    default: '#1E40AF'
  },
  // Access and visibility
  visibility: {
    type: String,
    enum: ['public', 'invite-only', 'private'],
    default: 'public'
  },
  joinCode: {
    type: String,
    trim: true
  },
  // Moderation
  moderators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'organizer'],
      default: 'moderator'
    },
    addedDate: { type: Date, default: Date.now }
  }],
  // Statistics
  stats: {
    totalMembers: { type: Number, default: 0 },
    activeMembers: { type: Number, default: 0 },
    totalTournaments: { type: Number, default: 0 },
    completedTournaments: { type: Number, default: 0 },
    totalMatches: { type: Number, default: 0 }
  },
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'League must have a creator']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
leagueSchema.index({ type: 1, game: 1 });
leagueSchema.index({ 'currentSeason.status': 1 });
leagueSchema.index({ visibility: 1 });
leagueSchema.index({ createdBy: 1 });
leagueSchema.index({ 'divisions.participants.user': 1 });

// Virtual for active participants count
leagueSchema.virtual('activeParticipantCount').get(function() {
  return this.divisions.reduce((total, division) => {
    return total + division.participants.filter(p => p.status === 'active').length;
  }, 0);
});

// Virtual for league status
leagueSchema.virtual('status').get(function() {
  const now = new Date();
  if (!this.currentSeason) return 'no-season';

  if (now < this.currentSeason.startDate) return 'upcoming';
  if (now >= this.currentSeason.startDate && now <= this.currentSeason.endDate) return 'active';
  return 'completed';
});

// Instance method to add participant to division
leagueSchema.methods.addParticipant = function(userId, divisionName) {
  const division = this.divisions.find(d => d.name === divisionName);
  if (!division) {
    throw new Error('Division not found');
  }

  // Check if user is already in the league
  const isAlreadyParticipant = this.divisions.some(d =>
    d.participants.some(p => p.user.toString() === userId.toString())
  );

  if (isAlreadyParticipant) {
    throw new Error('User is already a participant in this league');
  }

  // Check if division is full
  if (division.participants.length >= this.settings.maxParticipants) {
    throw new Error('Division is full');
  }

  // Add participant
  division.participants.push({
    user: userId,
    joinedDate: new Date(),
    status: 'active'
  });

  // Update league stats
  this.stats.totalMembers += 1;
  this.stats.activeMembers += 1;

  return this.save();
};

// Instance method to update rankings
leagueSchema.methods.updateRankings = function() {
  const allParticipants = [];

  // Collect all participants from all divisions
  this.divisions.forEach(division => {
    division.participants.forEach(participant => {
      if (participant.status === 'active') {
        allParticipants.push({
          user: participant.user,
          stats: participant.stats,
          division: division.name,
          divisionLevel: division.level
        });
      }
    });
  });

  // Sort by points, then by win rate, then by matches played
  allParticipants.sort((a, b) => {
    if (a.stats.points !== b.stats.points) {
      return b.stats.points - a.stats.points;
    }
    if (a.stats.winRate !== b.stats.winRate) {
      return b.stats.winRate - a.stats.winRate;
    }
    return b.stats.matchesPlayed - a.stats.matchesPlayed;
  });

  // Update rankings
  this.ranking.standings = allParticipants.map((participant, index) => ({
    user: participant.user,
    rank: index + 1,
    points: participant.stats.points,
    matchesPlayed: participant.stats.matchesPlayed,
    wins: participant.stats.wins,
    losses: participant.stats.losses,
    draws: participant.stats.draws,
    winRate: participant.stats.winRate
  }));

  this.ranking.lastUpdated = new Date();

  return this.save();
};

// Instance method to create new season
leagueSchema.methods.createNewSeason = function(seasonNumber, name, startDate, endDate) {
  this.currentSeason = {
    number: seasonNumber,
    name: name,
    startDate: startDate,
    endDate: endDate,
    status: 'upcoming'
  };

  // Reset all participant stats for new season
  this.divisions.forEach(division => {
    division.participants.forEach(participant => {
      participant.stats = {
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        points: 0
      };
    });
  });

  return this.save();
};

// Static method to find active leagues
leagueSchema.statics.findActive = function() {
  return this.find({
    isActive: true,
    'currentSeason.status': { $in: ['active', 'upcoming'] }
  }).populate('createdBy', 'displayName avatar');
};

// Static method to find by game
leagueSchema.statics.findByGame = function(game) {
  return this.find({ game: new RegExp(game, 'i') })
    .populate('createdBy', 'displayName avatar');
};

// Static method to find leagues by type
leagueSchema.statics.findByType = function(type) {
  return this.find({ type: type, isActive: true })
    .populate('createdBy', 'displayName avatar');
};

module.exports = mongoose.model('League', leagueSchema);
