const User = require('../models/User');
const Group = require('../models/Group');
const Contest = require('../models/Contest');
const ProblemStatus = require('../models/ProblemStatus');
const GroupProblem = require('../models/GroupProblem');
const GroupProblemStatus = require('../models/GroupProblemStatus');
const ProblemSet = require('../models/ProblemSet');
const { parseProblemLink, getProblemInfo, getUserSubmissions, getContestProblems, getUserRatingHistory, getAllProblems, getContestList } = require('../utils/codeforcesAPI');
const fs = require('fs');
const path = require('path');

const debugLog = (msg) => {
    const logPath = path.join(__dirname, '../debug.log');
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
};


/**
 * @desc    Get student's participated contests (from CF history)
 * @route   GET /api/student/participated-contests
 * @access  Private (Student)
 */
const getParticipatedContests = async (req, res) => {
    try {
        const user = req.user;
        if (!user.codeforcesHandle) {
            return res.status(200).json({ contests: [], message: 'Link your Codeforces handle to see recent contests.' });
        }

        const history = await getUserRatingHistory(user.codeforcesHandle);

        // Map to simpler structure
        const distinctContests = history.slice(0, 15).map(c => ({
            contestId: c.contestId,
            contestName: c.contestName,
            rank: c.rank,
            ratingChange: c.newRating - c.oldRating
        }));

        res.status(200).json({
            contests: distinctContests
        });

    } catch (error) {
        console.error('Get participated contests error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Get student's group and contests
 * @route   GET /api/student/my-contests
 * @access  Private (Student only)
 */
const getMyContests = async (req, res) => {

    try {
        const groupIds = req.user.groupIds;
        let groupContests = [];

        if (groupIds && groupIds.length > 0) {
            const groups = await Group.find({ _id: { $in: groupIds } })
                .populate('contests')
                .populate('mentorId', 'name email');
            
            groups.forEach(group => {
                if (group.contests) {
                    groupContests = [...groupContests, ...group.contests];
                }
            });
        }
        
        // Also fetch Personal Contests (created by this student via Upsolve features)
        const personalContests = await Contest.find({ mentorId: req.user._id });
        
        // Combine
        const allContests = [...groupContests, ...personalContests];

        res.status(200).json({ contests: allContests }); 
    } catch (error) {
        console.error('Get contests error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};



/**
 * @desc    Get upsolve queue for student
 * @route   GET /api/student/upsolve-queue
 * @access  Private (Student only)
 */
const getUpsolveQueue = async (req, res) => {
    try {
        debugLog(`Fetching queue for user: ${req.user._id}`);
        
        // Get all pending problems for this student
        const pendingStatuses = await ProblemStatus.find({
            userId: req.user._id,
            status: 'Pending'
        }).populate('contestId');

        debugLog(`Found ${pendingStatuses.length} pending records in DB`);

        const upsolveQueue = pendingStatuses.map(status => {
            const contest = status.contestId;
            if (!contest) {
                debugLog(`Status ${status._id} has no contestId`);
                return null;
            }

            const problem = contest.problems.find(p => p.order === status.problemIndex);
            if (!problem) {
                debugLog(`Status ${status._id} problem ${status.problemIndex} not found in contest ${contest._id}`);
                return null;
            }

            return {
                _id: status._id,
                contestName: contest.contestName,
                problemIndex: status.problemIndex,
                link: problem.link,
                createdAt: status.createdAt
            };
        }).filter(item => item !== null);

        debugLog(`Returning ${upsolveQueue.length} items to frontend`);

        res.status(200).json({
            total: upsolveQueue.length,
            queue: upsolveQueue
        });
    } catch (error) {
        debugLog(`Get upsolve queue error: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Smart Upsolve: Add next unsolved problems to queue
 * @route   POST /api/student/smart-upsolve
 * @access  Private (Student only)
 */
const recommendUpsolve = async (req, res) => {
    const { contestId, count } = req.body; // count: 1, 2, or 3
    const numToAdd = Math.min(Math.max(parseInt(count) || 1, 1), 3); // Limit to 1-3

    try {
        const user = req.user;
        if (!user.codeforcesHandle) {
            return res.status(400).json({ message: 'Codeforces handle not set in profile' });
        }

        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        if (contest.problems.length === 0) {
            return res.status(400).json({ message: 'Contest has no initial problems' });
        }

        // Determine CF Contest ID from the first problem link
        const parsed = parseProblemLink(contest.problems[0].link);
        if (!parsed) {
            return res.status(400).json({ message: 'Cannot parse Codeforces contest ID' });
        }
        const cfContestId = parsed.contestId;

        // Fetch Data from Codeforces
        const [contestData, userSubmissions] = await Promise.all([
            getContestProblems(cfContestId),
            getUserSubmissions(user.codeforcesHandle)
        ]);
        
        const allProblems = contestData.problems;

        if (!allProblems || !allProblems.length) {
            return res.status(500).json({ message: 'Failed to fetch contest problems from Codeforces' });
        }

        // Identify Solved Problems
        const solvedIndices = new Set();
        userSubmissions.forEach(sub => {
            if (sub.contestId == cfContestId && sub.verdict === 'OK') {
                solvedIndices.add(sub.problem.index);
            }
        });

        // Identify Recommendations
        // Problems in the contest (A, B, C...) that are NOT solved
        const recommendations = [];
        for (const prob of allProblems) {
            if (recommendations.length >= numToAdd) break;
            
            if (!solvedIndices.has(prob.index)) {
                // Also check if already in user's queue (Pending or Accepted in DB)
                const existingStatus = await ProblemStatus.findOne({
                    userId: user._id,
                    contestId: contest._id,
                    problemIndex: prob.index
                });

                if (!existingStatus) {
                    recommendations.push(prob);
                }
            }
        }

        if (recommendations.length === 0) {
            return res.status(200).json({ message: 'No new upsolve problems found (you mostly solved them all!)', added: [] });
        }

        const addedProblems = [];

        // Add to DB
        for (const prob of recommendations) {
            // 1. Ensure problem exists in Contest (extend contest if needed)
            const problemLink = `https://codeforces.com/contest/${cfContestId}/problem/${prob.index}`;
            const existingInContest = contest.problems.find(p => p.order === prob.index);

            if (!existingInContest) {
                contest.problems.push({
                    order: prob.index,
                    link: problemLink
                });
            }

            // 2. Add to ProblemStatus
            await ProblemStatus.create({
                userId: user._id,
                contestId: contest._id,
                problemIndex: prob.index,
                status: 'Pending'
            });

            addedProblems.push(prob.index);
        }

        await contest.save(); // Save any new problems to the contest schema

        res.status(200).json({
            message: `Added ${addedProblems.length} problems to your upsolve queue`,
            added: addedProblems
        });

    } catch (error) {
        console.error('Smart upsolve error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Bulk Upsolve: Auto-add next unsolved from ALL recent contests
 * @route   POST /api/student/bulk-upsolve
 * @access  Private (Student)
 */
const bulkUpsolve = async (req, res) => {
    const userId = req.user._id;
    console.time(`bulkUpsolve-${userId}`);
    try {
        const user = req.user;
        if (!user.codeforcesHandle) {
            return res.status(400).json({ message: 'Codeforces handle not set in profile' });
        }

        // 1. Fetch ALL data (parallel)
        debugLog(`[BulkUpsolve] Starting strict focus sync for ${user.codeforcesHandle}`);
        const { getUserRatingHistory, getUserSubmissions, getContestList, getAllProblems } = require('../utils/codeforcesAPI');
        const [history, submissions, contestList, allGlobalProblems] = await Promise.all([
            getUserRatingHistory(user.codeforcesHandle), // History source
            getUserSubmissions(user.codeforcesHandle),   // Solves source
            getContestList(),                             // Timing source
            getAllProblems()                             // Problems source
        ]);

        if (!contestList.length) {
            return res.status(500).json({ message: 'Failed to fetch contest timing from Codeforces' });
        }

        // 2. Map Constants and Global Data
        const contestInfoMap = new Map();
        contestList.forEach(c => {
            contestInfoMap.set(c.id, {
                endTime: c.startTimeSeconds + c.durationSeconds,
                name: c.name
            });
        });

        const contestProblemsMap = {};
        allGlobalProblems.forEach(p => {
            if (!contestProblemsMap[p.contestId]) {
                contestProblemsMap[p.contestId] = [];
            }
            contestProblemsMap[p.contestId].push(p);
        });
        Object.values(contestProblemsMap).forEach(list => {
            list.sort((a, b) => a.index.localeCompare(b.index, undefined, { numeric: true, sensitivity: 'base' }));
        });

        // 3. Robust Existing State Matching (By Name)
        const existingContests = await Contest.find({ mentorId: user._id });
        const existingStatuses = await ProblemStatus.find({ userId: user._id }).populate('contestId');
        
        // Group statuses by normalized contest name
        const statusesByContestName = new Map();
        existingStatuses.forEach(s => {
            if (!s.contestId) return;
            const normName = s.contestId.contestName.trim().toLowerCase();
            if (!statusesByContestName.has(normName)) statusesByContestName.set(normName, []);
            statusesByContestName.get(normName).push(s);
        });

        const recommendations = [];
        const statusesToSolve = []; 
        const processedContestNames = new Set();
        let addedCount = 0;
        let syncedCount = 0;

        let upsolveDoneCount = 0;
        let upsolvePendingCount = 0;

        // 4. PROCESS RATED HISTORY (THE SOURCE OF TRUTH)
        for (const ratingEvent of history) {
            const cId = ratingEvent.contestId;
            const problems = contestProblemsMap[cId];
            const timing = contestInfoMap.get(cId);

            if (!problems || !timing) continue;
            
            const normName = timing.name.trim().toLowerCase();
            processedContestNames.add(normName);

            // Find last accepted submission
            const acceptedSubs = submissions
                .filter(s => s.contestId === cId && s.verdict === "OK")
                .sort((a, b) => a.creationTimeSeconds - b.creationTimeSeconds);

            let lastSolvedTime = 0;
            let lastSolvedIdxInArray = -1;

            if (acceptedSubs.length > 0) {
                const lastSub = acceptedSubs[acceptedSubs.length - 1];
                lastSolvedTime = lastSub.creationTimeSeconds;
                lastSolvedIdxInArray = problems.findIndex(p => p.index === lastSub.problem.index);
            }

            const isCompleted = (acceptedSubs.length > 0 && lastSolvedTime > timing.endTime);
            const staleProblems = statusesByContestName.get(normName) || [];

            if (isCompleted) {
                // CASE 1: Completed -> All pending must be Solved
                upsolveDoneCount++;
                staleProblems.forEach(s => {
                    if (s.status === 'Pending') {
                        s.status = 'Solved';
                        s.solvedAt = new Date(lastSolvedTime * 1000);
                        statusesToSolve.push(s.save());
                        syncedCount++;
                    }
                });
                continue;
            }

            // CASE 2: Required -> Only the IMMEDIATE next (+1) should stay/be added
            upsolvePendingCount++;
            const nextIdx = lastSolvedIdxInArray + 1;
            let targetProblemIndex = null;
            if (nextIdx < problems.length) {
                const nextProb = problems[nextIdx];
                // Check if already solved globally later
                const isSolvedLater = submissions.some(s => s.contestId === cId && s.problem.index === nextProb.index && s.verdict === "OK");
                if (!isSolvedLater) {
                    targetProblemIndex = nextProb.index;
                } else {
                    // If everything solved including latest, treat as done? 
                    // No, user said strictly AFTER contest. But if they solved ALL, we don't add.
                }
            }

            // Cleanup Case 2: Mark everything else Solved
            staleProblems.forEach(s => {
                if (s.status === 'Pending' && s.problemIndex !== targetProblemIndex) {
                    s.status = 'Solved';
                    s.solvedAt = new Date();
                    statusesToSolve.push(s.save());
                    syncedCount++;
                }
            });

            // Add the target problem if missing
            if (targetProblemIndex && !staleProblems.some(s => s.problemIndex === targetProblemIndex)) {
                recommendations.push({
                    cfContestId: cId,
                    contestName: timing.name,
                    problem: problems[nextIdx]
                });
            }
        }

        // 5. GARBAGE COLLECTION: Cleanup problems from contests not in history
        existingStatuses.forEach(s => {
            if (s.status === 'Pending' && s.contestId) {
                const normName = s.contestId.contestName.trim().toLowerCase();
                if (!processedContestNames.has(normName)) {
                    s.status = 'Solved'; 
                    s.solvedAt = new Date();
                    statusesToSolve.push(s.save());
                    syncedCount++;
                }
            }
        });

        // 6. Final DB Operations
        const contestsToUpdate = new Set();
        const contestMapByIdentifier = new Map(existingContests.map(c => [c.contestName.trim().toLowerCase(), c]));
        const statusesToCreate = [];

        for (const item of recommendations) {
            const { cfContestId, contestName, problem } = item;
            const normName = contestName.trim().toLowerCase();
            let contest = contestMapByIdentifier.get(normName);
            
            if (!contest) {
                contest = await Contest.create({ contestName, mentorId: user._id, problems: [] });
                contestMapByIdentifier.set(normName, contest);
            }

            const problemLink = `https://codeforces.com/contest/${cfContestId}/problem/${problem.index}`;
            if (!contest.problems.some(p => p.order === problem.index)) {
                contest.problems.push({ order: problem.index, link: problemLink });
                contestsToUpdate.add(contest);
            }
            statusesToCreate.push({
                userId: user._id,
                contestId: contest._id,
                problemIndex: problem.index,
                status: 'Pending'
            });
            addedCount++;
        }

        await Promise.all([...statusesToSolve]);
        if (contestsToUpdate.size > 0) await Promise.all(Array.from(contestsToUpdate).map(c => c.save()));
        if (statusesToCreate.length > 0) await ProblemStatus.insertMany(statusesToCreate);

        debugLog(`BulkUpsolve Focused Sync finished. Added: ${addedCount}, Trashed/Synced: ${syncedCount}`);
        console.timeEnd(`bulkUpsolve-${userId}`);

        res.status(200).json({
            message: `Synchronization complete!`,
            stats: {
                contestGiven: history.length,
                upsolveDone: upsolveDoneCount,
                upsolvePending: upsolvePendingCount
            }
        });


    } catch (error) {
        console.error('Bulk upsolve sync error:', error.message);
        console.timeEnd(`bulkUpsolve-${userId}`);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};






/**
 * @desc    Add Personal Contest Upsolve
 * @route   POST /api/student/add-personal-contest
 * @access  Private (Student)
 */
const addPersonalContest = async (req, res) => {
    const { cfContestId, count } = req.body;
    const numToAdd = Math.min(Math.max(parseInt(count) || 1, 1), 5); // Limit to 5

    try {
        const user = req.user;
        if (!user.codeforcesHandle) {
            return res.status(400).json({ message: 'Codeforces handle not set in profile' });
        }

        // Fetch Data from Codeforces
        const [contestData, userSubmissions] = await Promise.all([
            getContestProblems(cfContestId),
            getUserSubmissions(user.codeforcesHandle)
        ]);
        
        const allProblems = contestData.problems;
        const contestName = contestData.name;

        if (!allProblems || !allProblems.length) {
            return res.status(404).json({ message: 'Contest not found on Codeforces' });
        }

        // Find or Create Internal Contest
        // We look for a contest named like the CF one, owned by this user
        let contest = await Contest.findOne({ 
            mentorId: user._id,
            contestName: contestName 
        });

        if (!contest) {
            // Create "Personal" contest
            contest = await Contest.create({
                contestName: contestName,
                mentorId: user._id,
                problems: []
            });
        }

        // Match Logic (Same as smart upsolve)
        const solvedIndices = new Set();
        userSubmissions.forEach(sub => {
            if (sub.contestId == cfContestId && sub.verdict === 'OK') {
                solvedIndices.add(sub.problem.index);
            }
        });

        const recommendations = [];
        for (const prob of allProblems) {
            if (recommendations.length >= numToAdd) break;
            
            if (!solvedIndices.has(prob.index)) {
                // Check existance
                const existingStatus = await ProblemStatus.findOne({
                    userId: user._id,
                    contestId: contest._id,
                    problemIndex: prob.index
                });

                if (!existingStatus) {
                    recommendations.push(prob);
                }
            }
        }

        if (recommendations.length === 0) {
            return res.status(200).json({ message: 'No new problems to solve (completed or invalid)', added: [] });
        }

        const addedProblems = [];

        // Add to DB
        for (const prob of recommendations) {
            const problemLink = `https://codeforces.com/contest/${cfContestId}/problem/${prob.index}`;
            const existingInContest = contest.problems.find(p => p.order === prob.index);

            if (!existingInContest) {
                contest.problems.push({
                    order: prob.index,
                    link: problemLink
                });
            }

            await ProblemStatus.create({
                userId: user._id,
                contestId: contest._id,
                problemIndex: prob.index,
                status: 'Pending'
            });

            addedProblems.push(prob.index);
        }

        await contest.save();

        res.status(200).json({
            message: `Created personal tracker for ${contestName} and added ${addedProblems.length} problems`,
            added: addedProblems
        });

    } catch (error) {
        console.error('Personal upsolve error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};


/**
 * @desc    Mark a problem as solved
 * @route   PUT /api/student/mark-solved/:problemStatusId
 * @access  Private (Student only)
 */
const markProblemSolved = async (req, res) => {
    const { problemStatusId } = req.params;

    try {
        const problemStatus = await ProblemStatus.findById(problemStatusId);

        if (!problemStatus) {
            return res.status(404).json({ message: 'Problem status not found' });
        }

        // Verify this belongs to the current user
        if (problemStatus.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Update status
        problemStatus.status = 'Accepted';
        problemStatus.solvedAt = new Date();
        await problemStatus.save();

        res.status(200).json({
            message: 'Problem marked as solved',
            problemStatus
        });
    } catch (error) {
        console.error('Mark solved error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Get student's problem statistics
 * @route   GET /api/student/my-stats
 * @access  Private (Student only)
 */
const getMyStats = async (req, res) => {
    try {
        const totalProblems = await ProblemStatus.countDocuments({ 
            userId: req.user._id 
        });

        const solvedProblems = await ProblemStatus.countDocuments({ 
            userId: req.user._id,
            status: 'Accepted'
        });

        const pendingProblems = totalProblems - solvedProblems;

        res.status(200).json({
            total: totalProblems,
            solved: solvedProblems,
            pending: pendingProblems,
            solveRate: totalProblems > 0 ? ((solvedProblems / totalProblems) * 100).toFixed(2) : 0
        });
    } catch (error) {
        console.error('Get stats error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};


/**
 * @desc    Verify if problem is solved on Codeforces
 * @route   POST /api/student/verify-problem/:problemStatusId
 * @access  Private
 */
const verifyProblem = async (req, res) => {
    try {
        const { problemStatusId } = req.params;
        const status = await ProblemStatus.findById(problemStatusId).populate('contestId');
        
        if (!status) return res.status(404).json({ message: 'Item not found' });
        
        // Safety check if contest exists
        if (!status.contestId) return res.status(404).json({ message: 'Contest reference missing' });
        
        // Find problem link from contest definition
        const probDef = status.contestId.problems.find(p => p.order === status.problemIndex);
        if (!probDef) return res.status(404).json({ message: 'Problem definition not found in contest' });
        
        const parsed = parseProblemLink(probDef.link);
        if (!parsed) return res.status(400).json({ message: `Invalid Codeforces Link: ${probDef.link}` });
        
        if (!req.user.codeforcesHandle) {
             return res.status(400).json({ message: 'Link your Codeforces handle first.' });
        }

        const submissions = await getUserSubmissions(req.user.codeforcesHandle);
        
        // Check if solved
        const isSolved = submissions.some(sub => 
            sub.contestId == parsed.contestId &&
            sub.problem.index === parsed.problemIndex &&
            sub.verdict === 'OK'
        );

        if (isSolved) {
            status.status = 'Solved';
            status.solvedAt = Date.now();
            await status.save();
            return res.status(200).json({ solved: true, message: 'Verified! Marked as Solved.' });
        } else {
            return res.status(200).json({ solved: false, message: 'Not solved on Codeforces yet.' });
        }

    } catch (error) {
        console.error('Verify problem error:', error.message);
        res.status(500).json({ message: 'Server error checking status' });
    }
};

/**
 * @desc    Verify ALL pending problems in queue
 * @route   POST /api/student/verify-queue
 * @access  Private
 */
const verifyQueue = async (req, res) => {
    try {
        const user = req.user;
        if (!user.codeforcesHandle) {
             return res.status(400).json({ message: 'Link your Codeforces handle first.' });
        }

        // Get all pending problems
        const pending = await ProblemStatus.find({
            userId: user._id,
            status: 'Pending'
        }).populate('contestId');

        if (pending.length === 0) {
            return res.status(200).json({ checked: 0, solved: 0, message: 'Queue is empty.' });
        }

        // Fetch User's Submissions (Once)
        const submissions = await getUserSubmissions(user.codeforcesHandle);
        let solvedCount = 0;

        // Verify each
        for (const item of pending) {
            if (!item.contestId) continue;
            
            // Find problem definition
            const probDef = item.contestId.problems.find(p => p.order === item.problemIndex);
            if (!probDef) continue;
            
            // Parse link
            const parsed = parseProblemLink(probDef.link);
            if (!parsed) continue;

            // Check if solved
            const isSolved = submissions.some(sub => 
                sub.contestId == parsed.contestId &&
                sub.problem.index === parsed.problemIndex &&
                sub.verdict === 'OK'
            );

            if (isSolved) {
                item.status = 'Solved';
                item.solvedAt = Date.now();
                await item.save(); // Direct save safer than bulk write for now
                solvedCount++;
            }
        }

        res.status(200).json({
            checked: pending.length,
            solved: solvedCount,
            message: `Verified ${pending.length} problems. ${solvedCount > 0 ? `Found ${solvedCount} solved! 🎉` : 'No new solves found.'}`
        });

    } catch (error) {
        console.error('Verify queue error:', error.message);
        res.status(500).json({ message: 'Server error verifying queue' });
    }
};

/**
 * @desc    Get problems assigned to the student's group
 * @route   GET /api/student/group-problems
 * @access  Private (Student only)
 */
const getGroupProblems = async (req, res) => {
    try {
        // Self-healing: Find all groups where this user is in the 'students' array
        const groupsWhereImIn = await Group.find({ students: req.user._id });
        const actualGroupIds = groupsWhereImIn.map(g => g._id.toString());
        
        // Update user if they are missing any of these groups in their 'groupIds' array
        const student = await User.findById(req.user._id);
        const currentGroupIds = (student.groupIds || []).map(id => id.toString());
        
        const missingGroups = actualGroupIds.filter(id => !currentGroupIds.includes(id));
        
        if (missingGroups.length > 0) {
            await User.findByIdAndUpdate(req.user._id, {
                $addToSet: { groupIds: { $each: missingGroups } }
            });
            // Refresh student object
            student.groupIds = [...(student.groupIds || []), ...missingGroups];
        }

        // Now populate for response
        await student.populate('groupIds');
        
        if (!student.groupIds || student.groupIds.length === 0) {
            return res.status(200).json({ groups: [] });
        }

        const groupsWithProblems = [];

        for (const group of student.groupIds) {
            if (!group) continue;
            
            // Fetch all sets for this group
            const sets = await ProblemSet.find({ groupId: group._id }).populate('problems');
            const groupSetsWithProblems = [];

            // Fetch all problem statuses for this student and group
            const statuses = await GroupProblemStatus.find({ 
                groupId: group._id,
                userId: req.user._id 
            });

            // Map problems in each set with their status
            for (const set of sets) {
                const problemsWithStatus = set.problems.map(prob => {
                    const statusEntry = statuses.find(s => s.problemId.toString() === prob._id.toString());
                    return {
                        ...prob.toObject(),
                        status: statusEntry ? statusEntry.status : 'Pending',
                        timeTaken: statusEntry ? statusEntry.timeTaken : '',
                        learnings: statusEntry ? statusEntry.learnings : '',
                        solvedAt: statusEntry ? statusEntry.solvedAt : null
                    };
                });

                groupSetsWithProblems.push({
                    setId: set._id,
                    setName: set.setName,
                    problems: problemsWithStatus
                });
            }

            // Also find problems NOT in any set (orphaned problems)
            const allProblemIdsInSets = sets.flatMap(s => s.problems.map(p => p._id.toString()));
            const orphanedProblems = await GroupProblem.find({ 
                groupId: group._id,
                _id: { $nin: allProblemIdsInSets }
            });

            if (orphanedProblems.length > 0) {
                const orphanedWithStatus = orphanedProblems.map(prob => {
                    const statusEntry = statuses.find(s => s.problemId.toString() === prob._id.toString());
                    return {
                        ...prob.toObject(),
                        status: statusEntry ? statusEntry.status : 'Pending',
                        timeTaken: statusEntry ? statusEntry.timeTaken : '',
                        learnings: statusEntry ? statusEntry.learnings : '',
                        solvedAt: statusEntry ? statusEntry.solvedAt : null
                    };
                });

                groupSetsWithProblems.push({
                    setId: 'unassigned',
                    setName: 'Unassigned Problems',
                    problems: orphanedWithStatus
                });
            }

            groupsWithProblems.push({
                groupId: group._id,
                groupName: group.groupName,
                sets: groupSetsWithProblems
            });
        }

        res.status(200).json({ groups: groupsWithProblems });
    } catch (error) {
        console.error('Get group problems error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Submit a solve for a group problem
 * @route   POST /api/student/submit-solve/:problemId
 * @access  Private (Student only)
 */
const submitGroupSolve = async (req, res) => {
    const { problemId } = req.params;
    const { timeTaken, learnings } = req.body;

    try {
        if (!timeTaken) {
            return res.status(400).json({ message: 'Time taken is required' });
        }

        const statusEntry = await GroupProblemStatus.findOne({
            problemId,
            userId: req.user._id
        }).populate('problemId');

        if (!statusEntry) {
            return res.status(404).json({ message: 'Problem status not found for this student. Are you added to this group?' });
        }

        statusEntry.status = 'Solved';
        statusEntry.timeTaken = timeTaken;
        statusEntry.learnings = learnings;
        statusEntry.solvedAt = new Date();

        await statusEntry.save();

        res.status(200).json({ message: 'Solve submitted successfully!', status: statusEntry });
    } catch (error) {
        console.error('Submit solve error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Get all global contests
 * @route   GET /api/student/global-contests
 * @access  Private (Student only)
 */
const getGlobalContests = async (req, res) => {
    try {
        const contests = await Contest.find({ isGlobal: true })
            .populate('registeredStudents', '_id')
            .sort({ createdAt: -1 });
        res.status(200).json({ contests });
    } catch (error) {
        console.error('Get global contests error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Register for a global contest
 * @route   POST /api/student/register-contest/:contestId
 * @access  Private (Student only)
 */
const registerForContest = async (req, res) => {
    try {
        const { contestId } = req.params;
        const contest = await Contest.findById(contestId);
        
        if (!contest || !contest.isGlobal) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        if (!contest.registeredStudents) {
            contest.registeredStudents = [];
        }

        if (contest.registeredStudents.includes(req.user._id)) {
            return res.status(400).json({ message: 'Already registered for this contest' });
        }

        contest.registeredStudents.push(req.user._id);
        await contest.save();

        res.status(200).json({ message: 'Successfully registered for contest' });
    } catch (error) {
        console.error('Register contest error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
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
    submitGroupSolve,
    getGlobalContests,
    registerForContest
};

