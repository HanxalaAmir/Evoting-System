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
import {
  formatDate,
  formatTime,
  calculatePercentage,
  truncateText,
} from "../../utils/helpers";

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
  const [activeElectionsList, setActiveElectionsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActiveElections = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await electionAPI.getActive();
      setActiveElectionsList(response.data || []);
    } catch (err) {
      setError("Failed to connect to the live election stream.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveElections();
  }, []);

  useEffect(() => {
    if (!selectedElection) return;

    const interval = setInterval(async () => {
      try {
        const response = await electionAPI.getById(selectedElection.id);
        const freshData = response.data;

        setSelectedElection((prev) => {
          if (!prev || prev.id !== freshData.id) return freshData;

          const newLogs = [];
          freshData.candidates.forEach((freshCand) => {
            const prevCand = prev.candidates.find((c) => c.id === freshCand.id);
            const diff = (freshCand.votes || 0) - (prevCand?.votes || 0);

            if (diff > 0) {
              newLogs.push({
                id: Date.now() + Math.random(),
                text: `+${diff} votes for ${freshCand.name}`,
                time: new Date().toLocaleTimeString([], {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }),
                color: freshCand.color
                  ? freshCand.color.replace("from-", "bg-").split(" ")[0]
                  : "bg-indigo-500",
              });
            }
          });

          if (newLogs.length > 0) {
            setRecentLog((prevLogs) => [...newLogs, ...prevLogs].slice(0, 6));
          }

          freshData.candidates.sort((a, b) => (b.votes || 0) - (a.votes || 0));
          return freshData;
        });
      } catch (err) {
        // Fail silently during live stream
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedElection?.id]);

  const getTotalVotes = () =>
    selectedElection
      ? selectedElection.candidates.reduce(
          (acc, curr) => acc + (curr.votes || 0),
          0,
        )
      : 0;

  const participationRate = selectedElection
    ? calculatePercentage(getTotalVotes(), selectedElection.totalVoters || 1)
    : 0;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
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
                className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg transition-all text-sm font-bold"
              >
                <FiRefreshCw className="w-4 h-4" /> Try Again
              </button>
            </motion.div>
          )}

          {!selectedElection && !isLoading && !error && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 border-b border-slate-800 pb-8 animate-fade-in">
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <div className="p-2.5 bg-rose-600 rounded-xl shadow-lg">
                      <FiRadio className="text-white w-6 h-6 animate-pulse" />
                    </div>
                    Live Election Hub
                  </h1>
                  <p className="text-slate-400 text-sm mt-3 ml-1 max-w-xl">
                    Select an active election to initialize real-time monitoring
                    and telemetry stream.
                  </p>
                </div>
                <div className="px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 text-xs font-mono text-slate-400">
                  System Status:{" "}
                  <span className="text-emerald-400">ONLINE</span>
                </div>
              </div>

              {activeElectionsList.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-700/50 rounded-2xl bg-slate-800/20">
                  <FiActivity className="w-8 h-8 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-1">
                    No Active Feeds
                  </h3>
                  <p className="text-slate-500">
                    There are currently no ongoing elections to monitor.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeElectionsList.map((election) => (
                    <div
                      key={election.id}
                      onClick={() => {
                        setSelectedElection(election);
                        setRecentLog([]);
                      }}
                      className="group relative bg-slate-800/40 border border-slate-700/50 hover:border-rose-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl"
                    >
                      <div className="p-8 relative z-10">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <span className="text-rose-500 font-bold tracking-widest text-[10px] uppercase mb-2 block flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span>{" "}
                              Live Feed
                            </span>
                            <h3 className="text-xl font-bold text-white">
                              {election.title}
                            </h3>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:bg-rose-600 transition-colors">
                            <FiActivity className="text-slate-400 group-hover:text-white" />
                          </div>
                        </div>
                        <p className="text-slate-400 text-sm mb-8 line-clamp-2">
                          {truncateText(election.description, 120)}
                        </p>
                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/50">
                            <div className="text-slate-500 text-[10px] font-bold uppercase mb-1 flex items-center gap-2">
                              <FiUsers /> Eligible
                            </div>
                            <div className="text-xl font-mono text-white">
                              {election.totalVoters || "N/A"}
                            </div>
                          </div>
                          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/50">
                            <div className="text-slate-500 text-[10px] font-bold uppercase mb-1 flex items-center gap-2">
                              <FiClock /> Started
                            </div>
                            <div className="text-xl font-mono text-white">
                              {formatTime(election.start_time)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-800 pt-6">
                          <div className="flex -space-x-2">
                            {(election.candidates || [])
                              .slice(0, 4)
                              .map((c, i) => (
                                <div
                                  key={i}
                                  className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold"
                                >
                                  {c.name.charAt(0)}
                                </div>
                              ))}
                          </div>
                          <span className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase group-hover:translate-x-1 transition-transform">
                            Enter Monitoring Room <FiArrowRight />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {selectedElection && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="h-full"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6 border-b border-slate-800 pb-6">
                <div>
                  <button
                    onClick={() => setSelectedElection(null)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider mb-4 transition-colors"
                  >
                    <FiChevronLeft /> Exit Room
                  </button>
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    {selectedElection.title}
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                    </span>
                  </h1>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-8 shadow-xl">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                      Total Votes
                    </p>
                    <p className="text-2xl font-mono text-white font-bold tracking-tighter">
                      <FramerCounter value={getTotalVotes()} />
                    </p>
                  </div>
                  <div className="h-8 w-px bg-slate-800"></div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                      Participation
                    </p>
                    <p className="text-2xl font-mono text-emerald-400 font-bold tracking-tighter">
                      {participationRate}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <FiTarget className="text-rose-500" /> Leaderboard
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono uppercase">
                      Live Sync Active
                    </span>
                  </div>

                  <AnimatePresence>
                    {selectedElection.candidates.map((candidate, index) => {
                      const percentage = calculatePercentage(
                        candidate.votes,
                        getTotalVotes(),
                      );
                      const isLeader = index === 0;

                      return (
                        <motion.div
                          layout
                          key={candidate.id}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`relative overflow-hidden rounded-2xl flex items-center group ${isLeader ? "bg-slate-800 border border-amber-500/20 shadow-xl py-5 z-10" : "bg-slate-900 border border-slate-800 py-3 opacity-80"}`}
                        >
                          <motion.div
                            className={`absolute left-0 top-0 bottom-0 bg-gradient-to-r ${candidate.color || "from-indigo-500 to-blue-500"} opacity-5`}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                          />
                          <div className="w-16 flex-shrink-0 text-center z-10">
                            <span
                              className={`text-xl font-bold font-mono ${isLeader ? "text-amber-400" : "text-slate-600"}`}
                            >
                              #{index + 1}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 z-10 flex-1">
                            <div
                              className={`rounded-full border-2 border-slate-800 flex items-center justify-center text-white font-bold bg-slate-700 ${isLeader ? "w-14 h-14 text-xl" : "w-10 h-10 text-sm"}`}
                            >
                              {candidate.name.charAt(0)}
                            </div>
                            <div>
                              <h2
                                className={`font-bold leading-tight ${isLeader ? "text-lg text-white" : "text-sm text-slate-300"}`}
                              >
                                {candidate.name}
                              </h2>
                              <p className="text-[10px] text-slate-500 font-bold uppercase">
                                {candidate.designation}
                              </p>
                            </div>
                          </div>
                          <div className="pr-6 text-right z-10 min-w-[140px]">
                            <div
                              className={`font-mono font-bold leading-none tabular-nums ${isLeader ? "text-3xl text-white" : "text-xl text-slate-400"}`}
                            >
                              <FramerCounter value={candidate.votes || 0} />
                            </div>
                            <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden flex justify-end">
                              <motion.div
                                className={`h-full rounded-full bg-gradient-to-r ${candidate.color || "from-indigo-500 to-blue-500"}`}
                                animate={{ width: `${percentage}%` }}
                              />
                            </div>
                            <p className="text-[9px] text-slate-500 font-bold mt-1">
                              {percentage}%
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden text-center shadow-xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600"></div>
                    <CiTrophy className="text-amber-500 w-10 h-10 mx-auto mb-3" />
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">
                      Projected Winner
                    </p>
                    <h3 className="text-xl font-bold text-white">
                      {selectedElection.candidates[0]?.name || "N/A"}
                    </h3>
                  </div>

                  <div className="bg-black/40 border border-slate-800 rounded-3xl p-5 h-[320px] flex flex-col shadow-inner">
                    <h4 className="text-slate-400 font-bold text-xs uppercase mb-4 flex items-center gap-2">
                      <FiHash className="text-rose-500" /> Incoming Ledger
                      Stream
                    </h4>
                    <div className="space-y-2 flex-1 overflow-hidden relative font-mono text-[10px]">
                      <AnimatePresence initial={false}>
                        {recentLog.map((log) => (
                          <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-3 p-2 rounded hover:bg-slate-800/50 border-l-2 border-transparent hover:border-rose-500/50"
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
      </div>
    </AdminLayout>
  );
};

export default LiveVoting;
