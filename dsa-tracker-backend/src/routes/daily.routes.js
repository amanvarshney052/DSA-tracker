const express = require('express');
const router = express.Router();
const {
    getDailyChallenge,
    createDailyChallenge,
    getAllChallenges
} = require('../controllers/dailyController');
const { protect, admin } = require('../middleware/auth');

router.get('/today', protect, getDailyChallenge);

// Admin Routes
router.post('/', protect, admin, createDailyChallenge);
router.get('/all', protect, admin, getAllChallenges);

module.exports = router;
