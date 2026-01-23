import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import Button from "../../components/Button";
import {
  FiUser,
  FiMail,
  FiShield,
  FiCheckCircle,
  FiLock,
  FiEdit2,
  FiSave,
  FiSmartphone,
  FiToggleRight,
  FiToggleLeft,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw, // Added for Try Again button
} from "react-icons/fi";
import { authAPI } from "../../services/api";

const Profile = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // --- FETCH USER DATA ---
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authAPI.getCurrentUser();
      setUser(response.data);
      setFormData(response.data);
    } catch (err) {
      console.error("Profile Fetch Error:", err);
      // Determine error message
      const msg =
        err.response?.data?.message ||
        "Failed to load profile data. Please check your connection.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleEdit = async () => {
    if (isEditing) {
      // Save Mode
      setIsSaving(true);
      try {
        const response = await authAPI.updateProfile(formData);
        setUser(response.data); // Update local state
        setIsEditing(false);
      } catch (err) {
        alert("Failed to update profile. Please try again.");
      } finally {
        setIsSaving(false);
      }
    } else {
      // Enter Edit Mode
      setIsEditing(true);
    }
  };

  const handle2FASetup = () => {
    if (!user.twoFactorEnabled) {
      navigate("/voter/2fa-setup");
    } else {
      if (
        window.confirm(
          "Are you sure you want to disable 2FA? This makes your account less secure.",
        )
      ) {
        authAPI
          .disable2FA()
          .then(() => {
            setUser({ ...user, twoFactorEnabled: false });
          })
          .catch(() => alert("Failed to disable 2FA."));
      }
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      alert("New passwords do not match.");
      return;
    }

    try {
      await authAPI.changePassword({
        currentPassword: passwordData.current,
        newPassword: passwordData.new,
      });
      alert("Password updated successfully.");
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update password.");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh] text-slate-500">
          <FiLoader className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      </DashboardLayout>
    );
  }

  // --- ERROR STATE (Voter Theme: Indigo/Blue) ---
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="bg-indigo-500/10 p-4 rounded-full mb-4">
            <FiAlertCircle className="w-8 h-8 text-indigo-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            Connection Error
          </h3>
          <p className="text-slate-400 mb-6 max-w-md">{error}</p>

          <button
            onClick={fetchProfile}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 text-sm font-bold"
          >
            <FiRefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* --- HERO HEADER --- */}
      <div className="relative mb-10 rounded-3xl bg-slate-900 border border-slate-700/50 overflow-hidden shadow-2xl">
        {/* Banner */}
        <div className="h-40 bg-gradient-to-r from-indigo-600 to-purple-800 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
        </div>

        {/* Profile Info Wrapper */}
        <div className="px-8 pb-8 flex flex-col md:flex-row items-end -mt-16 gap-6 relative z-10">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-slate-900 p-1.5 shadow-2xl ring-1 ring-slate-700/50">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-5xl font-bold text-white relative overflow-hidden">
                {user.fullName ? user.fullName.charAt(0) : <FiUser />}
              </div>
            </div>
            {/* Verified Badge */}
            <div
              className="absolute bottom-2 right-2 bg-slate-900 rounded-full p-1.5 border border-slate-700 shadow-lg"
              title="Verified Voter"
            >
              <FiCheckCircle className="text-emerald-400 w-5 h-5 fill-current bg-slate-900 rounded-full" />
            </div>
          </div>

          {/* Text Info */}
          <div className="flex-1 text-center md:text-left mb-2">
            <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">
              {user.fullName}
            </h1>
            <p className="text-slate-400 text-sm mb-4 font-medium flex items-center justify-center md:justify-start gap-2">
              {user.role === "admin" ? "Administrator" : "Voter"}{" "}
              <span className="w-1 h-1 bg-slate-600 rounded-full"></span>{" "}
              {user.department || "General"}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-300">
                <FiShield className="w-3.5 h-3.5" />{" "}
                {user.username || user.indexNo}
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300">
                <FiMail className="w-3.5 h-3.5" /> {user.email}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="mb-2 w-full md:w-auto">
            <button
              onClick={toggleEdit}
              disabled={isSaving}
              className={`w-full md:w-auto px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                isEditing
                  ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20"
                  : "bg-white text-slate-900 hover:bg-indigo-50"
              }`}
            >
              {isSaving ? (
                <FiLoader className="animate-spin" />
              ) : isEditing ? (
                <>
                  <FiSave /> Save Changes
                </>
              ) : (
                <>
                  <FiEdit2 /> Edit Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-700/50 pb-4">
              <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <FiUser className="text-indigo-400 w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Personal Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={isEditing ? formData.fullName : user.fullName}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className={`w-full bg-slate-900/50 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all ${
                    isEditing
                      ? "border-indigo-500/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      : "border-slate-700 cursor-default opacity-70"
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Index / Username
                </label>
                <input
                  type="text"
                  value={user.username || user.indexNo}
                  readOnly
                  className="w-full bg-slate-900/30 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  University Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    className="w-full bg-slate-900/30 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-400 cursor-not-allowed"
                  />
                  <FiLock className="absolute right-4 top-3.5 text-slate-600" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1 pl-1">
                  Official communication channel. Cannot be changed manually.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Security Center */}
        <div className="lg:col-span-1 space-y-6">
          {/* 2FA Card */}
          <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <FiSmartphone className="text-indigo-400 w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">
                    2-Factor Auth
                  </h4>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${user.twoFactorEnabled ? "text-emerald-400" : "text-slate-500"}`}
                  >
                    {user.twoFactorEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
              <button
                onClick={handle2FASetup}
                className={`text-3xl transition-transform active:scale-95 duration-200 ${user.twoFactorEnabled ? "text-emerald-500" : "text-slate-600 hover:text-slate-400"}`}
              >
                {user.twoFactorEnabled ? <FiToggleRight /> : <FiToggleLeft />}
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed relative z-10">
              Secure your account by requiring a TOTP code from your mobile
              device during login.
            </p>
          </div>

          {/* Password Manager */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
              <FiLock className="text-slate-500" /> Security Settings
            </h3>

            <form onSubmit={handlePasswordUpdate} className="space-y-3">
              <input
                type="password"
                placeholder="Current Password"
                value={passwordData.current}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, current: e.target.value })
                }
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwordData.new}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, new: e.target.value })
                }
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwordData.confirm}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirm: e.target.value })
                }
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
              />

              <Button
                variant="primary"
                type="submit"
                className="w-full mt-2 bg-slate-700 hover:bg-indigo-600 border-0 text-sm py-2.5"
              >
                Update Password
              </Button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
