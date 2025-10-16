require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const User = require('../models/User');
const Tournament = require('../models/Tournament');

const BASE_URL = 'http://localhost:5001/api';

/**
 * Create a test tournament and register users for testing
 * Run with: node src/scripts/createTestTournament.js
 */
async function createTestTournament() {
  try {
    console.log('🏆 Creating Test Tournament for Bracket Testing...\n');

    // Login as organizer
    console.log('1. Logging in as organizer...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'organizer@test.com',
      password: 'test123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Organizer login successful');

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Create a test tournament
    console.log('\n2. Creating test tournament...');
    const testTournament = {
      name: 'Bracket Testing Tournament',
      description: 'A test tournament to verify bracket generation and admin functionality',
      game: 'Test Game',
      format: 'single-elimination',
      maxParticipants: 8,
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      registrationDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
      isPublic: true,
      requireApproval: true
    };

    const createResponse = await axios.post(`${BASE_URL}/tournaments`, testTournament, { headers });
    const tournamentId = createResponse.data.tournament.id;
    console.log(`✅ Test tournament created: ${tournamentId}`);

    // Login as admin and approve the tournament
    console.log('\n3. Logging in as admin to approve tournament...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@beybolt.com',
      password: 'admin123'
    });

    const adminToken = adminLoginResponse.data.token;
    const adminHeaders = {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    };

    await axios.post(`${BASE_URL}/admin/tournaments/${tournamentId}/approve`, {}, { headers: adminHeaders });
    console.log('✅ Tournament approved by admin');

    // Register test users to the tournament
    console.log('\n4. Registering test users to tournament...');
    const testUsers = [
      'player1@test.com',
      'player2@test.com',
      'player3@test.com',
      'player4@test.com'
    ];

    for (const email of testUsers) {
      try {
        // Login as each player
        const userLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: email,
          password: 'test123'
        });

        const userToken = userLoginResponse.data.token;
        const userHeaders = {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        };

        // Register for tournament
        await axios.post(`${BASE_URL}/tournaments/${tournamentId}/register`, {}, { headers: userHeaders });
        console.log(`✅ ${email} registered for tournament`);
      } catch (error) {
        console.log(`❌ Failed to register ${email}: ${error.response?.data?.error || error.message}`);
      }
    }

    // Start tournament early as admin
    console.log('\n5. Starting tournament early as admin...');
    try {
      await axios.post(`${BASE_URL}/admin/tournaments/${tournamentId}/start-early`, {}, { headers: adminHeaders });
      console.log('✅ Tournament started early successfully');
    } catch (error) {
      console.log(`❌ Failed to start tournament: ${error.response?.data?.error || error.message}`);
    }

    // Check tournament details
    console.log('\n6. Checking tournament details...');
    try {
      const tournamentResponse = await axios.get(`${BASE_URL}/tournaments/${tournamentId}`, { headers: adminHeaders });
      const tournament = tournamentResponse.data.tournament;

      console.log(`✅ Tournament: ${tournament.name}`);
      console.log(`   Status: ${tournament.status}`);
      console.log(`   Participants: ${tournament.participants?.length || 0}/${tournament.maxParticipants}`);
      console.log(`   Bracket rounds: ${tournament.bracketData?.rounds?.length || 0}`);

      if (tournament.bracketData?.rounds) {
        console.log('\n   Bracket Structure:');
        tournament.bracketData.rounds.forEach((round, index) => {
          console.log(`     Round ${round.roundNumber}: ${round.matches?.length || 0} matches`);
        });
      }
    } catch (error) {
      console.log(`❌ Failed to get tournament details: ${error.response?.data?.error || error.message}`);
    }

    console.log('\n🎮 Test tournament setup completed!');
    console.log(`\nTournament ID: ${tournamentId}`);
    console.log('\nYou can now test:');
    console.log('- Admin dashboard functionality');
    console.log('- Tournament bracket display');
    console.log('- Match creation and management');

  } catch (error) {
    console.error('❌ Error creating test tournament:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

createTestTournament();
