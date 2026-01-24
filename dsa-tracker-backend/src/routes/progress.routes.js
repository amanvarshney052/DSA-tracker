const express = require('express');
const router = express.Router();
const {
    getUserProgress,
    markProblemSolved,
    updateProgress,
    getUserStats,
} = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getUserProgress);
router.post('/solve', protect, markProblemSolved);
router.put('/:id', protect, updateProgress);
router.get('/stats', protect, getUserStats);

module.exports = router;
