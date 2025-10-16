require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const User = require('../models/User');

const BASE_URL = 'http://localhost:5001/api';

/**
 * Test admin endpoints functionality
 * Run with: node src/scripts/testAdminEndpoints.js
 */
async function testAdminEndpoints() {
  try {
    console.log('🔧 Testing Admin Endpoints...\n');

    // Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@beybolt.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test getting pending tournaments
    console.log('\n2. Testing GET /api/admin/pending-tournaments...');
    try {
      const pendingResponse = await axios.get(`${BASE_URL}/admin/pending-tournaments`, { headers });
      console.log(`✅ Found ${pendingResponse.data.tournaments?.length || 0} pending tournaments`);
    } catch (error) {
      console.log(`❌ Failed to get pending tournaments: ${error.response?.data?.error || error.message}`);
    }

    // Test getting all tournaments
    console.log('\n3. Testing GET /api/admin/tournaments...');
    try {
      const tournamentsResponse = await axios.get(`${BASE_URL}/admin/tournaments`, { headers });
      console.log(`✅ Found ${tournamentsResponse.data.tournaments?.length || 0} total tournaments`);
    } catch (error) {
      console.log(`❌ Failed to get tournaments: ${error.response?.data?.error || error.message}`);
    }

    // Test admin dashboard stats
    console.log('\n4. Testing GET /api/admin/dashboard...');
    try {
      const dashboardResponse = await axios.get(`${BASE_URL}/admin/dashboard`, { headers });
      console.log('✅ Admin dashboard stats:', dashboardResponse.data.stats);
    } catch (error) {
      console.log(`❌ Failed to get dashboard stats: ${error.response?.data?.error || error.message}`);
    }

    // Login as organizer to create a test tournament
    console.log('\n5. Logging in as organizer to create test tournament...');
    const organizerLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'organizer@test.com',
      password: 'test123'
    });

    const organizerToken = organizerLoginResponse.data.token;
    const organizerHeaders = {
      Authorization: `Bearer ${organizerToken}`,
      'Content-Type': 'application/json'
    };

    // Create a test tournament
    console.log('\n6. Creating test tournament...');
    const testTournament = {
      name: 'Test Tournament for Admin',
      description: 'A test tournament to verify admin functionality',
      game: 'Test Game',
      format: 'single-elimination',
      maxParticipants: 8,
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      registrationDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
      isPublic: true,
      requireApproval: true
    };

    try {
      const createResponse = await axios.post(`${BASE_URL}/tournaments`, testTournament, { headers: organizerHeaders });
      const tournamentId = createResponse.data.tournament.id;
      console.log(`✅ Test tournament created: ${tournamentId}`);

      // Now test admin approval
      console.log('\n7. Testing tournament approval as admin...');
      try {
        await axios.post(`${BASE_URL}/admin/tournaments/${tournamentId}/approve`, {}, { headers });
        console.log('✅ Tournament approved successfully');
      } catch (error) {
        console.log(`❌ Failed to approve tournament: ${error.response?.data?.error || error.message}`);
      }

      // Test starting tournament early
      console.log('\n8. Testing start tournament early as admin...');
      try {
        await axios.post(`${BASE_URL}/admin/tournaments/${tournamentId}/start-early`, {}, { headers });
        console.log('✅ Tournament started early successfully');
      } catch (error) {
        console.log(`❌ Failed to start tournament early: ${error.response?.data?.error || error.message}`);
      }

      // Test tournament deletion
      console.log('\n9. Testing tournament deletion as admin...');
      try {
        await axios.delete(`${BASE_URL}/admin/tournaments/${tournamentId}`, { headers });
        console.log('✅ Tournament deleted successfully');
      } catch (error) {
        console.log(`❌ Failed to delete tournament: ${error.response?.data?.error || error.message}`);
      }

    } catch (error) {
      console.log(`❌ Failed to create test tournament: ${error.response?.data?.error || error.message}`);
    }

    console.log('\n🎮 Admin endpoints testing completed!');

  } catch (error) {
    console.error('❌ Error testing admin endpoints:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAdminEndpoints();
