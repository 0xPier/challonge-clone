import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Trophy, ListOrdered, BarChart3 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchTournaments } from '../store/slices/tournamentSlice';
import TournamentCard from '../components/Tournament/TournamentCard';

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { tournaments, loading } = useAppSelector((state) => state.tournaments);

  useEffect(() => {
    dispatch(fetchTournaments({ limit: 6 }));
  }, [dispatch]);

  if (!user) {
    return (
      <div className="card text-center">
        <h2 className="text-2xl font-heading font-semibold text-white">Welcome to Challonge Clone!</h2>
        <p className="mt-2 text-slate-300">Please log in to access your dashboard.</p>
        <Link to="/login" className="btn-primary mt-6">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-500/20 via-indigo-900/60 to-indigo-950/80 p-10 shadow-glow">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-200/80">Organizer dashboard</p>
            <h1 className="mt-4 text-3xl font-heading font-semibold text-white md:text-4xl">
              Welcome back, {user.displayName}
            </h1>
            <p className="mt-3 max-w-xl text-sm text-slate-200/80">
              You have everything you need to host unforgettable brackets—create new competitions, track player
              momentum, and spotlight your champions.
            </p>
          </div>
          <Link to="/create-tournament" className="btn-primary w-full justify-center text-base sm:w-auto">
            <Sparkles className="h-4 w-4" />
            Create Tournament
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Tournaments Created',
            value: user.stats.tournamentsCreated,
            icon: Sparkles,
            accent: 'from-brand-500/40 to-brand-700/10',
          },
          {
            label: 'Tournaments Joined',
            value: user.stats.tournamentsParticipated,
            icon: Trophy,
            accent: 'from-emerald-500/40 to-emerald-700/10',
          },
          {
            label: 'Matches Played',
            value: user.stats.matchesPlayed,
            icon: ListOrdered,
            accent: 'from-sky-500/40 to-sky-700/10',
          },
          {
            label: 'Win Rate',
            value: `${Math.round(user.stats.winRate)}%`,
            icon: BarChart3,
            accent: 'from-violet-500/40 to-violet-700/10',
          },
        ].map(({ label, value, icon: Icon, accent }) => (
          <div
            key={label}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-subtle backdrop-blur-xl"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-60`} />
            <div className="relative z-10 flex flex-col gap-4">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-brand-100">
                <Icon className="h-5 w-5" />
              </span>
              <p className="text-sm text-slate-300/80">{label}</p>
              <p className="text-2xl font-heading font-semibold text-white">{value}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-heading font-semibold text-white">Recent tournaments</h2>
          <Link to="/tournaments" className="btn-secondary">
            View all
          </Link>
        </div>

        {loading && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="mb-4 h-8 w-3/4 rounded-lg bg-white/10" />
                <div className="mb-2 h-4 w-1/2 rounded bg-white/10" />
                <div className="h-32 rounded-2xl bg-white/5" />
              </div>
            ))}
          </div>
        )}

        {!loading && tournaments.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {tournaments.slice(0, 6).map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                showOrganizer={false}
              />
            ))}
          </div>
        )}

        {!loading && tournaments.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/20 bg-white/5 p-10 text-center">
            <p className="text-lg font-semibold text-white">No tournaments yet</p>
            <p className="mt-2 text-sm text-slate-300/80">
              Create your first competition to see insights and live updates.
            </p>
            <Link to="/create-tournament" className="btn-primary mt-6">
              Start your first bracket
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
