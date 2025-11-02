const mongoose = require('mongoose');
const Match = require('../models/Match');

const isValidObjectId = (value) => {
  if (!value) {
    return false;
  }

  if (value instanceof mongoose.Types.ObjectId) {
    return true;
  }

  try {
    return mongoose.Types.ObjectId.isValid(String(value));
  } catch (error) {
    return false;
  }
};

const resolveParticipantId = (participant) => {
  if (!participant) {
    return null;
  }

  if (participant instanceof mongoose.Types.ObjectId) {
    return participant;
  }

  if (typeof participant === 'string') {
    return isValidObjectId(participant) ? participant : null;
  }

  if (participant.user) {
    return resolveParticipantId(participant.user);
  }

  if (participant._id) {
    return resolveParticipantId(participant._id);
  }

  return null;
};

const buildScore = (score) => {
  if (!score || typeof score !== 'object') {
    return { player1: 0, player2: 0 };
  }

  const player1 = typeof score.player1 === 'number' ? score.player1 : 0;
  const player2 = typeof score.player2 === 'number' ? score.player2 : 0;

  return { player1, player2 };
};

/**
 * Tournament Bracket Generation Service
 * Handles creating brackets for different tournament formats
 */
class BracketGenerator {

  /**
   * Generate bracket for a tournament
   * @param {Object} tournament - Tournament document
   * @param {Array} participants - Array of participant objects
   * @returns {Object} Bracket data with rounds and matches
   */
  static async generateBracket(tournament, participants) {
    try {
      switch (tournament.format) {
        case 'single-elimination':
          return this.generateSingleElimination(tournament, participants);

        case 'double-elimination':
          return this.generateDoubleElimination(tournament, participants);

        case 'round-robin':
          return this.generateRoundRobin(tournament, participants);

        case 'swiss':
          return this.generateSwiss(tournament, participants);

        case 'free-for-all':
          return this.generateFreeForAll(tournament, participants);

        default:
          throw new Error(`Unsupported tournament format: ${tournament.format}`);
      }
    } catch (error) {
      console.error('Bracket generation error:', error);
      throw error;
    }
  }

  /**
   * Generate Single Elimination bracket
   * Classic knockout format where losers are eliminated immediately
   */
  static generateSingleElimination(tournament, participants) {
    const totalParticipants = participants.length;
    const rounds = [];
    let currentRoundParticipants = [...participants];
    let roundNumber = 1;
    let matchNumber = 1;

    // Calculate total rounds needed
    const totalRounds = Math.ceil(Math.log2(totalParticipants));

    while (currentRoundParticipants.length > 1 || roundNumber === 1) {
      const round = {
        roundNumber,
        matches: [],
        isComplete: false
      };

      const matchesInRound = Math.ceil(currentRoundParticipants.length / 2);
      const nextRoundSize = Math.ceil(matchesInRound / 2);

      for (let i = 0; i < matchesInRound; i++) {
        const match = {
          matchId: `match-${matchNumber}`,
          matchNumber: matchNumber++,
          player1: currentRoundParticipants[i * 2] || null,
          player2: currentRoundParticipants[i * 2 + 1] || null,
          winner: null,
          status: 'pending',
          round: roundNumber
        };

        // If only one player in this match (bye)
        if (!match.player2) {
          match.winner = match.player1;
          match.status = 'bye';
        }

        round.matches.push(match);
      }

      rounds.push(round);

      // Prepare for next round
      if (roundNumber < totalRounds) {
        currentRoundParticipants = new Array(nextRoundSize).fill(null);
      }

      roundNumber++;
    }

    return {
      rounds,
      currentRound: 1,
      totalRounds,
      format: 'single-elimination'
    };
  }

  /**
   * Generate Double Elimination bracket
   * Losers get a second chance in a losers bracket
   */
  static generateDoubleElimination(tournament, participants) {
    const totalParticipants = participants.length;
    const winnersBracket = this.generateSingleElimination(tournament, participants);
    const losersBracket = {
      rounds: [],
      currentRound: 1,
      totalRounds: Math.ceil(Math.log2(totalParticipants)) + 1,
      format: 'losers-bracket'
    };

    // Generate losers bracket rounds
    let losersParticipants = [];
    let losersRoundNumber = 1;
    let losersMatchNumber = 1;

    while (losersParticipants.length > 1 || losersRoundNumber === 1) {
      const round = {
        roundNumber: losersRoundNumber,
        matches: [],
        isComplete: false
      };

      const matchesInRound = Math.ceil(losersParticipants.length / 2);

      for (let i = 0; i < matchesInRound; i++) {
        const match = {
          matchId: `losers-match-${losersMatchNumber}`,
          matchNumber: losersMatchNumber++,
          player1: losersParticipants[i * 2] || null,
          player2: losersParticipants[i * 2 + 1] || null,
          winner: null,
          status: 'pending',
          round: losersRoundNumber,
          bracket: 'losers'
        };

        if (!match.player2 && match.player1) {
          match.winner = match.player1;
          match.status = 'bye';
        }

        round.matches.push(match);
      }

      losersBracket.rounds.push(round);
      losersRoundNumber++;
    }

    return {
      winnersBracket,
      losersBracket,
      currentRound: 1,
      totalRounds: winnersBracket.totalRounds,
      format: 'double-elimination'
    };
  }

  /**
   * Generate Round Robin tournament
   * Every participant plays every other participant
   */
  static generateRoundRobin(tournament, participants) {
    const rounds = [];
    const totalParticipants = participants.length;
    const totalRounds = totalParticipants - 1;
    let matchNumber = 1;

    // Generate round-robin schedule
    for (let round = 0; round < totalRounds; round++) {
      const tournamentRound = {
        roundNumber: round + 1,
        matches: [],
        isComplete: false
      };

      // Create matches for this round
      for (let i = 0; i < totalParticipants / 2; i++) {
        const player1Index = (round + i) % totalParticipants;
        const player2Index = (round + totalParticipants - i - 1) % totalParticipants;

        // Avoid duplicate matches
        if (player1Index !== player2Index) {
          const match = {
            matchId: `round-robin-${matchNumber}`,
            matchNumber: matchNumber++,
            player1: participants[player1Index],
            player2: participants[player2Index],
            winner: null,
            status: 'pending',
            round: round + 1
          };

          tournamentRound.matches.push(match);
        }
      }

      rounds.push(tournamentRound);
    }

    return {
      rounds,
      currentRound: 1,
      totalRounds,
      format: 'round-robin'
    };
  }

  /**
   * Generate Swiss System tournament
   * Pairings based on similar skill levels each round
   */
  static generateSwiss(tournament, participants) {
    const rounds = [];
    const totalRounds = tournament.settings?.swissRounds || Math.ceil(Math.log2(participants.length));
    let currentStandings = participants.map((p, index) => ({
      player: p,
      score: 0,
      opponentScores: [],
      roundResults: []
    }));

    let matchNumber = 1;

    for (let round = 1; round <= totalRounds; round++) {
      const tournamentRound = {
        roundNumber: round,
        matches: [],
        isComplete: false
      };

      // Sort players by score (Swiss pairing)
      currentStandings.sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        // Tiebreakers: opponent scores, etc.
        return 0;
      });

      // Create pairs (avoid rematches)
      const paired = new Set();
      const matches = [];

      for (let i = 0; i < currentStandings.length; i++) {
        if (paired.has(i)) continue;

        for (let j = i + 1; j < currentStandings.length; j++) {
          if (paired.has(j)) continue;

          // Check if they've played before
          const hasPlayedBefore = currentStandings[i].opponentScores.includes(currentStandings[j].score);

          if (!hasPlayedBefore) {
            matches.push({
              matchId: `swiss-${matchNumber}`,
              player1: currentStandings[i].player,
              player2: currentStandings[j].player,
              matchNumber: matchNumber++,
              round: round
            });

            paired.add(i);
            paired.add(j);
            break;
          }
        }
      }

      tournamentRound.matches = matches;
      rounds.push(tournamentRound);
    }

    return {
      rounds,
      currentRound: 1,
      totalRounds,
      format: 'swiss',
      standings: currentStandings
    };
  }

  /**
   * Generate Free For All tournament
   * Multiple participants compete simultaneously
   */
  static generateFreeForAll(tournament, participants) {
    const rounds = [];
    const participantsPerMatch = tournament.settings?.participantsPerMatch || 4;
    const totalParticipants = participants.length;
    const totalMatches = Math.ceil(totalParticipants / participantsPerMatch);

    let matchNumber = 1;
    let remainingParticipants = [...participants];

    while (remainingParticipants.length > 1) {
      const round = {
        roundNumber: rounds.length + 1,
        matches: [],
        isComplete: false
      };

      // Create matches for this round
      for (let match = 0; match < totalMatches; match++) {
        const matchParticipants = remainingParticipants.splice(0, participantsPerMatch);

        if (matchParticipants.length > 1) {
          const matchData = {
            matchId: `free-for-all-${matchNumber}`,
            matchNumber: matchNumber++,
            players: matchParticipants,
            winners: [],
            status: 'pending',
            round: round.roundNumber,
            format: 'free-for-all'
          };

          round.matches.push(matchData);
        }
      }

      rounds.push(round);

      // Advance winners to next round
      const winners = round.matches.flatMap(m => m.winners || []);
      remainingParticipants = winners;
    }

    return {
      rounds,
      currentRound: 1,
      totalRounds: rounds.length,
      format: 'free-for-all'
    };
  }

  /**
   * Create actual Match documents in database
   * @param {Object} tournament - Tournament document
   * @param {Object} bracketData - Generated bracket data
   * @returns {Array} Created match documents
   */
  static async createMatches(tournament, bracketData) {
    try {
      const createdMatches = [];

      const rounds = Array.isArray(bracketData?.rounds) ? bracketData.rounds : [];
      const sanitizedRounds = rounds.map((round, index) => ({
        roundNumber: round.roundNumber || index + 1,
        matches: [],
        isComplete: Boolean(round.isComplete)
      }));

      for (let roundIndex = 0; roundIndex < rounds.length; roundIndex += 1) {
        const round = rounds[roundIndex];
        const sanitizedRound = sanitizedRounds[roundIndex];
        const matches = Array.isArray(round.matches) ? round.matches : [];

        for (let matchIndex = 0; matchIndex < matches.length; matchIndex += 1) {
          const matchData = matches[matchIndex];

          const playersPayload = [];

          if (Array.isArray(matchData.players) && matchData.players.length) {
            matchData.players.forEach((participant) => {
              const userId = resolveParticipantId(participant?.user || participant);
              if (userId) {
                playersPayload.push({
                  user: userId,
                  seed: participant?.seed ?? null
                });
              }
            });
          } else {
            const player1Id = resolveParticipantId(matchData.player1);
            const player2Id = resolveParticipantId(matchData.player2);

            if (player1Id) {
              playersPayload.push({
                user: player1Id,
                seed: matchData.player1?.seed ?? null
              });
            }

            if (player2Id) {
              playersPayload.push({
                user: player2Id,
                seed: matchData.player2?.seed ?? null
              });
            }
          }

          const rawStatus = matchData.status;
          const bracketStatus = rawStatus === 'bye'
            ? 'bye'
            : (['pending', 'in-progress', 'completed'].includes(rawStatus) ? rawStatus : 'pending');

          const matchStatus = bracketStatus === 'bye'
            ? 'bye'
            : (['in-progress', 'completed', 'cancelled'].includes(rawStatus) ? rawStatus : 'scheduled');

          const matchPayload = {
            tournament: tournament._id,
            round: sanitizedRound.roundNumber,
            matchNumber: matchData.matchNumber || matchIndex + 1,
            players: playersPayload,
            status: matchStatus,
            format: matchData.format || (tournament.format === 'free-for-all' ? 'custom' : 'single-game'),
            createdBy: tournament.organizer
          };

          if (matchData.scheduledDate) {
            matchPayload.scheduledDate = matchData.scheduledDate;
          }

          if (isValidObjectId(matchData.matchId)) {
            matchPayload._id = matchData.matchId;
          }

          if (matchStatus === 'bye' && playersPayload.length === 1) {
            matchPayload.winner = playersPayload[0].user;
          }

          const match = new Match(matchPayload);
          await match.save();
          createdMatches.push(match);

          sanitizedRound.matches.push({
            matchId: match._id,
            player1: resolveParticipantId(matchData.player1),
            player2: resolveParticipantId(matchData.player2),
            status: bracketStatus,
            winner: matchPayload.winner || resolveParticipantId(matchData.winner),
            score: buildScore(matchData.score),
            scheduledDate: matchData.scheduledDate || null,
            completedDate: matchData.completedDate || null
          });
        }
      }

      tournament.bracketData = {
        rounds: sanitizedRounds,
        currentRound: bracketData.currentRound || 1,
        totalRounds: bracketData.totalRounds || sanitizedRounds.length,
        format: bracketData.format || tournament.format
      };

      tournament.markModified('bracketData');

      if (!tournament.stats) {
        tournament.stats = {};
      }

      tournament.stats.totalMatches = createdMatches.length;

      return createdMatches;

    } catch (error) {
      console.error('Create matches error:', error);
      throw error;
    }
  }

  /**
   * Update match result and track winners/losers
   * @param {Object} tournament - Tournament document
   * @param {Object} match - Match document
   * @param {String} winnerId - ID of winning player
   * @param {Object} score - Match score
   * @returns {Object} Updated tournament and next matches
   */
  static async updateMatchResult(tournament, match, winnerId, score = {}) {
    try {
      // Update match
      match.winner = winnerId;
      match.status = 'completed';
      match.endTime = new Date();
      match.duration = match.matchDuration;
      match.results = {
        finalScore: score,
        completedDate: new Date()
      };

      await match.save();

      // Update tournament bracket data
      const round = tournament.bracketData.rounds.find(r => r.roundNumber === match.round);
      if (round) {
        const bracketMatch = round.matches.find(m => m.matchId.toString() === match._id.toString());
        if (bracketMatch) {
          bracketMatch.winner = winnerId;
          bracketMatch.status = 'completed';
          bracketMatch.score = score;
        }

        round.isComplete = round.matches.every(m => m.status === 'completed' || m.status === 'bye');
      }

      // Update tournament stats
      tournament.stats.completedMatches += 1;

      // Track winners and losers in tournament
      if (!tournament.winners) tournament.winners = [];
      if (!tournament.losers) tournament.losers = [];

      // Add winner to winners list (if not already present)
      if (!tournament.winners.some(w => w.toString() === winnerId.toString())) {
        tournament.winners.push(winnerId);
      }

      // Find loser (the player who didn't win)
      const loserId = match.players.find(p => p.user.toString() !== winnerId.toString())?.user;
      if (loserId && !tournament.losers.some(l => l.toString() === loserId.toString())) {
        tournament.losers.push(loserId);
      }

      // Find next match for winner
      const nextMatches = await this.findNextMatches(tournament, match, winnerId);

      return {
        tournament,
        match,
        nextMatches,
        shouldAdvance: nextMatches.length > 0
      };

    } catch (error) {
      console.error('Update match result error:', error);
      throw error;
    }
  }

  /**
   * Find next matches where winner should advance
   * @param {Object} tournament - Tournament document
   * @param {Object} match - Completed match
   * @param {String} winnerId - Winner's user ID
   * @returns {Array} Next matches for the winner
   */
  static async findNextMatches(tournament, match, winnerId) {
    try {
      const nextRound = match.round + 1;
      const nextMatches = await Match.find({
        tournament: tournament._id,
        round: nextRound,
        status: 'scheduled'
      });

      // For single elimination, find the match where this winner should go
      const matchIndex = match.matchNumber - 1;
      const nextMatchIndex = Math.floor(matchIndex / 2);

      return nextMatches.filter(nextMatch => {
        // Simple logic: first match gets winners from matches 1-2, second from 3-4, etc.
        return nextMatch.matchNumber - 1 === nextMatchIndex;
      });

    } catch (error) {
      console.error('Find next matches error:', error);
      return [];
    }
  }

  /**
   * Get tournament standings for Swiss format
   * @param {Object} tournament - Tournament document
   * @returns {Array} Current standings
   */
  static getSwissStandings(tournament) {
    const standings = [];

    tournament.participants.forEach(participant => {
      const matches = tournament.bracketData.rounds
        .flatMap(round => round.matches)
        .filter(match =>
          (match.player1?.toString() === participant.user.toString() ||
           match.player2?.toString() === participant.user.toString()) &&
          match.status === 'completed'
        );

      const wins = matches.filter(match =>
        match.winner?.toString() === participant.user.toString()
      ).length;

      const losses = matches.length - wins;

      standings.push({
        user: participant.user,
        matchesPlayed: matches.length,
        wins,
        losses,
        points: wins * 3 + (matches.length - wins - losses), // Assuming draws possible
        winRate: matches.length > 0 ? (wins / matches.length) * 100 : 0
      });
    });

    return standings.sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points;
      if (a.winRate !== b.winRate) return b.winRate - a.winRate;
      return b.wins - a.wins;
    });
  }
}

module.exports = BracketGenerator;
