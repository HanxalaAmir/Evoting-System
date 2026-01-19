import React, { useState, useRef, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { 
  FiTrendingUp, FiUsers, FiBox, FiActivity, FiLayers, 
  FiCalendar, FiChevronDown, FiClock, FiBarChart2, FiArrowRight, 
  FiX, FiCheckCircle, FiTarget, FiAlignLeft
} from 'react-icons/fi';

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('Today');
  const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Modal State
  const [selectedElection, setSelectedElection] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const filterRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getTimeLeft = (endTime) => {
    const total = Date.parse(endTime) - Date.parse(currentTime);
    if (total <= 0) return "Ended";
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    return `${hours}h ${minutes}m`;
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsTimeFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openDetails = (election) => {
    setSelectedElection(election);
    setShowModal(true);
  };

  const closeDetails = () => {
    setShowModal(false);
    setSelectedElection(null);
  };

  // --- MOCK DATA ---
  const today = new Date();
  const liveElections = [
    {
      id: 1,
      title: 'Student Council President',
      date: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      startTime: '09:00 AM',
      endTime: new Date(today.getTime() + 4 * 60 * 60 * 1000).toISOString(),
      description: "Electing the leader of the student body for the 2026 academic year.",
      votes: 1240,
      participation: 78,
      status: 'Live',
      candidates: [
        { id: 101, name: "Sarah Jenkins", party: "Future Vision", votes: 650, color: "bg-purple-600", designation: "Presidential Candidate" },
        { id: 102, name: "Michael Chen", party: "Tech Forward", votes: 410, color: "bg-blue-600", designation: "Presidential Candidate" },
        { id: 103, name: "Jessica Alba", party: "Green Campus", votes: 180, color: "bg-emerald-500", designation: "Presidential Candidate" },
      ]
    },
    {
      id: 2,
      title: 'Science Dept. Representative',
      date: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      startTime: '10:00 AM',
      endTime: new Date(today.getTime() + 6 * 60 * 60 * 1000).toISOString(),
      description: "Representative for the Computer Science and Physics departments.",
      votes: 450,
      participation: 45,
      status: 'Live',
      candidates: [
        { id: 201, name: "Emily Blunt", party: "Science Union", votes: 200, color: "bg-orange-500", designation: "Dept Lead" },
        { id: 202, name: "John Krasinski", party: "Innovators", votes: 250, color: "bg-cyan-500", designation: "Dept Lead" },
      ]
    }
  ];

  const stats = [
    { label: 'Total Voters Registered', val: '1,204', icon: FiUsers, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Total Votes Cast', val: '2,092', icon: FiBox, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Participation', val: '76%', icon: FiTrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Active Sessions', val: '2', icon: FiActivity, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Total Elections', val: '12', icon: FiLayers, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'System Status', val: 'Optimal', icon: FiCheckCircle, color: 'text-rose-400', bg: 'bg-rose-500/10', animate: true },
  ];

  return (
    <AdminLayout>
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            Admin Dashboard
            <span className="flex h-2 w-2 relative">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            System status: <span className="text-emerald-400 font-bold">ONLINE</span> • 2 Active Elections
          </p>
        </div>

        {/* Time Filter */}
        <div className="relative z-20" ref={filterRef}>
            <button 
              onClick={() => setIsTimeFilterOpen(!isTimeFilterOpen)}
              className={`flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl border transition-all shadow-lg min-w-[160px] justify-between ${isTimeFilterOpen ? 'border-rose-500 ring-1 ring-rose-500/50' : 'border-slate-700'}`}
            >
              <div className="flex items-center gap-2">
                <FiCalendar className="text-rose-400" />
                <span className="text-sm font-medium">{timeRange}</span>
              </div>
              <FiChevronDown className={`text-slate-500 transition-transform duration-200 ${isTimeFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isTimeFilterOpen && (
              <div className="absolute right-0 mt-2 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-slide-up origin-top-right z-30">
                <div className="px-4 py-2 text-[10px] uppercase font-bold text-slate-500 bg-slate-900/50 border-b border-slate-700/50">
                  View Data For
                </div>
                {['Today', 'Last 7 Days', 'Last 30 Days', 'All Time'].map((range) => (
                  <button 
                    key={range}
                    onClick={() => { setTimeRange(range); setIsTimeFilterOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors border-l-2 ${
                      timeRange === range ? 'bg-rose-500/10 text-rose-400 border-rose-500 font-medium' : 'text-slate-300 hover:bg-slate-700 hover:text-white border-transparent'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
        </div>
      </header>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12 animate-slide-up">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-slate-800/40 border border-slate-700/50 p-5 md:p-6 rounded-2xl flex items-center justify-between hover:border-slate-600 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group">
            <div>
              <p className="text-slate-500 text-[10px] md:text-xs uppercase tracking-wider font-bold mb-1 group-hover:text-slate-400 transition-colors">{stat.label}</p>
              <h3 className={`text-2xl md:text-3xl font-bold ${stat.color} flex items-center gap-2`}>
                {stat.val}
                {stat.animate && (
                   <span className="flex h-2 w-2 relative">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                   </span>
                )}
              </h3>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* --- LIVE ELECTIONS (PREMIUM REDESIGN) --- */}
      <div className="mb-12 animate-slide-up">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
               <FiActivity className="text-rose-500 w-5 h-5" />
            </div>
            Live Elections
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {liveElections.map((election) => (
                <div 
                  key={election.id} 
                  className="relative overflow-hidden rounded-[24px] bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/60 shadow-2xl transition-all duration-300 hover:shadow-rose-500/10 hover:border-rose-500/30 group"
                >
                    {/* Ambient Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none group-hover:bg-rose-500/20 transition-colors duration-500"></div>

                    <div className="p-7 relative z-10">
                        {/* Header Row */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                               <h3 className="text-xl font-bold text-white tracking-tight leading-snug mb-1">{election.title}</h3>
                               <p className="text-xs text-slate-400 font-medium flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full"></span> 
                                  ID: #ELEC-2026-0{election.id}
                               </p>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-lg shadow-rose-500/10">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> Live Now
                                </span>
                                <span className="text-[10px] font-mono text-slate-500">
                                  Ends in {getTimeLeft(election.endTime)}
                                </span>
                            </div>
                        </div>

                        {/* Live Metrics Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Total Votes</p>
                                <p className="text-2xl font-mono text-white font-bold tracking-tighter">{election.votes.toLocaleString()}</p>
                            </div>
                            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Turnout</p>
                                <div className="flex items-end gap-2">
                                   <p className="text-2xl font-mono text-emerald-400 font-bold tracking-tighter">{election.participation}%</p>
                                   <FiTrendingUp className="text-emerald-500/50 w-5 h-5 mb-1" />
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-6">
                           <div className="flex justify-between text-xs mb-2">
                              <span className="text-slate-400">Participation Goal</span>
                              <span className="text-slate-300 font-bold">100%</span>
                           </div>
                           <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]" 
                                style={{ width: `${election.participation}%` }}
                              ></div>
                           </div>
                        </div>

                        {/* Action Footer */}
                        <button 
                          onClick={() => openDetails(election)} 
                          className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all group-hover:border-white/20 group-hover:shadow-lg"
                        >
                            View Analytics <FiArrowRight className="text-slate-400 group-hover:text-white transition-colors" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* --- UNIFIED DETAIL MODAL --- */}
      {showModal && selectedElection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-3xl shadow-2xl animate-slide-up relative flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-6 md:p-8 border-b border-slate-700 bg-slate-800/50 rounded-t-3xl flex justify-between items-start">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border mb-3 bg-rose-500/10 text-rose-400 border-rose-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                  Live Monitoring
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-white">{selectedElection.title}</h2>
                <div className="flex items-center gap-4 text-slate-400 text-sm mt-2">
                    <span className="flex items-center gap-1"><FiCalendar /> {selectedElection.date}</span>
                    <span className="flex items-center gap-1"><FiAlignLeft /> {selectedElection.description}</span>
                </div>
              </div>
              <button onClick={closeDetails} className="bg-slate-800 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 md:p-8 overflow-y-auto">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2 flex items-center gap-2">
                <FiTarget className="text-emerald-400" /> Live Vote Distribution
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedElection.candidates.map((candidate) => {
                  const total = selectedElection.votes || 1;
                  const percent = ((candidate.votes / total) * 100).toFixed(1);
                  
                  return (
                    <div key={candidate.id} className="relative p-5 rounded-2xl border bg-slate-800/40 border-slate-700/50 transition-all hover:bg-slate-800/60">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg ${candidate.color}`}>
                          {candidate.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">{candidate.name}</h4>
                          <p className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block mb-1">{candidate.designation}</p>
                          <p className="text-sm text-slate-400">{candidate.party}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300 font-medium">Votes Secured</span>
                          <span className="text-white font-bold">{candidate.votes} <span className="text-slate-500 font-normal">({percent}%)</span></span>
                        </div>
                        <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${candidate.color} transition-all duration-1000`} 
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-700 bg-slate-800/50 rounded-b-3xl flex justify-end gap-3 backdrop-blur-sm">
                <button onClick={closeDetails} className="px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors text-sm shadow-lg">
                    Close Dashboard
                </button>
            </div>

          </div>
        </div>
      )}

    </AdminLayout>
  );
};

export default AdminDashboard;