require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function fixAdminPassword() {
  try {
    console.log('🔧 Fixing Admin Password...\n');

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/challonge-clone';

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@beybolt.com' });
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('✅ Admin user found');
    console.log('Current password hash length:', adminUser.password?.length || 0);

    // Set new password
    adminUser.password = 'admin123';
    await adminUser.save();

    console.log('✅ Admin password updated successfully');
    console.log('Email: admin@beybolt.com');
    console.log('Password: admin123');

    // Test password comparison
    const isPasswordValid = await adminUser.comparePassword('admin123');
    console.log('Password comparison test:', isPasswordValid ? '✅ PASS' : '❌ FAIL');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing admin password:', error);
    process.exit(1);
  }
}

fixAdminPassword();
