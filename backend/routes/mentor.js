const express = require('express');
const router = express.Router();
const { 
    createGroup,
    getMyGroups,
    addStudentsToGroup,
    createContest,
    viewStudentProgress,
    addGroupProblem,
    getGroupStats,
    createProblemSet,
    getProblemSets
} = require('../controllers/mentorController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and mentor-only
router.use(protect);
router.use(authorize('mentor'));

router.post('/create-group', createGroup);
router.get('/groups', getMyGroups);
router.post('/add-students/:groupId', addStudentsToGroup);
router.post('/create-contest/:groupId', createContest);
router.get('/progress/:groupId/:contestId', viewStudentProgress);
router.post('/group-problem/:groupId', addGroupProblem);
router.get('/group-stats/:groupId', getGroupStats);
router.post('/create-set/:groupId', createProblemSet);
router.get('/problem-sets/:groupId', getProblemSets);

module.exports = router;
