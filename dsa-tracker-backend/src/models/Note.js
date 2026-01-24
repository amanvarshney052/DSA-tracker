const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    topic: {
        type: String,
        required: [true, 'Please provide a topic'],
        trim: true,
    },
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        trim: true,
    },
    content: {
        type: String,
        required: [true, 'Please provide content'],
    },
    codeTemplates: {
        type: String,
        default: '',
    },
    tags: [{
        type: String,
        trim: true,
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

module.exports = mongoose.model('Note', noteSchema);
