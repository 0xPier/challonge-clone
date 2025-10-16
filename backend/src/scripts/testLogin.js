require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const User = require('../models/User');

const BASE_URL = 'http://localhost:5001/api';

/**
 * Test login functionality
 * Run with: node src/scripts/testLogin.js
 */
async function testLogin() {
  try {
    console.log('🔧 Testing Login Functionality...\n');

    // Test admin login
    console.log('1. Testing admin login...');
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@beybolt.com',
        password: 'admin123'
      });

      console.log('✅ Admin login successful');
      console.log('Token:', response.data.token.substring(0, 50) + '...');

      // Test admin endpoints with this token
      console.log('\n2. Testing admin endpoints with token...');
      const headers = {
        Authorization: `Bearer ${response.data.token}`,
        'Content-Type': 'application/json'
      };

      const pendingResponse = await axios.get(`${BASE_URL}/admin/pending-tournaments`, { headers });
      console.log(`✅ Found ${pendingResponse.data.tournaments?.length || 0} pending tournaments`);

    } catch (error) {
      console.log(`❌ Admin login failed: ${error.response?.data?.error || error.message}`);

      // Let's check if the user exists and what the password hash looks like
      console.log('\n3. Checking user in database...');
      const user = await User.findOne({ email: 'admin@beybolt.com' }).select('+password');
      if (user) {
        console.log('✅ User found in database');
        console.log('Email:', user.email);
        console.log('Role:', user.role);
        console.log('isActive:', user.isActive);
        console.log('isEmailVerified:', user.isEmailVerified);
        console.log('Password hash length:', user.password?.length || 0);

        // Test password comparison
        const isPasswordValid = await user.comparePassword('admin123');
        console.log('Password comparison result:', isPasswordValid);
      } else {
        console.log('❌ User not found in database');
      }
    }

  } catch (error) {
    console.error('❌ Error testing login:', error.message);
  }
}

testLogin();
