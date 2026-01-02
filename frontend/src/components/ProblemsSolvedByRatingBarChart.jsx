import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ProblemsSolvedByRatingBarChart = ({ submissions }) => {
    if (!submissions || submissions.length === 0) {
        return (
            <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                padding: '2rem', 
                borderRadius: '12px', 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                textAlign: 'center'
            }}>
                <h3 style={{ color: 'white' }}>No submissions available</h3>
            </div>
        );
    }

    // Filter only accepted submissions and get unique problems with ratings
    const acceptedSubmissions = submissions.filter(sub => sub.verdict === 'OK');
    const uniqueProblems = new Map();
    
    acceptedSubmissions.forEach(sub => {
        const problemKey = `${sub.problem.contestId}-${sub.problem.index}`;
        if (!uniqueProblems.has(problemKey) && sub.problem.rating) {
            uniqueProblems.set(problemKey, sub.problem);
        }
    });

    // Count problems by rating buckets
    const buckets = {
        '800-999': 0,
        '1000-1199': 0,
        '1200-1399': 0,
        '1400-1599': 0,
        '1600-1799': 0,
        '1800-1999': 0,
        '2000-2199': 0,
        '2200-2399': 0,
        '2400-2599': 0,
        '2600+': 0
    };

    uniqueProblems.forEach(problem => {
        const rating = problem.rating;
        if (rating >= 800 && rating < 1000) buckets['800-999']++;
        else if (rating < 1200) buckets['1000-1199']++;
        else if (rating < 1400) buckets['1200-1399']++;
        else if (rating < 1600) buckets['1400-1599']++;
        else if (rating < 1800) buckets['1600-1799']++;
        else if (rating < 2000) buckets['1800-1999']++;
        else if (rating < 2200) buckets['2000-2199']++;
        else if (rating < 2400) buckets['2200-2399']++;
        else if (rating < 2600) buckets['2400-2599']++;
        else if (rating >= 2600) buckets['2600+']++;
    });

    const data = {
        labels: Object.keys(buckets),
        datasets: [
            {
                label: 'Problems Solved',
                data: Object.values(buckets),
                backgroundColor: [
                    'rgba(0, 128, 0, 0.8)',
                    'rgba(0, 150, 0, 0.8)',
                    'rgba(3, 168, 158, 0.8)',
                    'rgba(3, 190, 180, 0.8)',
                    'rgba(0, 0, 255, 0.8)',
                    'rgba(0, 50, 255, 0.8)',
                    'rgba(170, 0, 170, 0.8)',
                    'rgba(200, 0, 200, 0.8)',
                    'rgba(255, 0, 0, 0.8)',
                    'rgba(255, 50, 50, 0.8)'
                ],
                borderColor: [
                    'rgba(0, 128, 0, 1)',
                    'rgba(0, 150, 0, 1)',
                    'rgba(3, 168, 158, 1)',
                    'rgba(3, 190, 180, 1)',
                    'rgba(0, 0, 255, 1)',
                    'rgba(0, 50, 255, 1)',
                    'rgba(170, 0, 170, 1)',
                    'rgba(200, 0, 200, 1)',
                    'rgba(255, 0, 0, 1)',
                    'rgba(255, 50, 50, 1)'
                ],
                borderWidth: 1,
                hoverBackgroundColor: [
                    'rgba(0, 128, 0, 1)',
                    'rgba(0, 150, 0, 1)',
                    'rgba(3, 168, 158, 1)',
                    'rgba(3, 190, 180, 1)',
                    'rgba(0, 0, 255, 1)',
                    'rgba(0, 50, 255, 1)',
                    'rgba(170, 0, 170, 1)',
                    'rgba(200, 0, 200, 1)',
                    'rgba(255, 0, 0, 1)',
                    'rgba(255, 50, 50, 1)'
                ]
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: 'white'
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const range = context.label;
                        const count = context.parsed.y;
                        return `${range}: ${count} problems`;
                    }
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Rating Range',
                    color: 'white'
                },
                ticks: {
                    color: 'white'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Number of Problems',
                    color: 'white'
                },
                ticks: {
                    color: 'white',
                    beginAtZero: true
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            }
        }
    };

    return (
        <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            padding: '2rem', 
            borderRadius: '12px', 
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)'
        }}>
            <h3 style={{ color: 'white', marginBottom: '1rem', textAlign: 'center' }}>
                Problems Solved by Rating
            </h3>
            <p style={{ color: '#aaa', textAlign: 'center', marginBottom: '1rem' }}>
                Total Rated Problems: {uniqueProblems.size}
            </p>
            <div style={{ height: '400px' }}>
                <Bar data={data} options={options} />
            </div>
        </div>
    );
};

export default ProblemsSolvedByRatingBarChart;