import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle, XCircle, Clock, Trophy, Users, Edit, Trash2, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

interface Tournament {
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
  participants: any[];
}

const AdminDashboard: React.FC = () => {
  const [pendingTournaments, setPendingTournaments] = useState<Tournament[]>([]);
  const [allTournaments, setAllTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

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

  const fetchAllTournaments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/tournaments');
      setAllTournaments(response.data.tournaments || []);
    } catch (error: any) {
      console.error('Failed to fetch tournaments:', error);
      toast.error('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingTournaments();
    } else {
      fetchAllTournaments();
    }
  }, [activeTab]);

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

  const handleDelete = async (tournamentId: string) => {
    if (!window.confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/admin/tournaments/${tournamentId}`);
      toast.success('Tournament deleted successfully');
      setAllTournaments(prev => prev.filter(t => t._id !== tournamentId));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete tournament');
    }
  };

  const handleStartEarly = async (tournamentId: string) => {
    if (!window.confirm('Are you sure you want to start this tournament early?')) {
      return;
    }

    try {
      await api.post(`/admin/tournaments/${tournamentId}/start-early`);
      toast.success('Tournament started successfully');
      fetchAllTournaments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to start tournament');
    }
 };

  const handleAddParticipant = async (tournamentId: string) => {
    const userId = prompt('Enter User ID to add:');
    if (!userId) return;

    try {
      await api.post(`/admin/tournaments/${tournamentId}/participants/add`, { userId });
      toast.success('Participant added successfully');
      fetchAllTournaments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add participant');
    }
 };

  const handleRemoveParticipant = async (tournamentId: string) => {
    const userId = prompt('Enter User ID to remove:');
    if (!userId) return;

    try {
      await api.delete(`/admin/tournaments/${tournamentId}/participants/remove`, {
        data: { userId }
      });
      toast.success('Participant removed successfully');
      fetchAllTournaments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove participant');
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
          Manage tournaments, approve submissions, and oversee platform operations.
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
        <div className="flex items-center gap-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'pending'
                ? 'border-b-2 border-brand-400 text-brand-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending Approvals ({pendingTournaments.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'all'
                ? 'border-b-2 border-brand-400 text-brand-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Tournaments
          </button>
        </div>

        {activeTab === 'pending' && pendingTournaments.length === 0 ? (
          <div className="card border-white/10 bg-white/5 text-center py-12">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-lg text-slate-300">All caught up!</p>
            <p className="text-sm text-slate-400 mt-2">
              No tournaments awaiting approval at the moment.
            </p>
          </div>
        ) : activeTab === 'pending' ? (
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
        ) : null}

        {activeTab === 'all' && (
          <div className="space-y-4">
            {allTournaments.map((tournament) => (
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
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${
                            tournament.status === 'in-progress'
                              ? 'border-green-500/30 bg-green-500/10 text-green-400'
                              : tournament.status === 'open'
                              ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                              : tournament.status === 'completed'
                              ? 'border-gray-500/30 bg-gray-500/10 text-gray-400'
                              : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                          }`}
                        >
                          {tournament.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-brand-200">{tournament.game}</p>
                    </div>

                    <div className="grid gap-4 text-sm md:grid-cols-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Organizer</p>
                        <p className="text-white">{tournament.organizer.displayName}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Format</p>
                        <p className="text-white capitalize">
                          {tournament.format.replace('-', ' ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          Participants
                        </p>
                        <p className="text-white">
                          {tournament.participants?.length || 0} / {tournament.maxParticipants}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Start Date</p>
                        <p className="text-white">
                          {new Date(tournament.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {(tournament.status === 'open' || tournament.status === 'pending-approval') &&
                      tournament.participants?.length >= 2 && (
                        <button
                          onClick={() => handleStartEarly(tournament._id)}
                          className="btn-primary flex items-center gap-2 justify-center"
                          title="Start tournament early"
                        >
                          <Play className="h-4 w-4" />
                          Start
                        </button>
                      )}
                    <button
                      onClick={() => handleAddParticipant(tournament._id)}
                      className="btn-secondary flex items-center gap-2 justify-center text-blue-400 hover:bg-blue-50/10"
                      title="Add participant"
                    >
                      <Edit className="h-4 w-4" />
                      Add
                    </button>
                    <button
                      onClick={() => handleRemoveParticipant(tournament._id)}
                      className="btn-secondary flex items-center gap-2 justify-center text-orange-400 hover:bg-orange-500/10"
                      title="Remove participant"
                    >
                      <Edit className="h-4 w-4" />
                      Remove
                    </button>
                    <button
                      onClick={() => handleDelete(tournament._id)}
                      className="btn-secondary flex items-center gap-2 justify-center text-red-400 hover:bg-red-50/10"
                      title="Delete tournament"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
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
