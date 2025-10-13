import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Users, ArrowRight, UserCircle2, Clock, MapPin, Star, TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import { Tournament } from '../../store/slices/tournamentSlice';

interface TournamentCardProps {
  tournament: Tournament;
  showOrganizer?: boolean;
}

const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  showOrganizer = true,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-slate-500/20 text-slate-300 border-slate-400/30';
      case 'open':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-400/30';
    }
  };

  const getFormatLabel = (format: string) => {
    const formats: Record<string, string> = {
      'single-elimination': 'Single Elim',
      'double-elimination': 'Double Elim',
      'round-robin': 'Round Robin',
      'swiss': 'Swiss',
      'free-for-all': 'Free For All',
    };
    return formats[format] || format;
  };

  const progressPercentage = tournament.bracketData?.totalRounds
    ? Math.min(
        100,
        Math.round(
          (tournament.bracketData.currentRound / Math.max(tournament.bracketData.totalRounds, 1)) * 100
        )
      )
    : 0;

  const registrationDate = tournament.registrationDeadline
    ? new Date(tournament.registrationDeadline).toLocaleDateString()
    : 'TBD';
  const startDate = tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : 'TBD';

  const isAlmostFull = tournament.currentParticipants / tournament.maxParticipants > 0.8;
  const isNew = tournament.createdAt && Date.now() - new Date(tournament.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-white/20">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-sky-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Status indicator */}
      <div className="absolute top-4 right-4">
        <span className={clsx(
          "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
          getStatusColor(tournament.status)
        )}>
          {tournament.status.replace('-', ' ')}
        </span>
      </div>

      {/* Header */}
      <div className="relative z-10 mb-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-white/80 border border-white/10">
                {getFormatLabel(tournament.format)} • {tournament.game}
              </span>
              {isNew && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-300 border border-emerald-400/30">
                  <Star className="h-3 w-3" />
                  New
                </span>
              )}
              {isAlmostFull && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-1 text-xs font-semibold text-amber-300 border border-amber-400/30">
                  <TrendingUp className="h-3 w-3" />
                  Almost Full
                </span>
              )}
            </div>
            <h3 className="text-xl font-heading font-bold leading-tight text-white group-hover:text-brand-100 transition-colors">
              {tournament.name}
            </h3>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="relative z-10 space-y-6">
        {/* Tournament info */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
            <span className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 border border-white/5">
              <Users className="h-4 w-4 text-brand-300" />
              <span className="font-medium">
                {tournament.currentParticipants}/{tournament.maxParticipants} players
              </span>
            </span>
            <span className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 border border-white/5">
              <CalendarDays className="h-4 w-4 text-brand-300" />
              <span className="font-medium">Starts {startDate}</span>
            </span>
          </div>

          {tournament.description && (
            <p className="text-sm text-slate-300/90 leading-relaxed line-clamp-2">
              {tournament.description}
            </p>
          )}
        </div>

        {/* Progress bar for in-progress tournaments */}
        {tournament.status === 'in-progress' && tournament.bracketData && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300 font-medium">Tournament Progress</span>
              <span className="text-brand-300 font-semibold">
                Round {tournament.bracketData.currentRound}/{tournament.bracketData.totalRounds}
              </span>
            </div>
            <div className="relative">
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-400 via-sky-400 to-blue-500 transition-all duration-500 relative"
                  style={{ width: `${progressPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tournament details */}
        <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Reg closes {registrationDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>Online Event</span>
          </div>
        </div>

        {/* Organizer info */}
        {showOrganizer && tournament.organizer && (
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              {tournament.organizer.avatar ? (
                <img
                  src={tournament.organizer.avatar}
                  alt={tournament.organizer.displayName}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-white/10"
                />
              ) : (
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 ring-2 ring-white/10">
                  <UserCircle2 className="h-4 w-4 text-white" />
                </span>
              )}
              <div>
                <p className="text-sm font-semibold text-white">
                  {tournament.organizer.displayName}
                </p>
                <p className="text-xs text-slate-400">Tournament Organizer</p>
              </div>
            </div>
            <span className="rounded-full bg-brand-500/20 px-2 py-1 text-xs font-semibold text-brand-300 border border-brand-400/30">
              Host
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <Link
            to={`/tournaments/${tournament.id}`}
            className="group/btn flex-1 btn-primary justify-center text-sm"
          >
            <span className="flex items-center gap-2">
              View Details
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </span>
          </Link>

          {tournament.status === 'open' && (
            <Link
              to={`/tournaments/${tournament.id}/register`}
              className="group/btn flex-1 btn-secondary justify-center text-sm"
            >
              <span className="flex items-center gap-2">
                Register Now
                <Users className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
              </span>
            </Link>
          )}

          {tournament.status === 'in-progress' && (
            <Link
              to={`/tournaments/${tournament.id}/bracket`}
              className="group/btn flex-1 btn-secondary justify-center text-sm"
            >
              <span className="flex items-center gap-2">
                Live Bracket
                <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
              </span>
            </Link>
          )}
        </div>

        {/* Tags */}
        {tournament.tags && tournament.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
            {tournament.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-xs font-medium text-slate-300 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
            {tournament.tags.length > 4 && (
              <span className="text-xs text-slate-400 px-2 py-1">
                +{tournament.tags.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-500/5 to-sky-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
    </div>
  );
};

export default TournamentCard;
