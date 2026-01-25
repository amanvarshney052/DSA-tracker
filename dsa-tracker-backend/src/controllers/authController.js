const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const crypto = require('crypto');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        console.log('Register Request Body:', req.body); // DEBUG
        const { name, email, password } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Register Error:', error);

        // Handle Mongoose Validation Error
        if (error.name === 'ValidationError') {
            const message = Object.values(error.errors).map((val) => val.message).join(', ');
            return res.status(400).json({ message });
        }

        // Handle Duplicate Key Error (if not caught by checkout above)
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            if (user.isBlocked) {
                return res.status(403).json({ message: 'Your account has been blocked. Contact admin.' });
            }

            // Update last active date and streak
            const today = new Date().setHours(0, 0, 0, 0);
            const lastActive = new Date(user.lastActiveDate).setHours(0, 0, 0, 0);
            const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

            if (daysDiff === 1) {
                user.streak += 1;
            } else if (daysDiff > 1) {
                user.streak = 1;
            }

            user.lastActiveDate = Date.now();
            await user.save();

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                streak: user.streak,
                activeSheet: user.activeSheet,
                hasOnboarded: user.hasOnboarded,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                goal: user.goal,
                dailyGoal: user.dailyGoal,
                streak: user.streak,
                preferredLanguage: user.preferredLanguage,
                xpPoints: user.xpPoints,
                level: user.level,
                activeSheet: user.activeSheet,
                hasOnboarded: user.hasOnboarded,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.goal = req.body.goal || user.goal;
            user.dailyGoal = req.body.dailyGoal || user.dailyGoal;
            user.preferredLanguage = req.body.preferredLanguage || user.preferredLanguage;

            // Handle activeSheet update (allow null for Overall)
            if (req.body.activeSheet !== undefined) {
                user.activeSheet = req.body.activeSheet;
            }

            if (req.body.hasOnboarded !== undefined) {
                user.hasOnboarded = req.body.hasOnboarded;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                goal: updatedUser.goal,
                dailyGoal: updatedUser.dailyGoal,
                preferredLanguage: updatedUser.preferredLanguage,
                activeSheet: updatedUser.activeSheet,
                hasOnboarded: updatedUser.hasOnboarded,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleCallback = (req, res) => {
    const token = generateToken(req.user._id);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    // Redirect to frontend with token
    res.redirect(`${frontendUrl}/oauth/callback?token=${token}`);
};

// @desc    Update user password
// @route   PUT /api/auth/updatepassword
// @access  Private
const updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('+password');

        if (user) {
            // Check current password
            if (await user.matchPassword(req.body.currentPassword)) {
                user.password = req.body.newPassword;
                await user.save();
                res.json({ message: 'Password updated' });
            } else {
                res.status(401).json({ message: 'Invalid current password' });
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        // In a real app, send email here. For now, log to console.
        console.log('------------------------------------');
        console.log('PASSWORD RESET LINK (COPY THIS):');
        console.log(resetUrl);
        console.log('------------------------------------');

        res.status(200).json({ message: 'Email sent' });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        res.status(500).json({ message: 'Email could not be sent' });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            message: 'Password updated success',
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    googleCallback,
    updatePassword,
    forgotPassword,
    resetPassword,
};
