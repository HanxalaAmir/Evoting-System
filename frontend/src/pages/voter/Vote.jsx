import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiClock,
  FiCheck,
  FiAlertTriangle,
  FiShield,
  FiArrowRight,
  FiChevronLeft,
  FiCheckCircle,
  FiLock,
  FiSmartphone,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { electionAPI, voteAPI } from "../../services/api";
// import { verifyDeviceOwnership } from "../../utils/deviceAuth"; // Uncomment when utility is ready

const VoteScreen = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  );
  const [view, setView] = useState("list"); // list | ballot | success
  const [activeElection, setActiveElection] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Data Loading
  const [elections, setElections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Submission States
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authStatus, setAuthStatus] = useState("idle"); // idle | verifying | success | failed

  // --- FETCH ELECTIONS ---
  const fetchActiveElections = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await electionAPI.getActive();
      // Filter out elections user has already voted in (if backend provides flag, e.g., 'hasVoted')
      // For now, assuming backend filters or returns a flag
      setElections(response.data);
    } catch (err) {
      console.error("Vote Fetch Error:", err);
      setError("Unable to load active ballots. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveElections();
    const timer = setInterval(
      () =>
        setCurrentTime(
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        ),
      1000,
    );
    return () => clearInterval(timer);
  }, []);

  // --- HANDLERS ---
  const openBallot = (election) => {
    setActiveElection(election);
    setSelectedCandidate(null);
    setAuthStatus("idle");
    setView("ballot");
    window.scrollTo(0, 0);
  };

  const closeConfirmModal = () => {
    setShowConfirm(false);
    setAuthStatus("idle");
  };

  // --- VOTE SUBMISSION LOGIC ---
  const handleVote = async () => {
    if (!selectedCandidate) return;

    setIsSubmitting(true);
    setAuthStatus("verifying");

    try {
      // 1. Device Authentication (WebAuthn / Biometric)
      // const isVerified = await verifyDeviceOwnership();
      // Simulated for now:
      const isVerified = await new Promise((r) =>
        setTimeout(() => r(true), 1500),
      );

      if (isVerified) {
        setAuthStatus("success");

        // 2. Submit Vote to Backend
        await voteAPI.castVote({
          electionId: activeElection._id || activeElection.id,
          candidateId: selectedCandidate,
        });

        // 3. Show Success View
        setTimeout(() => {
          setIsSubmitting(false);
          setShowConfirm(false);
          setView("success");
          window.scrollTo(0, 0);
        }, 1000);
      } else {
        throw new Error("Device authentication failed.");
      }
    } catch (err) {
      console.error("Voting Failed:", err);
      setAuthStatus("failed");
      setIsSubmitting(false);
      alert(
        err.response?.data?.message ||
          "Vote submission failed. Please try again.",
      );
    }
  };

  const resetFlow = () => {
    setView("list");
    setActiveElection(null);
    setSelectedCandidate(null);
    setAuthStatus("idle");
    fetchActiveElections(); // Refresh list to remove voted election
  };

  // --- LOADING & ERROR STATES ---
  if (isLoading && view === "list") {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] text-slate-500">
          <FiLoader className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
          <p>Loading secure ballots...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error && view === "list") {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] text-center">
          <div className="bg-indigo-500/10 p-4 rounded-full mb-4">
            <FiAlertCircle className="w-8 h-8 text-indigo-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            Connection Error
          </h3>
          <p className="text-slate-400 mb-6 max-w-md">{error}</p>
          <button
            onClick={fetchActiveElections}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 text-sm font-bold"
          >
            <FiRefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // --- VIEW 1: SUCCESS SCREEN ---
  if (view === "success") {
    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
        >
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-emerald-500/20 shadow-xl shadow-emerald-500/10">
            <FiCheckCircle className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Vote Recorded
          </h2>
          <p className="text-slate-400 mb-8 max-w-sm text-sm leading-relaxed">
            Your ballot for{" "}
            <strong className="text-white">{activeElection.title}</strong> has
            been securely encrypted and written to the ledger.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/voter/results")}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold border border-slate-700 transition-all hover:scale-105"
            >
              View Analytics
            </button>
            <button
              onClick={resetFlow}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 hover:scale-105"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  // --- VIEW 2: BALLOT INTERFACE ---
  if (view === "ballot" && activeElection) {
    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="max-w-5xl mx-auto pb-40"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={resetFlow}
              className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors hover:bg-slate-800/50 px-3 py-1.5 rounded-lg"
            >
              <FiChevronLeft className="w-4 h-4" /> Back to Elections
            </button>

            <div className="px-3 py-1 bg-slate-900/80 rounded-lg border border-slate-700/50 text-[10px] font-mono text-slate-400 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {currentTime}
            </div>
          </div>

          {/* Title Section */}
          <div className="mb-10 pl-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 block">
              Official Ballot
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight leading-none mb-3">
              {activeElection.title}
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed opacity-80 border-l-2 border-slate-700 pl-4">
              {activeElection.description}
            </p>
          </div>

          {/* Candidates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeElection.candidates.map((candidate) => (
              <div
                key={candidate._id || candidate.id} // Handle both MongoDB _id and mockup id
                onClick={() =>
                  setSelectedCandidate(candidate._id || candidate.id)
                }
                className={`
                  relative flex items-center gap-5 p-4 rounded-[24px] border cursor-pointer transition-all duration-300 group overflow-hidden
                  ${
                    selectedCandidate === (candidate._id || candidate.id)
                      ? "bg-slate-800/80 border-indigo-500/50 ring-1 ring-indigo-500/20 shadow-2xl shadow-indigo-900/20"
                      : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600"
                  }
                `}
              >
                {/* Active Indicator Strip */}
                {selectedCandidate === (candidate._id || candidate.id) && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500"></div>
                )}

                {/* Avatar */}
                <div
                  className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-white text-lg font-bold shadow-inner bg-gradient-to-br ${candidate.color || "from-indigo-600 to-blue-500"}`}
                >
                  {candidate.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3
                      className={`text-base font-bold truncate transition-colors ${selectedCandidate === (candidate._id || candidate.id) ? "text-white" : "text-slate-200"}`}
                    >
                      {candidate.name}
                    </h3>
                    {selectedCandidate === (candidate._id || candidate.id) && (
                      <div className="bg-indigo-500 text-white rounded-full p-0.5 shadow-lg shadow-indigo-500/30">
                        <FiCheck className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-slate-900/50 border-slate-700/50 text-slate-400">
                      {candidate.designation || candidate.party}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Floating Action Capsule */}
          <AnimatePresence>
            {selectedCandidate && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="fixed bottom-8 left-0 right-0 z-50 flex justify-center"
              >
                <div className="w-[95%] max-w-3xl bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 rounded-full px-6 py-3 shadow-2xl flex items-center justify-between gap-8 ring-1 ring-black/40">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
                      Voting For
                    </span>
                    <span className="text-base font-semibold text-white truncate">
                      {
                        activeElection.candidates.find(
                          (c) => (c._id || c.id) === selectedCandidate,
                        )?.name
                      }
                    </span>
                  </div>
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2 active:scale-95 shrink-0"
                  >
                    Submit Vote <FiArrowRight />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- CONFIRMATION MODAL --- */}
          {showConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-900 border border-slate-700 p-6 rounded-[24px] shadow-2xl w-full max-w-sm relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <FiAlertTriangle className="text-amber-500 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-none">
                      Confirm Selection
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>

                {/* Candidate Preview */}
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 mb-6 flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-indigo-600 to-blue-500`}
                  >
                    {activeElection.candidates
                      .find((c) => (c._id || c.id) === selectedCandidate)
                      ?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {
                        activeElection.candidates.find(
                          (c) => (c._id || c.id) === selectedCandidate,
                        )?.name
                      }
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                      {
                        activeElection.candidates.find(
                          (c) => (c._id || c.id) === selectedCandidate,
                        )?.designation
                      }
                    </p>
                  </div>
                </div>

                {/* Auth & Actions */}
                <div className="space-y-3">
                  <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5 mb-2">
                    <FiShield className="w-3 h-3 text-emerald-500" /> Secure
                    verification required
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={closeConfirmModal}
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleVote}
                      disabled={isSubmitting}
                      className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition-all flex justify-center items-center gap-2 ${
                        isSubmitting
                          ? "bg-indigo-700 cursor-wait"
                          : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20"
                      }`}
                    >
                      {authStatus === "verifying" ? (
                        <>
                          Verifying <FiLoader className="animate-spin" />
                        </>
                      ) : authStatus === "success" ? (
                        <>
                          Verified <FiCheck />
                        </>
                      ) : (
                        <>
                          Confirm Vote <FiSmartphone />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </DashboardLayout>
    );
  }

  // --- VIEW 3: ELECTION LIST (Compact Grid) ---
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
              <FiShield className="text-indigo-500" /> Active Ballots
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Select an election below to proceed.
            </p>
          </div>
          <div className="px-3 py-1 bg-slate-900 rounded-lg border border-slate-700 text-[10px] font-mono text-slate-400">
            {currentTime}
          </div>
        </div>

        {elections.length === 0 ? (
          <div className="p-10 text-center bg-slate-800/20 border border-dashed border-slate-700 rounded-2xl">
            <p className="text-slate-500 text-sm">
              No active elections found at this moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {elections.map((election) => (
              <div
                key={election._id || election.id}
                onClick={() => openBallot(election)}
                className="group bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500/50 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-xl hover:shadow-black/20 hover:-translate-y-0.5 flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-indigo-500/10 transition-colors"></div>

                <div className="flex justify-between items-center mb-3 relative z-10">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                    {election.status}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 bg-slate-900/50 px-2 py-0.5 rounded border border-slate-700/50">
                    <FiClock className="w-3 h-3" /> Ends:{" "}
                    {new Date(election.endTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors relative z-10">
                  {election.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed relative z-10 opacity-80">
                  {election.description}
                </p>

                <div className="mt-auto pt-3 border-t border-slate-700/50 flex items-center justify-between relative z-10">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    {election.candidates.length} Candidates
                  </span>
                  <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
                    Vote Now <FiArrowRight />
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

export default VoteScreen;
