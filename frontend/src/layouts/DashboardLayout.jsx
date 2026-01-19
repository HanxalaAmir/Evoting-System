import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiGrid,       // Dashboard
  FiCheckSquare,// Vote
  FiPieChart,   // Results
  FiUser,       // Profile
  FiLogOut,     // Logout
  FiBox,        // Logo Icon
  FiMenu,       // Mobile Open
  FiX           // Mobile Close
} from 'react-icons/fi';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auto-close sidebar on route change (Mobile optimization)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  const handleLogout = () => {
    navigate('/');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FiGrid },
    { name: 'Vote Now', path: '/vote', icon: FiCheckSquare },
    { name: 'Live Results', path: '/results', icon: FiPieChart },
    { name: 'My Profile', path: '/profile', icon: FiUser },
  ];

  return (
    <div className="h-screen bg-slate-900 flex text-white font-sans overflow-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* --- MOBILE BACKDROP OVERLAY --- */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* --- SIDEBAR NAVIGATION --- */}
      <aside 
        className={`
          fixed md:relative z-50 h-full w-72 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl
          transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)]
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800/60 bg-slate-900/50">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
            <FiBox className="text-white w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight leading-none text-white">Voter Panel</span>
            <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider mt-1">Student Portal</span>
          </div>
          
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden ml-auto p-2 text-slate-400 hover:text-white transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          <p className="px-4 text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-4">Main Menu</p>
          {menuItems.map((item) => (
            <NavItem key={item.path} item={item} isActive={location.pathname === item.path} />
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-900/50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all duration-200 group"
          >
            <FiLogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative bg-slate-900">
        
        {/* Mobile Header (Visible only on small screens) */}
        <header className="md:hidden h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <FiBox className="text-white w-4 h-4" />
             </div>
             <span className="font-bold text-white tracking-tight">Voter Panel</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-300 bg-slate-800 rounded-lg border border-slate-700 active:scale-95 transition-transform"
          >
            <FiMenu className="w-6 h-6" />
          </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth relative">
          <div className="max-w-7xl mx-auto animate-fade-in pb-20 md:pb-10">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
};

// --- Helper Component for Cleaner Code ---
const NavItem = ({ item, isActive }) => {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      className={`
        flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden
        ${isActive 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/10' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
        }
      `}
    >
      <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
      <span className="font-medium text-sm tracking-wide">{item.name}</span>
      
      {/* Active Indicator Bar */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/30 rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
      )}
    </Link>
  );
};

export default DashboardLayout;