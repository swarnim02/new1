import axios from 'axios';

const API_URL = 'https://cp-helper-7mt6.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Include cookies in requests
    headers: {
        'Content-Type': 'application/json'
    }
});

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me')
};

// Mentor API
export const mentorAPI = {
    createGroup: (data) => api.post('/mentor/create-group', data),
    getGroups: () => api.get('/mentor/groups'),
    addStudents: (groupId, emails) => api.post(`/mentor/add-students/${groupId}`, { studentEmails: emails }),
    createContest: (groupId, data) => api.post(`/mentor/create-contest/${groupId}`, data),
    createGlobalContest: (data) => api.post('/mentor/create-global-contest', data),
    getGlobalContests: () => api.get('/mentor/global-contests'),
    updateGlobalContest: (contestId, data) => api.put(`/mentor/global-contests/${contestId}`, data),
    getContestLeaderboard: (contestId) => api.get(`/student/contest-leaderboard/${contestId}`),
    viewProgress: (groupId, contestId) => api.get(`/mentor/progress/${groupId}/${contestId}`),
    addGroupProblem: (groupId, data) => api.post(`/mentor/group-problem/${groupId}`, data),
    getGroupStats: (groupId) => api.get(`/mentor/group-stats/${groupId}`),
    createSet: (groupId, data) => api.post(`/mentor/create-set/${groupId}`, data),
    getProblemSets: (groupId) => api.get(`/mentor/problem-sets/${groupId}`)
};

// Student API
export const studentAPI = {
    getParticipatedContests: () => api.get('/student/participated-contests'),
    getMyContests: () => api.get('/student/my-contests'),
    getUpsolveQueue: () => api.get('/student/upsolve-queue'),
    smartUpsolve: (contestId, count) => api.post('/student/smart-upsolve', { contestId, count }),
    addPersonalContest: (cfContestId, count) => api.post('/student/add-personal-contest', { cfContestId, count }),
    bulkUpsolve: () => api.post('/student/bulk-upsolve'),
    verifyProblem: (id) => api.post(`/student/verify-problem/${id}`),
    verifyQueue: () => api.post('/student/verify-queue'),
    markSolved: (problemStatusId) => api.put(`/student/mark-solved/${problemStatusId}`),
    getMyStats: () => api.get('/student/my-stats'),
    getGroupProblems: () => api.get('/student/group-problems'),
    submitGroupSolve: (problemId, data) => api.post(`/student/submit-solve/${problemId}`, data),
    getGlobalContests: () => api.get('/student/global-contests'),
    registerForContest: (contestId) => api.post(`/student/register-contest/${contestId}`),
    getContestLeaderboard: (contestId) => api.get(`/student/contest-leaderboard/${contestId}`)
};

export default api;
