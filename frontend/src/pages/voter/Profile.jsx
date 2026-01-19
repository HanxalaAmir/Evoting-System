import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/Button';
import { 
  FiUser, FiMail, FiShield, FiCheckCircle, FiLock, 
  FiActivity, FiEdit2, FiSave, FiSmartphone, FiToggleRight, FiToggleLeft, FiCamera
} from 'react-icons/fi';

const Profile = () => {
  const navigate = useNavigate();

  // Mock User Data
  const [user, setUser] = useState({
    name: "John Doe",
    id: "V-2024-8890",
    email: "john.doe@university.edu",
    department: "Computer Science",
    status: "Verified Voter",
    twoFactorEnabled: false
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleEdit = () => {
    if (isEditing) setUser({ ...formData });
    setIsEditing(!isEditing);
  };

  const handle2FASetup = () => {
    if (!user.twoFactorEnabled) {
      navigate('/voter/2fa-setup');
    } else {
      if(confirm("Are you sure you want to disable 2FA? This makes your account less secure.")) {
        setUser({ ...user, twoFactorEnabled: false });
      }
    }
  };

  return (
    <DashboardLayout>
      {/* --- HERO HEADER SECTION --- */}
      <div className="relative mb-10 rounded-3xl bg-slate-800 border border-slate-700/50 overflow-hidden shadow-2xl">
        
        {/* Top Gradient Banner */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-700 relative">
           <div className="absolute inset-0 bg-black/10"></div>
           {/* Decorative pattern/noise could go here */}
        </div>

        {/* Profile Content Wrapper */}
        <div className="px-8 pb-8 flex flex-col md:flex-row items-end -mt-12 gap-6 relative z-10">
          
          {/* Avatar with Ring */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-slate-900 p-1.5 shadow-2xl ring-1 ring-slate-700/50">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-5xl font-bold text-white relative overflow-hidden">
                {user.name.charAt(0)}
                
                {/* Edit Overlay (Hover) */}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer">
                     <FiCamera className="w-8 h-8 text-white/80" />
                  </div>
                )}
              </div>
            </div>
            {/* Status Badge */}
            <div className="absolute bottom-2 right-2 bg-slate-900 rounded-full p-1.5 border border-slate-700 shadow-md" title="Verified Voter">
              <FiCheckCircle className="text-emerald-400 w-5 h-5 fill-current bg-slate-900 rounded-full" />
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center md:text-left mb-2">
            <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">{user.name}</h1>
            <p className="text-slate-400 text-sm mb-4 font-medium">{user.department} Department</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-700/50 border border-slate-600 text-xs font-medium text-indigo-300">
                <FiShield className="w-3.5 h-3.5" /> {user.id}
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-700/50 border border-slate-600 text-xs font-medium text-slate-300">
                <FiMail className="w-3.5 h-3.5" /> {user.email}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="mb-2 w-full md:w-auto">
             <button 
                onClick={toggleEdit}
                className={`w-full md:w-auto px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                  isEditing 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20' 
                    : 'bg-white text-slate-900 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
              >
                {isEditing ? <><FiSave /> Save Changes</> : <><FiEdit2 /> Edit Profile</>}
              </button>
          </div>

        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-700/50 pb-4">
              <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <FiUser className="text-indigo-400 w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Account Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={isEditing ? formData.name : user.name}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className={`w-full bg-slate-900/50 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all ${
                    isEditing 
                      ? 'border-indigo-500/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                      : 'border-slate-700 cursor-default opacity-80'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department</label>
                <input 
                  type="text" 
                  name="department"
                  value={isEditing ? formData.department : user.department}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className={`w-full bg-slate-900/50 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all ${
                    isEditing 
                      ? 'border-indigo-500/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                      : 'border-slate-700 cursor-default opacity-80'
                  }`}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">University Email</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={user.email} 
                    readOnly
                    className="w-full bg-slate-900/30 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-400 cursor-not-allowed"
                  />
                  <FiLock className="absolute right-4 top-3.5 text-slate-600" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Email address is managed by the university administrator.</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Security Center */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* 2FA Card */}
          <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
             <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-indigo-500/20 rounded-lg">
                      <FiSmartphone className="text-indigo-400 w-5 h-5" />
                   </div>
                   <div>
                      <h4 className="text-white font-bold text-sm">2-Factor Auth</h4>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${user.twoFactorEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {user.twoFactorEnabled ? 'Active' : 'Inactive'}
                      </span>
                   </div>
                </div>
                <button 
                  onClick={handle2FASetup}
                  className={`text-3xl transition-colors ${user.twoFactorEnabled ? 'text-emerald-500' : 'text-slate-600 hover:text-slate-400'}`}
                >
                  {user.twoFactorEnabled ? <FiToggleRight /> : <FiToggleLeft />}
                </button>
             </div>
             <p className="text-xs text-slate-400 leading-relaxed relative z-10">
               Secure your voting account by requiring a TOTP code during login.
             </p>
          </div>

          {/* Password Manager */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
              <FiLock className="text-slate-500" /> Change Password
            </h3>
            
            <form className="space-y-4">
              <input 
                type="password" 
                placeholder="Current Password"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
              />
              <input 
                type="password" 
                placeholder="New Password"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
              />
              <input 
                type="password" 
                placeholder="Confirm New Password"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
              />
              
              <Button variant="primary" className="w-full mt-2 bg-slate-700 hover:bg-indigo-600 border-0 text-sm">
                Update Security Credentials
              </Button>
            </form>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;