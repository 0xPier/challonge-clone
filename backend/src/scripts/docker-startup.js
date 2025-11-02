#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { spawn } = require('child_process');

/**
 * Docker startup script - seeds admin then starts server
 */
async function seedAdminUser() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/challonge-clone';

    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists:', existingAdmin.email);
      await mongoose.connection.close();
      return;
    }

    console.log('🔄 Creating admin user...');

    // Create admin user
    const adminUser = new User({
      email: 'admin@beybolt.com',
      password: 'Admin@123', // Will be hashed by the model
      displayName: 'Admin User',
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      stats: {
        tournamentsCreated: 0,
        tournamentsParticipated: 0,
        matchesWon: 0,
        matchesLost: 0,
        winRate: 0
      },
      preferences: {
        notifications: {
          email: true,
          push: true
        },
        timezone: 'UTC',
        language: 'en'
      }
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@beybolt.com');
    console.log('🔑 Password: Admin@123');
    console.log('⚠️  Please change the password after first login!');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
}

async function startServer() {
  console.log('🚀 Starting server...');
  const server = spawn('node', ['src/server.js'], {
    stdio: 'inherit',
    env: process.env
  });

  server.on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
  });

  server.on('exit', (code) => {
    console.log(`Server exited with code ${code}`);
    process.exit(code);
  });
}

// Main execution
(async () => {
  try {
    await seedAdminUser();
    await startServer();
  } catch (error) {
    console.error('❌ Startup error:', error);
    process.exit(1);
  }
})();
