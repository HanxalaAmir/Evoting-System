import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import Button from "../../components/Button";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiClock,
  FiCheckCircle,
  FiActivity,
  FiArrowRight,
  FiBox,
  FiUserCheck,
  FiAward,
  FiBarChart2,
  FiX,
  FiCalendar,
  FiChevronDown,
  FiLoader,
  FiFilter,
  FiRefreshCw,
} from "react-icons/fi";
import { electionAPI, voteAPI } from "../../services/api";

const VoterDashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString(),
  );

  // Modal & Expansion State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);

  // Data State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeElections, setActiveElections] = useState([]);
  const [voteHistory, setVoteHistory] = useState([]);
  const [stats, setStats] = useState({
    active: 0,
    total: 0,
    wins: 0,
    losses: 0,
  });

  // --- 1. DATA FETCHING ---
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [activeRes, historyRes] = await Promise.all([
        electionAPI.getActive(),
        voteAPI.getHistory(),
      ]);

      const allActiveData = activeRes.data || [];
      const historyData = Array.isArray(historyRes.data) ? historyRes.data : [];

      const votedElectionIds = new Set(
        historyData.map((h) => h.electionId || h.election_id),
      );

      const electionsToVote = allActiveData.filter(
        (e) => !votedElectionIds.has(e._id || e.id),
      );

      setActiveElections(electionsToVote);
      setVoteHistory(historyData);

      const wins = historyData.filter(
        (h) => h.status === "Ended" && h.myCandidate === h.winnerName,
      ).length;

      const losses = historyData.filter(
        (h) => h.status === "Ended" && h.myCandidate !== h.winnerName,
      ).length;

      setStats({
        active: electionsToVote.length,
        total: historyData.length,
        wins: wins,
        losses: losses,
      });
    } catch (err) {
      console.error("Dashboard Data Error:", err);
      setError("Unable to load dashboard data. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const clockTimer = setInterval(
      () => setCurrentTime(new Date().toLocaleTimeString()),
      1000,
    );
    fetchData();
    return () => clearInterval(clockTimer);
  }, []);

  // --- 2. HELPERS ---
  const toggleRow = (id) => {
    setExpandedHistoryId((prev) => (prev === id ? null : id));
  };

  const getTimeLeft = (endTime) => {
    if (!endTime) return "Unknown";
    const total = Date.parse(endTime) - Date.now();
    if (total <= 0) return "Ending Soon";
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
  };

  const getRatio = (myVotes, winnerVotes, isWinner) => {
    if (isWinner) return { myPercent: 70, oppPercent: 30 };
    const total = (myVotes || 0) + (winnerVotes || 0);
    if (total === 0) return { myPercent: 50, oppPercent: 50 };
    const myPercent = Math.round((myVotes / total) * 100);
    return { myPercent, oppPercent: 100 - myPercent };
  };

  // --- 3. COMPONENTS ---
  const SimpleHistoryCard = ({ item }) => (
    <div
      onClick={() => setShowHistoryModal(true)}
      className="p-5 border-b border-slate-700/50 hover:bg-slate-800/60 transition-colors cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-bold text-white line-clamp-1">
          {item.electionTitle}
        </h4>
        <span
          className={`text-[10px] px-2 py-0.5 rounded border ${
            item.status === "Ended"
              ? "bg-slate-700 border-slate-600 text-slate-300"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          }`}
        >
          {item.status}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs mt-3">
        <span className="text-slate-500 flex items-center gap-1">
          <FiUserCheck className="text-blue-400" /> You Voted:{" "}
          <span className="text-slate-300 font-bold">{item.myCandidate}</span>
        </span>
        <FiChevronDown className="text-slate-500 -rotate-90" />
      </div>
    </div>
  );

  const PremiumHistoryCard = ({ item }) => {
    const isExpanded = expandedHistoryId === (item._id || item.id);
    const isWinner =
      item.status === "Ended" && item.myCandidate === item.winnerName;
    const isEnded = item.status === "Ended";
    const { myPercent, oppPercent } = getRatio(
      item.myCandidateVotes,
      item.winnerVotes,
      isWinner,
    );

    return (
      <div className="border border-slate-700/50 rounded-2xl overflow-hidden bg-slate-800/20 hover:bg-slate-800/40 transition-all duration-300 mb-3">
        <div
          onClick={() => toggleRow(item._id || item.id)}
          className={`p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer transition-colors ${
            isExpanded ? "bg-slate-800/80 border-b border-slate-700" : ""
          }`}
        >
          <div className="flex-1">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              {item.electionTitle}
              {isWinner && <FiAward className="text-emerald-400 w-4 h-4" />}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <FiCalendar /> {new Date(item.date).toLocaleDateString()}
              </span>
              <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
              <span>
                Vote ID: #
                {item.voteHash ? item.voteHash.substring(0, 6) : "..."}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                Status
              </p>
              <p
                className={`text-sm font-semibold ${
                  isEnded ? "text-slate-400" : "text-emerald-400"
                }`}
              >
                {item.status}
              </p>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <FiChevronDown className="text-slate-500 w-5 h-5" />
            </motion.div>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-5 bg-slate-900/50 space-y-5">
                <div className="flex justify-between items-end text-xs">
                  <div className="text-left">
                    <span className="bg-indigo-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold mb-1 inline-block shadow-lg shadow-indigo-500/20">
                      YOU
                    </span>
                    <div className="font-bold text-white text-sm">
                      {item.myCandidate}
                    </div>
                    <div className="text-slate-500">
                      {item.myCandidateVotes || 0} Votes
                    </div>
                  </div>

                  <div className="text-right">
                    {isWinner ? (
                      <span className="bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-bold mb-1 inline-block">
                        OTHERS
                      </span>
                    ) : (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold mb-1 inline-block">
                        WINNER
                      </span>
                    )}
                    <div className="font-bold text-slate-300 text-sm">
                      {isWinner ? "Rest of Field" : item.winnerName || "TBD"}
                    </div>
                    <div className="text-slate-500">
                      {isWinner
                        ? "Trailing"
                        : (item.winnerVotes || 0) + " Votes"}
                    </div>
                  </div>
                </div>

                <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex relative shadow-inner shadow-black/50">
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-900 z-10 opacity-50"></div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${myPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 flex items-center justify-start pl-2 text-[9px] font-bold text-white/90"
                  >
                    {myPercent}%
                  </motion.div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${oppPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                    className={`h-full flex items-center justify-end pr-2 text-[9px] font-bold text-white/90 ${
                      isWinner
                        ? "bg-slate-600"
                        : "bg-gradient-to-l from-emerald-600 to-emerald-400"
                    }`}
                  >
                    {oppPercent}%
                  </motion.div>
                </div>

                <div className="text-center pt-1 border-t border-slate-800/50 mt-2">
                  {isWinner ? (
                    <span className="text-emerald-400 text-xs font-bold flex items-center justify-center gap-1 mt-2">
                      <FiAward /> Victory! Your candidate won the election.
                    </span>
                  ) : (
                    <span className="text-slate-500 text-xs flex items-center justify-center gap-1 mt-2">
                      <FiTarget />{" "}
                      {oppPercent > myPercent
                        ? "Your candidate did not win this time."
                        : "Results pending final count."}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // --- 4. RENDER STATES ---

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="h-[80vh] flex flex-col items-center justify-center text-slate-500 gap-4">
          <FiLoader className="w-10 h-10 animate-spin text-indigo-500" />
          <p className="text-sm font-medium animate-pulse">
            Loading secure voter data...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="h-[80vh] flex flex-col items-center justify-center text-center gap-4 px-4">
          <div className="bg-indigo-500/10 p-4 rounded-full">
            <FiActivity className="w-10 h-10 text-indigo-500" />
          </div>
          <h3 className="text-xl font-bold text-white">Data Fetch Failed</h3>
          <p className="text-slate-400 max-w-md">{error}</p>
          <Button onClick={fetchData} variant="primary" className="mt-4 gap-2">
            <FiRefreshCw className="w-4 h-4" /> Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    {
      label: "Active Elections",
      val: stats.active,
      color: "text-indigo-400",
      icon: FiActivity,
      bg: "bg-indigo-500/10 border-indigo-500/20",
    },
    {
      label: "Total Participated",
      val: stats.total,
      color: "text-purple-400",
      icon: FiBox,
      bg: "bg-purple-500/10 border-purple-500/20",
    },
    {
      label: "Winning Votes",
      val: stats.wins,
      color: "text-emerald-400",
      icon: FiAward,
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Other Outcomes",
      val: stats.losses,
      color: "text-rose-400",
      icon: FiBarChart2,
      bg: "bg-rose-500/10 border-rose-500/20",
    },
  ];

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto"
      >
        {/* Updated Header with matching style */}
        <div className="mb-10 border-b border-slate-800 pb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
                <FiActivity className="text-white w-6 h-6" />
              </div>
              Voter Portal
            </h1>
            <p className="text-slate-400 mt-3 text-sm leading-relaxed">
              Welcome back, <strong>Voter</strong>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/50 text-xs font-mono text-slate-300">
              <FiClock className="w-3 h-3 text-indigo-400" /> {currentTime}
            </div>
            <div className="px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-xs font-mono text-indigo-400 flex items-center gap-2 shadow-lg shadow-indigo-500/10">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>{" "}
              Secure Connection
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
          {statCards.map((stat, idx) => (
            <div
              key={idx}
              className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl flex items-center justify-between group hover:border-slate-600 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
            >
              <div>
                <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold mb-1">
                  {stat.label}
                </p>
                <h3 className={`text-2xl md:text-3xl font-bold ${stat.color}`}>
                  {stat.val}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left: Live Elections */}
          <div className="xl:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-3">
              <div className="p-1.5 bg-rose-500/10 rounded-lg border border-rose-500/20">
                <FiActivity className="text-rose-500 w-4 h-4" />
              </div>
              Live Elections
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {activeElections.length === 0 ? (
                <div className="p-12 text-center text-slate-500 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700 flex flex-col items-center justify-center">
                  <FiFilter className="w-8 h-8 mb-3 text-slate-600" />
                  <p>No active elections require your vote right now.</p>
                </div>
              ) : (
                activeElections.map((election) => (
                  <div
                    key={election.id || election._id}
                    className="group relative bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 p-6 rounded-2xl transition-all duration-200 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>{" "}
                          Active
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 bg-slate-900/50 px-2 py-0.5 rounded border border-slate-700/50">
                          <FiClock className="w-3 h-3 text-rose-400" />{" "}
                          {getTimeLeft(election.end_time || election.endTime)}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {election.title}
                      </h3>
                    </div>
                    <Button
                      onClick={() => navigate("/voter/vote")}
                      variant="primary"
                      size="sm"
                      className="shadow-lg shadow-indigo-500/20 gap-2 bg-indigo-600 hover:bg-indigo-500 border-0"
                    >
                      Vote Now <FiArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Recent History */}
          <div className="xl:col-span-1 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-3">
              <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <FiCheckCircle className="text-indigo-500 w-4 h-4" />
              </div>
              Recent Activity
            </h2>

            <div className="space-y-4">
              {voteHistory.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm bg-slate-800/40 rounded-2xl border border-slate-700/50">
                  No voting history found.
                </div>
              ) : (
                voteHistory
                  .slice(0, 3)
                  .map((item) => (
                    <SimpleHistoryCard key={item._id || item.id} item={item} />
                  ))
              )}

              {voteHistory.length > 0 && (
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="w-full py-3.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-xl transition-colors border border-slate-700/50 flex items-center justify-center gap-2"
                >
                  View Full Archive <FiArrowRight />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- HISTORY MODAL --- */}
        <AnimatePresence>
          {showHistoryModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
              >
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50 sticky top-0 z-10 backdrop-blur-md">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                      <FiCheckCircle className="text-emerald-400" /> Voting
                      Archive
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">
                      Detailed history of all your elections.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowHistoryModal(false)}
                    className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-900 space-y-4">
                  {voteHistory.map((item) => (
                    <PremiumHistoryCard key={item._id || item.id} item={item} />
                  ))}
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-800/30 text-right">
                  <Button
                    onClick={() => setShowHistoryModal(false)}
                    variant="outline"
                    className="text-xs"
                  >
                    Close Archive
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
};

export default VoterDashboard;
