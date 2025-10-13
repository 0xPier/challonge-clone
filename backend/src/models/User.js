const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not using Google auth
    },
    minlength: [6, 'Password must be at least 6 characters long']
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
    maxlength: [50, 'Display name cannot exceed 50 characters']
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin', 'superuser'],
    default: 'user'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    timezone: { type: String, default: 'UTC' },
    language: { type: String, default: 'en' }
  },
  stats: {
    tournamentsCreated: { type: Number, default: 0 },
    tournamentsParticipated: { type: Number, default: 0 },
    matchesPlayed: { type: Number, default: 0 },
    matchesWon: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full profile
userSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    email: this.email,
    displayName: this.displayName,
    avatar: this.avatar,
    role: this.role,
    stats: this.stats,
    joinedAt: this.createdAt
  };
});

// Index for better query performance
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password') || !this.password) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to update stats
userSchema.methods.updateStats = function(statsUpdate) {
  Object.keys(statsUpdate).forEach(key => {
    if (this.stats[key] !== undefined) {
      this.stats[key] += statsUpdate[key];
    }
  });

  // Recalculate win rate if matches played or won changed
  if (statsUpdate.matchesPlayed || statsUpdate.matchesWon) {
    this.stats.winRate = this.stats.matchesPlayed > 0
      ? (this.stats.matchesWon / this.stats.matchesPlayed) * 100
      : 0;
  }

  return this.save();
};

// Static method to find by email or googleId
userSchema.statics.findByAuth = function(email, googleId) {
  const query = {};
  if (email) query.email = email.toLowerCase();
  if (googleId) query.googleId = googleId;

  if (Object.keys(query).length === 0) {
    return Promise.reject(new Error('Either email or googleId must be provided'));
  }

  return this.findOne(query);
};

module.exports = mongoose.model('User', userSchema);
