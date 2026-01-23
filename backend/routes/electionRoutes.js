const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getElections, 
  createElection, 
  getElectionById, 
  deleteElection,
  updateElection 
} = require('../controllers/electionController');

// Helper middleware to check for Admin role
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

// --- ROUTES ---

// Public/Voter: Read Elections
router.get('/', protect, getElections); 
router.get('/:id', protect, getElectionById);

// Admin Only: Create, Update, Delete
router.post('/', protect, adminOnly, createElection);
router.put('/:id', protect, adminOnly, updateElection);
router.delete('/:id', protect, adminOnly, deleteElection);

module.exports = router;