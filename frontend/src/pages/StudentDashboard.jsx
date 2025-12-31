import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../utils/api';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [recentContests, setRecentContests] = useState([]);
    const [upsolveQueue, setUpsolveQueue] = useState([]);
    const [statusMessage, setStatusMessage] = useState(null); // { type: 'success'|'error', text: '' }
    const [stats, setStats] = useState(null);
    const [upsolveStats, setUpsolveStats] = useState({
        contestGiven: 0,
        upsolveDone: 0,
        upsolvePending: 0
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('queue');
    const [customContestId, setCustomContestId] = useState('');
    const [studentGroups, setStudentGroups] = useState([]); // Array of { groupId, groupName, problems }
    const [solveModal, setSolveModal] = useState({ show: false, problem: null, timeTaken: '<20min', learnings: '' });

    useEffect(() => {
        fetchData();
        fetchGroupProblems();
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

    const handleVerifyQueue = async () => {
        const btn = document.getElementById('verify-all-btn');
        if (btn) { btn.innerText = 'Verifying...'; btn.disabled = true; }

        setStatusMessage({ type: 'info', text: 'Checking status of ALL pending problems from Codeforces...' });

        try {
            const res = await studentAPI.verifyQueue();
            const { checked, solved } = res.data;

            if (solved > 0) {
                setStatusMessage({ type: 'success', text: `Verified ${checked} problems. Marked ${solved} as Solved! 🎉` });
                fetchData();
            } else {
                setStatusMessage({ type: 'info', text: `Checked ${checked} problems. No new solves found yet.` });
            }
        } catch (error) {
            console.error(error);
            setStatusMessage({ type: 'error', text: 'Verification failed.' });
        } finally {
            if (btn) { btn.innerText = 'Verify Status 🔄'; btn.disabled = false; }
        }
    };

    const handleSmartUpsolve = async (contestId, count) => {
        if (!confirm(`Auto-fetch next ${count} unsolved problems from Codeforces?`)) return;

        try {
            // Optimistic UI or just simple blocking for now
            const res = await studentAPI.smartUpsolve(contestId, count);
            alert(res.data.message);
            fetchData(); // Refresh queue and contests
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error executing smart upsolve. Check if your handle is correct!');
        }
    };


    const handleAddCustomContest = async (id, count) => {
        const targetId = id || customContestId;

        if (!targetId || !targetId.toString().trim()) {
            alert('Please enter a Codeforces Contest ID');
            return;
        }

        try {
            const res = await studentAPI.addPersonalContest(targetId, count);
            alert(res.data.message);
            setCustomContestId(''); // Clear input if used
            fetchData();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error adding personal contest. Check ID and Handle.');
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
            if (btn) { btn.disabled = false; btn.innerText = 'Fetch Current Status 🔄'; }
        }
    };

    const handleRefresh = () => {
        setLoading(true);
        fetchData();
        fetchGroupProblems();
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (loading) return <div className="dashboard-container"><p>Loading...</p></div>;

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <h2>🚀 Algonauts - Student {studentGroups.length > 0 && <span style={{ fontSize: '1rem', color: '#aaa', marginLeft: '10px' }}>({studentGroups.length} Groups)</span>}</h2>
                <div className="nav-user">
                    <span>{user?.name}</span>
                    <button onClick={handleRefresh} className="btn btn-secondary" style={{ marginRight: '10px' }}>Refresh</button>
                    <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                </div>
            </nav>

            <div className="dashboard-content">
                <aside className="sidebar">
                    <button
                        className={activeTab === 'queue' ? 'active' : ''}
                        onClick={() => setActiveTab('queue')}
                    >
                        Upsolve Queue
                    </button>
                    <button
                        className={activeTab === 'groups' ? 'active' : ''}
                        onClick={() => setActiveTab('groups')}
                    >
                        Groups
                    </button>
                    <button
                        className={activeTab === 'stats' ? 'active' : ''}
                        onClick={() => setActiveTab('stats')}
                    >
                        Statistics
                    </button>
                </aside>

                <main className="main-content">
                    {activeTab === 'queue' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2>📝 Your Upsolve Queue</h2>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        id="fetch-status-btn"
                                        className="btn btn-primary"
                                        onClick={handleFetchStatus}
                                        style={{ background: 'var(--primary)' }}
                                    >
                                        Fetch Current Status 🔄
                                    </button>
                                </div>
                            </div>

                            {/* Precise Upsolve Stats */}
                            <div className="stats-grid" style={{ marginBottom: '20px', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                                <div className="stat-card" style={{ padding: '15px', textAlign: 'center' }}>
                                    <h4 style={{ fontSize: '0.8rem', color: '#aaa', margin: '0' }}>Contests Given</h4>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '5px 0' }}>{upsolveStats.contestGiven}</p>
                                </div>
                                <div className="stat-card" style={{ padding: '15px', textAlign: 'center', borderTop: '3px solid #2ecc71' }}>
                                    <h4 style={{ fontSize: '0.8rem', color: '#aaa', margin: '0' }}>Upsolve Done</h4>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '5px 0', color: '#2ecc71' }}>{upsolveStats.upsolveDone}</p>
                                </div>
                                <div className="stat-card" style={{ padding: '15px', textAlign: 'center', borderTop: '3px solid #e67e22' }}>
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
                                    <h3>🎉 All caught up!</h3>
                                    <p>No pending problems in your queue. Click "Auto-Fill" to find new challenges.</p>
                                </div>
                            ) : (
                                <div className="queue-list">
                                    {upsolveQueue.map((item, index) => (
                                        <div key={item._id} className="queue-item" style={{ borderLeft: '4px solid #3498db' }}>
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
                                <h2>👥 Collaborative Groups</h2>
                                <span className="status-badge" style={{ background: studentGroups.length > 0 ? 'var(--primary)' : '#e74c3c', padding: '5px 15px' }}>
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
                                studentGroups.map(group => (
                                    <div key={group.groupId} className="group-section" style={{ marginBottom: '3rem', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px' }}>
                                        <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '20px', color: 'var(--primary)' }}>
                                            Group: {group.groupName}
                                        </h3>

                                        {group.sets.length === 0 ? (
                                            <p style={{ color: '#666', fontStyle: 'italic' }}>No problem sets assigned yet in this group.</p>
                                        ) : (
                                            group.sets.map(set => (
                                                <div key={set.setId} className="set-section" style={{ marginBottom: '2rem' }}>
                                                    <h4 style={{ color: '#aaa', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <span style={{ color: 'var(--primary)' }}>#</span> {set.setName}
                                                    </h4>

                                                    <div className="queue-list">
                                                        {set.problems.map(problem => (
                                                            <div key={problem._id} className={`queue-item animate-fade-in ${problem.status === 'Solved' ? 'solved' : ''}`}>
                                                                <div className="problem-info">
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                        <span className="platform-tag">{problem.platform}</span>
                                                                        <span className="problem-title">{problem.title}</span>
                                                                    </div>
                                                                    <div className="problem-actions">
                                                                        <a href={problem.link} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">View</a>
                                                                        {problem.status !== 'Solved' ? (
                                                                            <button className="btn btn-primary btn-sm" onClick={() => setSolveModal({ show: true, problem, timeTaken: '<20min', learnings: '' })}>
                                                                                Mark Solved
                                                                            </button>
                                                                        ) : (
                                                                            <span className="status-badge solved">✅ Solved</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {problem.status === 'Solved' && (
                                                                    <div className="solve-details" style={{ marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '5px', fontSize: '0.85rem' }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa' }}>
                                                                            <span>Time: {problem.timeTaken}</span>
                                                                            <span>{new Date(problem.solvedAt).toLocaleDateString()}</span>
                                                                        </div>
                                                                        {problem.learnings && (
                                                                            <p style={{ marginTop: '5px', color: '#ddd' }}><strong>Learnings:</strong> {problem.learnings}</p>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {set.problems.length === 0 && <p style={{ fontSize: '0.8rem', color: '#444', fontStyle: 'italic' }}>No problems in this set.</p>}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'stats' && (
                        <div>
                            <h2>📊 Your Statistics</h2>
                            {stats && (
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <h3>Total Problems</h3>
                                        <p className="stat-value">{stats.total}</p>
                                    </div>
                                    <div className="stat-card success">
                                        <h3>Solved</h3>
                                        <p className="stat-value">{stats.solved}</p>
                                    </div>
                                    <div className="stat-card pending">
                                        <h3>Pending</h3>
                                        <p className="stat-value">{stats.pending}</p>
                                    </div>
                                    <div className="stat-card">
                                        <h3>Solve Rate</h3>
                                        <p className="stat-value">{stats.solveRate}%</p>
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
                        <h3>Mark as Solved: {solveModal.problem?.title}</h3>
                        <form onSubmit={handleSolveSubmit} className="form" style={{ marginTop: '20px' }}>
                            <div className="form-group">
                                <label>How long did it take?</label>
                                <select
                                    className="form-control"
                                    value={solveModal.timeTaken}
                                    onChange={e => setSolveModal({ ...solveModal, timeTaken: e.target.value })}
                                    style={{ width: '100%', padding: '10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '5px' }}
                                >
                                    <option value="<20min">&lt; 20 minutes (🚀 Godspeed)</option>
                                    <option value="<30min">&lt; 30 minutes (⚡ Fast)</option>
                                    <option value="<1hour">&lt; 1 hour (⏱️ Average)</option>
                                    <option value="<3hour">&lt; 3 hours (🐢 Slow & Steady)</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginTop: '20px' }}>
                                <label>Short Learning/Note (Optional)</label>
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
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit Solve</button>
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
