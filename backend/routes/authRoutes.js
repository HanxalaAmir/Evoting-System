const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Import Middleware
const { 
  registerUser, loginUser, logoutUser, getCurrentUser,
  updateProfile, changePassword,
  enable2FA, verify2FA, disable2FA, sendOTP 
} = require('../controllers/authController');

// --- PUBLIC ROUTES ---
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/send-otp', sendOTP);

// --- PROTECTED ROUTES (Require Login) ---
// Note: We add 'protect' before the controller function
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

// 2FA Routes
router.post('/2fa/enable', protect, enable2FA);
router.post('/2fa/verify', protect, verify2FA);
router.post('/2fa/disable', protect, disable2FA);

module.exports = router;