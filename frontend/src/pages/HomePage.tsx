import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Sparkles, ShieldCheck, Users, Rocket, ArrowRight, Star, Zap, Crown } from 'lucide-react';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import TournamentCard from '../components/Tournament/TournamentCard';
import Skeleton from '../components/ui/Skeleton';
import { fetchTournaments } from '../store/slices/tournamentSlice';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { tournaments, loading } = useAppSelector((state) => state.tournaments);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);

  useEffect(() => {
    if (!tournaments.length) {
      dispatch(fetchTournaments({ limit: 6 }));
    }
  }, [dispatch, tournaments.length]);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeatureIndex((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: 'Create in Minutes',
      description:
        'Flexible formats, smart defaults, and guided steps so you can launch your next bracket faster than ever.',
      icon: Rocket,
      accent: 'from-brand-500/30 via-sky-500/20 to-transparent',
      stats: '2min setup',
    },
    {
      title: 'Powerful Automations',
      description:
        'Automated seeding, scheduling assistance, and live bracket updates keep your events running smoothly.',
      icon: Trophy,
      accent: 'from-emerald-500/30 via-teal-500/20 to-transparent',
      stats: 'Real-time sync',
    },
    {
      title: 'Community Centric',
      description:
        'Player profiles, leaderboards, and shareable highlights that keep your community excited between events.',
      icon: Users,
      accent: 'from-violet-500/30 via-fuchsia-500/20 to-transparent',
      stats: 'Live updates',
    },
  ];

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-indigo-950/80 px-6 py-20 shadow-2xl sm:px-12 lg:px-16">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-sky-500/10" />
        <div className="pointer-events-none absolute inset-0 bg-hero-splash opacity-40" />

        {/* Animated background elements */}
        <div className="absolute top-10 left-10 h-32 w-32 animate-pulse rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-24 w-24 animate-pulse rounded-full bg-sky-400/10 blur-2xl delay-1000" />
        <div className="absolute top-1/2 left-1/4 h-16 w-16 animate-pulse rounded-full bg-emerald-400/10 blur-xl delay-500" />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-200 backdrop-blur-xl">
            <Sparkles className="h-4 w-4 text-brand-300 animate-pulse" />
            Competitive Experiences Crafted Beautifully
            <Crown className="h-4 w-4 text-yellow-400" />
          </div>

          <h1 className="mb-6 text-5xl font-heading font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
            Build tournaments{' '}
            <span className="relative">
              <span className="bg-gradient-to-r from-brand-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
                your players
              </span>
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 via-sky-400 to-emerald-400 rounded-full animate-pulse" />
            </span>{' '}
            will love.
          </h1>

          <p className="mt-8 max-w-3xl text-xl text-slate-200/90 leading-relaxed">
            Organize, launch, and scale world-class competitions with live brackets, automated scheduling, and
            rich community experiences—all in one beautiful dashboard.
          </p>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="group btn-primary text-lg px-8 py-4">
                  <span className="flex items-center gap-2">
                    Enter Dashboard
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
                <Link to="/tournaments" className="btn-secondary text-lg px-8 py-4">
                  Browse Tournaments
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="group btn-primary text-lg px-8 py-4">
                  <span className="flex items-center gap-2">
                    Start for Free
                    <Zap className="h-5 w-5 transition-transform group-hover:scale-110" />
                  </span>
                </Link>
                <Link to="/tournaments" className="btn-secondary text-lg px-8 py-4">
                  Explore Events
                </Link>
              </>
            )}
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-300/80">
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-xl">
              <ShieldCheck className="h-5 w-5 text-brand-200" />
              <span className="font-medium">Secure & reliable hosting</span>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-xl">
              <Users className="h-5 w-5 text-brand-200" />
              <span className="font-medium">Built for organizers & communities</span>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-xl">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="font-medium">Trusted by thousands</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-heading font-bold text-white">Why choose our platform?</h2>
          <p className="text-lg text-slate-300/80 max-w-2xl mx-auto">
            Everything you need to create amazing tournament experiences
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map(({ title, description, icon: Icon, accent, stats }, index) => (
            <div
              key={title}
              className={clsx(
                "group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl",
                index === currentFeatureIndex && "ring-2 ring-brand-400/50"
              )}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-60 transition-opacity duration-300 group-hover:opacity-80`} />

              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-gradient-to-br from-white/10 to-transparent blur-2xl" />
              </div>

              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-brand-100 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="rounded-full bg-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-200 border border-brand-400/30">
                    {stats}
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-heading font-semibold text-white group-hover:text-brand-100 transition-colors">
                    {title}
                  </h3>
                  <p className="text-slate-200/90 leading-relaxed">{description}</p>
                </div>

                {/* Hover indicator */}
                <div className="flex items-center gap-2 text-sm text-slate-400 opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <span>Learn more</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tournaments Section */}
      <section className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-4xl font-heading font-bold text-white">Trending tournaments</h2>
            <p className="text-lg text-slate-300/80">
              Discover the events organizers and players are buzzing about right now.
            </p>
          </div>
          <Link to="/tournaments" className="group btn-secondary text-lg px-6 py-3">
            <span className="flex items-center gap-2">
              View all tournaments
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {loading && (
            <>
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-2xl border border-white/5 bg-white/5 p-6 shadow-xl"
                >
                  <div className="mb-4 h-6 rounded-lg bg-white/10" />
                  <div className="mb-3 h-4 rounded-lg bg-white/10" />
                  <div className="h-32 rounded-xl bg-white/5" />
                </div>
              ))}
            </>
          )}

          {!loading && tournaments.slice(0, 3).map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}

          {!loading && tournaments.length === 0 && (
            <div className="col-span-full rounded-3xl border-2 border-dashed border-white/10 bg-white/5 p-16 text-center shadow-xl">
              <Trophy className="mx-auto h-16 w-16 text-slate-400 mb-6" />
              <p className="text-2xl font-semibold text-white mb-4">No tournaments yet</p>
              <p className="text-slate-300/80 mb-8 text-lg">
                Be the first to launch a competition and bring your community together.
              </p>
              <Link to="/create-tournament" className="btn-primary text-lg px-8 py-4">
                <span className="flex items-center gap-2">
                  Create a tournament
                  <Rocket className="h-5 w-5" />
                </span>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
