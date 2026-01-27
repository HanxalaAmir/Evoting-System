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
import { calculatePercentage } from "../../utils/helpers";

const Results = () => {
  const [selectedElection, setSelectedElection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeElections, setActiveElections] = useState([]);

  const fetchResults = async () => {
    try {
      const response = await electionAPI.getAll();
      const live = response.data.filter((e) => e.status === "Active");
      setActiveElections(live);
      setError(null);
    } catch (err) {
      if (activeElections.length === 0) {
        setError("Unable to load live election feeds.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 5000);
    return () => clearInterval(interval);
  }, []);

  const calculateTotalVotes = (candidates) => {
    return (candidates || []).reduce(
      (sum, c) => sum + (Number(c.votes) || 0),
      0,
    );
  };

  if (selectedElection) {
    const liveData =
      activeElections.find((e) => e.id === selectedElection.id) ||
      selectedElection;
    const totalVotes = calculateTotalVotes(liveData.candidates);
    const sortedCandidates = [...(liveData.candidates || [])].sort(
      (a, b) => (Number(b.votes) || 0) - (Number(a.votes) || 0),
    );
    const winner = totalVotes > 0 ? sortedCandidates[0] : null;

    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pb-10 max-w-6xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setSelectedElection(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors bg-slate-800/30 px-3 py-1.5 rounded-lg border border-slate-700/50"
            >
              <FiChevronLeft /> Back to List
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-[10px] font-bold uppercase tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              Live Feed
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg">
                <FiBarChart2 className="text-white w-6 h-6" />
              </div>
              {liveData.title}
            </h1>
            <p className="text-slate-400 text-sm mt-3">
              Live data telemetry from the secure ledger.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center h-full flex flex-col justify-center relative overflow-hidden shadow-xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-amber-300 to-orange-500 rounded-full flex items-center justify-center shadow-lg mb-6 ring-4 ring-slate-800">
                  <FiAward className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-indigo-400 font-bold uppercase text-[10px] tracking-widest mb-2">
                  Current Leader
                </h3>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {winner ? winner.name : "Waiting for Votes"}
                </h2>
                <p className="text-slate-500 text-xs font-medium mb-8 uppercase">
                  {winner?.designation || "-"}
                </p>

                {winner && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                      <span className="block text-xl font-bold text-white">
                        {calculatePercentage(winner.votes, totalVotes)}%
                      </span>
                      <span className="text-[9px] uppercase text-slate-500 font-bold">
                        Vote Share
                      </span>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                      <span className="block text-xl font-bold text-white">
                        {winner.votes || 0}
                      </span>
                      <span className="text-[9px] uppercase text-slate-500 font-bold">
                        Total Votes
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700/50 p-6 md:p-8 rounded-2xl">
              <div className="flex justify-between items-center mb-8 border-b border-slate-700/50 pb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Live Breakdown
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Real-time candidate distribution
                  </p>
                </div>
                <div className="text-[10px] text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg font-mono">
                  SYNC: ACTIVE
                </div>
              </div>

              <div className="space-y-6">
                {sortedCandidates.map((candidate) => {
                  const votes = Number(candidate.votes) || 0;
                  const percent = calculatePercentage(votes, totalVotes);
                  return (
                    <div key={candidate.id}>
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <span className="font-bold text-white text-sm">
                            {candidate.name}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase ml-2">
                            {candidate.designation}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="block text-white font-mono font-bold text-sm">
                            {percent}%
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {votes} votes
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-700/30 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          className={`h-full rounded-full ${candidate.color || "bg-indigo-500"}`}
                        ></motion.div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-700/50 flex justify-between items-center text-xs text-slate-500">
                <span className="bg-slate-900 px-3 py-1 rounded-md">
                  Total Count:{" "}
                  <strong className="text-white">{totalVotes}</strong>
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase text-[10px]">
                  <FiActivity /> Data Verified
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto"
      >
        <div className="mb-10 border-b border-slate-800 pb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg">
              <FiPieChart className="text-white w-6 h-6" />
            </div>
            Election Results
          </h1>
          <p className="text-slate-400 mt-3 text-sm">
            Select an active election to view real-time data metrics.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <FiLoader className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
            <p className="text-sm">Connecting to Feed...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FiAlertCircle className="w-8 h-8 text-indigo-500 mb-4" />
            <p className="text-slate-400 mb-6">{error}</p>
            <button
              onClick={fetchResults}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold"
            >
              <FiRefreshCw /> Retry
            </button>
          </div>
        ) : activeElections.length === 0 ? (
          <div className="text-center py-20 text-slate-500 bg-slate-800/20 rounded-2xl border border-slate-700 border-dashed">
            <FiActivity className="w-10 h-10 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-white">No Live Ballots</h3>
            <p className="text-sm mt-1">
              Results will appear here when an election is live.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeElections.map((election) => (
              <div
                key={election.id}
                onClick={() => setSelectedElection(election)}
                className="bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500/50 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-2xl flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active
                  </span>
                  <FiArrowRight className="text-slate-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 leading-snug">
                  {election.title}
                </h3>
                <p className="text-xs text-slate-400 mb-6 line-clamp-2">
                  {election.description}
                </p>
                <div className="mt-auto pt-4 border-t border-slate-700/30 flex justify-between items-center text-[10px] uppercase font-bold text-slate-500">
                  <span className="flex items-center gap-1">
                    <FiUsers className="text-indigo-400" />{" "}
                    {election.candidates?.length || 0} Candidates
                  </span>
                  <span className="flex items-center gap-1">
                    <FiCheckCircle className="text-emerald-400" />{" "}
                    {calculateTotalVotes(election.candidates)} Votes
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default Results;
