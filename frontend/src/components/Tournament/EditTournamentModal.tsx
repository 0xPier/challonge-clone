import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Users, Trophy, Settings } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../services/api';

export {};

interface Tournament {
  id: string;
  name: string;
  game: string;
  description: string;
  format: 'single-elimination' | 'double-elimination' | 'round-robin' | 'swiss' | 'free-for-all';
  status: 'draft' | 'open' | 'in-progress' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  registrationDeadline: string;
  maxParticipants: number;
  currentParticipants: number;
  organizer: {
    id: string;
    displayName: string;
    avatar?: string;
  };
  settings: {
    allowSelfRegistration: boolean;
    requireApproval: boolean;
    showAsOfficial: boolean;
    hideForum: boolean;
    allowParticipantScheduling: boolean;
    showRounds: boolean;
    allowMatchReporting: boolean;
  };
  rules?: string;
  tags?: string[];
}

interface EditTournamentModalProps {
  tournament: Tournament;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

type EditFormValues = {
  name: string;
  game: string;
  description: string;
  format: string;
  status: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxParticipants: number;
  isPublic: boolean;
  requireApproval: boolean;
  rules: string;
  tags: string;
};

const EditTournamentModal: React.FC<EditTournamentModalProps> = ({
  tournament,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFormValues>({
    defaultValues: {
      name: '',
      game: '',
      description: '',
      format: 'single-elimination',
      status: 'draft',
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      maxParticipants: 8,
      isPublic: true,
      requireApproval: false,
      rules: '',
      tags: '',
    },
  });

  // Reset form when tournament changes
  useEffect(() => {
    if (tournament) {
      reset({
        name: tournament.name,
        game: tournament.game,
        description: tournament.description,
        format: tournament.format,
        status: tournament.status,
        startDate: tournament.startDate ? new Date(tournament.startDate).toISOString().slice(0, 16) : '',
        endDate: tournament.endDate ? new Date(tournament.endDate).toISOString().slice(0, 16) : '',
        registrationDeadline: tournament.registrationDeadline ? new Date(tournament.registrationDeadline).toISOString().slice(0, 16) : '',
        maxParticipants: tournament.maxParticipants,
        isPublic: tournament.settings?.allowSelfRegistration ?? true,
        requireApproval: tournament.settings?.requireApproval ?? false,
        rules: tournament.rules || '',
        tags: tournament.tags?.join(', ') || '',
      });
    }
  }, [tournament, reset]);

  const onSubmit = async (values: EditFormValues) => {
    try {
      setIsLoading(true);

      const updateData = {
        ...values,
        tags: values.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        startDate: values.startDate ? new Date(values.startDate).toISOString() : null,
        endDate: values.endDate ? new Date(values.endDate).toISOString() : null,
        registrationDeadline: values.registrationDeadline ? new Date(values.registrationDeadline).toISOString() : null,
      };

      await api.put(`/admin/tournaments/${tournament.id}`, updateData);

      toast.success('Tournament updated successfully!');
      onUpdate();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update tournament');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-indigo-950/90 p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-brand-400" />
            <h2 className="text-2xl font-heading font-semibold text-white">Edit Tournament</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Tournament Name</label>
              <input
                type="text"
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
                placeholder="Enter tournament name"
                {...register('name', { required: 'Tournament name is required' })}
              />
              {errors.name && <p className="text-xs text-rose-300">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Game</label>
              <input
                type="text"
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
                placeholder="e.g., Valorant, CS2, League of Legends"
                {...register('game', { required: 'Game is required' })}
              />
              {errors.game && <p className="text-xs text-rose-300">{errors.game.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Description</label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
              placeholder="Describe your tournament..."
              {...register('description')}
            />
          </div>

          {/* Tournament Settings */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Format</label>
              <select
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
                {...register('format')}
              >
                <option value="single-elimination">Single Elimination</option>
                <option value="double-elimination">Double Elimination</option>
                <option value="round-robin">Round Robin</option>
                <option value="swiss">Swiss System</option>
                <option value="free-for-all">Free for All</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Status</label>
              <select
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
                {...register('status')}
              >
                <option value="draft">Draft</option>
                <option value="pending-approval">Pending Approval</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Start Date</label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="datetime-local"
                  className="w-full rounded-xl border border-white/20 bg-white/5 pl-10 pr-4 py-3 text-white focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
                  {...register('startDate')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">End Date</label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="datetime-local"
                  className="w-full rounded-xl border border-white/20 bg-white/5 pl-10 pr-4 py-3 text-white focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
                  {...register('endDate')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Registration Deadline</label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="datetime-local"
                  className="w-full rounded-xl border border-white/20 bg-white/5 pl-10 pr-4 py-3 text-white focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
                  {...register('registrationDeadline')}
                />
              </div>
            </div>
          </div>

          {/* Tournament Configuration */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Max Participants</label>
              <div className="relative">
                <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min="2"
                  max="128"
                  className="w-full rounded-xl border border-white/20 bg-white/5 pl-10 pr-4 py-3 text-white focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
                  {...register('maxParticipants', { required: 'Max participants is required', min: 2 })}
                />
              </div>
              {errors.maxParticipants && <p className="text-xs text-rose-300">{errors.maxParticipants.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Visibility</label>
              <select
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
                {...register('isPublic')}
              >
                <option value="true">Public</option>
                <option value="false">Private</option>
              </select>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="requireApproval"
                className="rounded border-white/20 bg-white/5 text-brand-400 focus:ring-brand-400 focus:ring-offset-0"
                {...register('requireApproval')}
              />
              <label htmlFor="requireApproval" className="text-sm text-slate-200">
                Require approval for participant registration
              </label>
            </div>
          </div>

          {/* Rules */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Tournament Rules</label>
            <textarea
              rows={4}
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
              placeholder="Enter tournament rules and guidelines..."
              {...register('rules')}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Tags</label>
            <input
              type="text"
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
              placeholder="e.g., competitive, casual, beginner-friendly"
              {...register('tags')}
            />
            <p className="text-xs text-slate-400">Separate tags with commas</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-xl bg-brand-500 px-6 py-3 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTournamentModal;
