import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Trophy, Users, BarChart2, Settings, LogOut } from 'lucide-react';
import { useAppDispatch } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';
import clsx from 'clsx';

interface SidebarProps {
  isMenuOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isMenuOpen }) => {
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

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
            <NavLink to="/dashboard" className="flex items-center p-2 rounded-md hover:bg-indigo-800">
              <Home className="w-5 h-5 mr-3" />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/tournaments" className="flex items-center p-2 rounded-md hover:bg-indigo-800">
              <Trophy className="w-5 h-5 mr-3" />
              Tournaments
            </NavLink>
          </li>
          <li>
            <NavLink to="/leaderboard" className="flex items-center p-2 rounded-md hover:bg-indigo-800">
              <BarChart2 className="w-5 h-5 mr-3" />
              Leaderboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile" className="flex items-center p-2 rounded-md hover:bg-indigo-800">
              <Users className="w-5 h-5 mr-3" />
              Profile
            </NavLink>
          </li>
        </ul>
        <ul className="mt-auto space-y-2">
          <li>
            <NavLink to="/settings" className="flex items-center p-2 rounded-md hover:bg-indigo-800">
              <Settings className="w-5 h-5 mr-3" />
              Settings
            </NavLink>
          </li>
          <li>
            <button onClick={handleLogout} className="flex items-center w-full p-2 rounded-md hover:bg-indigo-800">
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
