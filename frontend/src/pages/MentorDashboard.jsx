import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mentorAPI } from '../utils/api';

const MentorDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [problemSets, setProblemSets] = useState([]);
    const [selectedSet, setSelectedSet] = useState(null);

    // UI States
    const [showAddGroup, setShowAddGroup] = useState(false);
    const [showAddSet, setShowAddSet] = useState(false);
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [showAddProblem, setShowAddProblem] = useState(false);

    // Form states
    const [newGroupName, setNewGroupName] = useState('');
    const [newSetName, setNewSetName] = useState('');
    const [studentEmails, setStudentEmails] = useState('');
    const [problemForm, setProblemForm] = useState({ title: '', link: '', platform: 'Codeforces' });
    const [groupStats, setGroupStats] = useState(null);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const response = await mentorAPI.getGroups();
            setGroups(response.data);
            if (selectedGroup) {
                const updated = response.data.find(g => g._id === selectedGroup._id);
                if (updated) setSelectedGroup(updated);
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSets = async (groupId) => {
        try {
            const response = await mentorAPI.getProblemSets(groupId);
            setProblemSets(response.data);
            if (selectedSet) {
                const updated = response.data.find(s => s._id === selectedSet._id);
                if (updated) setSelectedSet(updated);
            }
        } catch (error) {
            console.error('Error fetching sets:', error);
        }
    };

    const fetchStats = async (groupId) => {
        try {
            const response = await mentorAPI.getGroupStats(groupId);
            setGroupStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            await mentorAPI.createGroup({ groupName: newGroupName });
            setNewGroupName('');
            setShowAddGroup(false);
            fetchGroups();
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating group');
        }
    };

    const handleCreateSet = async (e) => {
        e.preventDefault();
        try {
            await mentorAPI.createSet(selectedGroup._id, { setName: newSetName });
            setNewSetName('');
            setShowAddSet(false);
            fetchSets(selectedGroup._id);
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating set');
        }
    };

    const handleAddStudents = async (e) => {
        e.preventDefault();
        const emails = studentEmails.split(',').map(e => e.trim()).filter(e => e);
        try {
            await mentorAPI.addStudents(selectedGroup._id, emails);
            setStudentEmails('');
            setShowAddStudent(false);
            fetchGroups();
            alert('Students added!');
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding students');
        }
    };

    const handleAddProblem = async (e) => {
        e.preventDefault();
        try {
            await mentorAPI.addGroupProblem(selectedGroup._id, { ...problemForm, setId: selectedSet._id });
            setProblemForm({ title: '', link: '', platform: 'Codeforces' });
            setShowAddProblem(false);
            fetchSets(selectedGroup._id);
            alert('Problem added to set!');
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding problem');
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
                <h2>🚀 Algonauts Portal - Mentor</h2>
                <div className="nav-user">
                    <span>{user?.name}</span>
                    <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                </div>
            </nav>

            <div className="dashboard-content">
                <aside className="sidebar">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px 10px' }}>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>GROUPS</h3>
                        <button className="btn btn-sm btn-secondary" onClick={() => {
                            setShowAddGroup(true);
                            setSelectedGroup(null);
                        }}>+</button>
                    </div>
                    {groups.map(group => (
                        <button
                            key={group._id}
                            className={selectedGroup?._id === group._id ? 'active' : ''}
                            onClick={() => {
                                setSelectedGroup(group);
                                setSelectedSet(null);
                                fetchSets(group._id);
                                fetchStats(group._id);
                                setShowAddGroup(false);
                            }}
                        >
                            {group.groupName}
                        </button>
                    ))}
                </aside>

                <main className="main-content">
                    {showAddGroup && (
                        <div className="animate-fade-in">
                            <h2>Create New Group</h2>
                            <form onSubmit={handleCreateGroup} className="form">
                                <div className="form-group">
                                    <label>Group Name</label>
                                    <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="e.g. Batch of 2025" required />
                                </div>
                                <button type="submit" className="btn btn-primary">Create Group</button>
                            </form>
                        </div>
                    )}

                    {!selectedGroup && !showAddGroup && (
                        <div className="empty-state">
                            <h3>Welcome, {user?.name}!</h3>
                            <p>Select a group from the sidebar to manage it or click '+' to create a new one.</p>
                        </div>
                    )}

                    {selectedGroup && (
                        <div className="animate-fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h1>{selectedGroup.groupName}</h1>
                                <div>
                                    <button className="btn btn-secondary" onClick={() => setShowAddStudent(!showAddStudent)}>
                                        {showAddStudent ? 'Close' : 'Add Students'}
                                    </button>
                                </div>
                            </div>

                            {showAddStudent && (
                                <div className="form-card" style={{ marginBottom: '2rem' }}>
                                    <h3>Add Students by Email</h3>
                                    <form onSubmit={handleAddStudents} className="form">
                                        <textarea value={studentEmails} onChange={e => setStudentEmails(e.target.value)} placeholder="email1@gmail.com, email2@gmail.com" rows={3} />
                                        <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>Add</button>
                                    </form>
                                </div>
                            )}

                            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                                <section>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h2>Problem Sets</h2>
                                        <button className="btn btn-primary btn-sm" onClick={() => setShowAddSet(true)}>+ New Set</button>
                                    </div>

                                    {showAddSet && (
                                        <div className="form-card" style={{ marginBottom: '1rem' }}>
                                            <form onSubmit={handleCreateSet} className="form" style={{ display: 'flex', gap: '10px' }}>
                                                <input value={newSetName} onChange={e => setNewSetName(e.target.value)} placeholder="Set Name (e.g. Graph Theory)" required />
                                                <button type="submit" className="btn btn-primary">Create</button>
                                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddSet(false)}>Cancel</button>
                                            </form>
                                        </div>
                                    )}

                                    <div className="sets-list">
                                        {problemSets.length === 0 ? (
                                            <p style={{ color: '#666' }}>No problem sets created yet.</p>
                                        ) : (
                                            problemSets.map(set => (
                                                <div key={set._id} className={`set-card ${selectedSet?._id === set._id ? 'selected' : ''}`} style={{
                                                    background: 'rgba(255,255,255,0.03)',
                                                    padding: '15px',
                                                    borderRadius: '10px',
                                                    marginBottom: '10px',
                                                    border: selectedSet?._id === set._id ? '1px solid var(--primary)' : '1px solid #333',
                                                    cursor: 'pointer'
                                                }} onClick={() => setSelectedSet(set)}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <h3 style={{ margin: 0 }}>{set.setName}</h3>
                                                        <span style={{ fontSize: '0.8rem', color: '#666' }}>{set.problems?.length || 0} Problems</span>
                                                    </div>

                                                    {selectedSet?._id === set._id && (
                                                        <div className="set-details animate-fade-in" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #333' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                                                <h4 style={{ margin: 0 }}>Problems</h4>
                                                                <button className="btn btn-secondary btn-sm" onClick={() => setShowAddProblem(true)}>Add Problem</button>
                                                            </div>

                                                            {showAddProblem && (
                                                                <form onSubmit={handleAddProblem} className="form" style={{ marginBottom: '15px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '5px' }}>
                                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                                        <input value={problemForm.title} onChange={e => setProblemForm({ ...problemForm, title: e.target.value })} placeholder="Title" required />
                                                                        <input value={problemForm.link} onChange={e => setProblemForm({ ...problemForm, link: e.target.value })} placeholder="Link" required />
                                                                    </div>
                                                                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                                                        <select style={{ background: '#222', color: 'white', border: '1px solid #444', padding: '5px' }} value={problemForm.platform} onChange={e => setProblemForm({ ...problemForm, platform: e.target.value })}>
                                                                            <option value="Codeforces">Codeforces</option>
                                                                            <option value="LeetCode">LeetCode</option>
                                                                            <option value="AtCoder">AtCoder</option>
                                                                            <option value="Other">Other</option>
                                                                        </select>
                                                                        <button type="submit" className="btn btn-primary btn-sm">Save</button>
                                                                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddProblem(false)}>Cancel</button>
                                                                    </div>
                                                                </form>
                                                            )}

                                                            <div className="problems-mini-list">
                                                                {set.problems?.map((p, i) => (
                                                                    <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < set.problems.length - 1 ? '1px solid #222' : 'none' }}>
                                                                        <a href={p.link} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem' }}>{p.title}</a>
                                                                        <span style={{ fontSize: '0.7rem', color: '#444' }}>{p.platform}</span>
                                                                    </div>
                                                                ))}
                                                                {(!set.problems || set.problems.length === 0) && <p style={{ fontSize: '0.8rem', color: '#444' }}>No problems in this set.</p>}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </section>

                                <section>
                                    <h3>Group Stats</h3>
                                    {groupStats ? (
                                        <div className="stats-sidebar">
                                            <div className="stat-item" style={{ background: '#111', padding: '15px', borderRadius: '10px', marginBottom: '10px' }}>
                                                <div style={{ fontSize: '0.8rem', color: '#666' }}>Students</div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{selectedGroup.students.length}</div>
                                            </div>
                                            <div className="stat-item" style={{ background: '#111', padding: '15px', borderRadius: '10px', marginBottom: '10px' }}>
                                                <div style={{ fontSize: '0.8rem', color: '#666' }}>Total Problems</div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{groupStats.questionStats?.length || 0}</div>
                                            </div>

                                            <h4 style={{ marginTop: '2rem' }}>Students</h4>
                                            <div className="student-mini-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                                {selectedGroup.students.map(s => (
                                                    <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #222' }}>
                                                        <div style={{ fontSize: '0.85rem' }}>{s.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{s.email}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <p>Select a group to see stats.</p>
                                    )}
                                </section>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MentorDashboard;
