const UserProgress = require('../models/UserProgress');
const User = require('../models/User');
const Revision = require('../models/Revision');

// @desc    Get user progress
// @route   GET /api/progress
// @access  Private
const getUserProgress = async (req, res) => {
    try {
        const progress = await UserProgress.find({ userId: req.user._id })
            .populate('problemId')
            .sort({ updatedAt: -1 });

        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark problem as solved
// @route   POST /api/progress/solve
// @access  Private
const markProblemSolved = async (req, res) => {
    try {
        const { problemId, timeTaken, notes, approach, code, markedForRevision, revisionDays } = req.body;

        let progress = await UserProgress.findOne({
            userId: req.user._id,
            problemId,
        });

        if (progress) {
            // Update existing progress
            progress.solved = true;
            progress.solvedAt = Date.now();
            progress.timeTaken = timeTaken || progress.timeTaken;
            progress.notes = notes || progress.notes;
            progress.approach = approach || progress.approach;
            progress.code = code || progress.code;
            progress.markedForRevision = markedForRevision !== undefined ? markedForRevision : progress.markedForRevision;
            progress.updatedAt = Date.now();
        } else {
            // Create new progress
            progress = await UserProgress.create({
                userId: req.user._id,
                problemId,
                solved: true,
                solvedAt: Date.now(),
                timeTaken,
                notes,
                approach,
                code,
                markedForRevision: markedForRevision || false,
            });
        }

        await progress.save();

        // Schedule revisions if marked
        if (progress.markedForRevision) {
            // Use provided revisionDays or default to [1, 7, 30]
            const daysToSchedule = (revisionDays && revisionDays.length > 0) ? revisionDays : [1, 7, 30];
            const today = new Date();

            for (let i = 0; i < daysToSchedule.length; i++) {
                const scheduledDate = new Date(today);
                scheduledDate.setDate(scheduledDate.getDate() + daysToSchedule[i]);

                await Revision.create({
                    userId: req.user._id,
                    problemId,
                    scheduledDate,
                    revisionNumber: i + 1,
                });
            }

            // Set next revision date (earliest one)
            const nextRevision = new Date(today);
            const nextDay = Math.min(...daysToSchedule);
            nextRevision.setDate(nextRevision.getDate() + nextDay);
            progress.nextRevisionDate = nextRevision;
            await progress.save();
        }

        // Update user XP and level
        const user = await User.findById(req.user._id);
        user.xpPoints += 10; // 10 XP per problem

        // Progressive Leveling: Level = 0.1 * sqrt(XP) + 1
        // Lvl 1->2: 100 XP (10 probs)
        // Lvl 2->3: 400 XP (+30 probs)
        // Lvl 3->4: 900 XP (+50 probs)
        user.level = Math.floor(Math.sqrt(user.xpPoints) * 0.1) + 1;

        await user.save();

        res.status(201).json(progress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update progress
// @route   PUT /api/progress/:id
// @access  Private
const updateProgress = async (req, res) => {
    try {
        const progress = await UserProgress.findById(req.params.id);

        if (progress && progress.userId.toString() === req.user._id.toString()) {
            progress.timeTaken = req.body.timeTaken || progress.timeTaken;
            progress.notes = req.body.notes !== undefined ? req.body.notes : progress.notes;
            progress.approach = req.body.approach !== undefined ? req.body.approach : progress.approach;
            progress.code = req.body.code !== undefined ? req.body.code : progress.code;
            progress.markedForRevision = req.body.markedForRevision !== undefined ? req.body.markedForRevision : progress.markedForRevision;
            progress.updatedAt = Date.now();

            const updatedProgress = await progress.save();
            res.json(updatedProgress);
        } else {
            res.status(404).json({ message: 'Progress not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const Problem = require('../models/Problem');

// @desc    Get user statistics
// @route   GET /api/progress/stats
// @access  Private
const getUserStats = async (req, res) => {
    try {
        const { sheetId } = req.query;

        // 1. Define Scope for Problems (Total counts)
        let problemQuery = {};
        if (sheetId) {
            problemQuery.sheetId = sheetId;
        }

        const totalProblems = await Problem.countDocuments(problemQuery);
        const totalEasy = await Problem.countDocuments({ ...problemQuery, difficulty: 'easy' });
        const totalMedium = await Problem.countDocuments({ ...problemQuery, difficulty: 'medium' });
        const totalHard = await Problem.countDocuments({ ...problemQuery, difficulty: 'hard' });

        // 2. Define Scope for Progress (Solved counts)
        let progressQuery = { userId: req.user._id, solved: true };

        if (sheetId) {
            // To filter progress by sheet, we need to know which problems belong to this sheet
            // Since UserProgress -> Problem (ref), we can do this efficiently by pre-fetching IDs
            // OR use aggregation properly. For simplicity and since Sheets aren't massive:
            const sheetProblems = await Problem.find({ sheetId }).select('_id');
            const sheetProblemIds = sheetProblems.map(p => p._id);
            progressQuery.problemId = { $in: sheetProblemIds };
        }

        const progress = await UserProgress.find(progressQuery);

        // Calculate submission calendar and collect raw dates
        const submissionCalendar = {};
        const submissionDates = [];

        progress.forEach(p => {
            if (p.solvedAt) {
                // Legacy support for calendar (can be removed if frontend updated fully, but keeping for safety)
                const date = new Date(p.solvedAt);
                date.setHours(0, 0, 0, 0); // Normalize to midnight
                const timestamp = date.getTime() / 1000; // Seconds
                submissionCalendar[timestamp] = (submissionCalendar[timestamp] || 0) + 1;

                // Raw timestamp
                submissionDates.push(p.solvedAt);
            }
        });

        const stats = {
            totalSolved: progress.length,
            easy: 0,
            medium: 0,
            hard: 0,
            totalProblems,
            totalEasy,
            totalMedium,
            totalHard,
            topicWise: {},
            platformWise: {},
            solvedToday: 0,
            submissionCalendar,
            submissionDates // New field
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Populate problems to get difficulty and topics
        const populatedProgress = await UserProgress.find(progressQuery)
            .populate('problemId');

        populatedProgress.forEach(p => {
            // Calculate solved today
            if (new Date(p.solvedAt) >= today) {
                stats.solvedToday++;
            }

            if (p.problemId) {
                // Count by difficulty
                const diff = p.problemId.difficulty;
                if (diff === 'easy') stats.easy++;
                else if (diff === 'medium') stats.medium++;
                else if (diff === 'hard') stats.hard++;

                // Count by topic
                p.problemId.topics.forEach(topic => {
                    stats.topicWise[topic] = (stats.topicWise[topic] || 0) + 1;
                });

                // Count by platform
                const platform = p.problemId.platform;
                stats.platformWise[platform] = (stats.platformWise[platform] || 0) + 1;
            }
        });

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUserProgress,
    markProblemSolved,
    updateProgress,
    getUserStats,
};
