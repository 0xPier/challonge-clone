import React, { useMemo, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Trophy, X, LayoutDashboard, Medal, LogIn, UserPlus, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { useAppSelector } from '../../hooks/redux';

interface NavbarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Navbar: React.FC<NavbarProps> = ({ isMenuOpen, setIsMenuOpen }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = useMemo(() => {
    const core = [
      { to: '/tournaments', label: 'Tournaments', icon: Trophy },
      { to: '/leaderboard', label: 'Leaderboard', icon: Medal },
    ];

    if (isAuthenticated) {
      return [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }, ...core];
    }

    return core;
  }, [isAuthenticated]);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={clsx(
      "fixed inset-x-0 top-0 z-50 transition-all duration-300",
      isScrolled && "bg-slate-900/80 backdrop-blur-xl border-b border-white/10"
    )}>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <div className={clsx(
          "flex flex-1 items-center gap-4 rounded-2xl border border-white/10 p-3 shadow-lg transition-all duration-300",
          isScrolled
            ? "bg-slate-900/90 backdrop-blur-2xl shadow-2xl"
            : "bg-indigo-950/80 backdrop-blur-xl"
        )}>
          <Link
            to="/"
            className="group flex items-center gap-3 text-lg font-heading text-white transition-all duration-200 hover:scale-105"
            onClick={closeMenu}
          >
            <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 via-sky-500 to-indigo-500 text-white shadow-lg transition-all duration-200 group-hover:shadow-xl group-hover:shadow-brand-400/25">
              <Trophy className="h-5 w-5" />
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            </span>
            <span className="hidden sm:block">
              <span className="font-bold">Challonge</span>
              <span className="text-slate-300">Clone</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={closeMenu}
                className={clsx(
                  'relative flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all duration-200 group',
                  isActive(to)
                    ? 'bg-white/10 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white hover:scale-105'
                )}
              >
                <Icon className={clsx(
                  "h-4 w-4 transition-all duration-200",
                  isActive(to) ? "text-brand-300" : "group-hover:text-brand-300"
                )} />
                <span className="font-medium">{label}</span>
                {isActive(to) && (
                  <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-brand-300 to-transparent" />
                )}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/create-tournament"
                  className="hidden md:inline-flex btn-secondary group"
                  onClick={closeMenu}
                >
                  <Sparkles className="h-4 w-4 mr-1 transition-transform group-hover:rotate-12" />
                  Create
                </Link>
                <Link
                  to="/profile"
                  className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:border-white/30 hover:bg-white/20 hover:scale-105"
                  onClick={closeMenu}
                >
                  <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 text-sm font-semibold uppercase text-white shadow-lg transition-all duration-200 group-hover:shadow-xl">
                    {user?.displayName?.[0] ?? 'U'}
                    <span className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  </span>
                  <div className="hidden text-left md:block">
                    <p className="text-xs text-slate-300">Welcome back</p>
                    <p className="text-sm font-semibold text-white">{user?.displayName}</p>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 transition-all duration-200 hover:border-white/30 hover:text-white hover:bg-white/5 hover:scale-105 md:inline-flex"
                  onClick={closeMenu}
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="hidden md:inline-flex btn-primary group"
                  onClick={closeMenu}
                >
                  <UserPlus className="h-4 w-4 mr-1 transition-transform group-hover:scale-110" />
                  Sign Up
                </Link>
              </>
            )}

            <button
              type="button"
              className={clsx(
                "md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white transition-all duration-200 hover:scale-110",
                isScrolled ? "bg-slate-800/80" : "bg-white/5",
                "hover:border-white/30 hover:bg-white/10"
              )}
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <div className="relative">
                {isMenuOpen ? (
                  <X className="h-5 w-5 transition-transform duration-200 rotate-90" />
                ) : (
                  <Menu className="h-5 w-5 transition-transform duration-200" />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
