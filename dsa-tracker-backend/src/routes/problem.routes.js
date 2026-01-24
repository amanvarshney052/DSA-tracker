const express = require('express');
const router = express.Router();
const {
    getProblems,
    getProblemById,
    createProblem,
    updateProblem,
    deleteProblem,
} = require('../controllers/problemController');
const { protect, admin } = require('../middleware/auth');

const {
    bulkImportProblems
} = require('../controllers/importController');

router.route('/')
    .get(protect, getProblems)
    .post(protect, admin, createProblem);

router.post('/bulk-import', protect, admin, bulkImportProblems);

router.route('/:id')
    .get(protect, getProblemById)
    .put(protect, admin, updateProblem)
    .delete(protect, admin, deleteProblem);

module.exports = router;
