import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="min-h-screen bg-indigo-950 text-slate-100">
      <Toaster position="top-center" />
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <div className="flex pt-16">
        <Sidebar isMenuOpen={isMenuOpen} onClose={closeMenu} />
        <div className="flex-1 md:ml-64">
          <main className="p-4 md:p-8">
            {children}
          </main>
        </div>
        {isMenuOpen && (
          <div
            className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
            onClick={closeMenu}
          />
        )}
      </div>
    </div>
  );
};

export default Layout;
