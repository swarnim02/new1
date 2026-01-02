import React from 'react';

const StatsCards = ({ userData, ratingHistory }) => {
    const totalContests = ratingHistory.length;

    const stats = [
        { label: 'Current Rating', value: userData.rating || 'Unrated' },
        { label: 'Max Rating', value: userData.maxRating || 'N/A' },
        { label: 'Current Rank', value: userData.rank || 'Unrated' },
        { label: 'Max Rank', value: userData.maxRank || 'N/A' },
        { label: 'Contribution', value: userData.contribution || 0 },
        { label: 'Total Contests', value: totalContests }
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {stats.map((stat, index) => (
                <div key={index} style={{ 
                    background: 'rgba(255, 255, 255, 0.1)', 
                    padding: '1.5rem', 
                    borderRadius: '8px', 
                    border: '1px solid rgba(255, 255, 255, 0.2)', 
                    backdropFilter: 'blur(10px)',
                    textAlign: 'center'
                }}>
                    <h4 style={{ color: '#aaa', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>{stat.label}</h4>
                    <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{stat.value}</p>
                </div>
            ))}
        </div>
    );
};

export default StatsCards;