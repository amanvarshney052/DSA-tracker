const Revision = require('../models/Revision');
const UserProgress = require('../models/UserProgress');

// @desc    Get revision schedule
// @route   GET /api/revision
// @access  Private
const getRevisionSchedule = async (req, res) => {
    try {
        const { status } = req.query; // 'pending', 'completed', 'overdue'

        let query = { userId: req.user._id };

        if (status === 'completed') {
            query.completed = true;
        } else if (status === 'pending') {
            query.completed = false;
        } else if (status === 'overdue') {
            query.completed = false;
            query.scheduledDate = { $lt: new Date() };
        }

        const revisions = await Revision.find(query)
            .populate('problemId')
            .sort({ scheduledDate: 1 });

        res.json(revisions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get overdue revisions
// @route   GET /api/revision/overdue
// @access  Private
const getOverdueRevisions = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const overdueRevisions = await Revision.find({
            userId: req.user._id,
            scheduledDate: { $lt: today },
            completed: false,
        })
            .populate('problemId')
            .sort({ scheduledDate: 1 });

        res.json(overdueRevisions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark revision as complete
// @route   PUT /api/revision/:id/complete
// @access  Private
const markRevisionComplete = async (req, res) => {
    try {
        const revision = await Revision.findById(req.params.id);

        if (revision && revision.userId.toString() === req.user._id.toString()) {
            revision.completed = true;
            revision.completedAt = Date.now();

            await revision.save();

            // Update user progress revision count
            const progress = await UserProgress.findOne({
                userId: req.user._id,
                problemId: revision.problemId,
            });

            if (progress) {
                progress.revisionCount += 1;
                progress.revisionDates.push(Date.now());

                // Schedule next revision if applicable
                if (revision.revisionNumber < 3) {
                    const revisionDays = [1, 7, 30];
                    const nextDay = revisionDays[revision.revisionNumber];
                    const nextRevisionDate = new Date();
                    nextRevisionDate.setDate(nextRevisionDate.getDate() + nextDay);

                    progress.nextRevisionDate = nextRevisionDate;
                }

                await progress.save();
            }

            res.json(revision);
        } else {
            res.status(404).json({ message: 'Revision not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get revision statistics
// @route   GET /api/revision/stats
// @access  Private
const getRevisionStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // 1. Revisions Due Today (and strictly today, not just overdue)
        // Adjusting logic: Due Today usually includes Overdue in user's mind, but let's separate them as requested.
        // Due Today: scheduledDate >= today && scheduledDate < tomorrow && !completed
        // Overdue: scheduledDate < today && !completed

        const dueTodayCount = await Revision.countDocuments({
            userId: req.user._id,
            scheduledDate: { $gte: today, $lt: tomorrow },
            completed: false
        });

        const overdueCount = await Revision.countDocuments({
            userId: req.user._id,
            scheduledDate: { $lt: today },
            completed: false
        });

        // 3. Total Problems Marked for Revision (Total active revisions pending)
        const totalPendingCount = await Revision.countDocuments({
            userId: req.user._id,
            completed: false
        });

        // 4. Weak Topics
        // We can infer weak topics from UserProgress where markedForRevision is true or revisionCount is high
        // Let's aggregate UserProgress to find topics with most active revisions
        const weakTopicsAggregation = await UserProgress.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    markedForRevision: true
                }
            },
            {
                $lookup: {
                    from: 'problems',
                    localField: 'problemId',
                    foreignField: '_id',
                    as: 'problem'
                }
            },
            { $unwind: '$problem' },
            { $unwind: '$problem.topics' },
            {
                $group: {
                    _id: '$problem.topics',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 3 }
        ]);

        const weakTopics = weakTopicsAggregation.map(t => ({ topic: t._id, count: t.count }));

        res.json({
            dueToday: dueTodayCount,
            overdue: overdueCount,
            totalPending: totalPendingCount,
            weakTopics
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a revision (Stop revising)
// @route   DELETE /api/revision/:id
// @access  Private
const deleteRevision = async (req, res) => {
    try {
        const revision = await Revision.findById(req.params.id);

        if (revision && revision.userId.toString() === req.user._id.toString()) {
            // Also update the UserProgress to stop future revisions for this problem
            await UserProgress.updateOne(
                { userId: req.user._id, problemId: revision.problemId },
                {
                    $set: {
                        markedForRevision: false,
                        nextRevisionDate: null
                    }
                }
            );

            await revision.deleteOne();
            res.json({ message: 'Revision removed' });
        } else {
            res.status(404).json({ message: 'Revision not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getRevisionSchedule,
    getOverdueRevisions,
    markRevisionComplete,
    getRevisionStats,
    deleteRevision
};
