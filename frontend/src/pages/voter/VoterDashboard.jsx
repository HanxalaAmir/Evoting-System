import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import Button from "../../components/Button";
import {
  FiClock,
  FiCheckCircle,
  FiActivity,
  FiArrowRight,
  FiBox,
  FiUserCheck,
  FiXCircle,
  FiAward,
  FiBarChart2,
  FiX,
  FiCalendar,
  FiChevronDown,
  FiLoader,
  FiUsers,
} from "react-icons/fi";
import { electionAPI, voteAPI } from "../../services/api";

const VoterDashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString(),
  );
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);

  // Data State
  const [isLoading, setIsLoading] = useState(true);
  const [activeElections, setActiveElections] = useState([]);
  const [voteHistory, setVoteHistory] = useState([]);
  const [stats, setStats] = useState({
    active: 0,
    total: 0,
    wins: 0,
    losses: 0,
  });

  // --- CLOCK & DATA FETCHING ---
  useEffect(() => {
    const clockTimer = setInterval(
      () => setCurrentTime(new Date().toLocaleTimeString()),
      1000,
    );

    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Parallel fetching for performance
        const [activeRes, historyRes] = await Promise.all([
          electionAPI.getActive(), // Returns only status='Active'
          voteAPI.getHistory(), // Returns user's past votes
        ]);

        const activeData = activeRes.data || [];
        const historyData = historyRes.data || [];

        setActiveElections(activeData);
        setVoteHistory(historyData);

        // Calculate Stats Dynamically based on real data
        const wins = historyData.filter((h) => h.result === "Winner").length;
        const losses = historyData.filter((h) => h.result === "Lost").length; // Or 'Runner-up' depending on backend

        setStats({
          active: activeData.length,
          total: historyData.length,
          wins: wins,
          losses: losses,
        });
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => clearInterval(clockTimer);
  }, []);

  const toggleRow = (id) => {
    setExpandedHistoryId(expandedHistoryId === id ? null : id);
  };

  // Helper for time left calculation
  const getTimeLeft = (endTime) => {
    const total = Date.parse(endTime) - Date.now();
    if (total <= 0) return "Ended";
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
  };

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

  // Stats Configuration for UI
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
      label: "Runner-Up Votes",
      val: stats.losses,
      color: "text-rose-400",
      icon: FiBarChart2,
      bg: "bg-rose-500/10 border-rose-500/20",
    },
  ];

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
          <p className="text-slate-400 text-sm mt-1">
            Welcome back, <strong>Voter</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/50 text-xs font-mono text-slate-300">
            <FiClock className="w-3 h-3 text-indigo-400" />
            {currentTime}
          </div>
          <div className="px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-xs font-mono text-indigo-400 flex items-center gap-2 shadow-lg shadow-indigo-500/10">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
            Secure Connection
          </div>
        </div>
      </header>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10 animate-slide-up">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl flex items-center justify-between group hover:border-slate-600 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
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
            {activeElections.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700">
                No active elections at the moment.
              </div>
            ) : (
              activeElections.map((election) => (
                <div
                  key={election._id || election.id}
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
                        {getTimeLeft(election.endTime)}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {election.title}
                    </h3>
                  </div>

                  {election.hasVoted ? ( // Assuming backend returns hasVoted boolean for user
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="opacity-60 gap-2 border-emerald-500/30 text-emerald-400 bg-emerald-500/5 cursor-not-allowed"
                    >
                      <FiCheckCircle className="w-4 h-4" /> Voted
                    </Button>
                  ) : (
                    <Button
                      onClick={() =>
                        navigate(`/voter/vote?electionId=${election._id}`)
                      }
                      variant="primary"
                      size="sm"
                      className="shadow-lg shadow-indigo-500/20 gap-2 bg-indigo-600 hover:bg-indigo-500 border-0"
                    >
                      Vote Now <FiArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))
            )}
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
            {voteHistory.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                No voting history found.
              </div>
            ) : (
              voteHistory.slice(0, 3).map((history) => (
                <div
                  key={history._id || history.id}
                  className="p-5 border-b border-slate-700/50 hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-white line-clamp-1">
                      {history.electionTitle}
                    </h4>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
                      {new Date(history.date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs mt-3 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                    <div>
                      <span className="text-slate-500 block mb-1 text-[10px] uppercase font-bold tracking-wider">
                        Your Vote
                      </span>
                      <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                        <FiUserCheck className="text-blue-400" />{" "}
                        {history.candidateName}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {voteHistory.length > 0 && (
              <button
                onClick={() => setShowHistoryModal(true)}
                className="w-full py-3.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors border-t border-slate-700/50 flex items-center justify-center gap-2"
              >
                View Full Archive <FiArrowRight />
              </button>
            )}
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
                <p className="text-slate-400 text-xs mt-1">
                  Detailed breakdown of your past election participation.
                </p>
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
                {voteHistory.map((item) => {
                  const isExpanded = expandedHistoryId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="border border-slate-700 rounded-2xl overflow-hidden bg-slate-800/20 transition-all duration-300"
                    >
                      {/* Summary Row */}
                      <div
                        onClick={() => toggleRow(item.id)}
                        className={`p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/50 transition-colors ${isExpanded ? "bg-slate-800/80 border-b border-slate-700" : ""}`}
                      >
                        <div className="flex-1">
                          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                            {item.electionTitle}
                            {item.result === "Winner" && (
                              <FiAward
                                className="text-emerald-400 w-4 h-4"
                                title="You picked the winner"
                              />
                            )}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <FiCalendar />{" "}
                              {new Date(item.date).toLocaleDateString()}
                            </span>
                            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                            <span>
                              Vote Cast ID: #{item.voteHash?.substring(0, 8)}...
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                          <div className="text-right">
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                              Your Vote
                            </p>
                            <p className="text-sm font-semibold text-slate-300">
                              {item.candidateName}
                            </p>
                          </div>
                          <div
                            className={`transform transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                          >
                            <FiChevronDown className="text-slate-500 w-5 h-5" />
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="p-6 bg-slate-900/50 animate-fade-in border-t border-slate-800">
                          <div className="flex flex-col md:flex-row gap-8">
                            {/* Left: Meta */}
                            <div className="w-full space-y-4">
                              <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                                  Blockchain Verification
                                </p>
                                <p className="text-slate-300 text-xs font-mono break-all bg-slate-950 p-2 rounded border border-slate-800">
                                  {item.voteHash || "Pending Confirmation"}
                                </p>
                              </div>
                              <div className="pt-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                  Confirmed & Counted
                                </span>
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
              <Button
                onClick={() => setShowHistoryModal(false)}
                variant="outline"
                className="text-xs"
              >
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
