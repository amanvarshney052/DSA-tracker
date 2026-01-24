const express = require('express');
const router = express.Router();
const {
    getTopicStrength,
    getTimeDistribution,
    getConsistencyData,
    getPlatformStats,
    getInsights,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/topic-strength', protect, getTopicStrength);
router.get('/time-distribution', protect, getTimeDistribution);
router.get('/consistency', protect, getConsistencyData);
router.get('/platform-stats', protect, getPlatformStats);
router.get('/insights', protect, getInsights);

module.exports = router;
