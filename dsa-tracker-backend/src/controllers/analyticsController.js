const UserProgress = require('../models/UserProgress');
const Problem = require('../models/Problem');
const Revision = require('../models/Revision');

// @desc    Get topic-wise strength analysis
// @route   GET /api/analytics/topic-strength
// @access  Private
// @desc    Get topic-wise strength analysis
// @route   GET /api/analytics/topic-strength
// @access  Private
const getTopicStrength = async (req, res) => {
    try {
        const { sheetId } = req.query;
        const userId = req.user._id;

        // 1. Get Solved Problem IDs
        const solvedProgress = await UserProgress.find({ userId, solved: true }).select('problemId');
        const solvedProblemIds = new Set(solvedProgress.map(p => p.problemId.toString()));

        const topicData = {};

        // 2. If Sheet Selected: Iterate ALL problems to find Unsolved & Calculate Totals
        if (sheetId) {
            const sheetProblems = await Problem.find({ sheetId }).select('title problemUrl difficulty topics platform');
            const difficultyWeight = { easy: 1, medium: 2, hard: 3 };

            sheetProblems.forEach(p => {
                const isSolved = solvedProblemIds.has(p._id.toString());

                p.topics.forEach(topic => {
                    if (!topicData[topic]) {
                        topicData[topic] = {
                            total: 0,
                            totalAvailable: 0,
                            easy: 0, medium: 0, hard: 0,
                            recommendation: null
                        };
                    }

                    topicData[topic].totalAvailable++;
                    if (isSolved) {
                        topicData[topic].total++; // Solved count
                        topicData[topic][p.difficulty]++;
                    } else {
                        // Difficulty-Aware Recommendation Strategy
                        const currentRec = topicData[topic].recommendation;
                        const newWeight = difficultyWeight[p.difficulty] || 2;

                        let shouldReplace = false;
                        if (!currentRec) {
                            shouldReplace = true;
                        } else {
                            const currentWeight = difficultyWeight[currentRec.difficulty] || 2;
                            // Prioritize easier problems (Easy < Medium < Hard)
                            if (newWeight < currentWeight) shouldReplace = true;
                        }

                        if (shouldReplace) {
                            topicData[topic].recommendation = {
                                _id: p._id,
                                title: p.title,
                                url: p.problemUrl,
                                difficulty: p.difficulty, // Store diff for comparison
                                platform: p.platform
                            };
                        }
                    }
                });
            });
        } else {
            // Fallback for Global View (No Sheet Selected)
            const progress = await UserProgress.find({ userId, solved: true }).populate('problemId');
            progress.forEach(p => {
                if (p.problemId && p.problemId.topics) {
                    p.problemId.topics.forEach(topic => {
                        if (!topicData[topic]) {
                            topicData[topic] = { total: 0, totalAvailable: 0, easy: 0, medium: 0, hard: 0 };
                        }
                        topicData[topic].total++;
                        topicData[topic][p.problemId.difficulty]++;
                    });
                }
            });
        }

        res.json(topicData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get time distribution analysis
// @route   GET /api/analytics/time-distribution
// @access  Private
const getTimeDistribution = async (req, res) => {
    try {
        const progress = await UserProgress.find({
            userId: req.user._id,
            solved: true,
            timeTaken: { $gt: 0 }
        }).populate('problemId');

        const timeByDifficulty = {
            easy: [],
            medium: [],
            hard: []
        };

        progress.forEach(p => {
            if (p.problemId) {
                timeByDifficulty[p.problemId.difficulty].push(p.timeTaken);
            }
        });

        const avgTimeByDifficulty = {
            easy: timeByDifficulty.easy.length > 0
                ? timeByDifficulty.easy.reduce((a, b) => a + b, 0) / timeByDifficulty.easy.length
                : 0,
            medium: timeByDifficulty.medium.length > 0
                ? timeByDifficulty.medium.reduce((a, b) => a + b, 0) / timeByDifficulty.medium.length
                : 0,
            hard: timeByDifficulty.hard.length > 0
                ? timeByDifficulty.hard.reduce((a, b) => a + b, 0) / timeByDifficulty.hard.length
                : 0,
        };

        res.json(avgTimeByDifficulty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get consistency data (last 30 days)
// @route   GET /api/analytics/consistency
// @access  Private
const getConsistencyData = async (req, res) => {
    try {
        const { sheetId } = req.query;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        let query = {
            userId: req.user._id,
            solved: true,
            solvedAt: { $gte: thirtyDaysAgo }
        };

        if (sheetId) {
            const sheetProblems = await Problem.find({ sheetId }).select('_id');
            const sheetProblemIds = sheetProblems.map(p => p._id);
            query.problemId = { $in: sheetProblemIds };
        }

        const progress = await UserProgress.find(query).sort({ solvedAt: 1 });

        // Group by date
        const dailyCount = {};
        progress.forEach(p => {
            const dateKey = new Date(p.solvedAt).toISOString().split('T')[0];
            dailyCount[dateKey] = (dailyCount[dateKey] || 0) + 1;
        });

        // Fill in missing days with 0
        const result = [];
        for (let i = 30; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            result.push({
                date: dateKey,
                count: dailyCount[dateKey] || 0
            });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get platform statistics
// @route   GET /api/analytics/platform-stats
// @access  Private
const getPlatformStats = async (req, res) => {
    try {
        const progress = await UserProgress.find({
            userId: req.user._id,
            solved: true
        }).populate('problemId');

        const platformStats = {};

        progress.forEach(p => {
            if (p.problemId) {
                const platform = p.problemId.platform;
                if (!platformStats[platform]) {
                    platformStats[platform] = 0;
                }
                platformStats[platform]++;
            }
        });

        res.json(platformStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get smart insights (weakest topic, speed, revision rate)
// @route   GET /api/analytics/insights
// @access  Private
const getInsights = async (req, res) => {
    try {
        const { sheetId } = req.query;
        const userId = req.user._id;

        // 1. Scope: Problem IDs for Sheet
        let sheetProblemIds = null;
        if (sheetId) {
            const sheetProblems = await Problem.find({ sheetId }).select('_id');
            sheetProblemIds = sheetProblems.map(p => p._id);
        }

        // --- Insight 1: Weakest Topic ---
        let topicQuery = { userId, solved: true };
        if (sheetProblemIds) topicQuery.problemId = { $in: sheetProblemIds };

        const progress = await UserProgress.find(topicQuery).populate('problemId');
        const topicStats = {};

        if (sheetId) {
            const sheetProblemsFull = await Problem.find({ sheetId }).select('topics');
            sheetProblemsFull.forEach(p => {
                p.topics.forEach(t => {
                    if (!topicStats[t]) topicStats[t] = { solved: 0, total: 0 };
                    topicStats[t].total++;
                });
            });
        }

        progress.forEach(p => {
            if (p.problemId && p.problemId.topics) {
                p.problemId.topics.forEach(t => {
                    if (!topicStats[t]) topicStats[t] = { solved: 0, total: 0 };
                    topicStats[t].solved++;
                });
            }
        });

        // Find weakest (Lowest ratio, prioritized by >0 total available)
        let weakestTopic = null;
        let lowestRatio = 1.1;

        Object.entries(topicStats).forEach(([topic, stats]) => {
            if (stats.total > 0) {
                const ratio = stats.solved / stats.total;
                // We prefer topics that have at least some availability.
                if (ratio < lowestRatio) {
                    lowestRatio = ratio;
                    weakestTopic = { topic, ratio, solved: stats.solved, total: stats.total };
                }
            }
        });

        // --- Insight 2: Fastest Difficulty ---
        let timeQuery = { userId, solved: true, timeTaken: { $gt: 0 } };
        if (sheetProblemIds) timeQuery.problemId = { $in: sheetProblemIds };

        const timedProgress = await UserProgress.find(timeQuery).populate('problemId');
        const timeStats = { easy: [], medium: [], hard: [] };

        timedProgress.forEach(p => {
            if (p.problemId && p.problemId.difficulty) {
                timeStats[p.problemId.difficulty].push(p.timeTaken);
            }
        });

        let fastestDiff = null;
        let minAvgTime = Infinity;

        Object.entries(timeStats).forEach(([diff, times]) => {
            if (times.length > 0) {
                const avg = times.reduce((a, b) => a + b, 0) / times.length;
                if (avg < minAvgTime) {
                    minAvgTime = avg;
                    fastestDiff = { difficulty: diff, avgTime: Math.round(avg) };
                }
            }
        });

        // --- Insight 3: Revision Success Rate ---
        let revQuery = { userId, scheduledDate: { $lte: new Date() } };
        if (sheetProblemIds) revQuery.problemId = { $in: sheetProblemIds };

        const revisions = await Revision.find(revQuery);
        const totalRevisions = revisions.length;
        const completedRevisions = revisions.filter(r => r.completed).length;
        const revisionRate = totalRevisions > 0 ? Math.round((completedRevisions / totalRevisions) * 100) : 0;

        // --- Insight 4: Total Time Spent ---
        const totalTimeSpent = timedProgress.reduce((sum, p) => sum + (p.timeTaken || 0), 0);

        res.json({
            weakestTopic: weakestTopic || { topic: 'None', ratio: 0, solved: 0, total: 0 },
            fastestDiff: fastestDiff || { difficulty: 'None', avgTime: 0 },
            revisionRate,
            totalRevisions,
            totalTimeSpent
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTopicStrength,
    getTimeDistribution,
    getConsistencyData,
    getPlatformStats,
    getInsights,
};
