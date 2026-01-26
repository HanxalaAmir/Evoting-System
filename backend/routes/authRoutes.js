const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    sendOTP,
    verifyOTP,
    updateProfile,
    changePassword,
    enable2FA,
    verify2FA,
    disable2FA
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

router.post('/2fa/enable', protect, enable2FA);
router.post('/2fa/verify', protect, verify2FA);
router.post('/2fa/disable', protect, disable2FA);

module.exports = router;