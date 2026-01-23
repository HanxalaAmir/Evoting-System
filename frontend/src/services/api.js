import axios from 'axios';

// Create Axios Instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Crucial for handling Cookies/Sessions/HTTP-Only tokens
  headers: {
    'Content-Type': 'application/json',
  },
});

// Global Response Interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract readable error message
    const message = error.response?.data?.message || "An unexpected error occurred.";

    // Handle 401 Unauthorized (Session Expired) automatically
    if (error.response?.status === 401) {
      // Optional: Logic to clear local state or redirect to login
      console.warn("Session expired. Please login again.");
      // window.location.href = '/login'; // Use cautiously to avoid loops
    }

    console.error("API Error:", message);
    return Promise.reject(message);
  }
);

// --- AUTHENTICATION SERVICES ---
export const authAPI = {
  // Core Auth
  login: (data) => API.post('/auth/login', data),         // { identifier, password, role }
  register: (data) => API.post('/auth/register', data),   // { fullName, email, password, etc. }
  logout: () => API.post('/auth/logout'),
  getCurrentUser: () => API.get('/auth/me'),

  // Security & Verification
  sendOTP: (data) => API.post('/auth/send-otp', data),    // { email }
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/password', data),

  // 2FA Endpoints
  enable2FA: () => API.post('/auth/2fa/enable'),          // Returns { qrCode, secret }
  verify2FA: (token) => API.post('/auth/2fa/verify', { token }),
  disable2FA: () => API.post('/auth/2fa/disable'),
};

// --- ELECTION & ADMIN SERVICES ---
export const electionAPI = {
  // CRUD
  getAll: () => API.get('/elections'),
  getActive: () => API.get('/elections?status=active'),   // Used for Voter Dashboard & Live View
  getById: (id) => API.get(`/elections/${id}`),
  create: (data) => API.post('/elections', data),
  update: (id, data) => API.put(`/elections/${id}`, data),
  delete: (id) => API.delete(`/elections/${id}`),

  // Analytics & Results
  getResults: (id) => API.get(`/elections/${id}/results`),
  getStats: () => API.get('/elections/stats'),            // For Admin Dashboard Cards

  // Exports (Optional future implementation)
  exportResults: (id) => API.get(`/elections/${id}/export`, { responseType: 'blob' }),
};

// --- VOTING SERVICES ---
export const voteAPI = {
  // General Status Check (Landing Page)
  checkRegistration: (indexNo) => API.post('/votes/check-registration', { indexNo }),

  // Election Specific Eligibility (Voting Booth)
  checkEligibility: (electionId) => API.get(`/votes/eligibility/${electionId}`),

  // Cast Vote
  castVote: (data) => API.post('/votes', data),           // { electionId, candidateId }

  // User History
  getHistory: () => API.get('/votes/history'),
};

export default API;