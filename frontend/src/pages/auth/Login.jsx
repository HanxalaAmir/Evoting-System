import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { FiArrowLeft, FiUser, FiLock, FiShield } from 'react-icons/fi';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // 1. Determine Role (Default to 'voter')
  const role = searchParams.get('role') === 'admin' ? 'admin' : 'voter';
  const isAdmin = role === 'admin';

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 2. Form State
  const [formData, setFormData] = useState({ 
    identifier: '', // Stores Index Number OR Username
    password: '' 
  });

  // 3. Validation Logic
  const validate = () => {
    const newErrors = {};
    
    // Validate Identifier (Index No vs Username)
    if (!formData.identifier.trim()) {
      newErrors.identifier = isAdmin ? 'Username is required' : 'Index Number is required';
    }
    
    // Validate Password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    // Returns true if no errors
    return Object.keys(newErrors).length === 0;
  };

  // 4. Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error immediately when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // 5. Handle Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return; // Stop if validation fails

    setIsLoading(true);

    // Simulate Backend API Call
    setTimeout(() => {
      setIsLoading(false);
      console.log(`Logged in as ${role}:`, formData);
      
      // Redirect based on role
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className={`absolute top-10 left-10 w-72 h-72 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob ${isAdmin ? 'bg-rose-500/20' : 'bg-primary/20'}`}></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-8 rounded-2xl shadow-2xl max-w-md w-full animate-fade-in ring-1 ring-white/5">
        
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-white mb-6 transition-colors group">
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        {/* Dynamic Header */}
        <div className="text-center mb-8">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg ${isAdmin ? 'bg-rose-500/10 text-rose-500 shadow-rose-500/20' : 'bg-primary/10 text-primary shadow-indigo-500/20'}`}>
            {isAdmin ? <FiShield className="w-6 h-6" /> : <FiUser className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
            {isAdmin ? 'Admin Portal' : 'Voter Login'}
          </h2>
          <p className="text-slate-400 text-sm">
            {isAdmin ? 'Enter your administrative credentials.' : 'Login with your University Index Number.'}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label={isAdmin ? "Username" : "University Index Number"}
            name="identifier"
            placeholder={isAdmin ? "admin_user" : "e.g. 20001234"} 
            value={formData.identifier}
            onChange={handleChange}
            error={errors.identifier}
            icon={FiUser}
          />
          
          <Input 
            label="Password" 
            name="password"
            type="password" 
            placeholder="••••••••" 
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={FiLock}
          />

          <Button 
            type="submit" 
            variant="primary" 
            size="md" // Explicitly requesting Medium size as asked
            className={`w-full ${isAdmin ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20' : 'shadow-primary/20'}`}
            isLoading={isLoading}
          >
            {isAdmin ? 'Access Dashboard' : 'Login to Vote'}
          </Button>
        </form>

        {/* Dynamic Footer Links */}
        <p className="mt-6 text-center text-xs text-slate-500">
          {isAdmin ? (
            <>
              New Administrator? <Link to="/admin/register" className="text-rose-400 hover:text-rose-300 font-semibold transition-colors">Register Here</Link>
            </>
          ) : (
            <>
              Not registered? <Link to="/register" className="text-primary hover:text-indigo-400 font-semibold transition-colors">Register with Index No</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Login;