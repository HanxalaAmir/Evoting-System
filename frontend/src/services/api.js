import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    error.customMessage = error.response?.data?.message || "An unexpected error occurred.";
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => API.post("/auth/login", data),
  register: (data) => API.post("/auth/register", data),
  logout: () => API.post("/auth/logout"),
  getCurrentUser: () => API.get("/auth/me"),
  sendOTP: (data) => API.post("/auth/send-otp", data),
  verifyOTP: (data) => API.post("/auth/verify-otp", data),
  updateProfile: (data) => API.put("/auth/profile", data),
  changePassword: (data) => API.put("/auth/password", data)
};

export const electionAPI = {
  getAll: () => API.get("/elections"),
  getActive: () => API.get("/elections/active"),
  getStats: () => API.get("/elections/stats"),
  getById: (id) => API.get(`/elections/${id}`),
  getResults: (id) => API.get(`/elections/${id}/results`),
  create: (data) => API.post("/elections", data),
  update: (id, data) => API.put(`/elections/${id}`, data),
  delete: (id) => API.delete(`/elections/${id}`)
};

export const voteAPI = {
  checkRegistration: (indexNo) => API.get(`/votes/check/${indexNo}`),
  checkEligibility: (electionId) => API.get(`/votes/eligibility/${electionId}`),
  castVote: (data) => API.post("/votes", data),
  getHistory: () => API.get("/votes/history")
};

export default API;