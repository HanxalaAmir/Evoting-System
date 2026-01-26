import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminRegister from "./pages/auth/AdminRegister";

import VoterDashboard from "./pages/voter/VoterDashboard";
import Vote from "./pages/voter/Vote";
import Results from "./pages/voter/Results";
import Profile from "./pages/voter/Profile";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageElections from "./pages/admin/ManageElections";
import ElectionResults from "./pages/admin/ElectionResults";
import LiveVoting from "./pages/admin/LiveVoting";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/register" element={<AdminRegister />} />

      <Route element={<ProtectedRoute allowedRoles={["voter"]} />}>
        <Route path="/voter/dashboard" element={<VoterDashboard />} />
        <Route path="/voter/vote" element={<Vote />} />
        <Route path="/voter/results" element={<Results />} />
        <Route path="/voter/profile" element={<Profile />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/elections" element={<ManageElections />} />
        <Route path="/admin/results" element={<ElectionResults />} />
        <Route path="/admin/livevoting" element={<LiveVoting />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
