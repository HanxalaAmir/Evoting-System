import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiUser } from 'react-icons/fi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Links for the Landing Page
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/#about' },
    { name: 'Features', path: '/#features' },
    { name: 'Contact', path: '/#contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* --- DESKTOP & MOBILE NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4">
        <div className="w-full max-w-5xl bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/20 px-6 py-3 transition-all duration-300">
          
          <div className="flex items-center justify-between">
            
            {/* 1. LOGO */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-tr from-primary to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <span className="text-sm">🗳️</span>
              </div>
              <span className="text-white font-bold tracking-tight group-hover:text-primary transition-colors">
                E-Vote
              </span>
            </Link>

            {/* 2. DESKTOP LINKS (Hidden on Mobile) */}
            <div className="hidden md:flex items-center gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`
                    px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive(link.path) 
                      ? 'bg-slate-700 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }
                  `}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* 3. RIGHT SIDE ACTIONS */}
            <div className="flex items-center gap-3">
              {/* Desktop Login Button */}
              <Link 
                to="/login"
                className="hidden md:flex items-center gap-2 text-xs font-semibold text-primary hover:text-indigo-400 transition-colors bg-primary/10 px-4 py-2 rounded-lg border border-primary/20 hover:bg-primary/20"
              >
                <FiUser /> Portal Login
              </Link>

              {/* Mobile Hamburger Toggle */}
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white transition-colors bg-slate-800/50 rounded-lg border border-slate-700/50"
              >
                {isOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* --- MOBILE DROPDOWN MENU (Animated) --- */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-60 opacity-100 mt-4 pb-2' : 'max-h-0 opacity-0'}`}>
            <div className="flex flex-col gap-2 border-t border-slate-700/50 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)} // Close menu on click
                  className="px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors bg-slate-800/30"
                >
                  {link.name}
                </Link>
              ))}
              
              <Link 
                to="/login"
                onClick={() => setIsOpen(false)}
                className="mt-2 px-4 py-3 text-sm font-bold text-center bg-primary text-white rounded-lg shadow-lg shadow-primary/20"
              >
                Login to Portal
              </Link>
            </div>
          </div>
          
        </div>
      </nav>
    </>
  );
};

export default Navbar;