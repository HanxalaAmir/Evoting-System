import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCheck,
  FiShield,
  FiArrowRight,
  FiChevronLeft,
  FiCheckCircle,
  FiSmartphone,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
  FiLock,
  FiHash,
  FiBox,
} from "react-icons/fi";
import { electionAPI, voteAPI } from "../../services/api";
import confetti from "canvas-confetti";

const verifyDeviceOwnership = async () => {
  if (!window.PublicKeyCredential) {
    return true;
  }

  try {
    const isAvailable =
      await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();

    if (!isAvailable) {
      return true;
    }

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: window.location.hostname,
        timeout: 60000,
        userVerification: "required",
      },
    });

    return !!assertion;
  } catch (error) {
    return false;
  }
};

const VoteScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [view, setView] = useState("list");
  const [activeElection, setActiveElection] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [indexNumberInput, setIndexNumberInput] = useState("");

  const [elections, setElections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authStatus, setAuthStatus] = useState("idle");

  const fetchActiveElections = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: activeData } = await electionAPI.getActive();

      let votedIds = new Set();
      try {
        const { data: historyData } = await voteAPI.getHistory();
        if (Array.isArray(historyData)) {
          votedIds = new Set(
            historyData.map((h) => h.electionId || h.election_id),
          );
        }
      } catch (historyErr) {
        console.warn(
          "History fetch skipped (likely empty or server issue). Proceeding.",
        );
      }

      // Filter: Show ONLY active elections that user has NOT voted in
      const availableElections = activeData.filter((e) => {
        const isVoted = votedIds.has(e.id || e._id);
        const isActive = e.status === "Active"; // Explicit check for status
        return isActive && !isVoted;
      });

      setElections(availableElections);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Unable to load active ballots. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveElections();
  }, []);

  const openBallot = (election) => {
    setActiveElection(election);
    setSelectedCandidate(null);
    setIndexNumberInput("");
    setAuthStatus("idle");
    setView("ballot");
    window.scrollTo(0, 0);
  };

  const closeConfirmModal = () => {
    setShowConfirm(false);
    setAuthStatus("idle");
    setIndexNumberInput("");
  };

  const handleVote = async () => {
    if (!selectedCandidate) return;

    if (indexNumberInput.trim() !== user?.username) {
      alert(
        "Verification Failed: The Index Number entered does not match your logged-in account.",
      );
      return;
    }

    setIsSubmitting(true);
    setAuthStatus("verifying");

    try {
      const isVerified = await verifyDeviceOwnership();

      if (isVerified) {
        setAuthStatus("success");

        const payload = {
          electionId: activeElection.id || activeElection._id,
          candidateId: selectedCandidate,
          indexNumber: indexNumberInput,
          election_id: activeElection.id || activeElection._id,
          candidate_id: selectedCandidate,
          index_number: indexNumberInput,
        };

        await voteAPI.castVote(payload);

        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#6366f1", "#10b981", "#f43f5e"],
        });

        setTimeout(() => {
          setIsSubmitting(false);
          setShowConfirm(false);
          setView("success");
          window.scrollTo(0, 0);
        }, 1000);
      } else {
        throw new Error("Device authentication failed or cancelled.");
      }
    } catch (err) {
      console.error("Voting Failed:", err);
      setAuthStatus("failed");
      setIsSubmitting(false);

      const msg =
        err.response?.data?.message ||
        err.message ||
        "Vote failed. Please check your connection.";
      alert(msg);
    }
  };

  const resetFlow = () => {
    setView("list");
    setActiveElection(null);
    setSelectedCandidate(null);
    setAuthStatus("idle");
    fetchActiveElections();
  };

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
            <strong className="text-white">{activeElection?.title}</strong> has
            been securely encrypted and written to the ledger.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/voter/dashboard")}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold border border-slate-700 transition-all hover:scale-105"
            >
              View Dashboard
            </button>
            <button
              onClick={resetFlow}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 hover:scale-105"
            >
              Vote Another
            </button>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  if (view === "ballot" && activeElection) {
    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="max-w-6xl mx-auto pb-40 px-4"
        >
          <div className="mb-8 border-b border-slate-800 pb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
                  <FiBox className="text-white w-6 h-6" />
                </div>
                Official Ballot
              </h1>
              <p className="text-slate-400 mt-2 text-sm leading-relaxed">
                Cast your secure vote for{" "}
                <strong>{activeElection.title}</strong>
              </p>
            </div>
            <button
              onClick={resetFlow}
              className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors hover:bg-slate-800/50 px-4 py-2 rounded-lg bg-slate-900 border border-slate-800"
            >
              <FiChevronLeft className="w-4 h-4" /> Cancel & Exit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeElection.candidates.map((candidate) => (
              <div
                key={candidate._id || candidate.id}
                onClick={() =>
                  setSelectedCandidate(candidate._id || candidate.id)
                }
                className={`relative flex items-center gap-5 p-6 rounded-2xl border cursor-pointer transition-all duration-300 group overflow-hidden ${selectedCandidate === (candidate._id || candidate.id) ? "bg-slate-800/80 border-indigo-500/50 ring-1 ring-indigo-500/20 shadow-2xl shadow-indigo-900/20" : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600"}`}
              >
                {selectedCandidate === (candidate._id || candidate.id) && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500"></div>
                )}
                <div
                  className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-white text-lg font-bold shadow-inner bg-gradient-to-br ${candidate.color || "from-indigo-600 to-blue-500"}`}
                >
                  {candidate.name.charAt(0)}
                </div>
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
                      {candidate.designation ||
                        candidate.party ||
                        "Independent"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
                    Proceed <FiArrowRight />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {showConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-900 border border-slate-700 p-6 rounded-[24px] shadow-2xl w-full max-w-sm relative overflow-hidden"
              >
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <FiShield className="text-amber-500 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-none">
                      Security Verification
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Authenticate to cast your vote.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 mb-6 flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs bg-gradient-to-br from-indigo-600 to-blue-500`}
                  >
                    {activeElection.candidates
                      .find((c) => (c._id || c.id) === selectedCandidate)
                      ?.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">
                      Voting For:
                    </span>
                    <span className="text-sm font-bold text-white">
                      {
                        activeElection.candidates.find(
                          (c) => (c._id || c.id) === selectedCandidate,
                        )?.name
                      }
                    </span>
                  </div>
                </div>

                <div className="mb-6 space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <FiHash /> Enter Index Number
                  </label>
                  <input
                    type="text"
                    value={indexNumberInput}
                    onChange={(e) => setIndexNumberInput(e.target.value)}
                    placeholder="e.g. 123456"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    autoFocus
                  />
                  <p className="text-[10px] text-slate-500">
                    This helps us ensure only registered students vote.
                  </p>
                </div>

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
                    disabled={isSubmitting || !indexNumberInput}
                    className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition-all flex justify-center items-center gap-2 ${isSubmitting || !indexNumberInput ? "bg-slate-700 cursor-not-allowed text-slate-400" : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20"}`}
                  >
                    {authStatus === "verifying" ? (
                      <>
                        <FiLoader className="animate-spin" /> Verifying
                      </>
                    ) : authStatus === "success" ? (
                      <>
                        <FiCheck /> Verified
                      </>
                    ) : (
                      <>
                        <FiSmartphone /> Confirm & Vote
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto px-4"
      >
        <div className="mb-10 border-b border-slate-800 pb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
              <FiShield className="text-white w-6 h-6" />
            </div>
            Active Ballots
          </h1>
          <p className="text-slate-400 mt-3 max-w-2xl text-sm leading-relaxed">
            Select an election below to proceed.
          </p>
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
                className="group bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500/50 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl hover:shadow-black/20 hover:-translate-y-0.5 flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-indigo-500/10 transition-colors"></div>
                <div className="flex justify-between items-center mb-3 relative z-10">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>{" "}
                    {election.status}
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
                  <span
                    className={`text-[10px] font-bold flex items-center gap-1 transition-transform px-3 py-1 rounded-lg border text-indigo-400 border-indigo-500/20 bg-indigo-500/10 group-hover:translate-x-1`}
                  >
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
