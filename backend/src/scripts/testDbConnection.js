require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function testDbConnection() {
  try {
    console.log('🔧 Testing Database Connection...\n');

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/challonge-clone';

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');

    // Test basic query
    console.log('\nTesting basic user query...');
    const userCount = await User.countDocuments();
    console.log(`✅ Found ${userCount} users in database`);

    // Test specific user query
    console.log('\nTesting specific user query...');
    const adminUser = await User.findOne({ email: 'admin@beybolt.com' });
    if (adminUser) {
      console.log('✅ Admin user found');
      console.log('Email:', adminUser.email);
      console.log('Role:', adminUser.role);
      console.log('isActive:', adminUser.isActive);

      // Test password comparison
      console.log('\nTesting password comparison...');
      const isPasswordValid = await adminUser.comparePassword('admin123');
      console.log('Password comparison result:', isPasswordValid);
    } else {
      console.log('❌ Admin user not found');
    }

    console.log('\n✅ Database connection test completed successfully');
    process.exit(0);

  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    process.exit(1);
  }
}

testDbConnection();
