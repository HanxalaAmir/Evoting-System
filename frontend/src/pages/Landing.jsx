import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../components/Button";
import Input from "../components/Input";
import {
  FiUser,
  FiShield,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiLoader,
  FiSearch,
} from "react-icons/fi";
import { voteAPI } from "../services/api";

const Landing = () => {
  const [showLoginOptions, setShowLoginOptions] = useState(false);

  // Status Check State
  const [indexCheck, setIndexCheck] = useState("");
  const [checkStatus, setCheckStatus] = useState("idle"); // idle | loading | eligible | not_found | error
  const [statusMessage, setStatusMessage] = useState("");

  const handleCheckStatus = async () => {
    if (!indexCheck.trim()) return;

    setCheckStatus("loading");
    setStatusMessage("");

    try {
      // API Call: Check if index number exists in the voter registry
      const response = await voteAPI.checkRegistration(indexCheck);

      // Assuming API returns { eligible: true, message: "..." }
      if (response.data?.eligible) {
        setCheckStatus("eligible");
        setStatusMessage(
          response.data.message ||
            "Registration Verified. You are eligible to vote.",
        );
      } else {
        // Fallback if API returns 200 but eligible is false (e.g. already voted)
        setCheckStatus("not_found");
        setStatusMessage(
          response.data.message ||
            "Status unknown. Please contact administration.",
        );
      }
    } catch (error) {
      console.error("Check Status Failed:", error);
      setCheckStatus("not_found");
      // Differentiate between 404 (Not Found) and other errors
      const msg =
        error.response?.status === 404
          ? "Index Number not found in the active voter list."
          : "Unable to verify status. Please check your connection.";
      setStatusMessage(msg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-900">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      {/* Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center ring-1 ring-white/5"
      >
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20"
        >
          <span className="text-3xl filter drop-shadow-sm">🗳️</span>
        </motion.div>

        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
          University E-Voting
        </h1>
        <p className="text-slate-400 mb-8 text-sm font-normal leading-relaxed">
          Secure. Transparent. Efficient.
        </p>

        {/* --- DYNAMIC LOGIN SECTION --- */}
        <div className="mb-8 min-h-[60px] relative">
          <AnimatePresence mode="wait">
            {!showLoginOptions ? (
              <motion.div
                key="main-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Button
                  variant="primary"
                  size="md"
                  className="w-full gap-2 shadow-lg shadow-indigo-500/25 bg-indigo-600 hover:bg-indigo-500 transition-all hover:scale-[1.02]"
                  onClick={() => setShowLoginOptions(true)}
                >
                  Login to Portal
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="options"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700 overflow-hidden"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Select Role
                  </span>
                  <button
                    onClick={() => setShowLoginOptions(false)}
                    className="text-slate-500 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-full"
                  >
                    <FiX />
                  </button>
                </div>

                <Link to="/login?role=voter" className="block">
                  <Button
                    variant="primary"
                    className="w-full gap-2 justify-start bg-indigo-600 hover:bg-indigo-500 border-0 h-10 text-sm"
                  >
                    <FiUser /> Voter Login
                  </Button>
                </Link>

                <Link to="/login?role=admin" className="block">
                  <Button
                    variant="secondary"
                    className="w-full gap-2 justify-start bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600 h-10 text-sm"
                  >
                    <FiShield /> Admin Login
                  </Button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- STATUS CHECK --- */}
        <div className="pt-6 border-t border-slate-800/50">
          <p className="text-xs text-slate-500 mb-3 uppercase tracking-wide font-semibold flex items-center justify-center gap-2">
            <FiSearch className="text-slate-600" /> Check Registration Status
          </p>

          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Enter Index No..."
              className="text-sm py-2 bg-slate-950/50 border-slate-700 focus:border-indigo-500"
              value={indexCheck}
              onChange={(e) => {
                setIndexCheck(e.target.value);
                if (checkStatus !== "idle") setCheckStatus("idle");
              }}
            />
            <Button
              variant="secondary"
              size="md"
              className="shrink-0 bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300"
              onClick={handleCheckStatus}
              disabled={checkStatus === "loading" || !indexCheck}
            >
              {checkStatus === "loading" ? (
                <FiLoader className="animate-spin" />
              ) : (
                "Check"
              )}
            </Button>
          </div>

          {/* Status Message Animation */}
          <AnimatePresence>
            {checkStatus === "eligible" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-emerald-400 flex items-center justify-center gap-2 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20"
              >
                <FiCheck className="text-emerald-500" /> {statusMessage}
              </motion.div>
            )}
            {checkStatus === "not_found" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-rose-400 flex items-center justify-center gap-2 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20"
              >
                <FiAlertCircle className="text-rose-500" /> {statusMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 text-[10px] text-slate-600 uppercase tracking-widest font-bold opacity-50">
          AES-256 Secured System
        </div>
      </motion.div>
    </div>
  );
};

export default Landing;
