import axios from 'axios';

// Automatic switching: Uses Vercel URL in production, Localhost in development
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Critical for HttpOnly Cookies (JWT)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor: Cleans up error messages
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Log the error for debugging (only in dev mode if you prefer)
    if (import.meta.env.DEV) {
      console.error("API Error:", error.response?.data?.message || error.message);
    }

    // 2. Standardize the error message
    // Now in your UI you can just access: error.customMessage
    error.customMessage = error.response?.data?.message || "An unexpected error occurred.";

    return Promise.reject(error);
  }
);

export const authAPI = {
  // Core Auth
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  logout: () => API.post('/auth/logout'),
  getCurrentUser: () => API.get('/auth/me'),

  // OTP & Verification
  sendOTP: (data) => API.post('/auth/send-otp', data),
  verifyOTP: (data) => API.post('/auth/verify-otp', data),

  // Profile Management
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/password', data),

  // Two-Factor Authentication (Added these to match backend)
  enable2FA: () => API.post('/auth/2fa/enable'),
  verify2FA: (data) => API.post('/auth/2fa/verify', data),
  disable2FA: () => API.post('/auth/2fa/disable'),
};

export const electionAPI = {
  getAll: () => API.get('/elections'),
  getActive: () => API.get('/elections/active'),
  getStats: () => API.get('/elections/stats'),
  getById: (id) => API.get(`/elections/${id}`),
  getResults: (id) => API.get(`/elections/${id}/results`),

  // Admin Operations
  create: (data) => API.post('/elections', data),
  update: (id, data) => API.put(`/elections/${id}`, data),
  delete: (id) => API.delete(`/elections/${id}`),
};

export const voteAPI = {
  checkRegistration: (indexNo) => API.get(`/votes/check/${indexNo}`),
  checkEligibility: (electionId) => API.get(`/votes/eligibility/${electionId}`),
  castVote: (data) => API.post('/votes', data),
  getHistory: () => API.get('/votes/history'),
};

export default API;