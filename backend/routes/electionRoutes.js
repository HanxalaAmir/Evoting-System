const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getAllElections,
    getActiveElections,
    getElectionById,
    createElection,
    updateElection,
    deleteElection,
    getElectionStats,
    getElectionResults
} = require('../controllers/electionController');

router.get('/stats', protect, admin, getElectionStats);
router.get('/active', protect, getActiveElections);

router.get('/', protect, getAllElections);
router.post('/', protect, admin, createElection);

router.get('/:id/results', protect, getElectionResults);
router.get('/:id', protect, getElectionById);
router.put('/:id', protect, admin, updateElection);
router.delete('/:id', protect, admin, deleteElection);

module.exports = router;