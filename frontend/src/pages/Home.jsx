import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="home-container">
            <div className="hero">
                <h1>🚀 Algonauts CP Helper</h1>
                <p className="hero-subtitle">
                    Master Competitive Programming with Structure & Strategy
                </p>
                <p className="hero-description">
                    A comprehensive platform for mentors to manage student progress
                    and students to systematically upsolve problems.
                </p>

                <div className="cta-buttons">
                    {isAuthenticated ? (
                        <Link to="/dashboard" className="btn btn-primary btn-large">
                            Go to Dashboard →
                        </Link>
                    ) : (
                        <>
                            <Link to="/register" className="btn btn-primary btn-large">
                                Get Started
                            </Link>
                            <Link to="/login" className="btn btn-secondary btn-large">
                                Sign In
                            </Link>
                        </>
                    )}
                </div>

                <div className="features">
                    <div className="feature-card">
                        <h3>📚 Smart Queue</h3>
                        <p>Problems organized by priority and difficulty</p>
                    </div>
                    <div className="feature-card">
                        <h3>📊 Progress Tracking</h3>
                        <p>Monitor student performance in real-time</p>
                    </div>
                    <div className="feature-card">
                        <h3>🔗 Codeforces Integration</h3>
                        <p>Seamless integration with Codeforces API</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;

