import React, { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchTournaments, setFilters } from '../store/slices/tournamentSlice';
import TournamentCard from '../components/Tournament/TournamentCard';

const TournamentListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tournaments, loading, error, filters, pagination } = useAppSelector((state) => state.tournaments);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formatFilter, setFormatFilter] = useState('');

  useEffect(() => {
    dispatch(fetchTournaments({ limit: 12, skip: 0 }));
  }, [dispatch]);

  useEffect(() => {
    const newFilters: Partial<typeof filters> = {};
    if (statusFilter) newFilters.status = statusFilter;
    if (formatFilter) newFilters.format = formatFilter;
    dispatch(setFilters(newFilters));
  }, [statusFilter, formatFilter, dispatch]);

  const handleSearch = () => {
    dispatch(
      fetchTournaments({
        ...filters,
        game: searchTerm || undefined,
        limit: 12,
        skip: 0,
      })
    );
  };

  const handleLoadMore = () => {
    if (!pagination.hasMore || loading) return;
    dispatch(
      fetchTournaments({
        ...filters,
        game: searchTerm || undefined,
        limit: 12,
        skip: tournaments.length,
      })
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setFormatFilter('');
    dispatch(setFilters({}));
    dispatch(fetchTournaments({ limit: 12, skip: 0 }));
  };

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-subtle backdrop-blur-xl">
        <div className="flex flex-col gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">
            <Filter className="h-4 w-4 text-brand-200" />
            Discover Tournaments
          </span>
          <h1 className="text-3xl font-heading font-semibold text-white">Find your next competition</h1>
          <p className="max-w-2xl text-sm text-slate-300/80">
            Browse community-driven events spanning every genre, skill level, and region.
          </p>
        </div>
      </section>

      <section className="card border-white/10 bg-indigo-950/80">
        <div className="grid gap-4 lg:grid-cols-[2fr,1fr,1fr]">
          <div className="space-y-2">
            <label className="input-label" htmlFor="search">
              Search games
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-200" />
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
                  placeholder="Search by game or tournament name..."
                  className="input-field pl-11"
                />
              </div>
              <button type="button" className="btn-primary" onClick={handleSearch}>
                Search
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="input-label" htmlFor="status-filter">
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="input-field"
            >
              <option value="">All status</option>
              <option value="open">Open</option>
              <option value="in-progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="input-label" htmlFor="format-filter">
              Format
            </label>
            <select
              id="format-filter"
              value={formatFilter}
              onChange={(event) => setFormatFilter(event.target.value)}
              className="input-field"
            >
              <option value="">All formats</option>
              <option value="single-elimination">Single Elimination</option>
              <option value="double-elimination">Double Elimination</option>
              <option value="round-robin">Round Robin</option>
              <option value="swiss">Swiss</option>
              <option value="free-for-all">Free For All</option>
            </select>
          </div>
        </div>

        {(searchTerm || statusFilter || formatFilter) && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
            <span>
              Showing results for{' '}
              <strong className="text-white">
                {searchTerm || 'all games'}
              </strong>
              {statusFilter && ` • ${statusFilter}`}
              {formatFilter && ` • ${formatFilter}`}
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className="text-brand-200 hover:text-brand-100"
            >
              Clear all
            </button>
          </div>
        )}
      </section>

      {/* Loading State */}
      {loading && tournaments.length === 0 && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <div className="mb-4 h-6 w-3/4 rounded-lg bg-white/10" />
              <div className="mb-3 h-4 w-1/2 rounded bg-white/10" />
              <div className="h-24 rounded-xl bg-white/5" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      )}

      {tournaments.length > 0 && (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {tournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} showOrganizer />
            ))}
          </div>

          {pagination.hasMore && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loading}
                className="btn-secondary mt-4 justify-center px-6 py-2 disabled:opacity-60"
              >
                {loading ? 'Loading...' : 'Load more tournaments'}
              </button>
            </div>
          )}
        </>
      )}

      {!loading && tournaments.length === 0 && !error && (
        <div className="rounded-3xl border border-dashed border-white/20 bg-white/5 p-10 text-center">
          <p className="text-lg font-semibold text-white">No tournaments match your filters</p>
          <p className="mt-2 text-sm text-slate-300/80">
            Try adjusting your search or start a new competition from scratch.
          </p>
          <a href="/create-tournament" className="btn-primary mt-6">
            Create a tournament
          </a>
        </div>
      )}
    </div>
  );
};

export default TournamentListPage;
