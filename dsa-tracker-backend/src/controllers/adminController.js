const User = require('../models/User');
const Sheet = require('../models/Sheet');
const Problem = require('../models/Problem');
const UserProgress = require('../models/UserProgress');
const Revision = require('../models/Revision');

// @desc    Get system statistics (counts)
// @route   GET /api/admin/stats
// @access  Private/Admin
const getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});
        const totalSheets = await Sheet.countDocuments({});
        const totalProblems = await Problem.countDocuments({});

        res.json({
            totalUsers,
            totalSheets,
            totalProblems
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.role = req.body.role; // 'admin' or 'user'
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle block status
// @route   PUT /api/admin/users/:id/block
const toggleUserBlock = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.isBlocked = !user.isBlocked;
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset user progress
// @route   POST /api/admin/users/:id/reset-progress
const resetUserProgress = async (req, res) => {
    try {
        const userId = req.params.id;

        // Delete all progress and revisions
        await UserProgress.deleteMany({ userId });
        await Revision.deleteMany({ userId });

        // Reset user stats
        const user = await User.findById(userId);
        if (user) {
            user.xpPoints = 0;
            user.level = 1;
            user.streak = 0;
            user.activeSheet = null; // Optional: Deselect sheet
            await user.save();
            res.json({ message: 'User progress reset successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSystemStats,
    getAllUsers,
    updateUserRole,
    toggleUserBlock,
    resetUserProgress
};
