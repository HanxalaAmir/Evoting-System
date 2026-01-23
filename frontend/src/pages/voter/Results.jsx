import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBarChart2,
  FiAward,
  FiClock,
  FiActivity,
  FiArrowRight,
  FiChevronLeft,
  FiPieChart,
  FiUsers,
  FiCheckCircle,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { electionAPI } from "../../services/api";

const Results = () => {
  const [selectedElection, setSelectedElection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [elections, setElections] = useState([]);

  // --- FETCH DATA ---
  const fetchResults = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await electionAPI.getAll();

      // Filter for elections that have results to show (Active, Completed, Finalizing)
      const visibleElections = response.data.filter((e) =>
        ["Active", "Completed", "Finalizing", "Ended"].includes(e.status),
      );

      setElections(visibleElections);
    } catch (err) {
      console.error("Results Fetch Error:", err);
      setError(
        "Unable to load election results. Please check your connection.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // Helper to calculate percentage safely
  const getPercentage = (votes, total) => {
    if (!total || total === 0) return 0;
    return ((votes / total) * 100).toFixed(1);
  };

  // --- VIEW 2: DETAILED RESULTS DASHBOARD ---
  if (selectedElection) {
    // Find the winner (simple sort)
    const sortedCandidates = [...selectedElection.candidates].sort(
      (a, b) => b.votes - a.votes,
    );
    const winner = sortedCandidates[0];
    const totalVotes = selectedElection.totalVotes || 1; // Prevent divide by zero

    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="pb-10"
        >
          {/* Navigation Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setSelectedElection(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors hover:bg-slate-800/50 px-3 py-1.5 rounded-lg group"
            >
              <FiChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />{" "}
              Back to All Results
            </button>

            {selectedElection.status === "Active" && (
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[10px] font-bold uppercase tracking-wide animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Feed Active
              </div>
            )}
          </div>

          {/* Title Section */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                  <FiBarChart2 className="text-indigo-400 w-5 h-5" />
                </div>
                {selectedElection.title}
              </h1>
              <p className="text-slate-400 text-sm mt-2 ml-1">
                Real-time data from the official election ledger.
              </p>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. WINNER HIGHLIGHT CARD */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/80 border border-indigo-500/20 p-8 rounded-2xl relative overflow-hidden text-center h-full shadow-2xl shadow-indigo-900/10 flex flex-col justify-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>

                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-amber-300 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 mb-6 ring-4 ring-slate-900/50">
                    <FiAward className="w-10 h-10 text-white drop-shadow-md animate-pulse" />
                  </div>

                  <h3 className="text-indigo-300 font-bold uppercase tracking-widest text-[10px] mb-2">
                    Projected Leader
                  </h3>
                  <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">
                    {winner ? winner.name : "No Votes Yet"}
                  </h2>
                  <p className="text-slate-400 text-xs font-medium mb-8 bg-slate-800/50 inline-block px-3 py-1 rounded-lg border border-slate-700/50">
                    {winner ? winner.party : "-"}
                  </p>

                  {winner && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                        <span className="block text-xl font-bold text-white mb-1">
                          {getPercentage(winner.votes, totalVotes)}%
                        </span>
                        <span className="text-[9px] uppercase tracking-wide text-slate-500 font-bold">
                          Total Share
                        </span>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                        <span className="block text-xl font-bold text-white mb-1">
                          {winner.votes}
                        </span>
                        <span className="text-[9px] uppercase tracking-wide text-slate-500 font-bold">
                          Votes Secured
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. DETAILED BREAKDOWN CARD */}
            <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700/50 p-6 md:p-8 rounded-2xl backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-slate-700/50 pb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Vote Breakdown
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Distribution across all candidates
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700/50 self-start sm:self-auto font-mono">
                  <FiClock className="w-3 h-3 text-emerald-400" />
                  <span>Live Sync Enabled</span>
                </div>
              </div>

              <div className="space-y-6">
                {sortedCandidates.map((candidate) => {
                  const percent = getPercentage(candidate.votes, totalVotes);
                  return (
                    <div
                      key={candidate._id || candidate.id}
                      className="relative group"
                    >
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm">
                            {candidate.name}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">
                            {candidate.designation || candidate.party}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="block text-white font-mono font-bold text-sm">
                            {percent}%
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {candidate.votes} votes
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-700/30 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${candidate.color || "bg-indigo-500"} shadow-lg relative`}
                        ></motion.div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-4">
                <div className="flex items-center gap-4 bg-slate-900/30 px-4 py-2 rounded-lg">
                  <span>
                    Total Votes:{" "}
                    <strong className="text-white ml-1">{totalVotes}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/10">
                  <FiActivity className="w-3.5 h-3.5" />
                  <span className="font-semibold text-[10px] uppercase tracking-wide">
                    Blockchain Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  // --- VIEW 1: SELECTION LIST (DEFAULT) ---
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <div className="mb-10 border-b border-slate-800 pb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
              <FiPieChart className="text-white w-6 h-6" />
            </div>
            Election Results
          </h1>
          <p className="text-slate-400 mt-3 max-w-2xl text-sm leading-relaxed">
            Select an election below to view real-time analytics, candidate
            breakdowns, and live winner projections directly from the
            blockchain.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <FiLoader className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
            <p className="text-sm">Loading election data...</p>
          </div>
        )}

        {/* Error State - Styled for Voter Theme (Indigo/Blue) */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-indigo-500/10 p-4 rounded-full mb-4">
              <FiAlertCircle className="w-8 h-8 text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              Connection Error
            </h3>
            <p className="text-slate-400 mb-6 max-w-md">{error}</p>

            <button
              onClick={fetchResults}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 text-sm font-bold"
            >
              <FiRefreshCw className="w-4 h-4" /> Try Again
            </button>
          </div>
        )}

        {/* Election Grid */}
        {!isLoading &&
          !error &&
          (elections.length === 0 ? (
            <div className="text-center py-20 text-slate-500 bg-slate-800/30 rounded-2xl border border-slate-700 border-dashed">
              <p>No results available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {elections.map((election) => (
                <div
                  key={election._id || election.id}
                  onClick={() => setSelectedElection(election)}
                  className="group bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500/50 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 relative overflow-hidden"
                >
                  {/* Top Row */}
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 ${
                        election.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-700/50 text-slate-400 border border-slate-600/50"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${election.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-slate-500"}`}
                      ></span>
                      {election.status}
                    </span>
                    <span className="text-slate-500 group-hover:text-indigo-400 transition-colors">
                      <FiArrowRight className="w-5 h-5" />
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                    {election.title}
                  </h3>

                  <p className="text-xs text-slate-400 mb-6 line-clamp-2 min-h-[32px]">
                    {election.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-6">
                    <div className="flex items-center gap-1.5">
                      <FiUsers className="text-indigo-400" />
                      <span>{election.candidates.length} Candidates</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FiCheckCircle className="text-emerald-400" />
                      <span>{election.totalVotes || 0} Votes Cast</span>
                    </div>
                  </div>

                  {/* Bottom Preview */}
                  {election.candidates && election.candidates.length > 0 && (
                    <div className="mt-auto pt-4 border-t border-slate-700/50">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">
                        Leading Candidate
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                            {election.candidates[0].name.charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-white">
                            {election.candidates[0].name}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {getPercentage(
                            election.candidates[0].votes,
                            election.totalVotes,
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
      </motion.div>
    </DashboardLayout>
  );
};

export default Results;
