const express = require('express');
const router = express.Router();
const {
    getRevisionSchedule,
    getOverdueRevisions,
    markRevisionComplete,
    getRevisionStats,
    deleteRevision,
} = require('../controllers/revisionController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getRevisionSchedule);
router.get('/stats', protect, getRevisionStats);
router.get('/overdue', protect, getOverdueRevisions);
router.put('/:id/complete', protect, markRevisionComplete);
router.delete('/:id', protect, deleteRevision);

module.exports = router;
