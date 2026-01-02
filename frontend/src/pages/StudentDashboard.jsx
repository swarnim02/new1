import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../utils/api';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [recentContests, setRecentContests] = useState([]);
    const [upsolveQueue, setUpsolveQueue] = useState([]);
    const [statusMessage, setStatusMessage] = useState(null);
    const [stats, setStats] = useState(null);
    const [upsolveStats, setUpsolveStats] = useState({
        contestGiven: 0,
        upsolveDone: 0,
        upsolvePending: 0
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('queue');
    const [customContestId, setCustomContestId] = useState('');
    const [studentGroups, setStudentGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedSet, setSelectedSet] = useState(null);
    const [solveModal, setSolveModal] = useState({ show: false, problem: null, timeTaken: '<20min', learnings: '' });
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [globalContests, setGlobalContests] = useState([]);
    const [selectedContest, setSelectedContest] = useState(null);
    const [contestTab, setContestTab] = useState('upcoming');

    useEffect(() => {
        fetchData();
        fetchGroupProblems();
        fetchGlobalContests();
    }, []);

    const fetchData = async () => {
        try {
            const [queueRes, statsRes, recentRes] = await Promise.all([
                studentAPI.getUpsolveQueue(),
                studentAPI.getMyStats(),
                studentAPI.getParticipatedContests()
            ]);

            setUpsolveQueue(queueRes.data.queue || []);
            setStats(statsRes.data);
            setRecentContests(recentRes.data.contests || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGroupProblems = async () => {
        try {
            const res = await studentAPI.getGroupProblems();
            setStudentGroups(res.data.groups || []);
        } catch (error) {
            console.error('Error fetching group problems:', error);
        }
    };

    const fetchGlobalContests = async () => {
        try {
            const res = await studentAPI.getGlobalContests();
            setGlobalContests(res.data.contests || []);
        } catch (error) {
            console.error('Error fetching contests:', error);
        }
    };

    const handleRegisterContest = async (contestId) => {
        try {
            await studentAPI.registerForContest(contestId);
            alert('Successfully registered for contest!');
            fetchGlobalContests();
        } catch (error) {
            alert(error.response?.data?.message || 'Error registering for contest');
        }
    };

    const handleSolveSubmit = async (e) => {
        e.preventDefault();
        try {
            await studentAPI.submitGroupSolve(solveModal.problem._id, {
                timeTaken: solveModal.timeTaken,
                learnings: solveModal.learnings
            });
            setSolveModal({ show: false, problem: null, timeTaken: '<20min', learnings: '' });
            fetchGroupProblems();
            alert('Solve submitted successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Error submitting solve');
        }
    };

    const handleFetchStatus = async () => {
        setStatusMessage({ type: 'info', text: 'Syncing with Codeforces... Usually takes 5-10 seconds.' });

        const btn = document.getElementById('fetch-status-btn');
        if (btn) { btn.disabled = true; btn.innerText = 'Syncing...'; }

        try {
            const res = await studentAPI.bulkUpsolve();

            if (res.data.stats) {
                setUpsolveStats(res.data.stats);
            }

            setStatusMessage({ type: 'success', text: 'Status synchronized successfully!' });
            fetchData();
        } catch (error) {
            console.error(error);
            const errMsg = error.response?.data?.message || 'Error fetching status.';
            setStatusMessage({ type: 'error', text: errMsg });
        } finally {
            if (btn) { btn.disabled = false; btn.innerText = 'Fetch Current Status'; }
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (loading) return <div className="dashboard-container"><p>Loading...</p></div>;

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <h2>Algonauts</h2>
                <div className="nav-user" style={{ position: 'relative' }}>
                    <button 
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {user?.name}
                        <span style={{ fontSize: '0.8rem' }}>▼</span>
                    </button>
                    {showProfileMenu && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '0.5rem',
                            background: 'rgba(0, 0, 0, 0.9)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            minWidth: '200px',
                            zIndex: 1000,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                        }}>
                            <div style={{ padding: '0.5rem 0' }}>
                                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#aaa', fontSize: '0.9rem' }}>
                                    {user?.email}
                                </div>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        width: '100%',
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'white',
                                        padding: '0.75rem 1rem',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            <div className="dashboard-content">
                <aside className="sidebar" style={{ background: 'rgba(0, 0, 0, 0.4)', borderRight: '1px solid rgba(255, 255, 255, 0.2)' }}>
                    <button
                        onClick={() => { setActiveTab('queue'); setSelectedContest(null); }}
                        style={{
                            background: activeTab === 'queue' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                            borderLeft: activeTab === 'queue' ? '3px solid white' : '3px solid transparent',
                            color: activeTab === 'queue' ? 'white' : '#aaa',
                            padding: '1rem 1.5rem',
                            textAlign: 'left',
                            border: 'none',
                            cursor: 'pointer',
                            width: '100%',
                            transition: 'all 0.3s ease',
                            fontSize: '1rem',
                            fontWeight: activeTab === 'queue' ? 'bold' : 'normal'
                        }}
                        onMouseEnter={(e) => {
                            if (activeTab !== 'queue') {
                                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                                e.target.style.color = 'white';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (activeTab !== 'queue') {
                                e.target.style.background = 'transparent';
                                e.target.style.color = '#aaa';
                            }
                        }}
                    >
                        Upsolve Queue
                    </button>
                    <button
                        onClick={() => { setActiveTab('groups'); setSelectedContest(null); }}
                        style={{
                            background: activeTab === 'groups' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                            borderLeft: activeTab === 'groups' ? '3px solid white' : '3px solid transparent',
                            color: activeTab === 'groups' ? 'white' : '#aaa',
                            padding: '1rem 1.5rem',
                            textAlign: 'left',
                            border: 'none',
                            cursor: 'pointer',
                            width: '100%',
                            transition: 'all 0.3s ease',
                            fontSize: '1rem',
                            fontWeight: activeTab === 'groups' ? 'bold' : 'normal'
                        }}
                        onMouseEnter={(e) => {
                            if (activeTab !== 'groups') {
                                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                                e.target.style.color = 'white';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (activeTab !== 'groups') {
                                e.target.style.background = 'transparent';
                                e.target.style.color = '#aaa';
                            }
                        }}
                    >
                        Groups
                    </button>
                    <button
                        onClick={() => setActiveTab('contests')}
                        style={{
                            background: activeTab === 'contests' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                            borderLeft: activeTab === 'contests' ? '3px solid white' : '3px solid transparent',
                            color: activeTab === 'contests' ? 'white' : '#aaa',
                            padding: '1rem 1.5rem',
                            textAlign: 'left',
                            border: 'none',
                            cursor: 'pointer',
                            width: '100%',
                            transition: 'all 0.3s ease',
                            fontSize: '1rem',
                            fontWeight: activeTab === 'contests' ? 'bold' : 'normal'
                        }}
                        onMouseEnter={(e) => {
                            if (activeTab !== 'contests') {
                                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                                e.target.style.color = 'white';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (activeTab !== 'contests') {
                                e.target.style.background = 'transparent';
                                e.target.style.color = '#aaa';
                            }
                        }}
                    >
                        Contests
                    </button>
                </aside>

                <main className="main-content">
                    {activeTab === 'queue' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ color: 'white' }}>Your Upsolve Queue</h2>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        id="fetch-status-btn"
                                        className="btn btn-primary"
                                        onClick={handleFetchStatus}
                                        style={{ background: 'white', color: '#000', fontWeight: 'bold' }}
                                    >
                                        Fetch Current Status
                                    </button>
                                </div>
                            </div>

                            <div className="stats-grid" style={{ marginBottom: '20px', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                                <div className="stat-card" style={{ 
                                    padding: '15px', 
                                    textAlign: 'center',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    backdropFilter: 'blur(10px)'
                                }}>
                                    <h4 style={{ fontSize: '0.8rem', color: '#aaa', margin: '0' }}>Contests Given</h4>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '5px 0', color: 'white' }}>{upsolveStats.contestGiven}</p>
                                </div>
                                <div className="stat-card" style={{ 
                                    padding: '15px', 
                                    textAlign: 'center', 
                                    background: 'rgba(46, 204, 113, 0.2)',
                                    border: '1px solid rgba(46, 204, 113, 0.5)',
                                    borderRadius: '8px',
                                    backdropFilter: 'blur(10px)'
                                }}>
                                    <h4 style={{ fontSize: '0.8rem', color: '#aaa', margin: '0' }}>Upsolve Done</h4>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '5px 0', color: '#2ecc71' }}>{upsolveStats.upsolveDone}</p>
                                </div>
                                <div className="stat-card" style={{ 
                                    padding: '15px', 
                                    textAlign: 'center', 
                                    background: 'rgba(230, 126, 34, 0.2)',
                                    border: '1px solid rgba(230, 126, 34, 0.5)',
                                    borderRadius: '8px',
                                    backdropFilter: 'blur(10px)'
                                }}>
                                    <h4 style={{ fontSize: '0.8rem', color: '#aaa', margin: '0' }}>Upsolve Pending</h4>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '5px 0', color: '#e67e22' }}>{upsolveStats.upsolvePending}</p>
                                </div>
                            </div>

                            {statusMessage && (
                                <div style={{
                                    padding: '10px',
                                    margin: '10px 0',
                                    borderRadius: '5px',
                                    background: statusMessage.type === 'error' ? '#e74c3c' : (statusMessage.type === 'info' ? '#3498db' : '#2ecc71'),
                                    color: '#fff',
                                    fontSize: '0.9rem'
                                }}>
                                    {statusMessage.text}
                                </div>
                            )}

                            {upsolveQueue.length === 0 ? (
                                <div className="empty-state">
                                    <h3>All caught up!</h3>
                                    <p>No pending problems in your queue. Click "Fetch Current Status" to sync with Codeforces.</p>
                                </div>
                            ) : (
                                <div className="queue-list">
                                    {upsolveQueue.map((item, index) => (
                                        <div key={item._id} className="queue-item" style={{ borderLeft: '4px solid white' }}>
                                            <div className="queue-header">
                                                <h3>
                                                    <a
                                                        href={item.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: 'inherit', textDecoration: 'none' }}
                                                    >
                                                        #{index + 1} - {item.contestName} - {item.problemIndex}
                                                    </a>
                                                </h3>
                                            </div>

                                            {item.problemDetails && (
                                                <div className="problem-details">
                                                    <p><strong>Name:</strong> {item.problemDetails.name}</p>
                                                    <p><strong>Rating:</strong> {item.problemDetails.rating}</p>
                                                    <p><strong>Tags:</strong> {item.problemDetails.tags.join(', ') || 'None'}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'groups' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <h2 style={{ color: 'white' }}>Collaborative Groups</h2>
                                <span className="status-badge" style={{ background: studentGroups.length > 0 ? 'white' : '#e74c3c', color: studentGroups.length > 0 ? '#000' : 'white', padding: '5px 15px', fontWeight: 'bold' }}>
                                    {studentGroups.length} {studentGroups.length === 1 ? 'Group' : 'Groups'} assigned
                                </span>
                            </div>
                            <p style={{ color: '#aaa', marginBottom: '20px' }}>Problems assigned to you across all your collaborative groups.</p>

                            {studentGroups.length === 0 ? (
                                <div className="empty-state" style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
                                    <h3 style={{ color: '#aaa' }}>You haven't been added to any group yet.</h3>
                                    <p style={{ color: '#666' }}>Ask your mentor to add your email ({user?.email}) to a group.</p>
                                </div>
                            ) : (
                                <div>
                                    {!selectedGroup ? (
                                        <div className="groups-list">
                                            {studentGroups.map(group => (
                                                <div 
                                                    key={group.groupId} 
                                                    className="queue-item" 
                                                    style={{ cursor: 'pointer', marginBottom: '1rem', borderLeft: '4px solid white' }}
                                                    onClick={() => setSelectedGroup(group)}
                                                >
                                                    <h3 style={{ margin: 0, color: 'white' }}>{group.groupName}</h3>
                                                    <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                                                        {group.sets.length} problem sets
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : !selectedSet ? (
                                        <div>
                                            <div style={{ marginBottom: '2rem' }}>
                                                <button 
                                                    className="btn btn-secondary btn-sm" 
                                                    onClick={() => setSelectedGroup(null)}
                                                    style={{ marginBottom: '1rem' }}
                                                >
                                                    Back to Groups
                                                </button>
                                                <h3 style={{ color: 'white' }}>Group: {selectedGroup.groupName}</h3>
                                            </div>

                                            {selectedGroup.sets.length === 0 ? (
                                                <p style={{ color: '#666', fontStyle: 'italic' }}>No problem sets assigned yet in this group.</p>
                                            ) : (
                                                <div className="sets-list">
                                                    {selectedGroup.sets.map(set => (
                                                        <div 
                                                            key={set.setId} 
                                                            className="queue-item" 
                                                            style={{ cursor: 'pointer', marginBottom: '1rem', borderLeft: '4px solid white' }}
                                                            onClick={() => setSelectedSet(set)}
                                                        >
                                                            <h4 style={{ margin: 0, color: 'white' }}>{set.setName}</h4>
                                                            <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                                                                {set.problems.length} problems
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div>
                                            <div style={{ marginBottom: '2rem' }}>
                                                <button 
                                                    className="btn btn-secondary btn-sm" 
                                                    onClick={() => setSelectedSet(null)}
                                                    style={{ marginBottom: '1rem' }}
                                                >
                                                    Back to Sets
                                                </button>
                                                <h4 style={{ color: 'white' }}>{selectedSet.setName}</h4>
                                            </div>

                                            <div style={{ 
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                borderRadius: '8px',
                                                backdropFilter: 'blur(10px)',
                                                overflow: 'hidden'
                                            }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr style={{ background: 'rgba(0, 0, 0, 0.3)' }}>
                                                            <th style={{ padding: '1rem', textAlign: 'left', color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>Problem</th>
                                                            <th style={{ padding: '1rem', textAlign: 'center', color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>Platform</th>
                                                            <th style={{ padding: '1rem', textAlign: 'center', color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>Status</th>
                                                            <th style={{ padding: '1rem', textAlign: 'center', color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedSet.problems.map(problem => (
                                                            <tr key={problem._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                                                <td style={{ padding: '1rem', color: 'white' }}>
                                                                    <div>
                                                                        <div style={{ fontWeight: 'bold' }}>{problem.title}</div>
                                                                        {problem.status === 'Solved' && (
                                                                            <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '5px' }}>
                                                                                Time: {problem.timeTaken} | {new Date(problem.solvedAt).toLocaleDateString()}
                                                                                {problem.learnings && <div style={{ color: '#ddd' }}>Learnings: {problem.learnings}</div>}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '1rem', textAlign: 'center', color: '#e67e22', fontWeight: 'bold' }}>{problem.platform}</td>
                                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                                    {problem.status === 'Solved' ? (
                                                                        <span className="status-badge solved" style={{ color: '#2ecc71', fontWeight: 'bold' }}>Solved</span>
                                                                    ) : (
                                                                        <span style={{ color: '#e67e22', fontWeight: 'bold' }}>Pending</span>
                                                                    )}
                                                                </td>
                                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                                                        <a href={problem.link} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">View</a>
                                                                        {problem.status !== 'Solved' && (
                                                                            <button className="btn btn-primary btn-sm" onClick={() => setSolveModal({ show: true, problem, timeTaken: '<20min', learnings: '' })}>
                                                                                Mark Solved
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'contests' && (
                        <div>
                            {!selectedContest ? (
                                <div>
                                    <h2 style={{ color: 'white', marginBottom: '20px' }}>Contests</h2>
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '20px' }}>
                                        {['upcoming', 'current', 'past'].map(tab => (
                                            <button
                                                key={tab}
                                                onClick={() => setContestTab(tab)}
                                                style={{
                                                    background: contestTab === tab ? 'white' : 'rgba(255, 255, 255, 0.1)',
                                                    color: contestTab === tab ? '#000' : 'white',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    textTransform: 'capitalize',
                                                    fontWeight: contestTab === tab ? 'bold' : 'normal'
                                                }}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                    {globalContests.filter(contest => {
                                        const now = new Date();
                                        const start = new Date(contest.startTime);
                                        const end = new Date(contest.endTime);
                                        if (contestTab === 'upcoming') return start > now;
                                        if (contestTab === 'current') return start <= now && end >= now;
                                        if (contestTab === 'past') return end < now;
                                        return false;
                                    }).length === 0 ? (
                                        <div className="empty-state" style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
                                            <h3 style={{ color: '#aaa' }}>No {contestTab} contests</h3>
                                            <p style={{ color: '#666' }}>Check back later for new contests.</p>
                                        </div>
                                    ) : (
                                        <div className="contests-list">
                                            {globalContests.filter(contest => {
                                                const now = new Date();
                                                const start = new Date(contest.startTime);
                                                const end = new Date(contest.endTime);
                                                if (contestTab === 'upcoming') return start > now;
                                                if (contestTab === 'current') return start <= now && end >= now;
                                                if (contestTab === 'past') return end < now;
                                                return false;
                                            }).map(contest => (
                                                <div key={contest._id} className="queue-item" style={{ borderLeft: '4px solid white', marginBottom: '1rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <h3 style={{ margin: 0, color: 'white' }}>{contest.title}</h3>
                                                            <p style={{ margin: '0.5rem 0', color: '#aaa' }}>{contest.description}</p>
                                                            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                                                                <span>Start: {new Date(contest.startTime).toLocaleString()}</span>
                                                                <span>End: {new Date(contest.endTime).toLocaleString()}</span>
                                                                <span>{contest.problems.length} problems</span>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                            <button 
                                                                className="btn btn-primary btn-sm"
                                                                onClick={() => setSelectedContest(contest)}
                                                            >
                                                                View
                                                            </button>
                                                            {contestTab === 'upcoming' && (
                                                                <button 
                                                                    className="btn btn-secondary btn-sm"
                                                                    onClick={() => handleRegisterContest(contest._id)}
                                                                    disabled={contest.registeredStudents?.some(student => student._id === user._id)}
                                                                >
                                                                    {contest.registeredStudents?.some(student => student._id === user._id) ? 'Registered' : 'Register'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <button 
                                        className="btn btn-secondary btn-sm" 
                                        onClick={() => setSelectedContest(null)}
                                        style={{ marginBottom: '1rem' }}
                                    >
                                        Back to Contests
                                    </button>
                                    <h2 style={{ color: 'white', marginBottom: '1rem' }}>{selectedContest.title}</h2>
                                    <p style={{ color: '#aaa', marginBottom: '1rem' }}>{selectedContest.description}</p>
                                    <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', fontSize: '0.9rem', color: '#666' }}>
                                        <span>Start: {new Date(selectedContest.startTime).toLocaleString()}</span>
                                        <span>End: {new Date(selectedContest.endTime).toLocaleString()}</span>
                                    </div>
                                    
                                    <h3 style={{ color: 'white', marginBottom: '1rem' }}>Problems</h3>
                                    <div style={{ 
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '8px',
                                        backdropFilter: 'blur(10px)',
                                        overflow: 'hidden'
                                    }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ background: 'rgba(0, 0, 0, 0.3)' }}>
                                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>Order</th>
                                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>Title</th>
                                                    <th style={{ padding: '1rem', textAlign: 'center', color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>Platform</th>
                                                    <th style={{ padding: '1rem', textAlign: 'center', color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedContest.problems.map((problem, index) => (
                                                    <tr key={problem._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                                        <td style={{ padding: '1rem', color: 'white', fontWeight: 'bold' }}>{index + 1}</td>
                                                        <td style={{ padding: '1rem', color: 'white' }}>{problem.title}</td>
                                                        <td style={{ padding: '1rem', textAlign: 'center', color: '#e67e22', fontWeight: 'bold' }}>{problem.platform}</td>
                                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                            {new Date(selectedContest.startTime) <= new Date() && new Date(selectedContest.endTime) >= new Date() ? (
                                                                <a href={problem.link} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                                                                    Open Problem
                                                                </a>
                                                            ) : (
                                                                <span style={{ color: '#666', fontSize: '0.9rem' }}>Not available</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Solve Modal */}
            {solveModal.show && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="modal-content animate-pop-in" style={{ background: '#1a1a1a', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '500px', border: '1px solid #333' }}>
                        <h3 style={{ color: 'white' }}>Mark as Solved: {solveModal.problem?.title}</h3>
                        <form onSubmit={handleSolveSubmit} className="form" style={{ marginTop: '20px' }}>
                            <div className="form-group">
                                <label style={{ color: '#ccc' }}>How long did it take?</label>
                                <select
                                    className="form-control"
                                    value={solveModal.timeTaken}
                                    onChange={e => setSolveModal({ ...solveModal, timeTaken: e.target.value })}
                                    style={{ width: '100%', padding: '10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '5px' }}
                                >
                                    <option value="<20min">Less than 20 minutes</option>
                                    <option value="<30min">Less than 30 minutes</option>
                                    <option value="<1hour">Less than 1 hour</option>
                                    <option value="<3hour">Less than 3 hours</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginTop: '20px' }}>
                                <label style={{ color: '#ccc' }}>Short Learning/Note (Optional)</label>
                                <textarea
                                    className="form-control"
                                    value={solveModal.learnings}
                                    onChange={e => setSolveModal({ ...solveModal, learnings: e.target.value })}
                                    placeholder="What did you learn from this problem?"
                                    rows={4}
                                    style={{ width: '100%', padding: '10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '5px' }}
                                />
                                <small style={{ color: '#666' }}>Max 200 characters recommended.</small>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, background: 'white', color: '#000', fontWeight: 'bold' }}>Submit Solve</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setSolveModal({ ...solveModal, show: false })} style={{ flex: 1 }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
