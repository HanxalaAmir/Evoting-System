import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { FiShield, FiUser, FiMail, FiLock, FiKey, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

const AdminRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    otp: '',
    secretCode: ''
  });

  const [errors, setErrors] = useState({});

  // --- VALIDATION LOGIC ---
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = "Full Name is required";
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.email.includes('@')) newErrors.email = "Invalid email";
    if (formData.password.length < 6) newErrors.password = "Password must be 6+ chars";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    if (formData.otp.length !== 6) {
      setErrors({ otp: "Enter the 6-digit OTP" });
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    // 🔐 CHECK THE SECRET CODE FROM .ENV
    const CORRECT_CODE = import.meta.env.VITE_ADMIN_SECRET_CODE;
    
    if (formData.secretCode !== CORRECT_CODE) {
      setErrors({ secretCode: "Invalid Authorization Code. Access Denied." });
      return false;
    }
    return true;
  };

  // --- HANDLERS ---
  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setIsLoading(true);
      // Simulate sending OTP
      setTimeout(() => { setIsLoading(false); setStep(2); }, 1000);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setIsLoading(true);
    // Simulate Backend Registration
    setTimeout(() => {
      setIsLoading(false);
      navigate('/admin/dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 relative overflow-hidden">
      
      {/* Red Background Ambience for Admin */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 bg-slate-900/60 backdrop-blur-xl border border-rose-500/30 p-8 rounded-2xl shadow-2xl shadow-rose-900/20 max-w-md w-full animate-fade-in ring-1 ring-white/5">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-rose-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/20">
            <FiShield className="text-white w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Admin Registration</h2>
          <p className="text-slate-400 text-sm mt-2">Restricted Access Only</p>
        </div>

        {/* --- STEP 1: ACCOUNT DETAILS --- */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Full Name" 
                placeholder="John Doe" 
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                error={errors.fullName}
              />
              <Input 
                label="Username" 
                placeholder="admin_john" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                error={errors.username}
              />
            </div>
            <Input 
              label="Email" 
              type="email" 
              placeholder="admin@uni.edu" 
              icon={FiMail}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              error={errors.email}
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              icon={FiLock}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              error={errors.password}
            />
            
            <Button onClick={handleNext} variant="primary" className="w-full bg-rose-600 hover:bg-rose-500 shadow-rose-500/20 mt-4" isLoading={isLoading}>
              Verify Email
            </Button>
          </div>
        )}

        {/* --- STEP 2: OTP VERIFICATION --- */}
        {step === 2 && (
          <div className="space-y-6 text-center animate-fade-in">
            <p className="text-slate-300 text-sm">
              Enter the OTP sent to <span className="text-rose-400 font-mono">{formData.email}</span>
            </p>
            <div className="max-w-[200px] mx-auto">
              <Input 
                placeholder="123456" 
                className="text-center text-2xl tracking-[0.5em] font-mono border-rose-500/50 focus:border-rose-500"
                value={formData.otp}
                onChange={(e) => setFormData({...formData, otp: e.target.value})}
                error={errors.otp}
                maxLength={6}
              />
            </div>
            <Button onClick={handleNext} variant="primary" className="w-full bg-rose-600 hover:bg-rose-500 shadow-rose-500/20">
              Verify OTP
            </Button>
            <button onClick={() => setStep(1)} className="text-xs text-slate-500 hover:text-white">Change Email</button>
          </div>
        )}

        {/* --- STEP 3: SECRET CODE --- */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3">
              <FiAlertTriangle className="text-rose-500 mt-1 shrink-0" />
              <p className="text-xs text-rose-200">
                This step requires a High-Level Authorization Code provided by the System Administrator.
              </p>
            </div>

            <Input 
              label="Secret Administration Code" 
              type="password" 
              placeholder="ENTER-CODE-HERE" 
              icon={FiKey}
              value={formData.secretCode}
              onChange={(e) => setFormData({...formData, secretCode: e.target.value})}
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
          </div>
        )}

        <div className="mt-6 text-center border-t border-slate-700/50 pt-4">
           <Link to="/login?role=admin" className="text-xs text-slate-400 hover:text-rose-400 transition-colors">
             Already an Admin? Login here
           </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;