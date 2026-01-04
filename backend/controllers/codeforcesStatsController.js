const { getUserRatingHistory, getUserSubmissions, getContestList, getContestProblems } = require('../utils/codeforcesAPI');

const analyzeCodeforcesStats = async (req, res) => {
    const { handle } = req.params;

    try {
        if (!handle) {
            return res.status(400).json({ message: 'Codeforces handle is required' });
        }

        // Fetch all required data
        const [ratingHistory, submissions, contestList] = await Promise.all([
            getUserRatingHistory(handle),
            getUserSubmissions(handle),
            getContestList()
        ]);

        // Build contest info map
        const contestInfoMap = new Map();
        contestList.forEach(c => {
            contestInfoMap.set(c.id, {
                name: c.name,
                startTime: c.startTimeSeconds,
                endTime: c.startTimeSeconds + c.durationSeconds
            });
        });

        // Build submissions map by contestId
        const submissionsByContest = {};
        submissions.forEach(sub => {
            if (sub.verdict === 'OK') {
                if (!submissionsByContest[sub.contestId]) {
                    submissionsByContest[sub.contestId] = {};
                }
                const problemKey = sub.problem.index;
                if (!submissionsByContest[sub.contestId][problemKey]) {
                    submissionsByContest[sub.contestId][problemKey] = [];
                }
                submissionsByContest[sub.contestId][problemKey].push(sub.creationTimeSeconds);
            }
        });

        // Analyze each participated contest
        const contestStats = [];
        const upsolveQueue = [];

        ratingHistory.forEach(event => {
            const contestId = event.contestId;
            const contestInfo = contestInfoMap.get(contestId);

            if (!contestInfo) return;

            const contestSubmissions = submissionsByContest[contestId] || {};
            let solvedDuring = 0;
            let solvedAfter = 0;

            Object.entries(contestSubmissions).forEach(([problemIndex, times]) => {
                const lastSolveTime = Math.max(...times);
                
                if (lastSolveTime <= contestInfo.endTime) {
                    solvedDuring++;
                } else {
                    solvedAfter++;
                    upsolveQueue.push({
                        contestId,
                        contestName: contestInfo.name,
                        problemIndex,
                        solvedAt: new Date(lastSolveTime * 1000)
                    });
                }
            });

            contestStats.push({
                contestId,
                contestName: contestInfo.name,
                solvedDuring,
                solvedAfter,
                totalSolved: solvedDuring + solvedAfter
            });
        });

        // Sort upsolve queue by solved time
        upsolveQueue.sort((a, b) => b.solvedAt - a.solvedAt);

        const totalContests = ratingHistory.length;
        const totalUpsolved = upsolveQueue.length;
        const totalSolvedDuring = contestStats.reduce((sum, c) => sum + c.solvedDuring, 0);

        res.status(200).json({
            handle,
            summary: {
                totalContests,
                totalSolvedDuring,
                totalUpsolved
            },
            contestStats,
            upsolveQueue
        });

    } catch (error) {
        console.error('Codeforces stats error:', error.message);
        res.status(500).json({ message: 'Error analyzing Codeforces stats' });
    }
};

module.exports = {
    analyzeCodeforcesStats
};
