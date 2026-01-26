import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiLoader } from "react-icons/fi";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-slate-500 gap-3">
        <FiLoader className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="font-mono text-sm animate-pulse">Verifying Access...</span>
      </div>
    );
  }

  // --- DEBUGGING LOGS (Check Console F12) ---
  console.group("🛡️ Protected Route Debug");
  console.log("Current User Object:", user);
  console.log("User Role Found:", user?.role);
  console.log("Required Roles:", allowedRoles);
  
  // Check for nesting issue (common bug: user.user.role)
  if (user?.user?.role) {
    console.warn("⚠️ Data Nesting Detected! User role is inside 'user.user'");
  }
  console.groupEnd();
  // ------------------------------------------

  // 1. Not Logged In
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Fix for "Nesting" Bug (if user.user exists)
  const actualRole = user.role || user.user?.role;

  // 3. Role Mismatch
  if (allowedRoles && !allowedRoles.includes(actualRole)) {
    console.error(`⛔ BLOCKED: '${actualRole}' is not allowed. Needs: ${allowedRoles}`);
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;