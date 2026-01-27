import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../components/Button";
import Input from "../../components/Input";
import {
  FiShield,
  FiMail,
  FiLock,
  FiKey,
  FiAlertTriangle,
  FiArrowLeft,
  FiAlertCircle,
  FiClock,
  FiCheck,
  FiRefreshCw,
} from "react-icons/fi";
import { authAPI } from "../../services/api";
import {
  formatDate,
  formatTime,
  calculatePercentage,
  truncateText,
} from "../../utils/helpers";

const AdminRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    otp: "",
    secretCode: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.full_name.trim())
      newErrors.full_name = "Full Name is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Valid email is required";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    if (formData.otp.length !== 6) {
      setErrors({ otp: "Please enter the 6-digit OTP code." });
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.secretCode.trim()) {
      setErrors({ secretCode: "Authorization Code is required." });
      return false;
    }
    return true;
  };

  const sendOtp = async () => {
    try {
      await authAPI.sendOTP({ email: formData.email, type: "register" });
      return true;
    } catch (error) {
      setErrors({
        form: error.response?.data?.message || "Failed to send OTP.",
      });
      return false;
    }
  };

  const handleNext = async () => {
    if (step === 1 && validateStep1()) {
      setIsLoading(true);
      setErrors({});
      try {
        const success = await sendOtp();
        if (success) {
          setStep(2);
          setOtpTimer(30);
        }
      } catch (error) {
        setErrors({ form: "Failed to connect to server." });
      } finally {
        setIsLoading(false);
      }
    } else if (step === 2 && validateStep2()) {
      setIsLoading(true);
      setErrors({});
      try {
        await authAPI.verifyOTP({
          email: formData.email,
          otp: formData.otp,
          type: "register",
        });
        setStep(3);
      } catch (error) {
        setErrors({
          otp:
            error.response?.data?.message ||
            "Invalid OTP code. Please check and try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    setIsLoading(true);
    setErrors({});
    try {
      const success = await sendOtp();
      if (success) {
        const newAttempts = resendAttempts + 1;
        setResendAttempts(newAttempts);
        if (newAttempts >= 3) {
          setOtpTimer(1200);
          setErrors({ form: "Max attempts reached. Please wait 20 minutes." });
        } else {
          setOtpTimer(30);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;
    setIsLoading(true);
    setErrors({});
    try {
      await authAPI.register({
        full_name: formData.full_name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        otp: formData.otp,
        role: "admin",
        secretCode: formData.secretCode,
      });
      navigate("/login?role=admin");
    } catch (error) {
      setErrors({
        form:
          error.response?.data?.message ||
          "Registration failed. Please check your credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
      </div>

      <div className="relative z-10 bg-slate-900/60 backdrop-blur-xl border border-rose-500/30 p-8 rounded-2xl shadow-2xl shadow-rose-900/20 max-w-md w-full ring-1 ring-white/5">
        <Link
          to="/login?role=admin"
          className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-rose-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/20">
            <FiShield className="text-white w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Admin Registration
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Step {step} of 3:{" "}
            {step === 1
              ? "Account Details"
              : step === 2
                ? "Verification"
                : "Authorization"}
          </p>
        </div>

        {errors.form && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-center gap-2 justify-center"
          >
            <FiAlertCircle className="w-4 h-4 shrink-0" />
            {errors.form}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  error={errors.full_name}
                />
                <Input
                  label="Username"
                  placeholder="admin_E1"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  error={errors.username}
                />
              </div>
              <Input
                label="Email"
                type="email"
                placeholder="admin@uni.edu"
                icon={FiMail}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                error={errors.email}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={FiLock}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                error={errors.password}
              />
              <Button
                onClick={handleNext}
                variant="primary"
                className="w-full bg-rose-600 hover:bg-rose-500 shadow-rose-500/20 mt-4 py-3"
                isLoading={isLoading}
              >
                Send Verification Code
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 text-center"
            >
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <p className="text-slate-300 text-sm mb-4">
                  We sent a 6-digit code to{" "}
                  <span className="text-rose-400 font-mono font-bold">
                    {formData.email}
                  </span>
                </p>
                <div className="relative max-w-[240px] mx-auto">
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="------"
                    className={`w-full bg-slate-900 border ${errors.otp ? "border-red-500" : "border-rose-500/30"} rounded-xl py-4 text-center text-3xl font-mono tracking-[0.5em] text-white focus:border-rose-500 outline-none placeholder:text-slate-700`}
                    value={formData.otp}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        otp: e.target.value.replace(/[^0-9]/g, ""),
                      })
                    }
                  />
                  {formData.otp.length === 6 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                      <FiCheck className="w-6 h-6" />
                    </div>
                  )}
                </div>
                {errors.otp && (
                  <p className="text-red-400 text-xs mt-2">{errors.otp}</p>
                )}
              </div>
              <Button
                onClick={handleNext}
                variant="primary"
                className="w-full bg-rose-600 hover:bg-rose-500 shadow-rose-500/20 py-3"
                isLoading={isLoading}
              >
                Verify & Continue
              </Button>
              <div className="text-xs flex flex-col gap-2 items-center pt-2">
                {otpTimer > 0 ? (
                  <span className="text-slate-500 flex items-center gap-1.5 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
                    <FiClock className="animate-pulse" /> Resend available in{" "}
                    <span className="text-rose-400 font-mono font-bold">
                      {formatTimer(otpTimer)}
                    </span>
                  </span>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-slate-400 hover:text-white underline flex items-center gap-1"
                  >
                    <FiRefreshCw className="w-3 h-3" /> Resend OTP Code
                  </button>
                )}
                <button
                  onClick={() => {
                    setStep(1);
                    setOtpTimer(0);
                    setResendAttempts(0);
                  }}
                  className="text-slate-600 hover:text-rose-400 text-[10px] uppercase font-bold mt-4"
                >
                  Change Email Address
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3">
                <FiAlertTriangle className="text-rose-500 mt-1 shrink-0 w-5 h-5" />
                <p className="text-xs text-rose-200 leading-relaxed">
                  <strong>Security Check:</strong> Authorization code required
                  to prevent unauthorized system admin access.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block ml-1">
                  Secret Key
                </label>
                <div className="relative">
                  <FiKey className="absolute left-4 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    placeholder="ENTER-ADMIN-KEY"
                    className={`w-full bg-slate-950/50 border ${errors.secretCode ? "border-red-500" : "border-slate-700"} rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:border-rose-500 outline-none font-mono text-center tracking-widest`}
                    value={formData.secretCode}
                    onChange={(e) =>
                      setFormData({ ...formData, secretCode: e.target.value })
                    }
                  />
                </div>
                {errors.secretCode && (
                  <p className="text-red-400 text-xs ml-1">
                    {errors.secretCode}
                  </p>
                )}
              </div>
              <Button
                onClick={handleSubmit}
                variant="primary"
                className="w-full bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 shadow-lg shadow-rose-500/20 py-3"
                isLoading={isLoading}
              >
                Complete Registration
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 text-center border-t border-slate-700/50 pt-4">
          <p className="text-xs text-slate-500">
            Already have an admin account?{" "}
            <Link
              to="/login?role=admin"
              className="text-rose-400 hover:text-rose-300 font-bold transition-colors hover:underline"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
