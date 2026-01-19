import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { FiUser, FiShield, FiX } from 'react-icons/fi';

const Landing = () => {
  const [showLoginOptions, setShowLoginOptions] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-900">
      
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      {/* Glass Card */}
      <div className="relative z-10 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center animate-fade-in ring-1 ring-white/5">
        
        {/* Logo */}
        <div className="w-16 h-16 bg-gradient-to-tr from-primary to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20">
          <span className="text-3xl filter drop-shadow-sm">🗳️</span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
          University E-Voting
        </h1>
        <p className="text-slate-400 mb-8 text-sm font-normal leading-relaxed">
          Secure. Transparent. Efficient.
        </p>

        {/* --- DYNAMIC LOGIN SECTION --- */}
        <div className="mb-8 min-h-[60px]">
          {!showLoginOptions ? (
            <Button 
              variant="primary" 
              size="md" 
              className="w-full gap-2 shadow-lg shadow-primary/25"
              onClick={() => setShowLoginOptions(true)}
            >
              Login to Portal
            </Button>
          ) : (
            <div className="space-y-3 animate-fade-in bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Select Role</span>
                <button onClick={() => setShowLoginOptions(false)} className="text-slate-500 hover:text-white transition-colors">
                  <FiX />
                </button>
              </div>
              
              <Link to="/login?role=voter" className="block">
                <Button variant="primary" className="w-full gap-2 justify-start">
                  <FiUser /> Voter Login
                </Button>
              </Link>
              
              <Link to="/login?role=admin" className="block">
                <Button variant="secondary" className="w-full gap-2 justify-start bg-slate-800 hover:bg-slate-700">
                  <FiShield /> Admin Login
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* --- STATUS CHECK --- */}
        <div className="pt-6 border-t border-slate-800/50">
          <p className="text-xs text-slate-500 mb-3 uppercase tracking-wide font-semibold">
            Check Registration Status
          </p>
          <div className="flex gap-2">
            <Input placeholder="Enter Index No..." className="text-sm" />
            <Button variant="secondary" size="md" className="shrink-0">Check</Button>
          </div>
        </div>

        <div className="mt-6 text-[10px] text-slate-600 uppercase tracking-wider font-bold">
          AES-256 Secured System
        </div>
      </div>
    </div>
  );
};

export default Landing;