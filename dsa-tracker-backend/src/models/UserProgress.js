const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true,
    },
    solved: {
        type: Boolean,
        default: false,
    },
    solvedAt: {
        type: Date,
    },
    timeTaken: {
        type: Number,
        default: 0,
    },
    notes: {
        type: String,
        default: '',
    },
    approach: {
        type: String,
        default: '',
    },
    code: {
        type: String,
        default: '',
    },
    markedForRevision: {
        type: Boolean,
        default: false,
    },
    revisionDates: [{
        type: Date,
    }],
    nextRevisionDate: {
        type: Date,
    },
    revisionCount: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Compound index for efficient queries
userProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });
// Index for progress calculation
userProgressSchema.index({ userId: 1, solved: 1 });

module.exports = mongoose.model('UserProgress', userProgressSchema);
