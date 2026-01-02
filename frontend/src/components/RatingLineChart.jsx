import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const RatingLineChart = ({ ratingHistory }) => {
    if (!ratingHistory || ratingHistory.length === 0) {
        return (
            <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                padding: '2rem', 
                borderRadius: '12px', 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                textAlign: 'center'
            }}>
                <h3 style={{ color: 'white' }}>No rating history available</h3>
            </div>
        );
    }

    const data = {
        labels: ratingHistory.map((contest, index) => `Contest ${index + 1}`),
        datasets: [
            {
                label: 'Rating',
                data: ratingHistory.map(contest => contest.newRating),
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#3498db',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                tension: 0.1
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
                    title: (context) => {
                        const index = context[0].dataIndex;
                        return ratingHistory[index].contestName || `Contest ${index + 1}`;
                    },
                    label: (context) => {
                        const index = context.dataIndex;
                        const contest = ratingHistory[index];
                        const change = contest.newRating - contest.oldRating;
                        return [
                            `Rating: ${contest.newRating}`,
                            `Change: ${change > 0 ? '+' : ''}${change}`,
                            `Rank: ${contest.rank}`
                        ];
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: 'white'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            y: {
                ticks: {
                    color: 'white'
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
            marginBottom: '2rem',
            backdropFilter: 'blur(10px)'
        }}>
            <h3 style={{ color: 'white', marginBottom: '1rem', textAlign: 'center' }}>Rating History</h3>
            <div style={{ height: '400px' }}>
                <Line data={data} options={options} />
            </div>
        </div>
    );
};

export default RatingLineChart;