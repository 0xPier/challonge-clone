const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Load environment variables
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, './backend/.env') });

async function createAdmin() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/challonge-clone';
  
  const client = new MongoClient(mongoUri, {
    serverSelectionTimeoutMS: 1000,
    socketTimeoutMS: 45000,
  });

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');

    // Check if admin user already exists
    console.log('Checking for existing admin users...');
    const existingAdmin = await usersCollection.findOne({ 
      $or: [
        { role: 'admin' },
        { role: 'superuser' },
        { email: 'admin@beybolt.com' }
      ] 
    });

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      console.log('Admin user details:', {
        email: existingAdmin.email,
        displayName: existingAdmin.displayName,
        role: existingAdmin.role
      });
      process.exit(0);
    }

    console.log('No existing admin found, creating new admin user...');

    // Create admin user
    const adminData = {
      email: 'admin@beybolt.com',
      displayName: 'Admin User',
      password: await bcrypt.hash('Admin@123', 12),
      role: 'admin',
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date(),
      isActive: true,
      preferences: {
        notifications: {
          email: true,
          push: true
        },
        timezone: 'UTC',
        language: 'en'
      },
      stats: {
        tournamentsCreated: 0,
        tournamentsParticipated: 0,
        matchesPlayed: 0,
        matchesWon: 0,
        winRate: 0
      }
    };

    const result = await usersCollection.insertOne(adminData);

    console.log('Admin user created successfully!');
    console.log('Email:', adminData.email);
    console.log('Password: Admin@123');
    console.log('Role:', adminData.role);
    console.log('User ID:', result.insertedId);

  } catch (error) {
    console.error('Error creating admin user:', error);
    console.error('Error code:', error.code);
    console.error('Error name:', error.name);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
createAdmin();
