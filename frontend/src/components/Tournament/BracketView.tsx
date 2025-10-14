import React from 'react';
import { Trophy, User, Calendar, Clock } from 'lucide-react';

interface Match {
  matchId: string;
  player1?: {
    id: string;
    displayName: string;
    avatar?: string;
  };
  player2?: {
    id: string;
    displayName: string;
    avatar?: string;
  };
  winner?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'bye';
  score?: {
    player1: number;
    player2: number;
  };
  scheduledDate?: string;
}

interface Round {
  roundNumber: number;
  matches: Match[];
  isComplete: boolean;
}

interface BracketViewProps {
  rounds: Round[];
  currentRound: number;
  totalRounds: number;
  format: string;
  onMatchClick?: (match: Match) => void;
}

const BracketView: React.FC<BracketViewProps> = ({
  rounds,
  currentRound,
  totalRounds,
  format,
  onMatchClick,
}) => {
  const getRoundName = (roundNumber: number) => {
    const roundsFromEnd = totalRounds - roundNumber;
    if (roundsFromEnd === 0) return 'Finals';
    if (roundsFromEnd === 1) return 'Semi-Finals';
    if (roundsFromEnd === 2) return 'Quarter-Finals';
    return `Round ${roundNumber}`;
  };

  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-500/30 bg-green-500/5';
      case 'in-progress':
        return 'border-yellow-500/30 bg-yellow-500/5';
      case 'bye':
        return 'border-slate-600/30 bg-slate-600/5';
      default:
        return 'border-white/10 bg-white/5';
    }
  };

  const PlayerSlot: React.FC<{
    player?: Match['player1'];
    score?: number;
    isWinner?: boolean;
    position: 'top' | 'bottom';
  }> = ({ player, score, isWinner, position }) => (
    <div
      className={`
        flex items-center justify-between px-3 py-2
        ${position === 'top' ? 'border-b border-white/10' : ''}
        ${isWinner ? 'bg-brand-500/10 text-brand-200' : 'text-slate-300'}
        transition-colors
      `}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {player ? (
          <>
            {player.avatar ? (
              <img
                src={player.avatar}
                alt={player.displayName}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center">
                <User className="h-3 w-3 text-slate-400" />
              </div>
            )}
            <span className="font-medium text-sm truncate">
              {player.displayName}
            </span>
            {isWinner && (
              <Trophy className="h-3 w-3 text-brand-400 flex-shrink-0" />
            )}
          </>
        ) : (
          <span className="text-xs text-slate-500 italic">TBD</span>
        )}
      </div>
      {score !== undefined && (
        <span className="text-sm font-semibold ml-2">{score}</span>
      )}
    </div>
  );

  const MatchCard: React.FC<{ match: Match; roundNumber: number }> = ({
    match,
    roundNumber,
  }) => {
    const isWinner1 = match.winner === match.player1?.id;
    const isWinner2 = match.winner === match.player2?.id;
    const canInteract = match.status !== 'bye' && onMatchClick;

    return (
      <div
        className={`
          relative rounded-lg border overflow-hidden
          ${getMatchStatusColor(match.status)}
          ${canInteract ? 'cursor-pointer hover:border-brand-400/50 hover:shadow-lg' : ''}
          transition-all duration-200
        `}
        onClick={() => canInteract && onMatchClick(match)}
      >
        {/* Match header */}
        <div className="bg-slate-800/50 px-3 py-1.5 border-b border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Match {match.matchId.slice(-4)}
            </span>
            {match.status === 'in-progress' && (
              <span className="flex items-center gap-1 text-yellow-400">
                <div className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
                Live
              </span>
            )}
            {match.status === 'completed' && (
              <span className="text-green-400">Completed</span>
            )}
            {match.status === 'bye' && (
              <span className="text-slate-500">Bye</span>
            )}
          </div>
        </div>

        {/* Players */}
        <div className="bg-slate-900/30">
          <PlayerSlot
            player={match.player1}
            score={match.score?.player1}
            isWinner={isWinner1}
            position="top"
          />
          <PlayerSlot
            player={match.player2}
            score={match.score?.player2}
            isWinner={isWinner2}
            position="bottom"
          />
        </div>

        {/* Match footer with scheduling info */}
        {match.scheduledDate && (
          <div className="px-3 py-1.5 bg-slate-800/30 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="h-3 w-3" />
              {new Date(match.scheduledDate).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!rounds || rounds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Trophy className="h-16 w-16 text-slate-600 mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          No bracket generated yet
        </h3>
        <p className="text-sm text-slate-500">
          The tournament bracket will appear here once the tournament starts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bracket header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-semibold text-white">
            Tournament Bracket
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {format.charAt(0).toUpperCase() + format.slice(1).replace('-', ' ')} format
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">Current Round</div>
          <div className="text-2xl font-bold text-brand-400">
            {currentRound} / {totalRounds}
          </div>
        </div>
      </div>

      {/* Bracket visualization */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-8 min-w-max">
          {rounds.map((round) => (
            <div key={round.roundNumber} className="flex-shrink-0" style={{ width: '280px' }}>
              {/* Round header */}
              <div className="mb-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                  <span className="text-sm font-semibold text-white">
                    {getRoundName(round.roundNumber)}
                  </span>
                  {round.isComplete && (
                    <div className="h-2 w-2 rounded-full bg-green-400" />
                  )}
                </div>
              </div>

              {/* Matches */}
              <div className="space-y-4">
                {round.matches.map((match, idx) => (
                  <MatchCard
                    key={match.matchId || idx}
                    match={match}
                    roundNumber={round.roundNumber}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-slate-400 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded border border-white/10 bg-white/5" />
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded border border-yellow-500/30 bg-yellow-500/5" />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded border border-green-500/30 bg-green-500/5" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="h-3 w-3 text-brand-400" />
          <span>Winner</span>
        </div>
      </div>
    </div>
  );
};

export default BracketView;
