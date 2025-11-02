import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CalendarDays, Users, Tag, Settings2, Trophy, ArrowLeft, ShieldCheck, Play, UserPlus, UserMinus, Edit, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { clearCurrentTournament, fetchTournament, registerForTournament } from '../store/slices/tournamentSlice';
import TournamentCard from '../components/Tournament/TournamentCard';
import BracketView from '../components/Tournament/BracketView';
import EditTournamentModal from '../components/Tournament/EditTournamentModal';
import toast from 'react-hot-toast';
import api from '../services/api';

const TournamentDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentTournament, tournaments, loading, error } = useAppSelector((state) => state.tournaments);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchTournament(id));
    }

    return () => {
      dispatch(clearCurrentTournament());
    };
  }, [dispatch, id]);

  const handleRegister = async () => {
    if (!currentTournament) return;
    try {
      await dispatch(registerForTournament(currentTournament.id)).unwrap();
      toast.success('You are registered! Check your dashboard for updates.');
    } catch (registerError: any) {
      toast.error(registerError || 'Unable to register at this time.');
    }
  };

  const handleStartEarly = async () => {
    if (!currentTournament || !id) return;
    if (!window.confirm('Are you sure you want to start this tournament early?')) return;

    try {
      await api.post(`/admin/tournaments/${id}/start-early`);
      toast.success('Tournament started successfully');
      dispatch(fetchTournament(id));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to start tournament');
    }
  };

  const handleAddParticipant = async () => {
    if (!currentTournament || !id) return;
    const userId = prompt('Enter User ID to add:');
    if (!userId) return;

    try {
      await api.post(`/admin/tournaments/${id}/participants/add`, { userId });
      toast.success('Participant added successfully');
      dispatch(fetchTournament(id));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add participant');
    }
  };

  const handleRemoveParticipant = async () => {
    if (!currentTournament || !id) return;
    const userId = prompt('Enter User ID to remove:');
    if (!userId) return;

    try {
      await api.delete(`/admin/tournaments/${id}/participants/remove`, {
        data: { userId }
      });
      toast.success('Participant removed successfully');
      dispatch(fetchTournament(id));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove participant');
    }
  };

  const handleDelete = async () => {
    if (!currentTournament || !id) return;
    if (!window.confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) return;

    try {
      await api.delete(`/admin/tournaments/${id}`);
      toast.success('Tournament deleted successfully');
      navigate('/admin');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete tournament');
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'superuser';

  if (loading && !currentTournament) {
    return (
      <div className="space-y-6">
        <Link to="/tournaments" className="btn-ghost inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to tournaments
        </Link>
        <div className="animate-pulse space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="h-8 w-1/2 rounded-lg bg-white/10" />
          <div className="h-4 w-2/3 rounded-lg bg-white/5" />
          <div className="h-40 rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  if (error && !currentTournament) {
    return (
      <div className="space-y-6">
        <Link to="/tournaments" className="btn-ghost inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to tournaments
        </Link>
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6 text-rose-100">
          {error}
        </div>
      </div>
    );
  }

  if (!currentTournament) {
    return null;
  }

  const {
    name,
    game,
    description,
    format,
    status,
    startDate,
    endDate,
    registrationDeadline,
    maxParticipants,
    currentParticipants,
    settings,
    tags,
    rules,
    organizer,
  } = currentTournament;

  const statusLabel = status.replace('-', ' ');

  return (
    <div className="space-y-10">
      <Link to="/tournaments" className="btn-ghost inline-flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to tournaments
      </Link>

      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-500/20 via-indigo-900/60 to-indigo-950/80 p-10 shadow-glow">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-100">
              {game} • {statusLabel}
            </div>
            <h1 className="text-4xl font-heading font-semibold text-white">{name}</h1>
            <p className="max-w-2xl text-sm text-slate-200/90">{description}</p>

            <div className="grid gap-4 text-sm text-slate-200/80 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-brand-200" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Participants</p>
                  <p className="text-white">
                    {currentParticipants}/{maxParticipants}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-brand-200" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Registration closes</p>
                  <p className="text-white">
                    {registrationDeadline ? new Date(registrationDeadline).toLocaleString() : 'TBD'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-brand-200" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Format</p>
                  <p className="text-white">{format.replace('-', ' ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-brand-200" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Starts</p>
                  <p className="text-white">{startDate ? new Date(startDate).toLocaleString() : 'TBD'}</p>
                  {endDate && (
                    <p className="text-xs text-slate-400">
                      Wraps {new Date(endDate).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-white/20 bg-white/10 p-6 text-sm text-slate-200/90">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Organizer</p>
              <p className="text-white">{organizer?.displayName || 'TBD'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Status</p>
              <p className="text-white capitalize">{statusLabel}</p>
            </div>
            {isAuthenticated && status === 'open' && (
              <button
                type="button"
                onClick={handleRegister}
                className="btn-primary justify-center"
              >
                Register now
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Admin Controls */}
      {isAdmin && (
        <section className="rounded-3xl border border-yellow-400/30 bg-yellow-500/10 p-6 shadow-subtle">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="h-6 w-6 text-yellow-400" />
            <h2 className="text-xl font-heading font-semibold text-white">Admin Controls</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {status !== 'in-progress' && status !== 'completed' && status !== 'cancelled' && currentParticipants >= 2 && (
              <button
                onClick={handleStartEarly}
                className="btn-primary flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Start Early
              </button>
            )}
            <button
              onClick={handleAddParticipant}
              className="btn-secondary flex items-center gap-2 text-blue-400 hover:bg-blue-500/10"
            >
              <UserPlus className="h-4 w-4" />
              Add Participant
            </button>
            <button
              onClick={handleRemoveParticipant}
              className="btn-secondary flex items-center gap-2 text-orange-400 hover:bg-orange-500/10"
            >
              <UserMinus className="h-4 w-4" />
              Remove Participant
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="btn-secondary flex items-center gap-2 text-green-400 hover:bg-green-500/10"
            >
              <Edit className="h-4 w-4" />
              Edit Tournament
            </button>
            <button
              onClick={handleDelete}
              className="btn-secondary flex items-center gap-2 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </section>
      )}

      {/* Bracket section - show if tournament has started */}
      {currentTournament.bracketData && currentTournament.bracketData.rounds && currentTournament.bracketData.rounds.length > 0 && (
        <section className="card border-white/10 bg-indigo-950/80 p-8">
          <BracketView
            rounds={currentTournament.bracketData.rounds.map(round => ({
              ...round,
              matches: round.matches.map((match: any) => ({
                matchId: match.matchId || match._id || `match-${match.matchNumber}`,
                player1: typeof match.player1 === 'string' || !match.player1 ? undefined : {
                  id: match.player1.id || match.player1._id || match.player1,
                  displayName: match.player1.displayName || match.player1.username || 'Unknown',
                  avatar: match.player1.avatar
                },
                player2: typeof match.player2 === 'string' || !match.player2 ? undefined : {
                  id: match.player2.id || match.player2._id || match.player2,
                  displayName: match.player2.displayName || match.player2.username || 'Unknown',
                  avatar: match.player2.avatar
                },
                winner: match.winner,
                status: match.status || 'scheduled',
                score: match.score,
                scheduledDate: match.scheduledDate
              }))
            }))}
            currentRound={currentTournament.bracketData.currentRound}
            totalRounds={currentTournament.bracketData.totalRounds}
            format={format}
            onMatchClick={(match) => {
              toast('Match details coming soon!', { icon: '🎮' });
            }}
          />
        </section>
      )}

      <section className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-8">
          <div className="card space-y-4 border-white/10 bg-indigo-950/80">
            <div className="flex items-center gap-3">
              <Settings2 className="h-5 w-5 text-brand-200" />
              <h2 className="text-lg font-heading font-semibold text-white">Match & player settings</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(settings).map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300/90"
                >
                  <span className="text-xs uppercase tracking-wide text-slate-400">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <p className="text-white">{value ? 'Enabled' : 'Disabled'}</p>
                </div>
              ))}
            </div>
          </div>

          {rules && (
            <div className="card space-y-4 border-white/10 bg-indigo-950/80">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-brand-200" />
                <h2 className="text-lg font-heading font-semibold text-white">Rules & guidelines</h2>
              </div>
              <p className="whitespace-pre-wrap text-sm text-slate-300/90">{rules}</p>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="card space-y-4 border-white/10 bg-indigo-950/80">
            <div className="flex items-center gap-3">
              <Tag className="h-5 w-5 text-brand-200" />
              <h3 className="text-lg font-heading font-semibold text-white">Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {(tags?.length ? tags : ['community', 'competitive']).map((tag) => (
                <span key={tag} className="chip">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="card space-y-4 border-white/10 bg-white/5">
            <h3 className="text-lg font-heading font-semibold text-white">More tournaments</h3>
            <div className="space-y-4">
              {tournaments
                .filter((tournament) => tournament.id !== currentTournament.id)
                .slice(0, 2)
                .map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              {tournaments.length <= 1 && (
                <p className="text-sm text-slate-300/70">
                  More events will appear here as organizers publish them.
                </p>
              )}
            </div>
          </div>
        </aside>
      </section>

      {/* Edit Tournament Modal */}
      {currentTournament && (
        <EditTournamentModal
          tournament={currentTournament}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={() => {
            if (id) {
              dispatch(fetchTournament(id));
            }
          }}
        />
      )}
    </div>
  );
};

export default TournamentDetailPage;
