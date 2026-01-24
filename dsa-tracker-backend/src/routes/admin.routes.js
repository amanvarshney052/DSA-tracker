const express = require('express');
const router = express.Router();
const {
    getSystemStats,
    getAllUsers,
    updateUserRole,
    toggleUserBlock,
    resetUserProgress
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.get('/stats', protect, admin, getSystemStats);
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.put('/users/:id/block', protect, admin, toggleUserBlock);
router.post('/users/:id/reset-progress', protect, admin, resetUserProgress);

module.exports = router;
