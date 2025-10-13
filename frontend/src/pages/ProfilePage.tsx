import React, { useEffect, useState } from 'react';
import { Crown, CalendarDays, Users, Medal, Activity } from 'lucide-react';
import { useAppSelector } from '../hooks/redux';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

interface RecentTournament {
  _id: string;
  name: string;
  game: string;
  format: string;
  status: string;
  startDate: string;
}

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [recentTournaments, setRecentTournaments] = useState<RecentTournament[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        setLoadingRecent(true);
        const response = await userAPI.getUserProfile(user.id);
        setRecentTournaments(response.recentTournaments || []);
      } catch (error: any) {
        toast.error(error?.response?.data?.error || 'Failed to load recent tournaments');
      } finally {
        setLoadingRecent(false);
      }
    };

    loadProfile();
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="card text-center text-slate-300">
        <h2 className="text-2xl font-heading font-semibold text-white">Please sign in</h2>
        <p className="mt-2 text-sm text-slate-400">Sign in to view your profile and performance history.</p>
      </div>
    );
  }

  const joinedAt = user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'Unknown';

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-500/20 via-indigo-900/60 to-indigo-950/80 p-10 shadow-glow">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-5">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 via-sky-500 to-indigo-500 text-2xl font-semibold uppercase text-white shadow-glow">
                {user.displayName.slice(0, 2)}
              </div>
              <span className="absolute -right-2 -bottom-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold uppercase text-white">
                {user.role[0]}
              </span>
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-heading font-semibold text-white">{user.displayName}</h1>
              <p className="text-sm text-slate-200/80">{user.email}</p>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">
                <Crown className="h-4 w-4 text-brand-200" />
                {user.role}
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-sm text-slate-200/90">
            <p className="text-xs uppercase tracking-wide text-slate-400">Member since</p>
            <p className="text-white">{joinedAt}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Tournaments Created',
            value: user.stats.tournamentsCreated,
            icon: Crown,
            description: 'Events you organized',
          },
          {
            label: 'Tournaments Joined',
            value: user.stats.tournamentsParticipated,
            icon: Users,
            description: 'Communities you embraced',
          },
          {
            label: 'Matches Played',
            value: user.stats.matchesPlayed,
            icon: Activity,
            description: 'Competitive rounds completed',
          },
          {
            label: 'Win Rate',
            value: `${Math.round(user.stats.winRate)}%`,
            icon: Medal,
            description: 'Your lifetime performance',
          },
        ].map(({ label, value, icon: Icon, description }) => (
          <div
            key={label}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-subtle backdrop-blur-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-60" />
            <div className="relative z-10 space-y-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-brand-100">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-300/70">{label}</p>
                <p className="text-2xl font-heading font-semibold text-white">{value}</p>
              </div>
              <p className="text-xs text-slate-400">{description}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="card space-y-6 border-white/10 bg-indigo-950/80">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-heading font-semibold text-white">Recent tournaments</h2>
            <p className="text-xs text-slate-300/80">
              A snapshot of the latest events you participated in.
            </p>
          </div>
        </div>

        {loadingRecent ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 h-4 w-1/2 rounded bg-white/10" />
                <div className="h-3 w-1/3 rounded bg-white/5" />
              </div>
            ))}
          </div>
        ) : recentTournaments.length > 0 ? (
          <div className="space-y-4">
            {recentTournaments.map((tournament) => (
              <div
                key={tournament._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200/90"
              >
                <div>
                  <p className="font-semibold text-white">{tournament.name}</p>
                  <p className="text-xs text-slate-400">
                    {tournament.game} • {tournament.format.replace('-', ' ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="capitalize text-slate-300/80">{tournament.status.replace('-', ' ')}</p>
                  <p className="text-xs text-slate-400">
                    {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : 'TBD'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-center text-sm text-slate-400">
            You have not joined any tournaments yet. Jump into the action!
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;
