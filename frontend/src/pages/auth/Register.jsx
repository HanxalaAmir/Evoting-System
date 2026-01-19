import React, { useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import Button from "../../components/Button";
import Input from "../../components/Input";
import {
  FiUser,
  FiMail,
  FiLock,
  FiCamera,
  FiCheckCircle,
  FiShield,
  FiArrowRight,
  FiArrowLeft,
} from "react-icons/fi";

const Register = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [faceCaptured, setFaceCaptured] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    indexNo: "", // Changed from voterId to indexNo for consistency
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const [errors, setErrors] = useState({});

  // --- VALIDATION LOGIC ---
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";

    if (!formData.indexNo.trim())
      newErrors.indexNo = "Index Number is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (formData.password.length < 6)
      newErrors.password = "Password must be 6+ chars";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!faceCaptured) newErrors.face = "Face verification is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- HANDLERS ---
  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setIsLoading(true);
      // Simulate sending OTP
      setTimeout(() => {
        setIsLoading(false);
        setStep(3);
      }, 1500);
    }
  };

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setFaceCaptured(imageSrc);
    setErrors((prev) => ({ ...prev, face: null }));
  }, [webcamRef]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.otp.length !== 6) {
      setErrors({ otp: "Please enter the 6-digit OTP sent to your email" });
      return;
    }

    setIsLoading(true);
    // Simulate Backend Registration
    setTimeout(() => {
      setIsLoading(false);
      navigate("/dashboard");
    }, 2000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on type
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6 md:p-8 rounded-2xl shadow-2xl max-w-lg w-full animate-fade-in ring-1 ring-white/5 mt-4 md:mt-0">
        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-8 px-2 md:px-4">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex flex-col items-center z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step >= num
                    ? "bg-primary text-white scale-110 shadow-lg shadow-primary/30"
                    : "bg-slate-800 text-slate-500 border border-slate-700"
                }`}
              >
                {step > num ? <FiCheckCircle /> : num}
              </div>
              <span className="text-[10px] text-slate-500 mt-2 uppercase tracking-wider font-semibold">
                {num === 1 ? "Details" : num === 2 ? "Security" : "Verify"}
              </span>
            </div>
          ))}
          {/* Connecting Lines */}
          <div className="absolute top-[44px] md:top-[52px] left-10 right-10 md:left-16 md:right-16 h-[2px] bg-slate-800 -z-0">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}
            ></div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-6">
          {step === 1
            ? "Voter Registration"
            : step === 2
            ? "Security Setup"
            : "Final Verification"}
        </h2>

        {/* --- STEP 1: Personal Details --- */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="fullName"
                placeholder="John Doe"
                icon={FiUser}
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
              />
              <Input
                label="Index No"
                name="indexNo"
                placeholder="V-2024-XXXX"
                value={formData.indexNo}
                onChange={handleChange}
                error={errors.indexNo}
              />
            </div>
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="student@university.edu"
              icon={FiMail}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <div className="pt-4 flex justify-end">
              <Button
                onClick={handleNext}
                variant="primary"
                className="gap-2 w-full md:w-auto"
              >
                Next Step <FiArrowRight />
              </Button>
            </div>
          </div>
        )}

        {/* --- STEP 2: Password & Face ID --- */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••"
                icon={FiLock}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
              />
              <Input
                label="Confirm"
                name="confirmPassword"
                type="password"
                placeholder="••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
              />
            </div>

            {/* Face Verification Box */}
            <div
              className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                errors.face
                  ? "border-red-500/50 bg-red-500/5"
                  : "border-slate-700 bg-slate-800/30"
              }`}
            >
              <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center justify-center gap-2">
                <FiShield className="text-primary" /> Face Identity Setup
              </label>

              {faceCaptured ? (
                <div className="relative w-32 h-32 mx-auto">
                  <img
                    src={faceCaptured}
                    alt="Captured"
                    className="w-full h-full object-cover rounded-full border-2 border-emerald-500 shadow-lg shadow-emerald-500/20"
                  />
                  <button
                    onClick={() => setFaceCaptured(null)}
                    className="absolute bottom-0 right-0 bg-slate-700 text-white p-1.5 rounded-full text-xs hover:bg-slate-600 transition-colors"
                  >
                    Retake
                  </button>
                </div>
              ) : (
                <div className="relative w-full max-w-[200px] mx-auto overflow-hidden rounded-lg aspect-square bg-black">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover"
                    videoConstraints={{ facingMode: "user" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={handleCapture}
                      className="bg-primary/90 hover:bg-primary text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110"
                    >
                      <FiCamera className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )}
              {errors.face && (
                <p className="text-red-400 text-xs mt-2">{errors.face}</p>
              )}
              {!faceCaptured && (
                <p className="text-slate-500 text-xs mt-2">
                  Position face in frame & click camera
                </p>
              )}
            </div>

            <div className="pt-2 flex justify-between">
              <Button
                onClick={() => setStep(1)}
                variant="ghost"
                className="gap-2 text-slate-400 hover:text-white"
              >
                <FiArrowLeft /> Back
              </Button>
              <Button
                onClick={handleNext}
                variant="primary"
                isLoading={isLoading}
              >
                Send OTP
              </Button>
            </div>
          </div>
        )}

        {/* --- STEP 3: OTP Verification --- */}
        {step === 3 && (
          <div className="space-y-6 text-center animate-fade-in">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMail className="w-8 h-8 text-blue-400" />
            </div>

            <p className="text-slate-400 text-sm">
              We've sent a 6-digit code to{" "}
              <span className="text-white font-mono">{formData.email}</span>
            </p>

            <div className="max-w-[200px] mx-auto">
              <Input
                name="otp"
                placeholder="123456"
                className="text-center text-2xl tracking-[0.5em] font-mono"
                value={formData.otp}
                onChange={handleChange}
                error={errors.otp}
                maxLength={6}
              />
            </div>

            <Button
              onClick={handleSubmit}
              variant="primary"
              className="w-full bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
              isLoading={isLoading}
            >
              Verify & Register
            </Button>

            <button
              onClick={() => setStep(2)}
              className="text-xs text-slate-500 hover:text-white underline transition-colors"
            >
              Change Email / Re-send
            </button>
          </div>
        )}
      </div>

      <p className="mt-8 text-slate-500 text-xs text-center">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-primary hover:text-white transition-colors"
        >
          Login here
        </Link>
      </p>
    </div>
  );
};

export default Register;
