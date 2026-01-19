import React from 'react';
import { Routes, Route } from 'react-router-dom';

// --- IMPORT ALL PAGES HERE ---
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminRegister from './pages/auth/AdminRegister';

// Voter Pages
import Dashboard from './pages/voter/VoterDashboard';
import VoteScreen from './pages/voter/VoteScreen';
import Results from './pages/voter/Results';
import Profile from './pages/voter/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageElections from './pages/admin/ManageElections';
import ElectionResults from './pages/admin/ElectionResults';
import LiveVoting from './pages/admin/LiveVoting';
import TwoFactorSetup from './pages/voter/TwoFactorSetup';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/register" element={<AdminRegister />} />

      {/* Voter Routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/vote" element={<VoteScreen />} />
      <Route path="/results" element={<Results />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/voter/2fa-setup" element={<TwoFactorSetup />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/elections" element={<ManageElections />} />
      <Route path="/admin/results" element={<ElectionResults />} />
      <Route path='/admin/livevoting' element={<LiveVoting />} />
    </Routes>
  );
}

export default App;