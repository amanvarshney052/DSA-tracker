const express = require('express');
const router = express.Router();
const {
    getSheets,
    getSheetById,
    createSheet,
    updateSheet,
    deleteSheet,
} = require('../controllers/sheetController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
    .get(protect, getSheets)
    .post(protect, admin, createSheet);

router.route('/:id')
    .get(protect, getSheetById)
    .put(protect, admin, updateSheet)
    .delete(protect, admin, deleteSheet);

module.exports = router;
