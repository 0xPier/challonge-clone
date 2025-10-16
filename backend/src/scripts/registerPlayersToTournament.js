require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const User = require('../models/User');
const Tournament = require('../models/Tournament');

const BASE_URL = 'http://localhost:5001/api';

/**
 * Register remaining players to the tournament for bracket testing
 * Run with: node src/scripts/registerPlayersToTournament.js
 */
async function registerPlayersToTournament() {
  try {
    console.log('👥 Registering Players to Tournament for Bracket Testing...\n');

    // Find the test tournament
    const tournament = await Tournament.findOne({ name: 'Bracket Testing Tournament' });
    if (!tournament) {
      console.log('❌ Test tournament not found');
      return;
    }

    console.log(`✅ Found tournament: ${tournament.name} (${tournament._id})`);
    console.log(`   Current participants: ${tournament.participants?.length || 0}/${tournament.maxParticipants}`);

    // Players to register
    const playersToRegister = [
      'player2@test.com',
      'player3@test.com',
      'player4@test.com'
    ];

    console.log('\n📋 Registering players one by one (with delays to avoid rate limiting)...');

    for (let i = 0; i < playersToRegister.length; i++) {
      const email = playersToRegister[i];

      try {
        console.log(`\n${i + 1}. Registering ${email}...`);

        // Login as player
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: email,
          password: 'test123'
        });

        const token = loginResponse.data.token;
        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Register for tournament
        await axios.post(`${BASE_URL}/tournaments/${tournament._id}/register`, {}, { headers });

        console.log(`   ✅ ${email} registered successfully`);

        // Add delay between registrations to avoid rate limiting
        if (i < playersToRegister.length - 1) {
          console.log('   ⏳ Waiting 2 seconds before next registration...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error) {
        console.log(`   ❌ Failed to register ${email}: ${error.response?.data?.error || error.message}`);
      }
    }

    // Check final tournament status
    console.log('\n🔍 Checking final tournament status...');
    await tournament.populate('participants', 'displayName email');
    console.log(`✅ Tournament: ${tournament.name}`);
    console.log(`   Status: ${tournament.status}`);
    console.log(`   Participants: ${tournament.participants?.length || 0}/${tournament.maxParticipants}`);

    if (tournament.participants && tournament.participants.length > 0) {
      console.log('\n   Registered Players:');
      tournament.participants.forEach((participant, index) => {
        console.log(`     ${index + 1}. ${participant.displayName} (${participant.email})`);
      });
    }

    // If we have enough participants, start the tournament
    if (tournament.participants && tournament.participants.length >= 2) {
      console.log('\n🚀 Starting tournament early as admin...');

      // Login as admin
      const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@beybolt.com',
        password: 'admin123'
      });

      const adminToken = adminLoginResponse.data.token;
      const adminHeaders = {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      };

      try {
        await axios.post(`${BASE_URL}/admin/tournaments/${tournament._id}/start-early`, {}, { headers: adminHeaders });
        console.log('✅ Tournament started successfully!');

        // Check bracket data
        const updatedTournament = await Tournament.findById(tournament._id);
        console.log(`✅ Bracket generated: ${updatedTournament.bracketData?.rounds?.length || 0} rounds`);
        console.log(`   Current round: ${updatedTournament.bracketData?.currentRound || 1}`);

        if (updatedTournament.bracketData?.rounds) {
          console.log('\n   Bracket Structure:');
          updatedTournament.bracketData.rounds.forEach((round, index) => {
            console.log(`     Round ${round.roundNumber}: ${round.matches?.length || 0} matches`);
          });
        }

      } catch (error) {
        console.log(`❌ Failed to start tournament: ${error.response?.data?.error || error.message}`);
      }
    } else {
      console.log('\n⚠️  Tournament needs at least 2 participants to start');
      console.log('   You can start it manually from the admin dashboard once more players are registered');
    }

    console.log('\n🎮 Player registration completed!');
    console.log('\nYou can now:');
    console.log('- View the tournament bracket in the frontend');
    console.log('- Test admin tournament management features');
    console.log('- Verify bracket generation and display');

  } catch (error) {
    console.error('❌ Error registering players:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

registerPlayersToTournament();
