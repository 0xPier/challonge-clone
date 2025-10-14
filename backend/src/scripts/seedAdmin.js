require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Seed admin user for initial setup
 * Run with: node src/scripts/seedAdmin.js
 */
async function seedAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/challonge-clone';

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      email: 'admin@challonge.local',
      password: 'admin123', // Will be hashed by the model
      displayName: 'Admin',
      role: 'admin',
      isVerified: true,
      stats: {
        tournamentsCreated: 0,
        tournamentsParticipated: 0,
        matchesWon: 0,
        matchesLost: 0,
        winRate: 0
      }
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@challonge.local');
    console.log('Password: admin123');
    console.log('⚠️  Please change the password after first login in production!');

    // Create a test user as well
    const testUser = new User({
      email: 'user@test.com',
      password: 'test123',
      displayName: 'Test User',
      role: 'user',
      isVerified: true,
      stats: {
        tournamentsCreated: 0,
        tournamentsParticipated: 0,
        matchesWon: 0,
        matchesLost: 0,
        winRate: 0
      }
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('Email: user@test.com');
    console.log('Password: test123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
