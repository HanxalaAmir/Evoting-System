import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  motion,
  AnimatePresence,
  useSpring,
  useTransform,
} from "framer-motion";
import { electionAPI } from "../../services/api";
import {
  FiActivity,
  FiClock,
  FiChevronLeft,
  FiPlay,
  FiRadio,
  FiHash,
  FiUsers,
  FiArrowRight,
  FiTarget,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { CiTrophy } from "react-icons/ci";

// --- 1. SMOOTH ODOMETER ENGINE ---
const FramerCounter = ({ value }) => {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) =>
    Math.floor(current).toLocaleString(),
  );

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
};

const LiveVoting = () => {
  const [selectedElection, setSelectedElection] = useState(null);
  const [recentLog, setRecentLog] = useState([]);

  // Data State
  const [activeElectionsList, setActiveElectionsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- FETCH ACTIVE ELECTIONS ---
  const fetchActiveElections = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await electionAPI.getActive(); // Fetch only 'Active' status
      setActiveElectionsList(response.data);
    } catch (err) {
      console.error("Live Voting Fetch Error:", err);
      setError("Failed to connect to the live election stream.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveElections();
  }, []);

  // --- LIVE SIMULATION ENGINE (Should be WebSockets in Prod) ---
  useEffect(() => {
    if (!selectedElection) return;

    // Simulate incoming vote stream updates for demo purposes
    // In production, this would be `socket.on('vote', ...)`
    const interval = setInterval(() => {
      setSelectedElection((prev) => {
        // Randomly add votes to simulate activity if connected
        const randomIndex = Math.floor(Math.random() * prev.candidates.length);
        const candidate = prev.candidates[randomIndex];
        const newVotes = Math.floor(Math.random() * 5) + 1;

        const updatedCandidates = [...prev.candidates];
        updatedCandidates[randomIndex] = {
          ...candidate,
          votes: candidate.votes + newVotes,
        };

        // Sort Leaderboard
        updatedCandidates.sort((a, b) => b.votes - a.votes);

        // Update Log
        const newLogEntry = {
          id: Date.now(),
          text: `+${newVotes} votes for ${candidate.name}`,
          time: new Date().toLocaleTimeString([], {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          color: candidate.color
            ? candidate.color.split(" ")[0].replace("from-", "bg-")
            : "bg-slate-500",
        };
        setRecentLog((prevLogs) => [newLogEntry, ...prevLogs].slice(0, 6));

        return { ...prev, candidates: updatedCandidates };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedElection ? selectedElection.id : null]);

  // Calculations
  const getTotalVotes = () =>
    selectedElection
      ? selectedElection.candidates.reduce((acc, curr) => acc + curr.votes, 0)
      : 0;
  const getParticipation = () =>
    selectedElection
      ? ((getTotalVotes() / (selectedElection.totalVoters || 1)) * 100).toFixed(
          1,
        )
      : 0;

  return (
    <AdminLayout>
      <AnimatePresence mode="wait">
        {/* --- LOADING STATE --- */}
        {isLoading && !selectedElection && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-[70vh] text-slate-500"
          >
            <FiLoader className="w-10 h-10 animate-spin mb-4 text-rose-500" />
            <p>Initializing secure telemetry...</p>
          </motion.div>
        )}

        {/* --- ERROR STATE --- */}
        {error && !isLoading && !selectedElection && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-[70vh] text-center"
          >
            <div className="bg-red-500/10 p-4 rounded-full mb-4">
              <FiAlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              Connection Error
            </h3>
            <p className="text-slate-400 mb-6 max-w-md">{error}</p>
            <button
              onClick={fetchActiveElections}
              className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/20 transition-all active:scale-95 text-sm font-bold"
            >
              <FiRefreshCw className="w-4 h-4" /> Try Again
            </button>
          </motion.div>
        )}

        {/* --- VIEW 1: ELECTION SELECTION HUB --- */}
        {!selectedElection && !isLoading && !error && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-6xl mx-auto"
          >
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                  <FiRadio className="text-rose-500 animate-pulse" /> Live
                  Election Hub
                </h1>
                <p className="text-slate-400 mt-2 text-sm max-w-xl">
                  Select an active election channel to initialize the real-time
                  monitoring dashboard and telemetry stream.
                </p>
              </div>
              <div className="px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 text-xs font-mono text-slate-400">
                System: <span className="text-emerald-400">ONLINE</span>
              </div>
            </div>

            {activeElectionsList.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/50">
                <FiActivity className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-400">
                  No Active Feeds
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                  There are currently no ongoing elections to monitor.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeElectionsList.map((election) => (
                  <div
                    key={election.id}
                    onClick={() => setSelectedElection(election)}
                    className="group relative bg-slate-900 border border-slate-800 hover:border-rose-500/50 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-rose-900/10 hover:-translate-y-1"
                  >
                    {/* Decorative Glow */}
                    <div className="absolute top-0 right-0 p-20 bg-rose-600/5 rounded-bl-full -mr-10 -mt-10 blur-3xl transition-all group-hover:bg-rose-600/10"></div>

                    <div className="p-8 relative z-10">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <span className="text-rose-500 font-bold tracking-widest text-[10px] uppercase mb-2 block flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span>{" "}
                            Live Feed
                          </span>
                          <h3 className="text-xl font-bold text-white leading-tight">
                            {election.title}
                          </h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:bg-rose-600 group-hover:border-rose-500 transition-colors">
                          <FiActivity className="text-slate-400 group-hover:text-white" />
                        </div>
                      </div>

                      <p className="text-slate-400 text-sm mb-8 line-clamp-2 min-h-[40px]">
                        {election.description}
                      </p>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/50">
                          <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                            <FiUsers /> Eligible
                          </div>
                          <div className="text-xl font-mono text-white tracking-tight">
                            {election.totalVoters
                              ? election.totalVoters.toLocaleString()
                              : "0"}
                          </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/50">
                          <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                            <FiClock /> Started
                          </div>
                          <div className="text-xl font-mono text-white tracking-tight">
                            {election.startTime}
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between border-t border-slate-800 pt-6">
                        <div className="flex -space-x-2">
                          {(election.candidates || []).map((c, i) => (
                            <img
                              key={i}
                              src={
                                c.image ||
                                `https://ui-avatars.com/api/?name=${c.name}&background=random`
                              }
                              alt={c.name}
                              className="w-8 h-8 rounded-full border-2 border-slate-900"
                            />
                          ))}
                          <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white">
                            +{election.candidates?.length || 0}
                          </div>
                        </div>
                        <span className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wide group-hover:translate-x-1 transition-transform">
                          Enter Room <FiArrowRight />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* --- VIEW 2: LIVE COMMAND CENTER --- */}
        {selectedElection && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full"
          >
            {/* Header / Nav */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6 border-b border-slate-800 pb-6">
              <div>
                <button
                  onClick={() => setSelectedElection(null)}
                  className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider mb-4 transition-colors group"
                >
                  <FiChevronLeft className="group-hover:-translate-x-1 transition-transform" />{" "}
                  Exit Monitoring
                </button>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                  {selectedElection.title}
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                  </span>
                </h1>
              </div>

              {/* Ticker */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-8 shadow-xl">
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Total Votes
                  </p>
                  <p className="text-2xl font-mono text-white font-bold tabular-nums tracking-tighter">
                    <FramerCounter value={getTotalVotes()} />
                  </p>
                </div>
                <div className="h-8 w-px bg-slate-800"></div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Participation
                  </p>
                  <p className="text-2xl font-mono text-emerald-400 font-bold tabular-nums tracking-tighter">
                    {getParticipation()}%
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* LEFT: LEADERBOARD (8 Cols) */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between mb-2 px-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FiTarget className="text-rose-500" /> Leaderboard
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono uppercase">
                    Live Sort: Auto
                  </span>
                </div>

                <AnimatePresence>
                  {selectedElection.candidates.map((candidate, index) => {
                    const percentage = (
                      (candidate.votes / getTotalVotes()) *
                      100
                    ).toFixed(1);
                    const isLeader = index === 0;

                    return (
                      <motion.div
                        layout
                        key={candidate.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 50,
                          damping: 20,
                        }}
                        className={`relative overflow-hidden rounded-2xl flex items-center group ${
                          isLeader
                            ? "bg-slate-800 border border-amber-500/20 shadow-xl py-5 z-10"
                            : "bg-slate-900 border border-slate-800 py-3 opacity-80"
                        }`}
                      >
                        {/* Progress Background */}
                        <motion.div
                          className={`absolute left-0 top-0 bottom-0 bg-gradient-to-r ${candidate.color || "from-indigo-500 to-blue-500"} opacity-5`}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1 }}
                        />

                        {/* Rank */}
                        <div className="w-16 flex-shrink-0 text-center z-10">
                          <span
                            className={`text-xl font-bold font-mono ${isLeader ? "text-amber-400" : "text-slate-600"}`}
                          >
                            #{index + 1}
                          </span>
                        </div>

                        {/* Candidate Info */}
                        <div className="flex items-center gap-4 z-10 flex-1">
                          <img
                            src={
                              candidate.image ||
                              `https://ui-avatars.com/api/?name=${candidate.name}&background=random`
                            }
                            alt={candidate.name}
                            className={`rounded-full border-2 border-slate-800 object-cover ${isLeader ? "w-14 h-14" : "w-10 h-10"}`}
                          />
                          <div>
                            <h2
                              className={`font-bold leading-tight ${isLeader ? "text-lg text-white" : "text-sm text-slate-300"}`}
                            >
                              {candidate.name}
                            </h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                              {candidate.party}
                            </p>
                          </div>
                        </div>

                        {/* Votes & Percentage */}
                        <div className="pr-6 text-right z-10 min-w-[140px]">
                          <div
                            className={`font-mono font-bold leading-none tabular-nums ${isLeader ? "text-3xl text-white" : "text-xl text-slate-400"}`}
                          >
                            <FramerCounter value={candidate.votes} />
                          </div>

                          <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden flex justify-end">
                            <motion.div
                              className={`h-full rounded-full bg-gradient-to-r ${candidate.color || "from-indigo-500 to-blue-500"}`}
                              animate={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-[9px] text-slate-500 font-bold mt-1 text-right">
                            {percentage}%
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* RIGHT: LIVE FEED & INSIGHTS (4 Cols) */}
              <div className="lg:col-span-4 space-y-6">
                {/* Winner Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden text-center">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500"></div>
                  <CiTrophy className="text-amber-500 w-8 h-8 mx-auto mb-3" />
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">
                    Projected Winner
                  </p>
                  <h3 className="text-xl font-bold text-white">
                    {selectedElection.candidates[0].name}
                  </h3>
                  <div className="mt-4 inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs font-mono font-bold">
                    Leading by{" "}
                    {selectedElection.candidates[0].votes -
                      (selectedElection.candidates[1]?.votes || 0)}{" "}
                    votes
                  </div>
                </div>

                {/* Vote Feed (Terminal Style) */}
                <div className="bg-black/40 border border-slate-800 rounded-3xl p-5 h-[320px] flex flex-col">
                  <h4 className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FiHash className="text-rose-500" /> Incoming Ledger Stream
                  </h4>
                  <div className="space-y-2 flex-1 overflow-hidden relative font-mono text-[10px]">
                    <AnimatePresence initial={false}>
                      {recentLog.map((log) => (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-3 p-2 rounded hover:bg-slate-800/50 transition-colors border-l-2 border-transparent hover:border-rose-500/50"
                        >
                          <span className="text-slate-600">{log.time}</span>
                          <span className="text-slate-300 flex-1">
                            {log.text}
                          </span>
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${log.color}`}
                          ></div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/40 to-transparent"></div>
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
