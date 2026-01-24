const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
    },
    goal: {
        type: String,
        default: 'SDE / Backend / Placements 2026',
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    dailyGoal: {
        type: Number,
        default: 3,
    },
    streak: {
        type: Number,
        default: 0,
    },
    lastActiveDate: {
        type: Date,
        default: Date.now,
    },
    preferredLanguage: {
        type: String,
        default: 'javascript',
    },
    activeSheet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sheet',
    },
    hasOnboarded: {
        type: Boolean,
        default: false,
    },
    xpPoints: {
        type: Number,
        default: 0,
    },
    level: {
        type: Number,
        default: 1,
    },
    isBlocked: {
        type: Boolean,
        default: false,
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

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
