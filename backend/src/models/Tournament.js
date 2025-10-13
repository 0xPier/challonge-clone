const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tournament name is required'],
    trim: true,
    maxlength: [100, 'Tournament name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  },
  game: {
    type: String,
    required: [true, 'Game/sport is required'],
    trim: true,
    maxlength: [50, 'Game name cannot exceed 50 characters']
  },
  format: {
    type: String,
    enum: ['single-elimination', 'double-elimination', 'round-robin', 'swiss', 'free-for-all'],
    required: [true, 'Tournament format is required']
  },
  status: {
    type: String,
    enum: ['draft', 'open', 'in-progress', 'completed', 'cancelled'],
    default: 'draft'
  },
  maxParticipants: {
    type: Number,
    required: [true, 'Maximum participants is required'],
    min: [2, 'Minimum 2 participants required'],
    max: [512, 'Maximum 512 participants allowed']
  },
  currentParticipants: {
    type: Number,
    default: 0,
    min: 0
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Registration deadline is required']
  },
  checkInEnabled: {
    type: Boolean,
    default: false
  },
  checkInStart: {
    type: Date
  },
  checkInEnd: {
    type: Date
  },
  // Tournament settings
  settings: {
    allowSelfRegistration: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    showAsOfficial: { type: Boolean, default: false },
    hideForum: { type: Boolean, default: false },
    allowParticipantScheduling: { type: Boolean, default: false },
    showRounds: { type: Boolean, default: true },
    allowMatchReporting: { type: Boolean, default: true }
  },
  // Prize information
  prizes: [{
    position: { type: Number, required: true },
    description: { type: String, required: true },
    value: { type: Number, default: 0 }
  }],
  // Rules and regulations
  rules: {
    type: String,
    maxlength: [5000, 'Rules cannot exceed 5000 characters'],
    default: ''
  },
  // Bracket data (for complex tournament structures)
  bracketData: {
    rounds: [{
      roundNumber: { type: Number, required: true },
      matches: [{
        matchId: { type: mongoose.Schema.Types.ObjectId, required: true },
        player1: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        player2: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: {
          type: String,
          enum: ['pending', 'in-progress', 'completed', 'bye'],
          default: 'pending'
        },
        score: {
          player1: { type: Number, default: 0 },
          player2: { type: Number, default: 0 }
        },
        scheduledDate: { type: Date },
        completedDate: { type: Date }
      }],
      isComplete: { type: Boolean, default: false }
    }],
    currentRound: { type: Number, default: 1 },
    totalRounds: { type: Number, required: true }
  },
  // Participants and seeding
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seed: { type: Number },
    checkedIn: { type: Boolean, default: false },
    registeredAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['registered', 'checked-in', 'eliminated', 'disqualified'],
      default: 'registered'
    }
  }],
  // League association
  league: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League'
  },
  // Organizer information
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Tournament must have an organizer']
  },
  // Moderators (can help manage the tournament)
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Statistics
  stats: {
    totalMatches: { type: Number, default: 0 },
    completedMatches: { type: Number, default: 0 },
    averageMatchDuration: { type: Number, default: 0 }, // in minutes
    totalViewers: { type: Number, default: 0 }
  },
  // Media and attachments
  banner: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    default: ''
  },
  // Tags for categorization
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  // Visibility and access
  visibility: {
    type: String,
    enum: ['public', 'unlisted', 'private'],
    default: 'public'
  },
  accessCode: {
    type: String,
    trim: true
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
tournamentSchema.index({ status: 1, startDate: -1 });
tournamentSchema.index({ game: 1, status: 1 });
tournamentSchema.index({ organizer: 1 });
tournamentSchema.index({ league: 1 });
tournamentSchema.index({ 'participants.user': 1 });
tournamentSchema.index({ tags: 1 });
tournamentSchema.index({ visibility: 1 });

// Virtual for participant count
tournamentSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Virtual for completion percentage
tournamentSchema.virtual('completionPercentage').get(function() {
  if (this.stats.totalMatches === 0) return 0;
  return Math.round((this.stats.completedMatches / this.stats.totalMatches) * 100);
});

// Virtual for tournament progress
tournamentSchema.virtual('progress').get(function() {
  const now = new Date();
  if (this.status === 'completed') return 'completed';
  if (this.status === 'cancelled') return 'cancelled';
  if (now < this.startDate) return 'upcoming';
  if (now >= this.startDate && now <= this.endDate) return 'in-progress';
  return 'unknown';
});

// Instance method to add participant
tournamentSchema.methods.addParticipant = function(userId, seed = null) {
  // Check if user is already registered
  const existingParticipant = this.participants.find(p => p.user.toString() === userId.toString());
  if (existingParticipant) {
    throw new Error('User is already registered for this tournament');
  }

  // Check if tournament is full
  if (this.currentParticipants >= this.maxParticipants) {
    throw new Error('Tournament is full');
  }

  // Check if registration is still open
  if (new Date() > this.registrationDeadline) {
    throw new Error('Registration deadline has passed');
  }

  // Add participant
  this.participants.push({
    user: userId,
    seed: seed,
    registeredAt: new Date()
  });

  this.currentParticipants += 1;

  return this.save();
};

// Instance method to remove participant
tournamentSchema.methods.removeParticipant = function(userId) {
  const participantIndex = this.participants.findIndex(p => p.user.toString() === userId.toString());
  if (participantIndex === -1) {
    throw new Error('User is not registered for this tournament');
  }

  this.participants.splice(participantIndex, 1);
  this.currentParticipants -= 1;

  return this.save();
};

// Instance method to update match result
tournamentSchema.methods.updateMatchResult = function(matchId, winnerId, score) {
  const match = this.bracketData.rounds
    .flatMap(round => round.matches)
    .find(m => m.matchId.toString() === matchId.toString());

  if (!match) {
    throw new Error('Match not found');
  }

  match.winner = winnerId;
  match.status = 'completed';
  match.completedDate = new Date();
  match.score = score || match.score;

  // Update tournament stats
  this.stats.completedMatches += 1;

  return this.save();
};

// Static method to find active tournaments
tournamentSchema.statics.findActive = function() {
  return this.find({
    status: { $in: ['open', 'in-progress'] },
    startDate: { $lte: new Date() },
    $or: [
      { endDate: { $exists: false } },
      { endDate: { $gte: new Date() } }
    ]
  }).populate('organizer', 'displayName avatar');
};

// Static method to find by game
tournamentSchema.statics.findByGame = function(game) {
  return this.find({ game: new RegExp(game, 'i') }).populate('organizer', 'displayName avatar');
};

module.exports = mongoose.model('Tournament', tournamentSchema);
