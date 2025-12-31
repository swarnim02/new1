const express = require('express');
const router = express.Router();
const {
    getParticipatedContests,
    getMyContests,
    getUpsolveQueue,
    recommendUpsolve,
    addPersonalContest,
    bulkUpsolve,
    markProblemSolved,
    verifyProblem,
    verifyQueue,
    getMyStats,
    getGroupProblems,
    submitGroupSolve
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and student-only
router.use(protect);
router.use(authorize('student'));

router.get('/participated-contests', getParticipatedContests);
router.get('/my-contests', getMyContests);
router.get('/upsolve-queue', getUpsolveQueue);
router.post('/smart-upsolve', recommendUpsolve);
router.post('/add-personal-contest', addPersonalContest);
router.post('/bulk-upsolve', bulkUpsolve);
router.post('/verify-problem/:problemStatusId', verifyProblem);
router.post('/verify-queue', verifyQueue);
router.put('/mark-solved/:problemStatusId', markProblemSolved);
router.get('/my-stats', getMyStats);
router.get('/group-problems', getGroupProblems);
router.post('/submit-solve/:problemId', submitGroupSolve);

module.exports = router;
