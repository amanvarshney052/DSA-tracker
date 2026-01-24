const mongoose = require('mongoose');

const sheetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a sheet name'],
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    totalProblems: {
        type: Number,
        default: 0,
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'mixed'],
        default: 'mixed',
    },
    isPublic: {
        type: Boolean,
        default: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    problems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Sheet', sheetSchema);
