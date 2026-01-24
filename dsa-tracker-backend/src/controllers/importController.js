const Problem = require('../models/Problem');
const Sheet = require('../models/Sheet');

// @desc    Bulk import problems
// @route   POST /api/problems/bulk-import
// @access  Private/Admin
const bulkImportProblems = async (req, res) => {
    try {
        const { problems, sheetId } = req.body;

        if (!problems || !Array.isArray(problems) || problems.length === 0) {
            return res.status(400).json({ message: 'No problems provided' });
        }

        if (!sheetId) {
            return res.status(400).json({ message: 'Sheet ID is required' });
        }

        // Validate Sheet Exists
        const sheet = await Sheet.findById(sheetId);
        if (!sheet) {
            return res.status(404).json({ message: 'Sheet not found' });
        }

        const normalizePlatform = (p) => {
            const lower = p?.toLowerCase().trim();
            if (lower === 'geeksforgeeks' || lower === 'gfg') return 'gfg';
            if (lower === 'leetcode') return 'leetcode';
            if (lower === 'codeforces') return 'codeforces';
            if (lower === 'codechef') return 'codechef';
            if (lower === 'hackerrank') return 'hackerrank';
            return 'custom';
        };

        // Basic validation and mapping
        const validProblems = problems.map(p => ({
            title: p.title,
            platform: normalizePlatform(p.platform),
            problemUrl: p.url, // Map CSV 'url' to 'problemUrl'
            difficulty: p.difficulty?.toLowerCase(),
            topics: p.topics ? p.topics.split(/[,;]/).map(t => t.trim()).filter(Boolean) : [],
            estimatedTime: parseInt(p.estimatedTime) || 30, // Parse int or default to 30
            sheetId: sheetId,
            createdBy: req.user._id
        })).filter(p => p.title && p.platform && p.problemUrl); // Ensure required fields

        if (validProblems.length === 0) {
            return res.status(400).json({ message: 'No valid problems found to import' });
        }

        // Insert Many
        const insertedProblems = await Problem.insertMany(validProblems);

        // Extract IDs
        const problemIds = insertedProblems.map(p => p._id);

        // Update Sheet
        await Sheet.findByIdAndUpdate(sheetId, {
            $push: { problems: { $each: problemIds } },
            $inc: { totalProblems: insertedProblems.length }
        });

        res.status(201).json({
            message: `Successfully imported ${insertedProblems.length} problems`,
            count: insertedProblems.length
        });

    } catch (error) {
        console.error('Bulk Import Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    bulkImportProblems
};
