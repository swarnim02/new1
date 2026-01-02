import React from 'react';
import UserInput from './UserInput';
import StatsCards from './StatsCards';
import RatingLineChart from './RatingLineChart';
import SolvedProblemsByTopicPieChart from './SolvedProblemsByTopicPieChart';
import ProblemsSolvedByRatingBarChart from './ProblemsSolvedByRatingBarChart';
import ProblemsSolvedCalendar from './ProblemsSolvedCalendar';

const CodeforcesDashboard = ({ 
    cfHandle, 
    setCfHandle, 
    cfLoading, 
    cfError, 
    userData, 
    ratingHistory,
    submissions, 
    onFetchStats 
}) => {
    return (
        <div>
            <h2 style={{ color: 'white', marginBottom: '20px' }}>Codeforces Statistics Dashboard</h2>
            
            <UserInput 
                onSubmit={onFetchStats}
                loading={cfLoading}
            />

            {cfError && (
                <div style={{
                    background: 'rgba(231, 76, 60, 0.2)',
                    border: '1px solid #e74c3c',
                    padding: '1rem',
                    borderRadius: '8px',
                    color: '#e74c3c',
                    marginBottom: '2rem',
                    backdropFilter: 'blur(10px)'
                }}>
                    {cfError}
                </div>
            )}

            {userData && (
                <div>
                    <StatsCards userData={userData} ratingHistory={ratingHistory} />
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                        <RatingLineChart ratingHistory={ratingHistory} />
                        <SolvedProblemsByTopicPieChart submissions={submissions} />
                    </div>
                    
                    <div style={{ marginBottom: '2rem' }}>
                        <ProblemsSolvedByRatingBarChart submissions={submissions} />
                    </div>
                    
                    <div style={{ marginBottom: '2rem' }}>
                        <ProblemsSolvedCalendar submissions={submissions} userData={userData} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CodeforcesDashboard;