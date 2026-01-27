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
        <span className="font-mono text-sm animate-pulse tracking-tight">
          SECURE_AUTH_VERIFICATION...
        </span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user.role;

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    const redirectPath =
      userRole === "admin" ? "/admin/dashboard" : "/voter/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
