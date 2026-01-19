import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/Button';
import { FiSmartphone, FiCheckCircle, FiLock, FiArrowLeft, FiCopy } from 'react-icons/fi';

const TwoFactorSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);

  // Handle OTP Input
  const handleInputChange = (value, index) => {
    if (isNaN(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleVerify = () => {
    setIsLoading(true);
    // Simulate verification API call
    setTimeout(() => {
      setIsLoading(false);
      setStep(3); // Success step
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto pt-10">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/profile')} 
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors text-sm font-semibold"
        >
          <FiArrowLeft /> Back to Profile
        </button>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          {/* --- STEP 1: SCAN QR CODE --- */}
          {step === 1 && (
            <div className="animate-fade-in text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700 shadow-xl">
                <FiSmartphone className="text-indigo-400 w-8 h-8" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Setup 2-Factor Authentication</h2>
              <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">
                Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.).
              </p>

              <div className="bg-white p-4 rounded-xl inline-block mb-6 shadow-lg">
                {/* Placeholder for Real QR Code */}
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=EVotingSecureSetup" alt="QR Code" className="w-40 h-40" />
              </div>

              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 flex items-center justify-between max-w-xs mx-auto mb-8">
                <span className="text-xs text-slate-500 font-mono tracking-wider">H7G2-9KJA-10PL-MQ4Z</span>
                <button className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  <FiCopy />
                </button>
              </div>

              <Button variant="primary" className="w-full max-w-xs bg-indigo-600 hover:bg-indigo-500" onClick={() => setStep(2)}>
                I've Scanned the Code
              </Button>
            </div>
          )}

          {/* --- STEP 2: VERIFY CODE --- */}
          {step === 2 && (
            <div className="animate-slide-up text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700">
                <FiLock className="text-emerald-400 w-8 h-8" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Verify Authentication</h2>
              <p className="text-slate-400 text-sm mb-8">
                Enter the 6-digit code from your authenticator app to confirm setup.
              </p>

              <div className="flex justify-center gap-2 mb-8">
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleInputChange(e.target.value, idx)}
                    className="w-12 h-14 bg-slate-900 border border-slate-700 rounded-lg text-center text-xl font-bold text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                ))}
              </div>

              <div className="flex gap-3 justify-center">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button 
                  variant="primary" 
                  className="bg-emerald-600 hover:bg-emerald-500 w-40 justify-center"
                  onClick={handleVerify}
                  disabled={code.some(c => c === '') || isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Verify & Enable'}
                </Button>
              </div>
            </div>
          )}

          {/* --- STEP 3: SUCCESS --- */}
          {step === 3 && (
            <div className="animate-slide-up text-center py-8">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                <FiCheckCircle className="text-emerald-400 w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">2FA Enabled Successfully</h2>
              <p className="text-slate-400 text-sm mb-8">
                Your account is now secured. You will need to enter a code whenever you log in.
              </p>
              <Button variant="primary" className="w-full max-w-xs" onClick={() => navigate('/voter/profile')}>
                Return to Profile
              </Button>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
};

export default TwoFactorSetup;