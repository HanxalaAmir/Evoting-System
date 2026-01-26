import React, { useState, useEffect } from "react";
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
  const [indexCheck, setIndexCheck] = useState("");
  const [checkStatus, setCheckStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("");

  // Auto-dismiss alerts after 3 seconds
  useEffect(() => {
    let timer;
    if (checkStatus === "eligible" || checkStatus === "not_found") {
      timer = setTimeout(() => {
        setCheckStatus("idle");
        setStatusMessage("");
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [checkStatus]);

  const handleCheckStatus = async () => {
    if (!indexCheck.trim()) return;

    setCheckStatus("loading");
    setStatusMessage("");

    try {
      const response = await voteAPI.checkRegistration(indexCheck);

      if (response.data?.eligible) {
        setCheckStatus("eligible");
        setStatusMessage(
          response.data.message || "Verified: Eligible to vote.",
        );
      } else {
        setCheckStatus("not_found");
        setStatusMessage(response.data.message || "Status unknown.");
      }
    } catch (error) {
      setCheckStatus("not_found");
      setStatusMessage(
        error.response?.status === 404
          ? "Index Number not found."
          : "Connection error. Try again.",
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-900 font-sans">
      {/* Background FX */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center ring-1 ring-white/10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20"
        >
          <span className="text-3xl drop-shadow-md">🗳️</span>
        </motion.div>

        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
          University E-Voting
        </h1>
        <p className="text-slate-400 mb-8 text-sm font-medium">
          Secure. Transparent. Efficient.
        </p>

        {/* --- LOGIN SECTION --- */}
        <div className="mb-8 min-h-[60px] relative">
          <AnimatePresence mode="wait">
            {!showLoginOptions ? (
              <motion.div
                key="main-btn"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Button
                  variant="primary"
                  className="w-full shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-500 transition-all hover:-translate-y-0.5"
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
                className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-3 overflow-hidden"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Select Role
                  </span>
                  <button
                    onClick={() => setShowLoginOptions(false)}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <FiX />
                  </button>
                </div>
                <Link to="/login?role=voter" className="block">
                  <Button
                    variant="primary"
                    className="w-full justify-start bg-indigo-600 hover:bg-indigo-500 text-sm h-10 gap-3"
                  >
                    <FiUser className="w-4 h-4" /> Voter Login
                  </Button>
                </Link>
                <Link to="/login?role=admin" className="block">
                  <Button
                    variant="secondary"
                    className="w-full justify-start bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300 text-sm h-10 gap-3"
                  >
                    <FiShield className="w-4 h-4" /> Admin Login
                  </Button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- STATUS CHECKER --- */}
        <div className="pt-6 border-t border-slate-800/50">
          <p className="text-xs text-slate-500 mb-3 uppercase tracking-wide font-bold flex items-center justify-center gap-2">
            <FiSearch /> Check Registration
          </p>

          <div className="flex gap-2 mb-3">
            {/* FIX APPLIED HERE:
                1. flex-1: Takes available width instead of overflowing.
                2. min-w-0: Prevents flexbox overflow issues.
                3. rounded-xl: Matches the button radius.
            */}
            <Input
              placeholder="Enter Index No..."
              className="flex-1 min-w-0 text-sm py-2.5 px-4 bg-slate-950/50 border border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-white placeholder:text-slate-600"
              value={indexCheck}
              onChange={(e) => setIndexCheck(e.target.value)}
            />

            <Button
              variant="secondary"
              className="shrink-0 bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300 w-20 justify-center rounded-xl"
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

          <div className="h-10 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {checkStatus === "loading" && (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full flex justify-center"
                >
                  <div className="h-8 w-3/4 bg-slate-800/50 rounded-lg animate-pulse border border-slate-700/50"></div>
                </motion.div>
              )}

              {checkStatus === "eligible" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xs text-emerald-400 flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20 w-full justify-center"
                >
                  <FiCheck className="shrink-0" /> {statusMessage}
                </motion.div>
              )}

              {checkStatus === "not_found" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xs text-rose-400 flex items-center gap-2 bg-rose-500/10 px-4 py-2 rounded-lg border border-rose-500/20 w-full justify-center"
                >
                  <FiAlertCircle className="shrink-0" /> {statusMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-8 text-[10px] text-slate-600 uppercase tracking-widest font-bold opacity-40">
          AES-256 Secured System
        </div>
      </motion.div>
    </div>
  );
};

export default Landing;
