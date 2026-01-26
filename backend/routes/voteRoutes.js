const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  castVote,
  getHistory,
  checkEligibility,
  checkRegistration
} = require('../controllers/voteController');

router.get('/check/:indexNumber', checkRegistration);

router.post('/', protect, castVote);
router.get('/history', protect, getHistory);
router.get('/eligibility/:electionId', protect, checkEligibility);

module.exports = router;