const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { castVote, getHistory, checkEligibility } = require('../controllers/voteController');

// All voting routes require login
router.post('/', protect, castVote);            // Submit Vote
router.get('/history', protect, getHistory);    // Voter Dashboard History
router.get('/eligibility/:electionId', protect, checkEligibility); // Check if voted

module.exports = router;