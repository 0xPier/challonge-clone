import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarDays, Users, Tag, Settings2, Trophy, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { clearCurrentTournament, fetchTournament, registerForTournament } from '../store/slices/tournamentSlice';
import TournamentCard from '../components/Tournament/TournamentCard';
import toast from 'react-hot-toast';

const TournamentDetailPage: React.FC = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { currentTournament, tournaments, loading, error } = useAppSelector((state) => state.tournaments);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

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
    </div>
  );
};

export default TournamentDetailPage;
