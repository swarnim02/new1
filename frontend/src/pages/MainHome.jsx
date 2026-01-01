import React, { useState } from 'react';
import '../App.css';

const MainHome = () => {
    const [activeTab, setActiveTab] = useState('home');

    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
                        <h1 style={{ 
                            fontSize: '4rem', 
                            margin: '0',
                            background: 'linear-gradient(45deg, #007bff, #00d4ff, #007bff)',
                            backgroundSize: '200% 200%',
                            animation: 'gradient 3s ease infinite',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 'bold',
                            letterSpacing: '2px',
                            textShadow: '0 0 30px rgba(0, 123, 255, 0.5)'
                        }}>Algonauts</h1>
                    </div>
                );
            case 'about':
                return (
                    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                        <h2>About Algonauts</h2>
                        <p>Information about this website and Algonauts will go here.</p>
                    </div>
                );
            case 'cphelper':
                return (
                    <div className="home-container">
                        <div className="hero">
                            <h1>Algonauts CP Helper</h1>
                            <p className="hero-subtitle">
                                Master Competitive Programming with Structure & Strategy
                            </p>
                            <p className="hero-description">
                                A comprehensive platform for mentors to manage student progress
                                and students to systematically upsolve problems.
                            </p>

                            <div className="cta-buttons">
                                <a href="/register" className="btn btn-primary btn-large">
                                    Get Started
                                </a>
                                <a href="/login" className="btn btn-secondary btn-large">
                                    Sign In
                                </a>
                            </div>

                            <div className="features">
                                <div className="feature-card">
                                    <h3>Smart Queue</h3>
                                    <p>Problems organized by priority and difficulty</p>
                                </div>
                                <div className="feature-card">
                                    <h3>Progress Tracking</h3>
                                    <p>Monitor student performance in real-time</p>
                                </div>
                                <div className="feature-card">
                                    <h3>Codeforces Integration</h3>
                                    <p>Seamless integration with Codeforces API</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'contact':
                return (
                    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
                        <h2>Contact Us</h2>
                        <form className="form">
                            <div className="form-group">
                                <label>Name</label>
                                <input type="text" placeholder="Your name" />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" placeholder="Your email" />
                            </div>
                            <div className="form-group">
                                <label>Query</label>
                                <textarea rows="5" placeholder="Your query"></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary">Submit</button>
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
                justifyContent: 'center'
            }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <button 
                        onClick={() => setActiveTab('home')}
                        style={{
                            background: activeTab === 'home' ? 'rgba(0, 123, 255, 0.8)' : 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
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
                            background: activeTab === 'about' ? 'rgba(0, 123, 255, 0.8)' : 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
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
                            background: activeTab === 'cphelper' ? 'rgba(0, 123, 255, 0.8)' : 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
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
                            background: activeTab === 'contact' ? 'rgba(0, 123, 255, 0.8)' : 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
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