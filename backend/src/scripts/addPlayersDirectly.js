require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Tournament = require('../models/Tournament');

async function addPlayersDirectly() {
  try {
    console.log('👥 Adding Players Directly to Tournament...\n');

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/challonge-clone';

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');

    // Find the test tournament
    const tournament = await Tournament.findOne({ name: 'Bracket Testing Tournament' });
    if (!tournament) {
      console.log('❌ Test tournament not found');
      return;
    }

    console.log(`✅ Found tournament: ${tournament.name} (${tournament._id})`);
    console.log(`   Current participants: ${tournament.participants?.length || 0}/${tournament.maxParticipants}`);

    // Get player users
    const playersToAdd = [
      'player2@test.com',
      'player3@test.com',
      'player4@test.com'
    ];

    console.log('\n📋 Adding players directly to tournament...');

    for (const email of playersToAdd) {
      const user = await User.findOne({ email: email });
      if (!user) {
        console.log(`❌ User not found: ${email}`);
        continue;
      }

      // Check if user is already registered
      const isAlreadyRegistered = tournament.participants.some(p => p.user.toString() === user._id.toString());
      if (isAlreadyRegistered) {
        console.log(`⏭️  ${email} already registered`);
        continue;
      }

      // Add user to tournament participants
      tournament.participants.push({
        user: user._id,
        registeredAt: new Date()
      });

      console.log(`✅ Added ${email} to tournament`);
    }

    // Save tournament
    await tournament.save();
    console.log('✅ Tournament updated with new participants');

    // Check final tournament status
    await tournament.populate('participants', 'displayName email');
    console.log(`\n✅ Final tournament status:`);
    console.log(`   Participants: ${tournament.participants?.length || 0}/${tournament.maxParticipants}`);

    if (tournament.participants && tournament.participants.length > 0) {
      console.log('\n   Registered Players:');
      tournament.participants.forEach((participant, index) => {
        console.log(`     ${index + 1}. ${participant.displayName} (${participant.email})`);
      });
    }

    // If we have enough participants, generate bracket
    if (tournament.participants && tournament.participants.length >= 2) {
      console.log('\n🏆 Generating tournament bracket...');

      const BracketGenerator = require('../services/bracketGenerator');
      const bracketData = await BracketGenerator.generateBracket(tournament, tournament.participants);

      tournament.bracketData = bracketData;
      await tournament.save();

      console.log('✅ Bracket generated successfully!');
      console.log(`   Rounds: ${bracketData.rounds?.length || 0}`);
      console.log(`   Current round: ${bracketData.currentRound}`);

      if (bracketData.rounds) {
        console.log('\n   Bracket Structure:');
        bracketData.rounds.forEach((round, index) => {
          console.log(`     Round ${round.roundNumber}: ${round.matches?.length || 0} matches`);
        });
      }

      // Create match documents
      console.log('\n📋 Creating match documents...');
      const createdMatches = await BracketGenerator.createMatches(tournament, bracketData);
      console.log(`✅ Created ${createdMatches.length} matches in database`);

    } else {
      console.log('\n⚠️  Tournament needs at least 2 participants to generate bracket');
    }

    console.log('\n🎮 Tournament setup completed!');
    console.log('\nYou can now:');
    console.log('- View the tournament bracket in the frontend');
    console.log('- Test admin tournament management features');
    console.log('- Verify bracket generation and display');

  } catch (error) {
    console.error('❌ Error adding players directly:', error.message);
  }
}

addPlayersDirectly();
