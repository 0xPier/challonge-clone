import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Trophy, Users, BarChart2, Settings, LogOut, ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';
import clsx from 'clsx';

interface SidebarProps {
  isMenuOpen: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMenuOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    onClose?.();
  };

  const handleLinkClick = () => {
    onClose?.();
  };

  const isActive = (path: string) => location.pathname === path;

  const sidebarClasses = clsx(
    'fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-indigo-900 text-slate-300 p-4 transition-transform duration-300 ease-in-out z-40 md:translate-x-0',
    {
      'translate-x-0': isMenuOpen,
      '-translate-x-full': !isMenuOpen,
    }
  );

  return (
    <aside className={sidebarClasses}>
      <nav className="flex flex-col h-full">
        <ul className="space-y-2">
          <li>
            <NavLink 
              to="/dashboard" 
              onClick={handleLinkClick}
              className={clsx(
                "flex items-center p-2 rounded-md transition-colors",
                isActive('/dashboard')
                  ? 'bg-indigo-800 text-white'
                  : 'hover:bg-indigo-800 text-slate-300'
              )}
            >
              <Home className="w-5 h-5 mr-3" />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/tournaments" 
              onClick={handleLinkClick}
              className={clsx(
                "flex items-center p-2 rounded-md transition-colors",
                isActive('/tournaments')
                  ? 'bg-indigo-800 text-white'
                  : 'hover:bg-indigo-800 text-slate-300'
              )}
            >
              <Trophy className="w-5 h-5 mr-3" />
              Tournaments
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/leaderboard" 
              onClick={handleLinkClick}
              className={clsx(
                "flex items-center p-2 rounded-md transition-colors",
                isActive('/leaderboard')
                  ? 'bg-indigo-800 text-white'
                  : 'hover:bg-indigo-800 text-slate-300'
              )}
            >
              <BarChart2 className="w-5 h-5 mr-3" />
              Leaderboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/profile"
              onClick={handleLinkClick}
              className={clsx(
                "flex items-center p-2 rounded-md transition-colors",
                isActive('/profile')
                  ? 'bg-indigo-800 text-white'
                  : 'hover:bg-indigo-800 text-slate-300'
              )}
            >
              <Users className="w-5 h-5 mr-3" />
              Profile
            </NavLink>
          </li>
          {user?.role === 'admin' && (
            <li>
              <NavLink
                to="/admin"
                onClick={handleLinkClick}
                className={clsx(
                  "flex items-center p-2 rounded-md transition-colors",
                  isActive('/admin')
                    ? 'bg-indigo-800 text-white'
                    : 'hover:bg-indigo-800 text-slate-300'
                )}
              >
                <ShieldCheck className="w-5 h-5 mr-3" />
                Admin Dashboard
              </NavLink>
            </li>
          )}
        </ul>
        <ul className="mt-auto space-y-2">
          <li>
            <NavLink 
              to="/settings" 
              onClick={handleLinkClick}
              className={clsx(
                "flex items-center p-2 rounded-md transition-colors",
                isActive('/settings')
                  ? 'bg-indigo-800 text-white'
                  : 'hover:bg-indigo-800 text-slate-300'
              )}
            >
              <Settings className="w-5 h-5 mr-3" />
              Settings
            </NavLink>
          </li>
          <li>
            <button onClick={handleLogout} className="flex items-center w-full p-2 rounded-md hover:bg-indigo-800 text-slate-300 transition-colors">
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
