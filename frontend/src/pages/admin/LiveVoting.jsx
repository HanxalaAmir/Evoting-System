import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { FiActivity, FiClock, FiChevronLeft, FiPlay, FiRadio, FiHash } from 'react-icons/fi';
import { CiTrophy } from "react-icons/ci";

// --- 1. SMOOTH ODOMETER ENGINE ---
const FramerCounter = ({ value }) => {
  // Tuned for "Heavy, Smooth" mechanical rolling effect
  const spring = useSpring(value, { mass: 3, stiffness: 30, damping: 25 });
  const display = useTransform(spring, (current) => Math.floor(current).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
};

const LiveVoting = () => {
  const [selectedElection, setSelectedElection] = useState(null);
  const [recentLog, setRecentLog] = useState([]);

  // --- MOCK DATA: ACTIVE ELECTIONS LIST ---
  const activeElectionsList = [
    {
      id: 1,
      title: "Student Council President 2026",
      totalVoters: 5000,
      startTime: "09:00 AM",
      description: "Main campus-wide presidential election.",
      image: "from-blue-600 to-indigo-900",
      candidates: [
        { id: 101, name: "Sarah Jenkins", party: "Future Vision", votes: 1245, color: "from-purple-500 to-indigo-600", image: "https://ui-avatars.com/api/?name=Sarah+Jenkins&background=7c3aed&color=fff" },
        { id: 102, name: "Michael Chen", party: "Tech Forward", votes: 1180, color: "from-blue-500 to-cyan-500", image: "https://ui-avatars.com/api/?name=Michael+Chen&background=2563eb&color=fff" },
        { id: 103, name: "Jessica Alba", party: "Green Campus", votes: 850, color: "from-emerald-500 to-teal-500", image: "https://ui-avatars.com/api/?name=Jessica+Alba&background=059669&color=fff" },
        { id: 104, name: "David Ross", party: "Student Voice", votes: 620, color: "from-orange-500 to-red-500", image: "https://ui-avatars.com/api/?name=David+Ross&background=ea580c&color=fff" },
      ]
    },
    {
      id: 2,
      title: "Science Dept. Representative",
      totalVoters: 1200,
      startTime: "10:00 AM",
      description: "Representative for Computer Science & Physics.",
      image: "from-emerald-600 to-teal-900",
      candidates: [
        { id: 201, name: "Emily Blunt", party: "Science Union", votes: 310, color: "from-orange-500 to-amber-500", image: "https://ui-avatars.com/api/?name=Emily+Blunt&background=f97316&color=fff" },
        { id: 202, name: "John Krasinski", party: "Innovators", votes: 290, color: "from-cyan-500 to-blue-500", image: "https://ui-avatars.com/api/?name=John+Krasinski&background=06b6d4&color=fff" },
      ]
    }
  ];

  // --- LIVE SIMULATION ENGINE (Only runs when election is selected) ---
  useEffect(() => {
    if (!selectedElection) return;

    const interval = setInterval(() => {
      setSelectedElection(prev => {
        // 1. Pick a random candidate to get votes
        const randomIndex = Math.floor(Math.random() * prev.candidates.length);
        const candidate = prev.candidates[randomIndex];
        
        // 2. Add random votes (Small increments for realism)
        const newVotes = Math.floor(Math.random() * 5) + 1; 
        
        const updatedCandidates = [...prev.candidates];
        updatedCandidates[randomIndex] = {
          ...candidate,
          votes: candidate.votes + newVotes
        };

        // 3. Sort for leaderboard
        updatedCandidates.sort((a, b) => b.votes - a.votes);

        // 4. Update Log
        const newLogEntry = {
          id: Date.now(),
          text: `+${newVotes} votes for ${candidate.name}`,
          time: "Just now",
          color: candidate.color.split(" ")[0].replace("from-", "text-") // Extract color class
        };
        setRecentLog(prevLogs => [newLogEntry, ...prevLogs].slice(0, 5)); // Keep last 5

        return { ...prev, candidates: updatedCandidates };
      });
    }, 4000); // Slower updates (4s) for cleaner readability

    return () => clearInterval(interval);
  }, [selectedElection ? selectedElection.id : null]);

  // --- RENDER HELPERS ---
  const getTotalVotes = () => selectedElection ? selectedElection.candidates.reduce((acc, curr) => acc + curr.votes, 0) : 0;
  const getParticipation = () => selectedElection ? ((getTotalVotes() / selectedElection.totalVoters) * 100).toFixed(1) : 0;

  return (
    <AdminLayout>
      <AnimatePresence mode='wait'>
        
        {/* --- VIEW 1: ELECTION SELECTION HUB --- */}
        {!selectedElection ? (
          <motion.div 
            key="selection"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-6xl mx-auto"
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                <FiRadio className="text-rose-500 animate-pulse" /> Live Election Hub
              </h1>
              <p className="text-slate-400 mt-2">Select an active election to launch the real-time monitoring dashboard.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeElectionsList.map((election) => (
                <div 
                  key={election.id}
                  onClick={() => setSelectedElection(election)}
                  className="group relative bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500/50 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1"
                >
                  <div className={`h-32 bg-gradient-to-r ${election.image} opacity-80 group-hover:opacity-100 transition-opacity relative p-6 flex flex-col justify-between`}>
                    <div className="flex justify-between items-start">
                      <span className="px-3 py-1 bg-black/30 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-full border border-white/10 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Active
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white drop-shadow-md">{election.title}</h2>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-slate-400 text-sm mb-6 line-clamp-2">{election.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-3">
                        {election.candidates.map((c, i) => (
                          <img key={i} src={c.image} alt={c.name} className="w-10 h-10 rounded-full border-2 border-slate-800" />
                        ))}
                        <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-xs text-white font-bold">
                          {election.candidates.length}
                        </div>
                      </div>
                      
                      <button className="flex items-center gap-2 text-indigo-400 font-bold text-sm group-hover:translate-x-1 transition-transform">
                        Watch Live <FiPlay className="fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (

        /* --- VIEW 2: LIVE COMMAND CENTER --- */
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full"
          >
            {/* Header / Nav */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
              <div>
                <button 
                  onClick={() => setSelectedElection(null)} 
                  className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold mb-3 transition-colors group"
                >
                  <FiChevronLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Hub
                </button>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                  {selectedElection.title}
                  <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                </h1>
              </div>

              {/* Ticker */}
              <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-4 rounded-2xl flex items-center gap-8 shadow-2xl">
                <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Total Votes</p>
                    <p className="text-3xl font-mono text-white font-bold tabular-nums tracking-tighter">
                      <FramerCounter value={getTotalVotes()} />
                    </p>
                </div>
                <div className="h-10 w-px bg-slate-700/50"></div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Turnout</p>
                    <p className="text-3xl font-mono text-emerald-400 font-bold tabular-nums tracking-tighter">{getParticipation()}%</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT: LEADERBOARD */}
              <div className="lg:col-span-8 space-y-4 relative">
                <AnimatePresence>
                  {selectedElection.candidates.map((candidate, index) => {
                    const percentage = ((candidate.votes / getTotalVotes()) * 100).toFixed(1);
                    const isLeader = index === 0;

                    return (
                      <motion.div
                        layout
                        key={candidate.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 45, damping: 20 }} // Smooth layout shift
                        className={`relative overflow-hidden rounded-2xl flex items-center group ${
                          isLeader 
                            ? 'bg-slate-800 border border-amber-500/30 shadow-2xl py-6 z-20' 
                            : 'bg-slate-800/40 border border-slate-700/50 py-4 opacity-90'
                        }`}
                      >
                        {/* Leader Glow */}
                        {isLeader && (
                          <motion.div 
                            layoutId="glow"
                            className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none"
                          />
                        )}

                        {/* Progress Bar Background */}
                        <motion.div 
                          className={`absolute left-0 top-0 bottom-0 bg-gradient-to-r ${candidate.color} opacity-10`}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }} // Slow, elegant fill
                        />

                        {/* Rank */}
                        <div className="w-20 flex-shrink-0 text-center z-10">
                          <span className={`text-2xl font-bold ${isLeader ? 'text-amber-400 drop-shadow-lg' : 'text-slate-600'}`}>
                            #{index + 1}
                          </span>
                        </div>

                        {/* Profile */}
                        <div className="flex items-center gap-5 z-10 flex-1">
                          <div className={`p-0.5 rounded-full bg-gradient-to-br ${candidate.color} ${isLeader ? 'shadow-lg shadow-amber-500/20' : ''}`}>
                              <img src={candidate.image} alt={candidate.name} className="w-16 h-16 rounded-full border-4 border-slate-900 object-cover" />
                          </div>
                          <div>
                              <h2 className={`font-bold leading-tight ${isLeader ? 'text-2xl text-white' : 'text-lg text-slate-200'}`}>
                                {candidate.name}
                              </h2>
                              <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mt-0.5">{candidate.party}</p>
                          </div>
                        </div>

                        {/* Counter */}
                        <div className="pr-10 text-right z-10 min-w-[160px]">
                          <div className={`font-mono font-bold leading-none tabular-nums tracking-tighter ${isLeader ? 'text-5xl text-white' : 'text-3xl text-slate-400'}`}>
                              <FramerCounter value={candidate.votes} />
                          </div>
                          <motion.div 
                            className="w-full bg-slate-700/50 h-1.5 rounded-full mt-2 overflow-hidden"
                          >
                              <motion.div 
                                className={`h-full rounded-full bg-gradient-to-r ${candidate.color}`}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1 }}
                              />
                          </motion.div>
                          <p className="text-[10px] text-slate-500 font-bold mt-1 text-right">{percentage}% SHARE</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* RIGHT: INSIGHTS & FEED */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Leader Card */}
                <motion.div 
                  layout
                  className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-8 relative overflow-hidden shadow-2xl"
                >
                  <div className="flex items-center gap-2 mb-6">
                      <CiTrophy className="text-amber-400 w-8 h-8" />
                      <span className="text-amber-400 font-bold text-sm uppercase tracking-widest">Leading</span>
                  </div>
                  <div className="text-center">
                      <div className="w-24 h-24 mx-auto rounded-full p-1 bg-gradient-to-b from-amber-300 to-amber-600 mb-4 shadow-2xl shadow-amber-500/20">
                        <img src={selectedElection.candidates[0].image} className="w-full h-full rounded-full border-4 border-slate-900 object-cover" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-1">{selectedElection.candidates[0].name}</h3>
                      <p className="text-slate-400 text-sm mb-4">Projected Winner</p>
                  </div>
                </motion.div>

                {/* Real-time Vote Feed */}
                <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl h-[300px] overflow-hidden flex flex-col">
                  <h4 className="text-slate-300 font-bold text-sm mb-4 flex items-center gap-2">
                    <FiActivity className="text-emerald-400" /> Incoming Votes
                  </h4>
                  <div className="space-y-3 flex-1 overflow-hidden relative">
                    <AnimatePresence initial={false}>
                      {recentLog.map((log) => (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex items-center gap-3 text-xs p-2 rounded-lg bg-slate-900/30 border border-slate-800"
                        >
                          <div className={`w-2 h-2 rounded-full ${log.color} bg-current`}></div>
                          <span className="text-slate-300 flex-1">{log.text}</span>
                          <span className="text-slate-500 font-mono">{log.time}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {/* Fade overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-900/10 to-transparent"></div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default LiveVoting;