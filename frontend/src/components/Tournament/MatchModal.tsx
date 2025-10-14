import React, { useState } from 'react';
import { X, Trophy, Save, User } from 'lucide-react';
import toast from 'react-hot-toast';

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

interface MatchModalProps {
  match: Match;
  tournamentId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
  canEdit?: boolean;
}

const MatchModal: React.FC<MatchModalProps> = ({
  match,
  tournamentId,
  isOpen,
  onClose,
  onUpdate,
  canEdit = false,
}) => {
  const [player1Score, setPlayer1Score] = useState(match.score?.player1 || 0);
  const [player2Score, setPlayer2Score] = useState(match.score?.player2 || 0);
  const [selectedWinner, setSelectedWinner] = useState<string | null>(match.winner || null);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!selectedWinner) {
      toast.error('Please select a winner');
      return;
    }

    setSaving(true);
    try {
      // TODO: Call API to update match result
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API call

      toast.success('Match result updated successfully!');
      onUpdate?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update match');
    } finally {
      setSaving(false);
    }
  };

  const handleWinnerSelect = (playerId: string) => {
    setSelectedWinner(playerId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <div>
            <h2 className="text-2xl font-heading font-semibold text-white">Match Details</h2>
            <p className="text-sm text-slate-400 mt-1">
              Match ID: {match.matchId.slice(-8)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Match Status */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium">
            <div className={`h-2 w-2 rounded-full ${
              match.status === 'completed' ? 'bg-green-400' :
              match.status === 'in-progress' ? 'bg-yellow-400 animate-pulse' :
              'bg-slate-400'
            }`} />
            <span className="capitalize text-white">{match.status.replace('-', ' ')}</span>
          </div>

          {/* Players */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Players</h3>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Player 1 */}
              <div
                className={`
                  relative rounded-xl border p-6 transition-all
                  ${selectedWinner === match.player1?.id
                    ? 'border-brand-400 bg-brand-500/10'
                    : 'border-white/10 bg-white/5'
                  }
                  ${canEdit && match.status !== 'completed' ? 'cursor-pointer hover:border-brand-400/50' : ''}
                `}
                onClick={() => canEdit && match.status !== 'completed' && match.player1 && handleWinnerSelect(match.player1.id)}
              >
                {selectedWinner === match.player1?.id && (
                  <Trophy className="absolute top-3 right-3 h-5 w-5 text-brand-400" />
                )}

                <div className="flex items-center gap-3 mb-4">
                  {match.player1?.avatar ? (
                    <img
                      src={match.player1.avatar}
                      alt={match.player1.displayName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center">
                      <User className="h-6 w-6 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-semibold text-white truncate">
                      {match.player1?.displayName || 'TBD'}
                    </p>
                    <p className="text-xs text-slate-400">Player 1</p>
                  </div>
                </div>

                {canEdit && match.status !== 'completed' ? (
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wide text-slate-400">Score</label>
                    <input
                      type="number"
                      min="0"
                      value={player1Score}
                      onChange={(e) => setPlayer1Score(parseInt(e.target.value) || 0)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-brand-400 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{match.score?.player1 || 0}</div>
                    <div className="text-xs text-slate-400">Score</div>
                  </div>
                )}
              </div>

              {/* Player 2 */}
              <div
                className={`
                  relative rounded-xl border p-6 transition-all
                  ${selectedWinner === match.player2?.id
                    ? 'border-brand-400 bg-brand-500/10'
                    : 'border-white/10 bg-white/5'
                  }
                  ${canEdit && match.status !== 'completed' ? 'cursor-pointer hover:border-brand-400/50' : ''}
                `}
                onClick={() => canEdit && match.status !== 'completed' && match.player2 && handleWinnerSelect(match.player2.id)}
              >
                {selectedWinner === match.player2?.id && (
                  <Trophy className="absolute top-3 right-3 h-5 w-5 text-brand-400" />
                )}

                <div className="flex items-center gap-3 mb-4">
                  {match.player2?.avatar ? (
                    <img
                      src={match.player2.avatar}
                      alt={match.player2.displayName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center">
                      <User className="h-6 w-6 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-semibold text-white truncate">
                      {match.player2?.displayName || 'TBD'}
                    </p>
                    <p className="text-xs text-slate-400">Player 2</p>
                  </div>
                </div>

                {canEdit && match.status !== 'completed' ? (
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wide text-slate-400">Score</label>
                    <input
                      type="number"
                      min="0"
                      value={player2Score}
                      onChange={(e) => setPlayer2Score(parseInt(e.target.value) || 0)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-brand-400 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{match.score?.player2 || 0}</div>
                    <div className="text-xs text-slate-400">Score</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {match.scheduledDate && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Scheduled</p>
              <p className="text-white">
                {new Date(match.scheduledDate).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {canEdit && match.status !== 'completed' && (
          <div className="border-t border-white/10 p-6 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="btn-secondary"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-primary flex items-center gap-2"
              disabled={saving || !selectedWinner}
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Result
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchModal;
