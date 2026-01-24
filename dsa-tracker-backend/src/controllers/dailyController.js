const DailyChallenge = require('../models/DailyChallenge');
const UserProgress = require('../models/UserProgress');
const Problem = require('../models/Problem');

// @desc    Get today's daily challenge
// @route   GET /api/daily/today
// @access  Private
const getDailyChallenge = async (req, res) => {
    try {
        // Get today's date string (YYYY-MM-DD)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayDate = `${year}-${month}-${day}`;

        let challenge = await DailyChallenge.findOne({ date: todayDate }).populate('problemId');

        // Fallback: If no challenge set for today, get the most recent one
        if (!challenge) {
            challenge = await DailyChallenge.findOne().sort({ date: -1 }).populate('problemId');
        }

        if (!challenge) {
            return res.json({ message: 'No daily challenge available yet.' });
        }

        // Check if user solved it
        const progress = await UserProgress.findOne({
            userId: req.user._id,
            problemId: challenge.problemId._id,
            solved: true
        });

        res.json({
            date: challenge.date,
            problem: challenge.problemId,
            message: challenge.message,
            isSolved: !!progress
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create or Update Daily Challenge (Admin)
// @route   POST /api/daily
// @access  Private/Admin
const createDailyChallenge = async (req, res) => {
    try {
        const { date, problemId, message } = req.body;

        if (!date || !problemId) {
            return res.status(400).json({ message: 'Date and Problem ID are required' });
        }

        // Upsert: Update if exists, Create if not
        const challenge = await DailyChallenge.findOneAndUpdate(
            { date },
            { problemId, message },
            { new: true, upsert: true }
        );

        res.json(challenge);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all scheduled challenges (Admin)
// @route   GET /api/daily/all
// @access  Private/Admin
const getAllChallenges = async (req, res) => {
    try {
        const challenges = await DailyChallenge.find().sort({ date: -1 }).populate('problemId');
        res.json(challenges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDailyChallenge,
    createDailyChallenge,
    getAllChallenges
};
