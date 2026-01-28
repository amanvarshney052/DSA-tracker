const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    googleCallback,
    updatePassword,
    forgotPassword,
    resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const passport = require('passport');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword/verify', resetPassword);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.put('/updatepassword', protect, updatePassword);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }), // session: false for JWT
    googleCallback
);

module.exports = router;
