const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth.routes');
const problemRoutes = require('./routes/problem.routes');
const sheetRoutes = require('./routes/sheet.routes');
const progressRoutes = require('./routes/progress.routes');
const revisionRoutes = require('./routes/revision.routes');
const notesRoutes = require('./routes/notes.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const adminRoutes = require('./routes/admin.routes');
const dailyRoutes = require('./routes/daily.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport middleware
const passport = require('./config/passport');
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/sheets', sheetRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/revision', revisionRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/daily', dailyRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'DSA Tracker API is running' });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
