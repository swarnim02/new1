const Group = require('../models/Group');
const Contest = require('../models/Contest');
const ProblemStatus = require('../models/ProblemStatus');
const User = require('../models/User');
const GroupProblem = require('../models/GroupProblem');
const GroupProblemStatus = require('../models/GroupProblemStatus');
const ProblemSet = require('../models/ProblemSet');
const { parseProblemLink, validateProblemLink } = require('../utils/codeforcesAPI');

/**
 * @desc    Create a new group
 * @route   POST /api/mentor/create-group
 * @access  Private (Mentor only)
 */
const createGroup = async (req, res) => {
    const { groupName } = req.body;

    try {
        if (!groupName) {
            return res.status(400).json({ message: 'Group name is required' });
        }

        // Check if group name already exists
        const existingGroup = await Group.findOne({ groupName });
        if (existingGroup) {
            return res.status(400).json({ message: 'Group name already exists' });
        }

        const group = await Group.create({
            groupName,
            mentorId: req.user._id,
            students: [],
            contests: []
        });

        res.status(201).json(group);
    } catch (error) {
        console.error('Create group error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Get mentor's groups
 * @route   GET /api/mentor/groups
 * @access  Private (Mentor only)
 */
const getMyGroups = async (req, res) => {
    try {
        const groups = await Group.find({ mentorId: req.user._id })
            .populate('students', 'name email codeforcesHandle')
            .populate('contests');

        res.status(200).json(groups);
    } catch (error) {
        console.error('Get groups error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Add students to a group
 * @route   POST /api/mentor/add-students/:groupId
 * @access  Private (Mentor only)
 */
const addStudentsToGroup = async (req, res) => {
    const { groupId } = req.params;
    const { studentEmails } = req.body; // Array of student emails

    try {
        if (!studentEmails || !Array.isArray(studentEmails)) {
            return res.status(400).json({ message: 'Student emails array is required' });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Verify mentor owns this group
        if (group.mentorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Find students by email
        const students = await User.find({ 
            email: { $in: studentEmails.map(e => e.toLowerCase()) },
            role: 'student'
        });

        if (students.length === 0) {
            return res.status(404).json({ message: 'No valid students found' });
        }

        // Add students to group (avoid duplicates)
        const studentIds = group.students.map(id => id.toString());
        const newStudents = students.filter(
            student => !studentIds.includes(student._id.toString())
        );

        if (newStudents.length === 0) {
            return res.status(200).json({ 
                message: 'All specified students are already in this group',
                group 
            });
        }

        group.students.push(...newStudents.map(s => s._id));
        await group.save();

        // Update students' groupIds array (always ensure it's there, $addToSet avoids duplicates)
        await User.updateMany(
            { _id: { $in: students.map(s => s._id) } },
            { $addToSet: { groupIds: group._id } }
        );

        // Initialize GroupProblemStatus for new students for all existing group problems
        const groupProblems = await GroupProblem.find({ groupId });
        const initStatuses = [];
        for (const student of newStudents) {
            for (const prob of groupProblems) {
                initStatuses.push({
                    userId: student._id,
                    problemId: prob._id,
                    groupId: group._id,
                    status: 'Pending'
                });
            }
        }
        if (initStatuses.length > 0) {
            await GroupProblemStatus.insertMany(initStatuses);
        }

        res.status(200).json({ 
            message: `${newStudents.length} student(s) added successfully`,
            group 
        });
    } catch (error) {
        console.error('Add students error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Create a contest for a group
 * @route   POST /api/mentor/create-contest/:groupId
 * @access  Private (Mentor only)
 */
const createContest = async (req, res) => {
    const { groupId } = req.params;
    const { contestName, problems } = req.body; // problems: [{ order: 'A', link: 'url' }, ...]

    try {
        if (!contestName || !problems || !Array.isArray(problems)) {
            return res.status(400).json({ message: 'Contest name and problems array required' });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Verify mentor owns this group
        if (group.mentorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Validate problem links (optional: can be async validated)
        const validatedProblems = [];
        for (const problem of problems) {
            if (!problem.order || !problem.link) {
                return res.status(400).json({ 
                    message: 'Each problem must have order and link' 
                });
            }

            const parsed = parseProblemLink(problem.link);
            if (!parsed) {
                return res.status(400).json({ 
                    message: `Invalid Codeforces link: ${problem.link}` 
                });
            }

            validatedProblems.push({
                order: problem.order.toUpperCase(),
                link: problem.link
            });
        }

        // Create contest
        const contest = await Contest.create({
            contestName,
            mentorId: req.user._id,
            problems: validatedProblems
        });

        // Add contest to group
        group.contests.push(contest._id);
        await group.save();

        // Initialize ProblemStatus for all students
        const students = await User.find({ groupId: group._id });
        const problemStatuses = [];

        for (const student of students) {
            for (const problem of validatedProblems) {
                problemStatuses.push({
                    userId: student._id,
                    contestId: contest._id,
                    problemIndex: problem.order,
                    status: 'Pending'
                });
            }
        }

        if (problemStatuses.length > 0) {
            await ProblemStatus.insertMany(problemStatuses);
        }

        res.status(201).json(contest);
    } catch (error) {
        console.error('Create contest error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    View student progress in a contest
 * @route   GET /api/mentor/progress/:groupId/:contestId
 * @access  Private (Mentor only)
 */
const viewStudentProgress = async (req, res) => {
    const { groupId, contestId } = req.params;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Verify mentor owns this group
        if (group.mentorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        // Get all problem statuses for this contest
        const statuses = await ProblemStatus.find({ contestId })
            .populate('userId', 'name email');

        // Organize data by student
        const progress = {};
        for (const status of statuses) {
            const studentId = status.userId._id.toString();
            
            if (!progress[studentId]) {
                progress[studentId] = {
                    student: {
                        _id: status.userId._id,
                        name: status.userId.name,
                        email: status.userId.email
                    },
                    problems: []
                };
            }

            progress[studentId].problems.push({
                index: status.problemIndex,
                status: status.status,
                solvedAt: status.solvedAt
            });
        }

        res.status(200).json({
            contest,
            progress: Object.values(progress)
        });
    } catch (error) {
        console.error('View progress error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Add a question to a group
 * @route   POST /api/mentor/group-problem/:groupId
 * @access  Private (Mentor only)
 */
const addGroupProblem = async (req, res) => {
    const { groupId } = req.params;
    const { title, link, platform } = req.body;

    try {
        if (!title || !link || !platform) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        if (group.mentorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const problem = await GroupProblem.create({
            groupId,
            title,
            link,
            platform,
            mentorId: req.user._id
        });

        // If setId is provided, add problem to the set
        const { setId } = req.body;
        if (setId) {
            await ProblemSet.findByIdAndUpdate(setId, { $addToSet: { problems: problem._id } });
        }

        // Initialize status for all students in group
        const initStatuses = group.students.map(studentId => ({
            userId: studentId,
            problemId: problem._id,
            groupId: group._id,
            status: 'Pending'
        }));

        if (initStatuses.length > 0) {
            await GroupProblemStatus.insertMany(initStatuses);
        }

        res.status(201).json(problem);
    } catch (error) {
        console.error('Add group problem error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Create a new problem set in a group
 * @route   POST /api/mentor/create-set/:groupId
 * @access  Private (Mentor only)
 */
const createProblemSet = async (req, res) => {
    const { groupId } = req.params;
    const { setName } = req.body;

    try {
        if (!setName) return res.status(400).json({ message: 'Set name is required' });

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        if (group.mentorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const problemSet = await ProblemSet.create({
            setName,
            groupId,
            mentorId: req.user._id
        });

        await Group.findByIdAndUpdate(groupId, { $addToSet: { problemSets: problemSet._id } });

        res.status(201).json(problemSet);
    } catch (error) {
        console.error('Create set error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Get all problem sets for a group
 * @route   GET /api/mentor/problem-sets/:groupId
 * @access  Private (Mentor only)
 */
const getProblemSets = async (req, res) => {
    const { groupId } = req.params;

    try {
        const sets = await ProblemSet.find({ groupId }).populate('problems');
        res.status(200).json(sets);
    } catch (error) {
        console.error('Get sets error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Get Group Statistics
 * @route   GET /api/mentor/group-stats/:groupId
 * @access  Private (Mentor only)
 */
const getGroupStats = async (req, res) => {
    const { groupId } = req.params;

    try {
        const group = await Group.findById(groupId).populate('students', 'name email codeforcesHandle');
        if (!group) return res.status(404).json({ message: 'Group not found' });

        if (group.mentorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const problems = await GroupProblem.find({ groupId });
        const statuses = await GroupProblemStatus.find({ groupId }).populate('userId', 'name');

        // Stats per question
        const questionStats = problems.map(prob => {
            const probStatuses = statuses.filter(s => s.problemId.toString() === prob._id.toString());
            const solvedCount = probStatuses.filter(s => s.status === 'Solved').length;
            
            // Time distribution for this question
            const timeDist = {
                '<20min': probStatuses.filter(s => s.timeTaken === '<20min').length,
                '<30min': probStatuses.filter(s => s.timeTaken === '<30min').length,
                '<1hour': probStatuses.filter(s => s.timeTaken === '<1hour').length,
                '<3hour': probStatuses.filter(s => s.timeTaken === '<3hour').length,
            };

            return {
                _id: prob._id,
                title: prob.title,
                solved: solvedCount,
                total: probStatuses.length,
                timeDist
            };
        });

        // Stats per student
        const studentStats = group.students.map(student => {
            const studentStatuses = statuses.filter(s => s.userId._id.toString() === student._id.toString());
            const solves = studentStatuses.filter(s => s.status === 'Solved').map(s => {
                const prob = problems.find(p => p._id.toString() === s.problemId.toString());
                return {
                    problemTitle: prob ? prob.title : 'Deleted Problem',
                    timeTaken: s.timeTaken,
                    learnings: s.learnings,
                    solvedAt: s.solvedAt
                };
            });

            return {
                _id: student._id,
                name: student.name,
                email: student.email,
                totalAssigned: studentStatuses.length,
                totalSolved: solves.length,
                solves
            };
        });

        res.status(200).json({
            groupName: group.groupName,
            questionStats,
            studentStats
        });
    } catch (error) {
        console.error('Get group stats error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createGroup,
    getMyGroups,
    addStudentsToGroup,
    createContest,
    viewStudentProgress,
    addGroupProblem,
    getGroupStats,
    createProblemSet,
    getProblemSets
};
