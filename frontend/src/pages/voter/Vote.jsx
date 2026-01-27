import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
// Import the utility we created earlier
import { verifyDeviceOwnership } from "../../utils/deviceAuth";
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
  FiHash,
  FiBox,
  FiCopy,
} from "react-icons/fi";
import { electionAPI, voteAPI } from "../../services/api";
import confetti from "canvas-confetti";

const VoteScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [view, setView] = useState("list");
  const [activeElection, setActiveElection] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [indexNumberInput, setIndexNumberInput] = useState("");

  // New state to store the Hash returned from backend
  const [voteReceipt, setVoteReceipt] = useState(null);

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
        // Silently continue
      }

      const availableElections = activeData.filter((e) => {
        const isVoted = votedIds.has(e.id || e._id);
        const isActive = e.status === "Active";
        return isActive && !isVoted;
      });

      setElections(availableElections);
    } catch (err) {
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
      // Use the utility function
      const isVerified = await verifyDeviceOwnership();

      if (isVerified) {
        setAuthStatus("success");

        const payload = {
          electionId: activeElection.id || activeElection._id,
          candidateId: selectedCandidate,
          indexNumber: indexNumberInput,
        };

        // Capture the response (which now includes voteHash)
        const response = await voteAPI.castVote(payload);

        setVoteReceipt({
          hash: response.data.voteHash,
          title: response.data.electionTitle || activeElection.title,
        });

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
    setVoteReceipt(null);
    fetchActiveElections();
  };

  // --- RENDERING ---

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
          <p className="text-slate-400 mb-6 max-w-sm text-sm leading-relaxed">
            Your ballot for{" "}
            <strong className="text-white">{voteReceipt?.title}</strong> has
            been securely encrypted.
          </p>

          {/* NEW: Display the Verification Hash */}
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl mb-8 max-w-md w-full relative group">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
              <FiHash /> Cryptographic Receipt
            </p>
            <code className="text-xs text-indigo-400 font-mono break-all block">
              {voteReceipt?.hash}
            </code>
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <FiCopy className="text-slate-500" />
            </div>
          </div>

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

  // ... (Ballot View remains the same as previous version) ...
  if (view === "ballot" && activeElection) {
    // Paste the exact same "ballot" view code from my previous response here
    // (I am omitting it to keep this response short, but ensure you keep the full ballot UI)
    return (
      <DashboardLayout>
        {/* ... Include the Ballot UI Code here ... */}
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
                      {candidate.designation || "Independent"}
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

  return null; // Should not reach here
};

export default VoteScreen;
