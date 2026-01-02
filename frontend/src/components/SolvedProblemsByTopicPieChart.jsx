import React from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const SolvedProblemsByTopicPieChart = ({ submissions }) => {
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

    // Filter only accepted submissions and get unique problems
    const acceptedSubmissions = submissions.filter(sub => sub.verdict === 'OK');
    const uniqueProblems = new Map();
    
    acceptedSubmissions.forEach(sub => {
        const problemKey = `${sub.problem.contestId}-${sub.problem.index}`;
        if (!uniqueProblems.has(problemKey)) {
            uniqueProblems.set(problemKey, sub.problem);
        }
    });

    // Count problems by topics/tags
    const topicCounts = {};
    
    uniqueProblems.forEach(problem => {
        if (problem.tags && problem.tags.length > 0) {
            problem.tags.forEach(tag => {
                topicCounts[tag] = (topicCounts[tag] || 0) + 1;
            });
        }
    });

    // Sort topics by count and take top topics for better visualization
    const sortedTopics = Object.entries(topicCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 12); // Show top 12 topics

    if (sortedTopics.length === 0) {
        return (
            <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                padding: '2rem', 
                borderRadius: '12px', 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                textAlign: 'center'
            }}>
                <h3 style={{ color: 'white' }}>No tagged problems found</h3>
            </div>
        );
    }

    // Generate colors for topics
    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
        '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'
    ];

    const data = {
        labels: sortedTopics.map(([topic, count]) => `${topic} (${count})`),
        datasets: [
            {
                data: sortedTopics.map(([, count]) => count),
                backgroundColor: colors.slice(0, sortedTopics.length),
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
                hoverBackgroundColor: colors.slice(0, sortedTopics.length).map(color => color + 'CC'),
                hoverBorderColor: '#FFD700',
                hoverBorderWidth: 3
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: 'white',
                    padding: 10,
                    usePointStyle: true,
                    font: {
                        size: 11
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const [topic, count] = sortedTopics[context.dataIndex];
                        const total = sortedTopics.reduce((sum, [, c]) => sum + c, 0);
                        const percentage = ((count / total) * 100).toFixed(1);
                        return [
                            `Topic: ${topic}`,
                            `Problems: ${count}`,
                            `Percentage: ${percentage}%`
                        ];
                    }
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
                Problems Solved by Topics
            </h3>
            <p style={{ color: '#aaa', textAlign: 'center', marginBottom: '1rem' }}>
                Total Unique Problems: {uniqueProblems.size}
            </p>
            <div style={{ height: '400px' }}>
                <Pie data={data} options={options} />
            </div>
        </div>
    );
};

export default SolvedProblemsByTopicPieChart;