import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../components/Button";
import Input from "../../components/Input";
import {
  FiArrowLeft,
  FiUser,
  FiLock,
  FiShield,
  FiAlertCircle,
  FiMail,
} from "react-icons/fi";
import { authAPI } from "../../services/api";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 1. Determine Role (Default to 'voter')
  const role = searchParams.get("role") === "admin" ? "admin" : "voter";
  const isAdmin = role === "admin";

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");

  // 2. Form State
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  // 3. Validation Logic
  const validate = () => {
    const newErrors = {};

    // Identifier Validation
    if (!formData.identifier.trim()) {
      newErrors.identifier = isAdmin
        ? "Username is required"
        : "Index Number or Email is required";
    } else if (!isAdmin) {
      // Optional: Check if it's a valid email OR a valid Index format (simple check)
      const isEmail = /\S+@\S+\.\S+/.test(formData.identifier);
      const isIndex = /^[a-zA-Z0-9-]+$/.test(formData.identifier); // Basic alphanumeric check

      if (!isEmail && !isIndex) {
        newErrors.identifier = "Invalid Index Number or Email format";
      }
    }

    // Password Validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 4. Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (globalError) setGlobalError("");
  };

  // 5. Handle Submit (Backend Integration)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setGlobalError("");

    try {
      // Call Centralized API
      // The backend should handle checking if 'identifier' matches an email OR an index number
      await authAPI.login({
        identifier: formData.identifier,
        password: formData.password,
        role: role,
      });

      // Redirect based on verified role
      if (isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/voter/dashboard");
      }
    } catch (error) {
      console.error("Login Failed:", error);
      const msg =
        typeof error === "string"
          ? error
          : error.response?.data?.message ||
            "Invalid credentials. Please try again.";
      setGlobalError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div
          className={`absolute top-10 left-10 w-72 h-72 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob ${isAdmin ? "bg-rose-500/20" : "bg-indigo-500/20"}`}
        ></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-8 rounded-2xl shadow-2xl max-w-md w-full ring-1 ring-white/5"
      >
        {/* Back Button (Premium Style) */}
        <Link
          to="/"
          className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/5"
          title="Back to Home"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>

        {/* Dynamic Header */}
        <div className="text-center mb-8">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg ${isAdmin ? "bg-rose-500/10 text-rose-500 shadow-rose-500/20" : "bg-indigo-500/10 text-indigo-500 shadow-indigo-500/20"}`}
          >
            {isAdmin ? (
              <FiShield className="w-6 h-6" />
            ) : (
              <FiUser className="w-6 h-6" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
            {isAdmin ? "Admin Portal" : "Voter Login"}
          </h2>
          <p className="text-slate-400 text-sm">
            {isAdmin
              ? "Enter your administrative credentials."
              : "Login using your University Index Number or Email."}
          </p>
        </div>

        {/* Global Error Message with Animation */}
        <AnimatePresence>
          {globalError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-center gap-2 justify-center"
            >
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              {globalError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label={isAdmin ? "Username" : "Index Number or Email"}
            name="identifier"
            // Dynamic placeholder based on role
            placeholder={isAdmin ? "admin_user" : "20001234 or student@uni.edu"}
            value={formData.identifier}
            onChange={handleChange}
            error={errors.identifier}
            // Use Mail icon if user types an '@', otherwise User icon
            icon={formData.identifier.includes("@") ? FiMail : FiUser}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={FiLock}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            className={`w-full ${isAdmin ? "bg-rose-600 hover:bg-rose-500 shadow-rose-500/20" : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20"}`}
            isLoading={isLoading}
          >
            {isAdmin ? "Access Dashboard" : "Login to Vote"}
          </Button>
        </form>

        {/* Dynamic Footer Links */}
        <p className="mt-6 text-center text-xs text-slate-500">
          {isAdmin ? (
            <>
              New Administrator?{" "}
              <Link
                to="/admin/register"
                className="text-rose-400 hover:text-rose-300 font-semibold transition-colors hover:underline"
              >
                Register Here
              </Link>
            </>
          ) : (
            <>
              Not registered?{" "}
              <Link
                to="/register"
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors hover:underline"
              >
                Register New Account
              </Link>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
