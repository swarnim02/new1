import React, { useState } from 'react';
import '../App.css';

const MainHome = () => {
    const [activeTab, setActiveTab] = useState('home');

    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', flexDirection: 'column' }}>
                        <h1 style={{ 
                            fontSize: '4rem', 
                            margin: '0 0 1rem 0',
                            color: 'white',
                            fontWeight: 'bold',
                            letterSpacing: '2px'
                        }}>Algonauts</h1>
                        <p style={{ fontSize: '1.3rem', color: 'white', marginBottom: '2rem', fontWeight: '500' }}>Master Competitive Programming</p>
                        <p style={{ fontSize: '1rem', color: '#aaa', marginBottom: '2rem', maxWidth: '600px', lineHeight: '1.8' }}>Join our community of competitive programmers and accelerate your journey to mastery with structured guidance, smart problem queues, and expert mentorship.</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={() => setActiveTab('cphelper')} style={{ padding: '0.8rem 2rem', fontSize: '1rem', background: 'white', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Explore CP Helper</button>
                            <button onClick={() => setActiveTab('about')} style={{ padding: '0.8rem 2rem', fontSize: '1rem', background: 'rgba(255, 255, 255, 0.2)', color: 'white', border: '1px solid white', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Learn More</button>
                        </div>
                    </div>
                );
            case 'about':
                return (
                    <div style={{ padding: '3rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'white' }}>About Algonauts</h2>
                        <div style={{ display: 'grid', gap: '2rem' }}>
                            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '2rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                                <h3 style={{ color: 'white', marginBottom: '1rem' }}>What is Algonauts?</h3>
                                <p style={{ lineHeight: '1.8', color: '#ccc' }}>Algonauts is a competitive programming club dedicated to helping students master algorithmic problem-solving. We provide structured guidance, mentorship, and tools to accelerate your journey in competitive programming.</p>
                            </div>
                            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '2rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                                <h3 style={{ color: 'white', marginBottom: '1rem' }}>Our Mission</h3>
                                <p style={{ lineHeight: '1.8', color: '#ccc' }}>To empower students with the knowledge, skills, and confidence needed to excel in competitive programming contests and technical interviews.</p>
                            </div>
                            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '2rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                                <h3 style={{ color: 'white', marginBottom: '1rem' }}>Why Join Us?</h3>
                                <ul style={{ lineHeight: '2', color: '#ccc', paddingLeft: '1.5rem' }}>
                                    <li>Expert mentorship from experienced competitive programmers</li>
                                    <li>Structured problem-solving curriculum</li>
                                    <li>Smart upsolve queue to optimize your learning</li>
                                    <li>Real-time progress tracking and analytics</li>
                                    <li>Community support and collaboration</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            case 'cphelper':
                return (
                    <div className="home-container">
                        <div className="hero">
                            <h1 style={{ color: 'white' }}>Algonauts CP Helper</h1>
                            <p className="hero-subtitle" style={{ color: 'white' }}>
                                Master Competitive Programming with Structure & Strategy
                            </p>
                            <p className="hero-description">
                                A comprehensive platform for mentors to manage student progress
                                and students to systematically upsolve problems.
                            </p>

                            <div className="cta-buttons">
                                <a href="/register" style={{ background: 'white', color: '#000', padding: '0.8rem 2rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
                                    Get Started
                                </a>
                                <a href="/login" style={{ background: 'rgba(255, 255, 255, 0.2)', color: 'white', border: '1px solid white', padding: '0.8rem 2rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
                                    Sign In
                                </a>
                            </div>

                            <div className="features">
                                <div className="feature-card">
                                    <h3 style={{ color: 'white' }}>Smart Queue</h3>
                                    <p>Problems organized by priority and difficulty</p>
                                </div>
                                <div className="feature-card">
                                    <h3 style={{ color: 'white' }}>Progress Tracking</h3>
                                    <p>Monitor student performance in real-time</p>
                                </div>
                                <div className="feature-card">
                                    <h3 style={{ color: 'white' }}>Codeforces Integration</h3>
                                    <p>Seamless integration with Codeforces API</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'contact':
                return (
                    <div style={{ padding: '3rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'white', textAlign: 'center' }}>Get In Touch</h2>
                        <form className="form" style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '2rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                            <div className="form-group">
                                <label style={{ color: '#ccc' }}>Name</label>
                                <input type="text" placeholder="Your name" style={{ background: '#222', color: 'white', border: '1px solid #444', padding: '0.7rem', borderRadius: '6px' }} />
                            </div>
                            <div className="form-group">
                                <label style={{ color: '#ccc' }}>Email</label>
                                <input type="email" placeholder="Your email" style={{ background: '#222', color: 'white', border: '1px solid #444', padding: '0.7rem', borderRadius: '6px' }} />
                            </div>
                            <div className="form-group">
                                <label style={{ color: '#ccc' }}>Subject</label>
                                <input type="text" placeholder="Subject" style={{ background: '#222', color: 'white', border: '1px solid #444', padding: '0.7rem', borderRadius: '6px' }} />
                            </div>
                            <div className="form-group">
                                <label style={{ color: '#ccc' }}>Message</label>
                                <textarea rows="5" placeholder="Your message" style={{ background: '#222', color: 'white', border: '1px solid #444', padding: '0.7rem', borderRadius: '6px' }}></textarea>
                            </div>
                            <button type="submit" style={{ marginTop: '1rem', padding: '0.7rem 2rem', fontSize: '1rem', background: 'white', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Send Message</button>
                        </form>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div style={{ minHeight: '100vh' }}>
            <nav style={{ 
                background: 'rgba(0, 0, 0, 0.3)', 
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)', 
                backdropFilter: 'blur(10px)',
                padding: '1rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div 
                    onClick={() => setActiveTab('home')}
                    style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', letterSpacing: '1px', cursor: 'pointer' }}
                >
                    Algonauts
                </div>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <button 
                        onClick={() => setActiveTab('home')}
                        style={{
                            background: activeTab === 'home' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.1)',
                            color: activeTab === 'home' ? '#000' : 'white',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            padding: '0.5rem 1rem',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            backdropFilter: 'blur(5px)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Home
                    </button>
                    <button 
                        onClick={() => setActiveTab('about')}
                        style={{
                            background: activeTab === 'about' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.1)',
                            color: activeTab === 'about' ? '#000' : 'white',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            padding: '0.5rem 1rem',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            backdropFilter: 'blur(5px)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        About
                    </button>
                    <button 
                        onClick={() => setActiveTab('cphelper')}
                        style={{
                            background: activeTab === 'cphelper' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.1)',
                            color: activeTab === 'cphelper' ? '#000' : 'white',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            padding: '0.5rem 1rem',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            backdropFilter: 'blur(5px)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        CP Helper
                    </button>
                    <button 
                        onClick={() => setActiveTab('contact')}
                        style={{
                            background: activeTab === 'contact' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.1)',
                            color: activeTab === 'contact' ? '#000' : 'white',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            padding: '0.5rem 1rem',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            backdropFilter: 'blur(5px)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Contact Us
                    </button>
                </div>
            </nav>
            
            <main>
                {renderContent()}
            </main>
        </div>
    );
};

export default MainHome;
