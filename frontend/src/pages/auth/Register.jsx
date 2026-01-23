import React, { useState } from "react";
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
} from "react-icons/fi";
import { authAPI } from "../../services/api";

const Register = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    indexNo: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const [errors, setErrors] = useState({});

  // --- VALIDATION ---
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!formData.indexNo.trim())
      newErrors.indexNo = "Index Number is required";
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

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (globalError) setGlobalError("");
  };

  const handleNext = async () => {
    setGlobalError("");

    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setIsLoading(true);
      try {
        // Send OTP via API
        // await authAPI.sendOTP({ email: formData.email });

        // Simulating network request for now if endpoint is missing in your backend
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setStep(3);
      } catch (error) {
        console.error("OTP Error:", error);
        setGlobalError("Failed to send OTP. Please check your email.");
      } finally {
        setIsLoading(false);
      }
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
        fullName: formData.fullName,
        username: formData.indexNo, // Using IndexNo as username
        email: formData.email,
        password: formData.password,
        role: "voter",
        otp: formData.otp,
      });

      // Redirect to Login on Success
      navigate("/login");
    } catch (error) {
      console.error("Registration Error:", error);
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
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6 md:p-8 rounded-2xl shadow-2xl max-w-lg w-full ring-1 ring-white/5 mt-4 md:mt-0">
        {/* Step Indicator */}
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
          {/* Connecting Line */}
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

        {/* Global Error */}
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
          {/* --- STEP 1: Personal Details --- */}
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
                  name="fullName"
                  placeholder="John Doe"
                  icon={FiUser}
                  value={formData.fullName}
                  onChange={handleChange}
                  error={errors.fullName}
                />
                <Input
                  label="Index No"
                  name="indexNo"
                  placeholder="V-2024-XXXX"
                  value={formData.indexNo}
                  onChange={handleChange}
                  error={errors.indexNo}
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

          {/* --- STEP 2: Password Setup --- */}
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

              <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20 text-center">
                <FiShield className="mx-auto text-indigo-400 w-6 h-6 mb-2" />
                <p className="text-xs text-indigo-200">
                  Your password will be encrypted using standard protocols.
                  Ensure it is at least 6 characters long.
                </p>
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

          {/* --- STEP 3: OTP Verification --- */}
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
                We've sent a 6-digit code to{" "}
                <span className="text-white font-mono">{formData.email}</span>
              </p>

              <div className="max-w-[200px] mx-auto">
                <Input
                  name="otp"
                  placeholder="123456"
                  className="text-center text-2xl tracking-[0.5em] font-mono border-indigo-500/50 focus:border-indigo-500"
                  value={formData.otp}
                  onChange={handleChange}
                  error={errors.otp}
                  maxLength={6}
                />
              </div>

              <Button
                onClick={handleSubmit}
                variant="primary"
                className="w-full bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                isLoading={isLoading}
              >
                Verify & Register
              </Button>

              <button
                onClick={() => setStep(1)}
                className="text-xs text-slate-500 hover:text-white underline transition-colors"
              >
                Change Email / Re-send
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-8 text-slate-500 text-xs text-center">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-indigo-400 hover:text-white transition-colors hover:underline"
        >
          Login here
        </Link>
      </p>
    </div>
  );
};

export default Register;
