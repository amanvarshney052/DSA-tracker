const Problem = require('../models/Problem');
const Sheet = require('../models/Sheet');

// @desc    Get all problems with filters
// @route   GET /api/problems
// @access  Private
const getProblems = async (req, res) => {
    try {
        const { platform, difficulty, topic, sheetId, solved } = req.query;

        let query = {};

        if (platform) query.platform = platform;
        if (difficulty) query.difficulty = difficulty;
        if (topic) query.topics = { $in: [topic] };
        if (sheetId) query.sheetId = sheetId;

        const problems = await Problem.find(query)
            .populate('sheetId', 'name')
            .sort({ createdAt: -1 });

        res.json(problems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single problem
// @route   GET /api/problems/:id
// @access  Private
const getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id).populate('sheetId', 'name');

        if (problem) {
            res.json(problem);
        } else {
            res.status(404).json({ message: 'Problem not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new problem
// @route   POST /api/problems
// @access  Private/Admin
const createProblem = async (req, res) => {
    try {
        const { title, platform, problemUrl, difficulty, topics, sheetId, estimatedTime } = req.body;

        const problem = await Problem.create({
            title,
            platform,
            problemUrl,
            difficulty,
            topics,
            sheetId,
            estimatedTime,
            createdBy: req.user._id,
        });

        // Update sheet's total problems
        await Sheet.findByIdAndUpdate(sheetId, {
            $push: { problems: problem._id },
            $inc: { totalProblems: 1 },
        });

        res.status(201).json(problem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update problem
// @route   PUT /api/problems/:id
// @access  Private/Admin
// @desc    Update problem
// @route   PUT /api/problems/:id
// @access  Private/Admin
const updateProblem = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);

        if (problem) {
            // Handle Sheet Change
            if (req.body.sheetId && req.body.sheetId !== problem.sheetId.toString()) {
                const oldSheetId = problem.sheetId;
                const newSheetId = req.body.sheetId;

                // Remove from old sheet
                await Sheet.findByIdAndUpdate(oldSheetId, {
                    $pull: { problems: problem._id },
                    $inc: { totalProblems: -1 },
                });

                // Add to new sheet
                await Sheet.findByIdAndUpdate(newSheetId, {
                    $push: { problems: problem._id },
                    $inc: { totalProblems: 1 },
                });

                problem.sheetId = newSheetId;
            }

            problem.title = req.body.title || problem.title;
            problem.platform = req.body.platform || problem.platform;
            problem.problemUrl = req.body.problemUrl || problem.problemUrl;
            problem.difficulty = req.body.difficulty || problem.difficulty;
            problem.topics = req.body.topics || problem.topics;
            problem.estimatedTime = req.body.estimatedTime || problem.estimatedTime;

            const updatedProblem = await problem.save();
            res.json(updatedProblem);
        } else {
            res.status(404).json({ message: 'Problem not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete problem
// @route   DELETE /api/problems/:id
// @access  Private/Admin
const deleteProblem = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);

        if (problem) {
            // Remove from sheet
            await Sheet.findByIdAndUpdate(problem.sheetId, {
                $pull: { problems: problem._id },
                $inc: { totalProblems: -1 },
            });

            await problem.deleteOne();
            res.json({ message: 'Problem removed' });
        } else {
            res.status(404).json({ message: 'Problem not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProblems,
    getProblemById,
    createProblem,
    updateProblem,
    deleteProblem,
};
