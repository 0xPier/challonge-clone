import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle, XCircle, Clock, Trophy, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

interface PendingTournament {
  _id: string;
  name: string;
  game: string;
  format: string;
  organizer: {
    displayName: string;
    email: string;
  };
  maxParticipants: number;
  startDate: string;
  createdAt: string;
  status: string;
}

const AdminDashboard: React.FC = () => {
  const [pendingTournaments, setPendingTournaments] = useState<PendingTournament[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingTournaments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/pending-tournaments');
      setPendingTournaments(response.data.tournaments || []);
    } catch (error: any) {
      console.error('Failed to fetch pending tournaments:', error);
      toast.error('Failed to load pending tournaments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingTournaments();
  }, []);

  const handleApprove = async (tournamentId: string) => {
    try {
      await api.post(`/admin/tournaments/${tournamentId}/approve`);
      toast.success('Tournament approved successfully!');
      setPendingTournaments(prev => prev.filter(t => t._id !== tournamentId));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to approve tournament');
    }
  };

  const handleReject = async (tournamentId: string) => {
    try {
      await api.post(`/admin/tournaments/${tournamentId}/reject`);
      toast.success('Tournament rejected');
      setPendingTournaments(prev => prev.filter(t => t._id !== tournamentId));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reject tournament');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-brand-400" />
          <h1 className="text-3xl font-heading font-semibold text-white">Admin Dashboard</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-subtle backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="h-8 w-8 text-brand-400" />
          <h1 className="text-3xl font-heading font-semibold text-white">Admin Dashboard</h1>
        </div>
        <p className="text-sm text-slate-300/80">
          Review and approve pending tournaments from organizers.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="card border-white/10 bg-gradient-to-br from-brand-500/20 to-indigo-900/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Pending Review</p>
              <p className="text-3xl font-bold text-white mt-1">{pendingTournaments.length}</p>
            </div>
            <Clock className="h-10 w-10 text-brand-400" />
          </div>
        </div>

        <div className="card border-white/10 bg-gradient-to-br from-green-500/20 to-emerald-900/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Total Tournaments</p>
              <p className="text-3xl font-bold text-white mt-1">-</p>
            </div>
            <Trophy className="h-10 w-10 text-green-400" />
          </div>
        </div>

        <div className="card border-white/10 bg-gradient-to-br from-purple-500/20 to-purple-900/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Active Users</p>
              <p className="text-3xl font-bold text-white mt-1">-</p>
            </div>
            <Users className="h-10 w-10 text-purple-400" />
          </div>
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-heading font-semibold text-white">
          Pending Tournament Approvals
        </h2>

        {pendingTournaments.length === 0 ? (
          <div className="card border-white/10 bg-white/5 text-center py-12">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-lg text-slate-300">All caught up!</p>
            <p className="text-sm text-slate-400 mt-2">
              No tournaments awaiting approval at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingTournaments.map((tournament) => (
              <div
                key={tournament._id}
                className="card border-white/10 bg-indigo-950/80 hover:border-brand-400/30 transition-colors"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-heading font-semibold text-white">
                          {tournament.name}
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
                          <Clock className="h-3 w-3" />
                          Pending Approval
                        </span>
                      </div>
                      <p className="text-sm text-brand-200">{tournament.game}</p>
                    </div>

                    <div className="grid gap-4 text-sm md:grid-cols-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Organizer</p>
                        <p className="text-white">{tournament.organizer.displayName}</p>
                        <p className="text-xs text-slate-500">{tournament.organizer.email}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Format</p>
                        <p className="text-white capitalize">
                          {tournament.format.replace('-', ' ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          Max Participants
                        </p>
                        <p className="text-white">{tournament.maxParticipants}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Start Date</p>
                        <p className="text-white">
                          {new Date(tournament.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          Submitted
                        </p>
                        <p className="text-white">
                          {new Date(tournament.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReject(tournament._id)}
                      className="btn-secondary flex items-center gap-2 justify-center"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(tournament._id)}
                      className="btn-primary flex items-center gap-2 justify-center"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
