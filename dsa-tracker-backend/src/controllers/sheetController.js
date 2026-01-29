const Sheet = require('../models/Sheet');
const Problem = require('../models/Problem');
const UserProgress = require('../models/UserProgress');

// @desc    Get all sheets
// @route   GET /api/sheets
// @access  Private
// @desc    Get all sheets
// @route   GET /api/sheets
// @access  Private
const getSheets = async (req, res) => {
    try {
        console.time('getSheets:fetchSheets');
        const sheets = await Sheet.find({ isPublic: true })
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        console.timeEnd('getSheets:fetchSheets');

        console.time('getSheets:fetchProgress');
        // Optimization: Fetch all solved problem IDs for this user in one go
        // instead of querying for each sheet separately.
        const solvedProblems = await UserProgress.distinct('problemId', {
            userId: req.user._id,
            solved: true
        });

        // Convert ObjectIds to strings for easier comparison if needed, 
        // though distinct usually returns what's in DB. set for O(1) lookups.
        const solvedProblemIds = new Set(solvedProblems.map(id => id.toString()));
        console.timeEnd('getSheets:fetchProgress');

        console.time('getSheets:calcProgress');
        // Calculate progress for each sheet in-memory
        const sheetsWithProgress = sheets.map(sheet => {
            const sheetObj = sheet.toObject();

            if (sheet.problems && sheet.problems.length > 0) {
                // Count how many of the sheet's problems are in the solved set
                let solvedCount = 0;
                sheet.problems.forEach(problemId => {
                    if (solvedProblemIds.has(problemId.toString())) {
                        solvedCount++;
                    }
                });

                sheetObj.solvedProblems = solvedCount;
                sheetObj.totalProblems = sheet.problems.length;
            } else {
                sheetObj.solvedProblems = 0;
                sheetObj.totalProblems = 0;
            }

            return sheetObj;
        });
        console.timeEnd('getSheets:calcProgress');

        res.json(sheetsWithProgress);
    } catch (error) {
        console.error('getSheets Error:', error);
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
