import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/Button';
import { 
  FiClock, FiCheckCircle, FiActivity, FiArrowRight,
  FiBox, FiUserCheck, FiXCircle, FiAward, FiBarChart2, FiX, FiCalendar, FiChevronDown, FiChevronUp, FiUsers
} from 'react-icons/fi';

const VoterDashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState(null); // Track expanded row

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- DATA ---
  
  const activeElections = [
    { id: 1, title: 'Student Council President', status: 'Active', deadline: '2h 45m left', voted: false },
    { id: 2, title: 'Department Representative', status: 'Active', deadline: '1d 10h left', voted: true },
    { id: 3, title: 'Science Club Lead', status: 'Active', deadline: '3d left', voted: false },
  ];

  // Enhanced History Data with Full Election Details
  const fullVoteHistory = [
    { 
      id: 101, 
      election: 'Sports Committee Head', 
      date: 'Jan 10, 2024', 
      time: '09:00 AM - 05:00 PM',
      myChoice: 'Alex Johnson', 
      result: 'Winner', 
      totalVotes: 890,
      turnout: "78%",
      winnerName: 'Alex Johnson',
      candidates: [
        { name: 'Alex Johnson', party: 'Fit Future', votes: 516, percent: 58, isWinner: true },
        { name: 'Sam Wilson', party: 'Iron Lifters', votes: 374, percent: 42, isWinner: false }
      ]
    },
    { 
      id: 102, 
      election: 'Cultural Secretary', 
      date: 'Dec 15, 2023', 
      time: '10:00 AM - 06:00 PM',
      myChoice: 'Kyle Reese', 
      result: 'Lost', 
      totalVotes: 1102,
      turnout: "82%",
      winnerName: 'Sarah Connor',
      candidates: [
        { name: 'Sarah Connor', party: 'Art & Soul', votes: 683, percent: 62, isWinner: true },
        { name: 'Kyle Reese', party: 'Drama Club', votes: 419, percent: 38, isWinner: false }
      ]
    },
    { 
      id: 103, 
      election: 'Class Rep (Fall)', 
      date: 'Sep 05, 2023', 
      time: '08:00 AM - 04:00 PM',
      myChoice: 'Sarah Connor', 
      result: 'Winner', 
      totalVotes: 450,
      turnout: "65%",
      winnerName: 'Sarah Connor',
      candidates: [
        { name: 'Sarah Connor', party: 'Scholars', votes: 250, percent: 55.5, isWinner: true },
        { name: 'John Smith', party: 'Unity', votes: 200, percent: 44.5, isWinner: false }
      ]
    }
  ];

  // Stats
  const stats = [
    { label: 'Active Elections', val: activeElections.filter(e => e.status === 'Active').length, color: 'text-blue-400', icon: FiActivity, bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Total Participated', val: fullVoteHistory.length, color: 'text-purple-400', icon: FiBox, bg: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Winning Votes', val: fullVoteHistory.filter(h => h.result === 'Winner').length, color: 'text-emerald-400', icon: FiAward, bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Lost / Runner-Ups', val: fullVoteHistory.filter(h => h.result === 'Lost').length, color: 'text-rose-400', icon: FiBarChart2, bg: 'bg-rose-500/10 border-rose-500/20' }
  ];

  const toggleRow = (id) => {
    if (expandedHistoryId === id) {
      setExpandedHistoryId(null);
    } else {
      setExpandedHistoryId(id);
    }
  };

  return (
    <DashboardLayout>
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            Voter Portal
            <span className="hidden md:flex h-2 w-2 relative">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Welcome back, <strong>John Doe</strong></p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/50 text-xs font-mono text-slate-300">
                <FiClock className="w-3 h-3 text-primary" />
                {currentTime}
            </div>
            <div className="px-4 py-2 bg-primary/10 rounded-full border border-primary/20 text-xs font-mono text-primary flex items-center gap-2 shadow-lg shadow-primary/10">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                ID: V-2024-8890
            </div>
        </div>
      </header>

      {/* --- STATS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10 animate-slide-up">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl flex items-center justify-between group hover:border-slate-600 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
            <div>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold mb-1">{stat.label}</p>
              <h3 className={`text-2xl md:text-3xl font-bold ${stat.color}`}>{stat.val}</h3>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* --- MAIN GRID --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT: ACTIVE ELECTIONS */}
        <div className="xl:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-3">
            <div className="p-1.5 bg-rose-500/10 rounded-lg border border-rose-500/20">
               <FiActivity className="text-rose-500 w-4 h-4" />
            </div>
            Live Elections
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {activeElections.filter(e => e.status === 'Active').map((election) => (
              <div 
                key={election.id} 
                className="group relative bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 p-6 rounded-2xl transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Active
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 bg-slate-900/50 px-2 py-0.5 rounded border border-slate-700/50">
                       <FiClock className="w-3 h-3 text-rose-400" /> {election.deadline}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                    {election.title}
                  </h3>
                </div>
                
                {election.voted ? (
                  <Button variant="outline" size="sm" disabled className="opacity-60 gap-2 border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
                    <FiCheckCircle className="w-4 h-4" /> Voted
                  </Button>
                ) : (
                  <Button 
                    onClick={() => navigate('/voter/vote')}
                    variant="primary" 
                    size="sm" 
                    className="shadow-lg shadow-primary/20 gap-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 border-0"
                  >
                    Vote Now <FiArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: RECENT HISTORY */}
        <div className="xl:col-span-1 space-y-6">
           <h2 className="text-lg font-bold text-white flex items-center gap-3">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
               <FiCheckCircle className="text-indigo-500 w-4 h-4" />
            </div>
            Recent Activity
          </h2>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden shadow-lg">
             {fullVoteHistory.slice(0, 3).map((history, idx) => (
               <div key={history.id} className={`p-5 border-b border-slate-700/50 hover:bg-slate-800/60 transition-colors`}>
                  <div className="flex justify-between items-start mb-2">
                     <h4 className="text-sm font-bold text-white line-clamp-1">{history.election}</h4>
                     <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">{history.date}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs mt-3 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                     <div>
                        <span className="text-slate-500 block mb-1 text-[10px] uppercase font-bold tracking-wider">Your Vote</span>
                        <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                           <FiUserCheck className="text-blue-400" /> {history.myChoice}
                        </span>
                     </div>
                     <div className="text-right">
                        <span className="text-slate-500 block mb-1 text-[10px] uppercase font-bold tracking-wider">Result</span>
                        <span className={`font-bold flex items-center gap-1 justify-end ${history.result === 'Winner' ? 'text-emerald-400' : 'text-rose-400'}`}>
                           {history.result === 'Winner' ? <FiAward className="w-3.5 h-3.5" /> : <FiXCircle className="w-3.5 h-3.5" />} 
                           {history.result}
                        </span>
                     </div>
                  </div>
               </div>
             ))}
             
             <button 
                onClick={() => setShowHistoryModal(true)}
                className="w-full py-3.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors border-t border-slate-700/50 flex items-center justify-center gap-2"
             >
                View Full Archive <FiArrowRight />
             </button>
          </div>
        </div>

      </div>

      {/* --- ADVANCED HISTORY MODAL --- */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <FiCheckCircle className="text-emerald-400" /> Voting Archive
                </h2>
                <p className="text-slate-400 text-xs mt-1">Detailed breakdown of your past election participation.</p>
              </div>
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
              <div className="space-y-4">
                {fullVoteHistory.map((item) => {
                  const isExpanded = expandedHistoryId === item.id;
                  
                  return (
                    <div key={item.id} className="border border-slate-700 rounded-2xl overflow-hidden bg-slate-800/20 transition-all duration-300">
                      
                      {/* Summary Row (Clickable) */}
                      <div 
                        onClick={() => toggleRow(item.id)}
                        className={`p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/50 transition-colors ${isExpanded ? 'bg-slate-800/80 border-b border-slate-700' : ''}`}
                      >
                        <div className="flex-1">
                          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                            {item.election}
                            {item.result === 'Winner' && <FiAward className="text-emerald-400 w-4 h-4" title="You picked the winner" />}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                             <span className="flex items-center gap-1"><FiCalendar /> {item.date}</span>
                             <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                             <span>Total Votes: {item.totalVotes}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                           <div className="text-right">
                              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Your Vote</p>
                              <p className={`text-sm font-semibold ${item.result === 'Winner' ? 'text-emerald-400' : 'text-slate-300'}`}>
                                {item.myChoice}
                              </p>
                           </div>
                           <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                              <FiChevronDown className="text-slate-500 w-5 h-5" />
                           </div>
                        </div>
                      </div>

                      {/* Expanded Details Section */}
                      {isExpanded && (
                        <div className="p-6 bg-slate-900/50 animate-fade-in border-t border-slate-800">
                           <div className="flex flex-col md:flex-row gap-8">
                              
                              {/* Left: Meta Info */}
                              <div className="md:w-1/3 space-y-4">
                                 <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Voting Hours</p>
                                    <p className="text-slate-300 text-sm flex items-center gap-2">
                                       <FiClock className="text-indigo-400" /> {item.time}
                                    </p>
                                 </div>
                                 <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Voter Turnout</p>
                                    <p className="text-slate-300 text-sm flex items-center gap-2">
                                       <FiUsers className="text-indigo-400" /> {item.turnout} Participation
                                    </p>
                                 </div>
                                 <div className="pt-2">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${item.result === 'Winner' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                       {item.result === 'Winner' ? 'Your Candidate Won' : 'Your Candidate Lost'}
                                    </span>
                                 </div>
                              </div>

                              {/* Right: Candidate Breakdown */}
                              <div className="md:w-2/3">
                                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Election Results Breakdown</h4>
                                 <div className="space-y-4">
                                    {item.candidates.map((cand, i) => (
                                       <div key={i} className="relative">
                                          <div className="flex justify-between items-end mb-1">
                                             <div className="flex items-center gap-2">
                                                <span className={`text-sm font-bold ${cand.isWinner ? 'text-amber-400' : 'text-slate-300'}`}>
                                                   {cand.name}
                                                </span>
                                                {cand.isWinner && <FiAward className="text-amber-400 w-4 h-4" />}
                                                {cand.name === item.myChoice && (
                                                   <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">YOU</span>
                                                )}
                                             </div>
                                             <span className="text-xs font-mono text-slate-400">{cand.votes} votes ({cand.percent}%)</span>
                                          </div>
                                          <div className="w-full bg-slate-700/30 rounded-full h-2">
                                             <div 
                                                className={`h-full rounded-full ${cand.isWinner ? 'bg-amber-500' : 'bg-slate-600'}`} 
                                                style={{ width: `${cand.percent}%` }}
                                             ></div>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>

                           </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-800/30 text-right">
              <Button onClick={() => setShowHistoryModal(false)} variant="outline" className="text-xs">
                Close Archive
              </Button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default VoterDashboard;