import React, { useState } from "react";
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
} from "react-icons/fi";
import { authAPI } from "../../services/api";

const AdminRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    otp: "",
    secretCode: "",
  });

  const [errors, setErrors] = useState({});

  // --- VALIDATION ---
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
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
      setErrors({ otp: "Please enter the 6-digit OTP sent to your email." });
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

  // --- HANDLERS ---
  const handleNext = async () => {
    if (step === 1 && validateStep1()) {
      setIsLoading(true);
      try {
        // TODO: Replace with real API call: await authAPI.sendOTP(formData.email);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setStep(2);
      } catch (error) {
        setErrors({ form: "Failed to send OTP. Please try again." });
      } finally {
        setIsLoading(false);
      }
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await authAPI.register({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: "admin",
        secretCode: formData.secretCode,
      });

      // Redirect on success
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Registration Failed:", error);
      setErrors({
        form:
          typeof error === "string"
            ? error
            : "Registration failed. Please check your credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 bg-slate-900/60 backdrop-blur-xl border border-rose-500/30 p-8 rounded-2xl shadow-2xl shadow-rose-900/20 max-w-md w-full ring-1 ring-white/5">
        {/* Back Button */}
        <Link
          to="/login?role=admin"
          className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-rose-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/20">
            <FiShield className="text-white w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Admin Registration
          </h2>
          <p className="text-slate-400 text-sm mt-2">Restricted Access Only</p>
        </div>

        {/* Global Error */}
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
          {/* --- STEP 1: ACCOUNT DETAILS --- */}
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
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  error={errors.fullName}
                />
                <Input
                  label="Username"
                  placeholder="admin_john"
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
                className="w-full bg-rose-600 hover:bg-rose-500 shadow-rose-500/20 mt-4"
                isLoading={isLoading}
              >
                Verify Email
              </Button>
            </motion.div>
          )}

          {/* --- STEP 2: OTP VERIFICATION --- */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 text-center"
            >
              <p className="text-slate-300 text-sm">
                Enter the OTP sent to{" "}
                <span className="text-rose-400 font-mono">
                  {formData.email}
                </span>
              </p>
              <div className="max-w-[200px] mx-auto">
                <Input
                  placeholder="123456"
                  className="text-center text-2xl tracking-[0.5em] font-mono border-rose-500/50 focus:border-rose-500"
                  value={formData.otp}
                  onChange={(e) =>
                    setFormData({ ...formData, otp: e.target.value })
                  }
                  error={errors.otp}
                  maxLength={6}
                />
              </div>
              <Button
                onClick={handleNext}
                variant="primary"
                className="w-full bg-rose-600 hover:bg-rose-500 shadow-rose-500/20"
              >
                Verify OTP
              </Button>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-slate-500 hover:text-white underline transition-colors"
              >
                Change Email
              </button>
            </motion.div>
          )}

          {/* --- STEP 3: SECRET CODE --- */}
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
                <FiAlertTriangle className="text-rose-500 mt-1 shrink-0" />
                <p className="text-xs text-rose-200">
                  This step requires a High-Level Authorization Code provided by
                  the System Administrator.
                </p>
              </div>

              <Input
                label="Secret Administration Code"
                type="password"
                placeholder="ENTER-CODE-HERE"
                icon={FiKey}
                value={formData.secretCode}
                onChange={(e) =>
                  setFormData({ ...formData, secretCode: e.target.value })
                }
                error={errors.secretCode}
                className="font-mono text-center"
              />

              <Button
                onClick={handleSubmit}
                variant="primary"
                className="w-full bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 shadow-lg shadow-rose-500/20"
                isLoading={isLoading}
              >
                Complete Registration
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 text-center border-t border-slate-700/50 pt-4">
          <p className="text-xs text-slate-500">
            Already have an admin account?{" "}
            <Link
              to="/login?role=admin"
              className="text-rose-400 hover:text-rose-300 font-semibold transition-colors hover:underline"
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
