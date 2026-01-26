import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBarChart2, FiAward, FiClock, FiActivity, FiArrowRight,
  FiChevronLeft, FiPieChart, FiUsers, FiCheckCircle, FiLoader,
  FiAlertCircle, FiRefreshCw
} from "react-icons/fi";
import { electionAPI } from "../../services/api";

const Results = () => {
  const [selectedElection, setSelectedElection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeElections, setActiveElections] = useState([]);

  // --- 1. DATA FETCHING (LIVE SYNC) ---
  const fetchResults = async () => {
    try {
      // Note: We don't set isLoading(true) here to prevent flickering on updates
      const response = await electionAPI.getAll();
      
      // STRICT FILTER: Only show 'Active' elections.
      const live = response.data.filter((e) => e.status === "Active");
      
      setActiveElections(live);
      setError(null);
    } catch (err) {
      console.error(err);
      if (activeElections.length === 0) {
        setError("Unable to load live election feeds. Connection failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(); // Initial Fetch
    const interval = setInterval(fetchResults, 5000); // Live Poll
    return () => clearInterval(interval);
  }, []);

  const calculateTotalVotes = (candidates) => {
    return (candidates || []).reduce((sum, c) => sum + (Number(c.vote_count) || Number(c.votes) || 0), 0);
  };

  const getPercentage = (votes, total) => {
    if (!total || total === 0) return "0.0"; // Prevent division by zero
    return ((votes / total) * 100).toFixed(1);
  };

  // --- 2. SELECTED ELECTION DETAIL VIEW ---
  if (selectedElection) {
    // Ensure we use the latest live data
    const liveData = activeElections.find(e => (e._id || e.id) === (selectedElection._id || selectedElection.id)) || selectedElection;
    
    // FIX: Removed '|| 1' so it correctly shows 0 if no votes are cast
    const totalVotes = calculateTotalVotes(liveData.candidates);
    
    const sortedCandidates = [...(liveData.candidates || [])].sort((a, b) => 
      (Number(b.vote_count) || 0) - (Number(a.vote_count) || 0)
    );
    
    // Determine winner only if there are votes
    const winner = totalVotes > 0 ? sortedCandidates[0] : null;

    return (
      <DashboardLayout>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="pb-10 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setSelectedElection(null)} className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors hover:bg-slate-800/50 px-3 py-1.5 rounded-lg group">
              <FiChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Live Feeds
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-[10px] font-bold uppercase tracking-wide animate-pulse">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              Live Broadcast
            </div>
          </div>

          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
                  <FiBarChart2 className="text-white w-6 h-6" />
                </div>
                {liveData.title}
              </h1>
              <p className="text-slate-400 text-sm mt-3 ml-1">Real-time data from the official election ledger.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/80 border border-indigo-500/20 p-8 rounded-2xl relative overflow-hidden text-center h-full shadow-2xl shadow-indigo-900/10 flex flex-col justify-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-amber-300 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 mb-6 ring-4 ring-slate-900/50">
                    <FiAward className="w-10 h-10 text-white drop-shadow-md animate-pulse" />
                  </div>
                  <h3 className="text-indigo-300 font-bold uppercase tracking-widest text-[10px] mb-2">Projected Leader</h3>
                  <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">{winner ? winner.name : "No Votes Yet"}</h2>
                  <p className="text-slate-400 text-xs font-medium mb-8 bg-slate-800/50 inline-block px-3 py-1 rounded-lg border border-slate-700/50">{winner ? winner.party : "-"}</p>
                  
                  {winner && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                        <span className="block text-xl font-bold text-white mb-1">{getPercentage(winner.vote_count || 0, totalVotes)}%</span>
                        <span className="text-[9px] uppercase tracking-wide text-slate-500 font-bold">Total Share</span>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                        <span className="block text-xl font-bold text-white mb-1">{winner.vote_count || 0}</span>
                        <span className="text-[9px] uppercase tracking-wide text-slate-500 font-bold">Votes Secured</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700/50 p-6 md:p-8 rounded-2xl backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-slate-700/50 pb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Vote Breakdown</h3>
                  <p className="text-slate-500 text-xs mt-1">Distribution across all candidates</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700/50 self-start sm:self-auto font-mono">
                  <FiClock className="w-3 h-3 text-emerald-400" /> <span>Live Sync Active (5s)</span>
                </div>
              </div>

              <div className="space-y-6">
                {sortedCandidates.map((candidate) => {
                  const votes = Number(candidate.vote_count) || 0;
                  const percent = getPercentage(votes, totalVotes);
                  return (
                    <div key={candidate._id || candidate.id} className="relative group">
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm">{candidate.name}</span>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">{candidate.designation || candidate.party}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-white font-mono font-bold text-sm">{percent}%</span>
                          <span className="text-[10px] text-slate-500">{votes} votes</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-700/30 rounded-full h-2.5 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 1, ease: "easeOut" }} className={`h-full rounded-full ${candidate.color || "bg-indigo-500"} shadow-lg relative`}></motion.div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-4">
                <div className="flex items-center gap-4 bg-slate-900/30 px-4 py-2 rounded-lg">
                  <span>Total Votes: <strong className="text-white ml-1">{totalVotes}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/10">
                  <FiActivity className="w-3.5 h-3.5" /> <span className="font-semibold text-[10px] uppercase tracking-wide">Blockchain Verified</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  // --- 3. MAIN DASHBOARD VIEW ---
  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto">
        <div className="mb-10 border-b border-slate-800 pb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
              <FiPieChart className="text-white w-6 h-6" />
            </div>
            Election Results
          </h1>
          <p className="text-slate-400 mt-3 max-w-2xl text-sm leading-relaxed">
            Select an election below to view real-time analytics, candidate breakdowns, and live winner projections directly from the blockchain.
          </p>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <FiLoader className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
            <p className="text-sm">Connecting to Live Feed...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-indigo-500/10 p-4 rounded-full mb-4">
              <FiAlertCircle className="w-8 h-8 text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Connection Error</h3>
            <p className="text-slate-400 mb-6 max-w-md">{error}</p>
            <button onClick={fetchResults} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 text-sm font-bold">
              <FiRefreshCw className="w-4 h-4" /> Try Again
            </button>
          </div>
        )}

        {!isLoading && !error && (activeElections.length === 0 ? (
          <div className="text-center py-20 text-slate-500 bg-slate-800/30 rounded-2xl border border-slate-700 border-dashed">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiActivity className="w-6 h-6 text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-white">No Live Elections</h3>
            <p className="text-sm mt-1">There are no elections currently active. Results will appear here once voting starts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeElections.map((election) => {
              const total = calculateTotalVotes(election.candidates);
              return (
                <div key={election._id || election.id} onClick={() => setSelectedElection(election)} className="group bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500/50 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 relative overflow-hidden flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`}>
                      <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse`}></span> {election.status}
                    </span>
                    <span className="text-slate-500 group-hover:text-indigo-400 transition-colors"><FiArrowRight className="w-5 h-5" /></span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors leading-snug">{election.title}</h3>
                  <p className="text-xs text-slate-400 mb-6 line-clamp-2 flex-grow">{election.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-6 pt-4 border-t border-slate-700/30">
                    <div className="flex items-center gap-1.5"><FiUsers className="text-indigo-400" /> <span>{election.candidates?.length || 0} Candidates</span></div>
                    <div className="flex items-center gap-1.5"><FiCheckCircle className="text-emerald-400" /> <span>{total} Votes</span></div>
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-slate-500 group-hover:text-indigo-400 transition-colors">
                      <span>View Analytics</span>
                      <FiActivity />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </motion.div>
    </DashboardLayout>
  );
};

export default Results;