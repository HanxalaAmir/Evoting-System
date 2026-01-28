import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../components/Button";
import Input from "../../components/Input";
import {
  FiUser,
  FiMail,
  FiLock,
  FiCheckCircle,
  FiArrowRight,
  FiArrowLeft,
  FiAlertCircle,
  FiShield,
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

const Register = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const [otpTimer, setOtpTimer] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);

  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
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
    if (!formData.username.trim())
      newErrors.username = "Index Number is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (formData.password.length < 6)
      newErrors.password = "Password must be 6+ chars";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (globalError) setGlobalError("");
  };

  const sendOtp = async () => {
    try {
      await authAPI.sendOTP({ email: formData.email, type: "register" });
      return true;
    } catch (error) {
      setGlobalError(
        error.response?.data?.message || "Failed to send OTP. Try again.",
      );
      return false;
    }
  };

  const handleNext = async () => {
    setGlobalError("");

    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setIsLoading(true);
      try {
        const success = await sendOtp();
        if (success) {
          setStep(3);
          setOtpTimer(30);
        }
      } catch (error) {
        setGlobalError("Failed to initiate verification.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;

    setIsLoading(true);
    setGlobalError("");

    try {
      const success = await sendOtp();
      if (success) {
        const newAttempts = resendAttempts + 1;
        setResendAttempts(newAttempts);

        if (newAttempts >= 3) {
          setOtpTimer(1200);
          setGlobalError("Max attempts reached. Wait 20 minutes.");
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
    if (formData.otp.length !== 6) {
      setErrors({ otp: "Please enter the 6-digit OTP" });
      return;
    }

    setIsLoading(true);
    setGlobalError("");

    try {
      await authAPI.register({
        fullName: formData.full_name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: "voter",
        otp: formData.otp,
      });

      navigate("/login?role=voter");
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      setGlobalError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6 md:p-8 rounded-2xl shadow-2xl max-w-lg w-full ring-1 ring-white/5 mt-4 md:mt-0">
        <div className="flex justify-between items-center mb-8 px-2 md:px-4">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex flex-col items-center z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step >= num
                    ? "bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/30"
                    : "bg-slate-800 text-slate-500 border border-slate-700"
                }`}
              >
                {step > num ? <FiCheckCircle /> : num}
              </div>
              <span className="text-[10px] text-slate-500 mt-2 uppercase tracking-wider font-semibold">
                {num === 1 ? "Details" : num === 2 ? "Security" : "Verify"}
              </span>
            </div>
          ))}
          <div className="absolute top-[44px] md:top-[52px] left-10 right-10 md:left-16 md:right-16 h-[2px] bg-slate-800 -z-0">
            <div
              className="h-full bg-indigo-600 transition-all duration-500"
              style={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}
            ></div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-6">
          {step === 1
            ? "Voter Registration"
            : step === 2
              ? "Set Password"
              : "Verify & Finish"}
        </h2>

        <AnimatePresence>
          {globalError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-xs flex items-center gap-2 justify-center"
            >
              <FiAlertCircle className="w-4 h-4" /> {globalError}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="full_name"
                  placeholder="John Doe"
                  icon={FiUser}
                  value={formData.full_name}
                  onChange={handleChange}
                  error={errors.full_name}
                />
                <Input
                  label="Index No"
                  name="username"
                  placeholder="V-2024-XXXX"
                  value={formData.username}
                  onChange={handleChange}
                  error={errors.username}
                />
              </div>
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="student@university.edu"
                icon={FiMail}
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />

              <div className="pt-4 flex justify-end">
                <Button
                  onClick={handleNext}
                  variant="primary"
                  className="gap-2 w-full md:w-auto bg-indigo-600 hover:bg-indigo-500"
                >
                  Next Step <FiArrowRight />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  icon={FiLock}
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                />
                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                />
              </div>

              <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20 text-center text-xs text-indigo-200">
                <FiShield className="mx-auto text-indigo-400 w-6 h-6 mb-2" />
                Passwords must be at least 6 characters and will be securely
                encrypted.
              </div>

              <div className="pt-2 flex justify-between">
                <Button
                  onClick={() => setStep(1)}
                  variant="ghost"
                  className="gap-2 text-slate-400 hover:text-white"
                >
                  <FiArrowLeft /> Back
                </Button>
                <Button
                  onClick={handleNext}
                  variant="primary"
                  isLoading={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-500"
                >
                  Send OTP
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-6 text-center"
            >
              <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMail className="w-8 h-8 text-indigo-400" />
              </div>

              <p className="text-slate-400 text-sm">
                Enter the 6-digit code sent to{" "}
                <span className="text-white font-mono">{formData.email}</span>
              </p>

              <div className="max-w-[200px] mx-auto relative">
                <Input
                  name="otp"
                  placeholder="123456"
                  className="text-center text-2xl tracking-[0.5em] font-mono border-indigo-500/50 focus:border-indigo-500"
                  value={formData.otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setFormData((prev) => ({ ...prev, otp: val }));
                    if (errors.otp)
                      setErrors((prev) => ({ ...prev, otp: null }));
                  }}
                  error={errors.otp}
                  maxLength={6}
                />
                {formData.otp.length === 6 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                    <FiCheck className="w-6 h-6" />
                  </div>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                variant="primary"
                className="w-full bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                isLoading={isLoading}
              >
                Verify & Register
              </Button>

              <div className="text-xs flex flex-col gap-1 items-center">
                {otpTimer > 0 ? (
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <FiClock /> Resend available in{" "}
                    <span className="text-indigo-400 font-mono font-bold">
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
                  className="text-slate-600 hover:text-indigo-400 mt-2 uppercase text-[10px] font-bold"
                >
                  Restart Registration
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-8 text-slate-500 text-xs text-center">
        Already have an account?{" "}
        <Link
          to="/login?role=voter"
          className="text-indigo-400 hover:text-white font-bold hover:underline"
        >
          Login here
        </Link>
      </p>
    </div>
  );
};

export default Register;
