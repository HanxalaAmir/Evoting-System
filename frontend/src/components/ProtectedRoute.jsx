import React, { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authAPI } from "../services/api";
import { FiLoader } from "react-icons/fi";

const ProtectedRoute = ({ allowedRoles }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        setUserRole(response.data.role); // Assuming backend returns { role: 'admin' | 'voter' }
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    verifySession();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-slate-500">
        <FiLoader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // User is logged in but wrong role (e.g., Voter trying to access Admin)
    return <Navigate to="/" replace />;
  }

  // Access Granted
  return <Outlet />;
};

export default ProtectedRoute;
