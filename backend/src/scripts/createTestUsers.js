require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Create additional test users for tournament testing
 * Run with: node src/scripts/createTestUsers.js
 */
async function createTestUsers() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/challonge-clone';

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');

    const testUsers = [
      {
        email: 'player1@test.com',
        password: 'test123',
        displayName: 'Player One',
        role: 'user',
        isVerified: true,
        stats: {
          tournamentsCreated: 0,
          tournamentsParticipated: 0,
          matchesWon: 0,
          matchesLost: 0,
          winRate: 0
        }
      },
      {
        email: 'player2@test.com',
        password: 'test123',
        displayName: 'Player Two',
        role: 'user',
        isVerified: true,
        stats: {
          tournamentsCreated: 0,
          tournamentsParticipated: 0,
          matchesWon: 0,
          matchesLost: 0,
          winRate: 0
        }
      },
      {
        email: 'player3@test.com',
        password: 'test123',
        displayName: 'Player Three',
        role: 'user',
        isVerified: true,
        stats: {
          tournamentsCreated: 0,
          tournamentsParticipated: 0,
          matchesWon: 0,
          matchesLost: 0,
          winRate: 0
        }
      },
      {
        email: 'player4@test.com',
        password: 'test123',
        displayName: 'Player Four',
        role: 'user',
        isVerified: true,
        stats: {
          tournamentsCreated: 0,
          tournamentsParticipated: 0,
          matchesWon: 0,
          matchesLost: 0,
          winRate: 0
        }
      },
      {
        email: 'organizer@test.com',
        password: 'test123',
        displayName: 'Tournament Organizer',
        role: 'user',
        isVerified: true,
        stats: {
          tournamentsCreated: 0,
          tournamentsParticipated: 0,
          matchesWon: 0,
          matchesLost: 0,
          winRate: 0
        }
      }
    ];

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User already exists: ${userData.email}`);
        continue;
      }

      // Create new user
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${userData.email} (${userData.displayName})`);
    }

    console.log('\n🎮 Test users created successfully!');
    console.log('\nAvailable accounts for testing:');
    console.log('Admin: admin@beybolt.com / admin123');
    console.log('Organizer: organizer@test.com / test123');
    console.log('Players:');
    console.log('- player1@test.com / test123');
    console.log('- player2@test.com / test123');
    console.log('- player3@test.com / test123');
    console.log('- player4@test.com / test123');
    console.log('- user@test.com / test123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    process.exit(1);
  }
}

createTestUsers();
