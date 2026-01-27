import React, { useState, useRef, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { electionAPI } from "../../services/api";
import {
  FiTrendingUp,
  FiUsers,
  FiBox,
  FiActivity,
  FiLayers,
  FiCalendar,
  FiChevronDown,
  FiArrowRight,
  FiX,
  FiCheckCircle,
  FiTarget,
  FiAlignLeft,
  FiAlertCircle,
  FiLoader,
  FiRefreshCw,
} from "react-icons/fi";
import { formatDate, calculatePercentage } from "../../utils/helpers";

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState("All Time");
  const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [elections, setElections] = useState([]);
  const [globalStats, setGlobalStats] = useState({
    totalVoters: 0,
    totalVotes: 0,
    activeElections: 0,
    totalElections: 0,
  });

  const [selectedElection, setSelectedElection] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const filterRef = useRef(null);

  const fetchDashboardData = async (isSilent = false) => {
    try {
      if (!isSilent) {
        setIsLoading(true);
        setError(null);
      }

      const [electionsRes, statsRes] = await Promise.all([
        electionAPI.getAll(),
        electionAPI.getStats(),
      ]);

      setElections(electionsRes.data);
      setGlobalStats(statsRes.data);
    } catch (err) {
      if (!isSilent) {
        setError(
          err.response?.data?.message || "Failed to load dashboard data.",
        );
      }
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const polling = setInterval(() => fetchDashboardData(true), 30000);
    return () => clearInterval(polling);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsTimeFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getFilteredData = () => {
    if (timeRange === "All Time") return elections;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    return elections.filter((e) => {
      const electionDate = new Date(e.start_time || e.created_at || Date.now());
      switch (timeRange) {
        case "Today":
          return electionDate >= today;
        case "Last 7 Days":
          return electionDate >= sevenDaysAgo;
        case "Last 30 Days":
          return electionDate >= thirtyDaysAgo;
        default:
          return true;
      }
    });
  };

  const filteredElections = getFilteredData();
  const liveElections = filteredElections.filter((e) => e.status === "Active");

  const currentStats = {
    totalVoters: globalStats.totalVoters,
    totalVotes: filteredElections.reduce(
      (acc, e) =>
        acc + (e.candidates?.reduce((sum, c) => sum + (c.votes || 0), 0) || 0),
      0,
    ),
    activeElections: liveElections.length,
    totalElections: filteredElections.length,
  };

  const getTimeLeft = (endTime) => {
    const total = new Date(endTime) - new Date();
    if (total <= 0) return "Ended";
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const openDetails = (election) => {
    setSelectedElection(election);
    setShowModal(true);
  };

  const closeDetails = () => {
    setShowModal(false);
    setSelectedElection(null);
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-0">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4 border-b border-slate-800 pb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <div className="p-2.5 bg-rose-600 rounded-xl shadow-lg shadow-rose-600/20">
                <FiLayers className="text-white w-6 h-6" />
              </div>
              Admin Dashboard
              <span className="flex h-2.5 w-2.5 relative ml-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-3">
              System status:{" "}
              <span className="text-emerald-400 font-bold">ONLINE</span> •{" "}
              {liveElections.length} Active Elections
            </p>
          </div>

          <div className="relative z-20" ref={filterRef}>
            <button
              onClick={() => setIsTimeFilterOpen(!isTimeFilterOpen)}
              className={`flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl border transition-all shadow-lg min-w-[160px] justify-between ${
                isTimeFilterOpen
                  ? "border-rose-500 ring-1 ring-rose-500/50"
                  : "border-slate-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <FiCalendar className="text-rose-400" />
                <span className="text-sm font-medium">{timeRange}</span>
              </div>
              <FiChevronDown
                className={`text-slate-500 transition-transform duration-200 ${isTimeFilterOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isTimeFilterOpen && (
              <div className="absolute right-0 mt-2 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden origin-top-right z-30">
                {["Today", "Last 7 Days", "Last 30 Days", "All Time"].map(
                  (range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setTimeRange(range);
                        setIsTimeFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors border-l-2 ${
                        timeRange === range
                          ? "bg-rose-500/10 text-rose-400 border-rose-500 font-medium"
                          : "text-slate-300 hover:bg-slate-700 hover:text-white border-transparent"
                      }`}
                    >
                      {range}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        </header>

        {error && (
          <div className="bg-slate-900/50 border border-red-500/20 rounded-2xl p-8 text-center mb-8 flex flex-col items-center">
            <div className="bg-red-500/10 p-4 rounded-full mb-3">
              <FiAlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              Connection Error
            </h3>
            <p className="text-slate-400 mb-6 max-w-md">{error}</p>
            <button
              onClick={() => fetchDashboardData(false)}
              className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg text-sm font-bold"
            >
              <FiRefreshCw className="w-4 h-4" /> Try Again
            </button>
          </div>
        )}

        {isLoading && !error ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <FiLoader className="w-10 h-10 animate-spin mb-4 text-rose-500" />
            <p>Syncing live system data...</p>
          </div>
        ) : (
          !error && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 animate-slide-up">
                <StatCard
                  label="Total Voters Registered"
                  val={currentStats.totalVoters}
                  icon={FiUsers}
                  color="text-blue-400"
                  bg="bg-blue-500/10"
                />
                <StatCard
                  label="Total Votes Cast"
                  val={currentStats.totalVotes}
                  icon={FiBox}
                  color="text-emerald-400"
                  bg="bg-emerald-500/10"
                />
                <StatCard
                  label="Participation"
                  val={`${calculatePercentage(currentStats.totalVotes, currentStats.totalVoters)}%`}
                  icon={FiTrendingUp}
                  color="text-purple-400"
                  bg="bg-purple-500/10"
                />
                <StatCard
                  label="Active Sessions"
                  val={currentStats.activeElections}
                  icon={FiActivity}
                  color="text-orange-400"
                  bg="bg-orange-500/10"
                />
                <StatCard
                  label="Total Elections"
                  val={currentStats.totalElections}
                  icon={FiLayers}
                  color="text-indigo-400"
                  bg="bg-indigo-500/10"
                />
                <StatCard
                  label="System Status"
                  val="Optimal"
                  icon={FiCheckCircle}
                  color="text-rose-400"
                  bg="bg-rose-500/10"
                  animate
                />
              </div>

              <div className="mb-12">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20 text-rose-500">
                    <FiActivity className="w-5 h-5" />
                  </div>
                  Live Elections
                </h2>

                {liveElections.length === 0 ? (
                  <div className="p-12 text-center border-2 border-dashed border-slate-700/50 rounded-2xl bg-slate-800/20 text-slate-500">
                    <FiActivity className="w-8 h-8 mx-auto mb-4 opacity-20" />
                    No active elections found for this period.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {liveElections.map((election) => (
                      <div
                        key={election.id}
                        className="relative overflow-hidden rounded-[24px] bg-slate-900 border border-slate-700/50 shadow-2xl transition-all hover:border-rose-500/30 group"
                      >
                        <div className="p-7 relative z-10">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <h3 className="text-xl font-bold text-white mb-1">
                                {election.title}
                              </h3>
                              <p className="text-xs text-slate-500">
                                ID: #{election.id}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>{" "}
                                Live
                              </span>
                              <p className="text-[10px] text-slate-500 mt-2">
                                Ends: {getTimeLeft(election.end_time)}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 text-center">
                              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                                Candidates
                              </p>
                              <p className="text-2xl font-mono text-white font-bold">
                                {election.candidates?.length || 0}
                              </p>
                            </div>
                            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 text-center">
                              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                                Ends At
                              </p>
                              <p className="text-sm font-mono text-emerald-400 font-bold pt-1">
                                {new Date(election.end_time).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => openDetails(election)}
                            className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all"
                          >
                            View Analytics <FiArrowRight />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )
        )}

        {showModal && selectedElection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[85vh]">
              <div className="p-6 md:p-8 border-b border-slate-700 bg-slate-800/50 rounded-t-3xl flex justify-between items-start">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border mb-3 bg-rose-500/10 text-rose-400 border-rose-500/20">
                    <FiActivity /> Live Monitoring
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    {selectedElection.title}
                  </h2>
                  <div className="flex items-center gap-4 text-slate-400 text-sm mt-2">
                    <span className="flex items-center gap-1">
                      <FiCalendar /> {formatDate(selectedElection.start_time)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiAlignLeft /> {selectedElection.description}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeDetails}
                  className="bg-slate-800 p-2 rounded-xl text-slate-400 hover:text-white transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2 flex items-center gap-2">
                  <FiTarget className="text-emerald-400" /> Vote Distribution
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedElection.candidates?.map((candidate) => {
                    const totalInElection = selectedElection.candidates.reduce(
                      (acc, c) => acc + (c.votes || 0),
                      0,
                    );
                    const percent = calculatePercentage(
                      candidate.votes,
                      totalInElection,
                    );

                    return (
                      <div
                        key={candidate.id}
                        className="p-5 rounded-2xl border bg-slate-800/40 border-slate-700/50"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div
                            className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white ${candidate.color || "bg-slate-700"}`}
                          >
                            {candidate.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-white">
                              {candidate.name}
                            </h4>
                            <p className="text-xs text-emerald-400 font-semibold">
                              {candidate.designation}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-300">
                              Votes Secured
                            </span>
                            <span className="text-white font-bold">
                              {candidate.votes || 0}{" "}
                              <span className="text-slate-500 font-normal">
                                ({percent}%)
                              </span>
                            </span>
                          </div>
                          <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${candidate.color || "bg-indigo-500"} transition-all duration-1000`}
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 border-t border-slate-700 bg-slate-800/50 rounded-b-3xl flex justify-end">
                <button
                  onClick={closeDetails}
                  className="px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors text-sm shadow-lg"
                >
                  Close Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

const StatCard = ({ label, val, icon: Icon, color, bg, animate }) => (
  <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl flex items-center justify-between hover:border-slate-600 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group">
    <div>
      <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold mb-1">
        {label}
      </p>
      <h3
        className={`text-2xl md:text-3xl font-bold ${color} flex items-center gap-2`}
      >
        {val}
        {animate && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
        )}
      </h3>
    </div>
    <div
      className={`p-3 rounded-xl ${bg} ${color} group-hover:scale-110 transition-transform duration-300`}
    >
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

export default AdminDashboard;
