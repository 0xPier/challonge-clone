import React, { useEffect, useState } from 'react';
import { Trophy, Medal, TrendingUp } from 'lucide-react';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

interface LeaderboardEntry {
  id: string;
  displayName: string;
  avatar?: string;
  stats: {
    tournamentsCreated: number;
    tournamentsParticipated: number;
    matchesPlayed: number;
    matchesWon: number;
    winRate: number;
  };
  winRate?: number;
  rank: number;
  createdAt: string;
}

const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getLeaderboard({ limit: 25 });
        setLeaderboard(response.leaderboard || []);
      } catch (error: any) {
        toast.error(error?.response?.data?.error || 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-subtle backdrop-blur-xl">
        <div className="flex flex-col gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">
            <Trophy className="h-4 w-4 text-brand-200" />
            Leaderboard
          </span>
          <h1 className="text-3xl font-heading font-semibold text-white">Top competitors across the platform</h1>
          <p className="max-w-2xl text-sm text-slate-300/80">
            Track the players who are dominating their brackets and shaping the competitive scene.
          </p>
        </div>
      </section>

      <section className="card space-y-6 border-white/10 bg-indigo-950/80">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-heading font-semibold text-white">Current season highlights</h2>
            <p className="text-xs text-slate-300/80">
              Rankings are based on win rate, total wins, and recent activity.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">
            <TrendingUp className="h-4 w-4 text-brand-200" />
            Live data
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 h-4 w-1/2 rounded bg-white/10" />
                <div className="h-3 w-1/4 rounded bg-white/5" />
              </div>
            ))}
          </div>
        ) : leaderboard.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm text-slate-200/80">
              <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-300/50">
                <tr>
                  <th className="px-6 py-3">Rank</th>
                  <th className="px-6 py-3">Player</th>
                  <th className="px-6 py-3">Matches</th>
                  <th className="px-6 py-3">Wins</th>
                  <th className="px-6 py-3">Win rate</th>
                  <th className="px-6 py-3">Tournaments</th>
                  <th className="px-6 py-3 text-right">Member since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.id}
                    className="transition hover:bg-white/5"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-white">
                      {entry.rank <= 3 ? (
                        <span className="inline-flex items-center gap-2">
                          <Medal className="h-4 w-4 text-brand-200" />
                          #{entry.rank}
                        </span>
                      ) : (
                        `#${entry.rank}`
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/20 text-sm font-semibold uppercase text-white">
                          {entry.displayName.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{entry.displayName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{entry.stats.matchesPlayed}</td>
                    <td className="px-6 py-4">{entry.stats.matchesWon}</td>
                    <td className="px-6 py-4">{Math.round(entry.winRate ?? entry.stats.winRate)}%</td>
                    <td className="px-6 py-4">{entry.stats.tournamentsParticipated}</td>
                    <td className="px-6 py-4 text-right text-xs text-slate-400">
                      {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-center text-sm text-slate-400">
            Leaderboard data will appear once players start competing.
          </div>
        )}
      </section>
    </div>
  );
};

export default LeaderboardPage;
