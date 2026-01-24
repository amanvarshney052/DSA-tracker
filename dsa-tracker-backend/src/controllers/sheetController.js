const Sheet = require('../models/Sheet');
const Problem = require('../models/Problem');
const UserProgress = require('../models/UserProgress');

// @desc    Get all sheets
// @route   GET /api/sheets
// @access  Private
const getSheets = async (req, res) => {
    try {
        const sheets = await Sheet.find({ isPublic: true })
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        // Calculate progress for each sheet
        const sheetsWithProgress = await Promise.all(sheets.map(async (sheet) => {
            const sheetObj = sheet.toObject();

            // Get problem IDs for this sheet
            // Assuming sheet.problems contains ObjectIds or objects with _id
            // If populate('problems') was used, we'd need to map to _id, but here it's likely just IDs or we need to check schema
            // Based on getSheetById, sheet.problems seems to be populated there, but here it might be just IDs if defined in schema as ref array
            // Let's perform a count based on the problems array

            if (sheet.problems && sheet.problems.length > 0) {
                const solvedCount = await UserProgress.countDocuments({
                    userId: req.user._id,
                    problemId: { $in: sheet.problems },
                    solved: true
                });
                sheetObj.solvedProblems = solvedCount;
                sheetObj.totalProblems = sheet.problems.length;
            } else {
                sheetObj.solvedProblems = 0;
                sheetObj.totalProblems = 0;
            }

            return sheetObj;
        }));

        res.json(sheetsWithProgress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get sheet by ID with problems and progress
// @route   GET /api/sheets/:id
// @access  Private
const getSheetById = async (req, res) => {
    try {
        const sheet = await Sheet.findById(req.params.id)
            .populate('createdBy', 'name')
            .populate('problems');

        if (sheet) {
            // Get user progress for this sheet's problems
            const problemIds = sheet.problems.map(p => p._id);
            const progress = await UserProgress.find({
                userId: req.user._id,
                problemId: { $in: problemIds },
            });

            // Create a map of problem progress
            const progressMap = {};
            progress.forEach(p => {
                progressMap[p.problemId.toString()] = p;
            });

            // Attach progress to each problem
            const problemsWithProgress = sheet.problems.map(problem => ({
                ...problem.toObject(),
                userProgress: progressMap[problem._id.toString()] || null,
            }));

            res.json({
                ...sheet.toObject(),
                problems: problemsWithProgress,
            });
        } else {
            res.status(404).json({ message: 'Sheet not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new sheet
// @route   POST /api/sheets
// @access  Private/Admin
const createSheet = async (req, res) => {
    try {
        const { name, description, difficulty, isPublic } = req.body;

        const sheet = await Sheet.create({
            name,
            description,
            difficulty,
            isPublic,
            createdBy: req.user._id,
        });

        res.status(201).json(sheet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update sheet
// @route   PUT /api/sheets/:id
// @access  Private/Admin
const updateSheet = async (req, res) => {
    try {
        const sheet = await Sheet.findById(req.params.id);

        if (sheet) {
            sheet.name = req.body.name || sheet.name;
            sheet.description = req.body.description || sheet.description;
            sheet.difficulty = req.body.difficulty || sheet.difficulty;
            sheet.isPublic = req.body.isPublic !== undefined ? req.body.isPublic : sheet.isPublic;
            sheet.updatedAt = Date.now();

            const updatedSheet = await sheet.save();
            res.json(updatedSheet);
        } else {
            res.status(404).json({ message: 'Sheet not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete sheet
// @route   DELETE /api/sheets/:id
// @access  Private/Admin
const deleteSheet = async (req, res) => {
    try {
        const sheet = await Sheet.findById(req.params.id);

        if (sheet) {
            // Delete all problems in the sheet
            await Problem.deleteMany({ sheetId: sheet._id });

            await sheet.deleteOne();
            res.json({ message: 'Sheet and associated problems removed' });
        } else {
            res.status(404).json({ message: 'Sheet not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSheets,
    getSheetById,
    createSheet,
    updateSheet,
    deleteSheet,
};
