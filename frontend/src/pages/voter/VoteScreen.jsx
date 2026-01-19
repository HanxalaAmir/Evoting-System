import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  FiClock,
  FiCheck,
  FiAlertTriangle,
  FiShield,
  FiArrowRight,
  FiChevronLeft,
  FiCheckCircle,
  FiLock,
  FiHash,
} from "react-icons/fi";

const VoteScreen = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  );
  const [view, setView] = useState("list");
  const [activeElection, setActiveElection] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Modal & Submission States
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [indexId, setIndexId] = useState(""); // State for the Index ID Input

  useEffect(() => {
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

  // --- MOCK DATA ---
  const elections = [
    {
      id: 1,
      title: "Student Council President 2026",
      description: "Cast your vote for the next student body leader.",
      deadline: "2h 45m left",
      candidates: [
        {
          id: 101,
          name: "Sarah Jenkins",
          party: "Future Vision",
          color: "from-purple-600 to-indigo-600",
          tagColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
          slogan: "Innovation for everyone.",
          initial: "S",
        },
        {
          id: 102,
          name: "Michael Chen",
          party: "Tech Forward",
          color: "from-blue-500 to-cyan-500",
          tagColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          slogan: "Digital campus transformation.",
          initial: "M",
        },
        {
          id: 103,
          name: "Jessica Alba",
          party: "Green Campus",
          color: "from-emerald-500 to-teal-500",
          tagColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          slogan: "Sustainable living starts now.",
          initial: "J",
        },
        {
          id: 104,
          name: "David Ross",
          party: "Student Voice",
          color: "from-orange-500 to-red-500",
          tagColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
          slogan: "Your voice, my command.",
          initial: "D",
        },
      ],
    },
    {
      id: 2,
      title: "CS Dept Representative",
      description: "Select the representative for the Computer Science board.",
      deadline: "1 day left",
      candidates: [
        {
          id: 201,
          name: "Emily Blunt",
          party: "Code Warriors",
          color: "from-rose-500 to-pink-600",
          tagColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          slogan: "Better labs, better code.",
          initial: "E",
        },
        {
          id: 202,
          name: "John Krasinski",
          party: "AI Alliance",
          color: "from-amber-500 to-orange-600",
          tagColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          slogan: "Embracing the future of AI.",
          initial: "J",
        },
      ],
    },
  ];

  // --- HANDLERS ---
  const openBallot = (election) => {
    setActiveElection(election);
    setSelectedCandidate(null);
    setIndexId(""); // Reset input
    setView("ballot");
    window.scrollTo(0, 0);
  };

  const closeConfirmModal = () => {
    setShowConfirm(false);
    setIndexId(""); // Clear ID on close
  };

  const handleVote = () => {
    if (!indexId.trim()) return; // Validation

    setIsSubmitting(true);
    // Simulate API Call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowConfirm(false);
      setView("success");
      window.scrollTo(0, 0);
    }, 1500);
  };

  const resetFlow = () => {
    setView("list");
    setActiveElection(null);
    setSelectedCandidate(null);
    setIndexId("");
  };

  // --- VIEW 1: SUCCESS SCREEN ---
  if (view === "success") {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in px-4">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-emerald-500/20">
            <FiCheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Vote Recorded</h2>
          <p className="text-slate-400 mb-8 max-w-sm text-sm">
            Your ballot for{" "}
            <strong className="text-white">
              {
                activeElection.candidates.find(
                  (c) => c.id === selectedCandidate,
                )?.name
              }
            </strong>{" "}
            has been securely encrypted.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/results")}
              className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium border border-slate-700 transition-all"
            >
              View Analytics
            </button>
            <button
              onClick={resetFlow}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-all shadow-lg shadow-emerald-500/20"
            >
              Back to Home
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // --- VIEW 2: BALLOT INTERFACE ---
  if (view === "ballot" && activeElection) {
    return (
      <DashboardLayout>
        <div className="animate-fade-in max-w-6xl mx-auto pb-40">
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

          {/* Aesthetic Title Section */}
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
                key={candidate.id}
                onClick={() => setSelectedCandidate(candidate.id)}
                className={`
                  relative flex items-center gap-5 p-4 rounded-[24px] border cursor-pointer transition-all duration-300 group overflow-hidden
                  ${
                    selectedCandidate === candidate.id
                      ? "bg-slate-800/80 border-white/20 ring-1 ring-white/10 shadow-2xl"
                      : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600"
                  }
                `}
              >
                {/* Active Indicator Strip */}
                {selectedCandidate === candidate.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
                )}

                {/* Avatar */}
                <div
                  className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-white text-lg font-bold shadow-inner bg-gradient-to-br ${candidate.color}`}
                >
                  {candidate.initial}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3
                      className={`text-base font-bold truncate transition-colors ${selectedCandidate === candidate.id ? "text-white" : "text-slate-200"}`}
                    >
                      {candidate.name}
                    </h3>
                    {selectedCandidate === candidate.id && (
                      <div className="bg-emerald-500 text-white rounded-full p-0.5 animate-scale-in shadow-lg shadow-emerald-500/30">
                        <FiCheck className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {/* Tag Styling */}
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${candidate.tagColor}`}
                    >
                      {candidate.party}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 italic truncate opacity-60">
                    "{candidate.slogan}"
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Floating Action Capsule */}
          <div
            className={`fixed bottom-8 left-0 right-0 z-50 flex justify-center transition-all duration-500 ${
              selectedCandidate
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0 pointer-events-none"
            }`}
          >
            <div className="w-[95%] max-w-3xl bg-slate-900/85 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-2xl flex items-center justify-between gap-8 ring-1 ring-black/40">
              {" "}
              <div className="flex flex-col min-w-0">
                {" "}
                <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
                  {" "}
                  Voting For{" "}
                </span>{" "}
                <span className="text-base font-semibold text-white truncate">
                  {" "}
                  {
                    activeElection.candidates.find(
                      (c) => c.id === selectedCandidate,
                    )?.name
                  }{" "}
                </span>{" "}
              </div>{" "}
              <button
                onClick={() => setShowConfirm(true)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold uppercase tracking-wider rounded-full shadow-md shadow-indigo-500/30 transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
              >
                {" "}
                Submit Vote <FiArrowRight className="text-sm" />{" "}
              </button>{" "}
            </div>{" "}
          </div>

          {/* --- CONFIRMATION MODAL WITH ID INPUT --- */}
          {showConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
              <div className="bg-slate-900 border border-slate-700 p-6 rounded-[24px] shadow-2xl w-full max-w-sm animate-slide-up relative overflow-hidden">
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
                      Verify identity to proceed
                    </p>
                  </div>
                </div>

                {/* Candidate Preview */}
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 mb-6 flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${activeElection.candidates.find((c) => c.id === selectedCandidate)?.color}`}
                  >
                    {
                      activeElection.candidates.find(
                        (c) => c.id === selectedCandidate,
                      )?.initial
                    }
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {
                        activeElection.candidates.find(
                          (c) => c.id === selectedCandidate,
                        )?.name
                      }
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                      {
                        activeElection.candidates.find(
                          (c) => c.id === selectedCandidate,
                        )?.party
                      }
                    </p>
                  </div>
                </div>

                {/* --- NEW: Index ID Input Field --- */}
                <div className="mb-6">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block pl-1">
                    Enter Your Index ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiHash className="text-slate-500" />
                    </div>
                    <input
                      type="text"
                      value={indexId}
                      onChange={(e) => setIndexId(e.target.value)}
                      placeholder="e.g. IDX-2024-001"
                      className="w-full bg-slate-950/50 border border-slate-700 text-white text-sm rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FiLock className="text-slate-600 w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1.5">
                    <FiShield className="w-3 h-3 text-emerald-500" /> Secure
                    verification required.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={closeConfirmModal}
                    className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVote}
                    disabled={!indexId.trim() || isSubmitting}
                    className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition-all flex justify-center items-center gap-2 ${
                      !indexId.trim() || isSubmitting
                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20"
                    }`}
                  >
                    {isSubmitting ? "Verifying..." : "Secure Vote"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // --- VIEW 3: ELECTION LIST (Compact Grid) ---
  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
              <FiShield className="text-rose-500" /> Active Ballots
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Select an election below to proceed.
            </p>
          </div>
          <div className="px-3 py-1 bg-slate-900 rounded-lg border border-slate-700 text-[10px] font-mono text-slate-400">
            {currentTime}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {elections.map((election) => (
            <div
              key={election.id}
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
                  <FiClock className="w-3 h-3" /> {election.deadline}
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
      </div>
    </DashboardLayout>
  );
};

export default VoteScreen;
