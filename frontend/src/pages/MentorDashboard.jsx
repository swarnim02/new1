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
    const [activeSection, setActiveSection] = useState('main');
    const [fetchingStats, setFetchingStats] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showAddGroup, setShowAddGroup] = useState(false);
    const [showAddSet, setShowAddSet] = useState(false);
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [showAddProblem, setShowAddProblem] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newSetName, setNewSetName] = useState('');
    const [studentEmails, setStudentEmails] = useState('');
    const [problemForm, setProblemForm] = useState({ title: '', link: '', platform: 'Codeforces' });

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

    const fetchAllStudentsStats = async () => {
        setFetchingStats(true);
        try {
            const updatedGroups = await Promise.all(
                groups.map(async (group) => {
                    const updatedStudents = await Promise.all(
                        group.students.map(async (student) => {
                            try {
                                if (!student.codeforcesHandle) {
                                    return { ...student, contestGiven: 0 };
                                }
                                const response = await fetch(`https://codeforces.com/api/user.rating?handle=${student.codeforcesHandle}`);
                                const data = await response.json();
                                if (data.status === 'OK') {
                                    return { ...student, contestGiven: data.result.length };
                                }
                                return { ...student, contestGiven: 0 };
                            } catch (error) {
                                console.error(`Error fetching stats for ${student.name}:`, error);
                                return { ...student, contestGiven: 0 };
                            }
                        })
                    );
                    return { ...group, students: updatedStudents };
                })
            );
            setGroups(updatedGroups);
            alert('Contest counts updated successfully!');
        } catch (error) {
            alert('Error fetching contest counts');
        } finally {
            setFetchingStats(false);
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

    const handleLogoClick = () => {
        navigate('/student-dashboard');
    };

    if (loading) return <div className="dashboard-container"><p>Loading...</p></div>;

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav" style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                padding: '1rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div 
                    onClick={handleLogoClick}
                    style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', letterSpacing: '1px', cursor: 'pointer' }}
                >
                    Algonauts
                </div>
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
                <main className="main-content" style={{ width: '100%' }}>
                    {activeSection === 'main' && (
                        <div className="animate-fade-in">
                            <h1 style={{ color: 'white' }}>Welcome, {user?.name}!</h1>
                            <p style={{ marginBottom: '3rem', color: '#aaa' }}>Choose a section to manage your groups and track student performance.</p>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                                <div 
                                    className="queue-item" 
                                    style={{ cursor: 'pointer', textAlign: 'center', padding: '2rem', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', transition: 'all 0.3s ease' }}
                                    onClick={() => setActiveSection('groups')}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                                >
                                    <h2 style={{ margin: '0 0 1rem 0', color: 'white' }}>Groups</h2>
                                    <p style={{ color: '#aaa' }}>Create and manage groups, add students, assign problem sets</p>
                                </div>
                                
                                <div 
                                    className="queue-item" 
                                    style={{ cursor: 'pointer', textAlign: 'center', padding: '2rem', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', transition: 'all 0.3s ease' }}
                                    onClick={() => setActiveSection('performance')}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                                >
                                    <h2 style={{ margin: '0 0 1rem 0', color: 'white' }}>Student Performance</h2>
                                    <p style={{ color: '#aaa' }}>View detailed statistics and progress of students in your groups</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'groups' && (
                        <div className="animate-fade-in">
                            <div style={{ marginBottom: '2rem' }}>
                                <button 
                                    className="btn btn-secondary btn-sm" 
                                    onClick={() => setActiveSection('main')}
                                >
                                    ← Back to Main
                                </button>
                            </div>

                            <div className="dashboard-content" style={{ display: 'flex', gap: '2rem', minHeight: 'calc(100vh - 200px)' }}>
                                <aside className="sidebar" style={{ minHeight: '100%' }}>
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
                                            <h2 style={{ color: 'white' }}>Create New Group</h2>
                                            <form onSubmit={handleCreateGroup} className="form" style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)', maxWidth: '500px' }}>
                                                <div className="form-group">
                                                    <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem' }}>Group Name</label>
                                                    <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="e.g. Batch of 2025" required style={{ width: '100%', padding: '0.7rem', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '6px', boxSizing: 'border-box' }} />
                                                </div>
                                                <button type="submit" className="btn btn-primary" style={{ background: 'white', color: '#000', fontWeight: 'bold', padding: '0.7rem 1.5rem', marginTop: '1rem' }}>Create Group</button>
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
                                                <h1 style={{ color: 'white' }}>{selectedGroup.groupName}</h1>
                                                <button className="btn btn-secondary" onClick={() => setShowAddStudent(!showAddStudent)}>
                                                    {showAddStudent ? 'Close' : 'Add Students'}
                                                </button>
                                            </div>

                                            {showAddStudent && (
                                                <div style={{ marginBottom: '2rem', background: 'rgba(255, 255, 255, 0.1)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                                                    <h3 style={{ marginTop: 0, color: 'white' }}>Add Students by Email</h3>
                                                    <form onSubmit={handleAddStudents} className="form">
                                                        <div className="form-group">
                                                            <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem' }}>Student Emails</label>
                                                            <textarea value={studentEmails} onChange={e => setStudentEmails(e.target.value)} placeholder="email1@gmail.com, email2@gmail.com" rows={3} style={{ width: '100%', padding: '0.7rem', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '6px', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                                                        </div>
                                                        <button type="submit" className="btn btn-primary" style={{ background: 'white', color: '#000', fontWeight: 'bold', padding: '0.7rem 1.5rem', marginTop: '1rem' }}>Add Students</button>
                                                    </form>
                                                </div>
                                            )}

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '2rem' }}>
                                                <section>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                        <h2 style={{ color: 'white' }}>Problem Sets</h2>
                                                        <button className="btn btn-primary btn-sm" onClick={() => setShowAddSet(true)}>+ New Set</button>
                                                    </div>

                                            {showAddSet && (
                                                <div style={{ marginBottom: '1rem', background: 'rgba(255, 255, 255, 0.1)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                                                    <form onSubmit={handleCreateSet} className="form" style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Set Name</label>
                                                            <input value={newSetName} onChange={e => setNewSetName(e.target.value)} placeholder="e.g. Graph Theory" required style={{ width: '100%', padding: '0.7rem', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '6px', boxSizing: 'border-box' }} />
                                                        </div>
                                                        <button type="submit" className="btn btn-primary" style={{ background: 'white', color: '#000', fontWeight: 'bold', padding: '0.7rem 1.5rem' }}>Create</button>
                                                        <button type="button" className="btn btn-secondary" onClick={() => setShowAddSet(false)} style={{ padding: '0.7rem 1.5rem' }}>Cancel</button>
                                                    </form>
                                                </div>
                                            )}

                                            <div className="sets-list">
                                                {problemSets.length === 0 ? (
                                                    <p style={{ color: '#666' }}>No problem sets created yet.</p>
                                                ) : (
                                                    problemSets.map(set => (
                                                        <div key={set._id} style={{
                                                            background: 'rgba(255,255,255,0.1)',
                                                            padding: '15px',
                                                            borderRadius: '8px',
                                                            marginBottom: '10px',
                                                            border: selectedSet?._id === set._id ? '1px solid white' : '1px solid rgba(255,255,255,0.2)',
                                                            cursor: 'pointer'
                                                        }} onClick={() => setSelectedSet(set)}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <h3 style={{ margin: 0, color: 'white' }}>{set.setName}</h3>
                                                                <span style={{ fontSize: '0.8rem', color: '#666' }}>{set.problems?.length || 0} Problems</span>
                                                            </div>

                                                            {selectedSet?._id === set._id && (
                                                                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                                                        <h4 style={{ margin: 0, color: 'white' }}>Problems</h4>
                                                                        <button className="btn btn-secondary btn-sm" onClick={() => setShowAddProblem(true)}>Add Problem</button>
                                                                    </div>

                                                                    {showAddProblem && (
                                                                        <form onSubmit={handleAddProblem} className="form" style={{ marginBottom: '15px', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                                                                <div>
                                                                                    <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Title</label>
                                                                                    <input value={problemForm.title} onChange={e => setProblemForm({ ...problemForm, title: e.target.value })} placeholder="Problem Title" required style={{ width: '100%', padding: '0.7rem', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '6px', boxSizing: 'border-box' }} />
                                                                                </div>
                                                                                <div>
                                                                                    <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Link</label>
                                                                                    <input value={problemForm.link} onChange={e => setProblemForm({ ...problemForm, link: e.target.value })} placeholder="Problem Link" required style={{ width: '100%', padding: '0.7rem', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '6px', boxSizing: 'border-box' }} />
                                                                                </div>
                                                                            </div>
                                                                            <div style={{ marginBottom: '15px' }}>
                                                                                <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Platform</label>
                                                                                <select value={problemForm.platform} onChange={e => setProblemForm({ ...problemForm, platform: e.target.value })} style={{ width: '100%', background: '#222', color: 'white', border: '1px solid #444', padding: '0.7rem', borderRadius: '6px', boxSizing: 'border-box' }}>
                                                                                    <option value="Codeforces">Codeforces</option>
                                                                                    <option value="LeetCode">LeetCode</option>
                                                                                    <option value="AtCoder">AtCoder</option>
                                                                                    <option value="Other">Other</option>
                                                                                </select>
                                                                            </div>
                                                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                                                <button type="submit" className="btn btn-primary" style={{ background: 'white', color: '#000', fontWeight: 'bold', padding: '0.7rem 1.5rem' }}>Save</button>
                                                                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddProblem(false)} style={{ padding: '0.7rem 1.5rem' }}>Cancel</button>
                                                                            </div>
                                                                        </form>
                                                                    )}

                                                                    <div>
                                                                        {set.problems?.map((p, i) => (
                                                                            <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < set.problems.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                                                                                <a href={p.link} target="_blank" rel="noreferrer" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem' }}>{p.title}</a>
                                                                                <span style={{ fontSize: '0.7rem', color: '#666' }}>{p.platform}</span>
                                                                            </div>
                                                                        ))}
                                                                        {(!set.problems || set.problems.length === 0) && <p style={{ fontSize: '0.8rem', color: '#666' }}>No problems in this set.</p>}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                                    </div>
                                                </section>

                                                <section style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)', height: 'fit-content', maxHeight: '600px', overflowY: 'auto' }}>
                                                    <h3 style={{ marginTop: 0, color: 'white' }}>Students ({selectedGroup.students.length})</h3>
                                                    <div>
                                                        {selectedGroup.students.map(s => (
                                                            <div key={s._id} style={{ padding: '0.75rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                                                <div style={{ fontWeight: 'bold', color: 'white', fontSize: '0.9rem' }}>{s.name}</div>
                                                                <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{s.email}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </section>
                                            </div>

                                        </div>
                                    )}
                                </main>
                            </div>
                        </div>
                    )}

                    {activeSection === 'performance' && (
                        <div className="animate-fade-in">
                            <div style={{ marginBottom: '2rem' }}>
                                <button 
                                    className="btn btn-secondary btn-sm" 
                                    onClick={() => setActiveSection('main')}
                                >
                                    ← Back to Main
                                </button>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={fetchAllStudentsStats}
                                    disabled={fetchingStats}
                                    style={{ marginLeft: '1rem' }}
                                >
                                    {fetchingStats ? 'Fetching...' : 'Fetch Contest Counts'}
                                </button>
                            </div>

                            {groups.length === 0 ? (
                                <div className="empty-state">
                                    <h3>No groups created yet</h3>
                                    <p>Create groups and add students to view performance statistics.</p>
                                </div>
                            ) : (
                                <div>
                                    <h3 style={{ color: 'white', marginBottom: '1rem' }}>All Students</h3>
                                    <div className="students-table-container" style={{ 
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '8px',
                                        backdropFilter: 'blur(10px)',
                                        overflow: 'hidden'
                                    }}>
                                        <table className="students-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ background: 'rgba(0, 0, 0, 0.3)' }}>
                                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>Name</th>
                                                    <th style={{ padding: '1rem', textAlign: 'center', color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>Contest Count</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {groups.map(group => 
                                                    group.students.map(student => (
                                                        <tr key={student._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                                            <td style={{ padding: '1rem', color: 'white' }}>
                                                                <div>
                                                                    <div style={{ fontWeight: 'bold' }}>{student.name}</div>
                                                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{student.email}</div>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '1rem', textAlign: 'center', color: 'white', fontWeight: 'bold' }}>{student.contestGiven || 0}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MentorDashboard;
