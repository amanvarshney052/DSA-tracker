const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a problem title'],
        trim: true,
    },
    platform: {
        type: String,
        required: [true, 'Please provide a platform'],
        enum: ['leetcode', 'codeforces', 'gfg', 'codechef', 'hackerrank', 'custom'],
    },
    platformIcon: {
        type: String,
        default: '',
    },
    problemUrl: {
        type: String,
        required: [true, 'Please provide a problem URL'],
    },
    difficulty: {
        type: String,
        required: [true, 'Please provide difficulty'],
        enum: ['easy', 'medium', 'hard'],
    },
    topics: [{
        type: String,
        trim: true,
    }],
    sheetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sheet',
        required: true,
    },
    estimatedTime: {
        type: Number,
        default: 30,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Problem', problemSchema);
