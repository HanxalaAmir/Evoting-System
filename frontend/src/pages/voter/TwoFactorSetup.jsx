import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../layouts/DashboardLayout";
import Button from "../../components/Button";
import {
  FiSmartphone,
  FiCheckCircle,
  FiLock,
  FiArrowLeft,
  FiCopy,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";
import { authAPI } from "../../services/api";

const TwoFactorSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [code, setCode] = useState(["", "", "", "", "", ""]);

  // Data State
  const [qrData, setQrData] = useState(null); // { secret, qrCodeUrl }
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);

  // --- STEP 1: FETCH QR CODE ---
  useEffect(() => {
    const initSetup = async () => {
      try {
        setIsLoading(true);
        // Request backend to generate 2FA secret and QR code
        const response = await authAPI.enable2FA();
        setQrData(response.data);
      } catch (err) {
        console.error("2FA Setup Error:", err);
        setError("Failed to initialize 2FA. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    };

    if (step === 1) {
      initSetup();
    }
  }, [step]);

  // --- HANDLERS ---
  const handleInputChange = (value, index) => {
    if (isNaN(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerify = async () => {
    const token = code.join("");
    if (token.length !== 6) return;

    setIsVerifying(true);
    setError(null);

    try {
      // Verify the token with the backend
      await authAPI.verify2FA(token);
      setStep(3); // Success step
    } catch (err) {
      console.error("Verification Failed:", err);
      setError(
        err.response?.data?.message || "Invalid code. Please try again.",
      );
      setCode(["", "", "", "", "", ""]); // Reset code on failure
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = () => {
    if (qrData?.secret) {
      navigator.clipboard.writeText(qrData.secret);
      alert("Secret code copied to clipboard!");
    }
  };

  // --- RENDERING ---
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto pt-10 px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate("/voter/profile")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors text-sm font-semibold group"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />{" "}
          Back to Profile
        </button>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden ring-1 ring-white/5 min-h-[500px] flex flex-col justify-center">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-6 left-0 right-0 mx-6 bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl flex items-center justify-center gap-2 text-sm z-20"
              >
                <FiAlertCircle className="w-4 h-4" /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* --- STEP 1: SCAN QR CODE --- */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="text-center relative z-10"
              >
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700 shadow-xl">
                  <FiSmartphone className="text-indigo-400 w-8 h-8" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  Setup 2-Factor Authentication
                </h2>
                <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto leading-relaxed">
                  Scan the QR code below with your authenticator app (Google
                  Authenticator, Authy, etc.) to secure your account.
                </p>

                {isLoading ? (
                  <div className="py-12 flex flex-col items-center text-slate-500">
                    <FiLoader className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
                    <p className="text-xs">Generating Secure Key...</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white p-4 rounded-xl inline-block mb-6 shadow-lg border-4 border-slate-800">
                      {/* Use Real QR Code from API */}
                      {qrData?.qrCodeUrl ? (
                        <img
                          src={qrData.qrCodeUrl}
                          alt="QR Code"
                          className="w-40 h-40"
                        />
                      ) : (
                        // Fallback if API fails to provide image but gives text
                        <div className="w-40 h-40 flex items-center justify-center text-slate-900 font-bold text-xs">
                          QR Code Loading...
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 flex items-center justify-between max-w-xs mx-auto mb-8 gap-4">
                      <span className="text-xs text-slate-400 font-mono tracking-wider truncate">
                        {qrData?.secret || "Loading..."}
                      </span>
                      <button
                        onClick={copyToClipboard}
                        className="text-indigo-400 hover:text-indigo-300 transition-colors p-1.5 hover:bg-slate-800 rounded-md"
                        title="Copy Code"
                      >
                        <FiCopy />
                      </button>
                    </div>

                    <Button
                      variant="primary"
                      className="w-full max-w-xs bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 mx-auto"
                      onClick={() => setStep(2)}
                      disabled={!qrData}
                    >
                      I've Scanned the Code
                    </Button>
                  </>
                )}
              </motion.div>
            )}

            {/* --- STEP 2: VERIFY CODE --- */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center relative z-10"
              >
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700">
                  <FiLock className="text-emerald-400 w-8 h-8" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  Verify Authentication
                </h2>
                <p className="text-slate-400 text-sm mb-8">
                  Enter the 6-digit code generated by your authenticator app to
                  confirm setup.
                </p>

                <div className="flex justify-center gap-2 md:gap-3 mb-8">
                  {code.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleInputChange(e.target.value, idx)}
                      className="w-10 h-12 md:w-12 md:h-14 bg-slate-950 border border-slate-700 rounded-xl text-center text-xl font-bold text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder-slate-700"
                      placeholder="•"
                    />
                  ))}
                </div>

                <div className="flex gap-3 justify-center">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    className="bg-emerald-600 hover:bg-emerald-500 w-40 justify-center shadow-lg shadow-emerald-500/20"
                    onClick={handleVerify}
                    disabled={code.some((c) => c === "") || isVerifying}
                  >
                    {isVerifying ? (
                      <>
                        <FiLoader className="animate-spin mr-2" /> Verifying...
                      </>
                    ) : (
                      "Verify & Enable"
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* --- STEP 3: SUCCESS --- */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 relative z-10"
              >
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
                  <FiCheckCircle className="text-emerald-400 w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  2FA Enabled Successfully
                </h2>
                <p className="text-slate-400 text-sm mb-8 max-w-sm mx-auto">
                  Your account is now secured. You will be required to enter a
                  TOTP code during future logins.
                </p>
                <Button
                  variant="primary"
                  className="w-full max-w-xs bg-slate-700 hover:bg-slate-600 mx-auto"
                  onClick={() => navigate("/voter/profile")}
                >
                  Return to Profile
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TwoFactorSetup;
