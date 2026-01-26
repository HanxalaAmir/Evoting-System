import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
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

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const role = searchParams.get("role") === "admin" ? "admin" : "voter";
  const isAdmin = role === "admin";

  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (globalError) {
      const timer = setTimeout(() => setGlobalError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [globalError]);

  const validate = () => {
    const newErrors = {};
    if (!formData.identifier.trim()) {
      newErrors.identifier = isAdmin
        ? "Username is required"
        : "Index Number or Email is required";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setGlobalError("");

    try {
      const res = await login({
        identifier: formData.identifier,
        password: formData.password,
        role: role,
      });

      if (res.role === "admin") navigate("/admin/dashboard");
      else navigate("/voter/dashboard");
    } catch (error) {
      console.error("Login Failed:", error);
      setGlobalError(error.response?.data?.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div
          className={`absolute top-10 left-10 w-72 h-72 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob ${isAdmin ? "bg-rose-500/20" : "bg-indigo-500/20"}`}
        ></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-8 rounded-2xl shadow-2xl max-w-md w-full ring-1 ring-white/5"
      >
        <Link
          to="/"
          className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/5"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>

        {isPageLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="w-12 h-12 bg-slate-700 rounded-xl mx-auto mb-4"></div>
            <div className="h-6 bg-slate-700 rounded w-1/2 mx-auto mb-2"></div>
            <div className="h-4 bg-slate-800 rounded w-3/4 mx-auto mb-8"></div>
            <div className="space-y-4">
              <div className="h-12 bg-slate-800 rounded-lg w-full"></div>
              <div className="h-12 bg-slate-800 rounded-lg w-full"></div>
              <div className="h-12 bg-slate-700 rounded-lg w-full mt-6"></div>
            </div>
          </div>
        ) : (
          <>
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
                  : "Login using your Index Number."}
              </p>
            </div>

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

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label={isAdmin ? "Username" : "Index Number"}
                name="identifier"
                placeholder={isAdmin ? "admin_user" : "e.g. 20001234"}
                value={formData.identifier}
                onChange={handleChange}
                error={errors.identifier}
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

            <p className="mt-6 text-center text-xs text-slate-500">
              {isAdmin ? (
                <>
                  New Admin?{" "}
                  <Link
                    to="/admin/register"
                    className="text-rose-400 hover:underline font-semibold ml-1"
                  >
                    Register Here
                  </Link>
                </>
              ) : (
                <>
                  Not registered?{" "}
                  <Link
                    to="/register"
                    className="text-indigo-400 hover:underline font-semibold ml-1"
                  >
                    Register New Account
                  </Link>
                </>
              )}
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Login;