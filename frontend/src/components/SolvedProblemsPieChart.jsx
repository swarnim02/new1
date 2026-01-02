import React from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const SolvedProblemsPieChart = ({ submissions }) => {
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

    // Count problems by difficulty buckets
    const buckets = {
        '0-800': 0,
        '800-1200': 0,
        '1200-1600': 0,
        '1600-2000': 0,
        '2000-2400': 0,
        '2400+': 0
    };

    uniqueProblems.forEach(problem => {
        const rating = problem.rating || 0;
        if (rating < 800) buckets['0-800']++;
        else if (rating < 1200) buckets['800-1200']++;
        else if (rating < 1600) buckets['1200-1600']++;
        else if (rating < 2000) buckets['1600-2000']++;
        else if (rating < 2400) buckets['2000-2400']++;
        else buckets['2400+']++;
    });

    const data = {
        labels: Object.keys(buckets).map(range => `${range} (${buckets[range]})`),
        datasets: [
            {
                data: Object.values(buckets),
                backgroundColor: [
                    '#808080',
                    '#008000',
                    '#03A89E',
                    '#0000FF',
                    '#AA00AA',
                    '#FF0000'
                ],
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
                hoverBackgroundColor: [
                    '#909090',
                    '#109010',
                    '#13B8AE',
                    '#1010FF',
                    '#BA10BA',
                    '#FF1010'
                ],
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
                    padding: 15,
                    usePointStyle: true,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const range = Object.keys(buckets)[context.dataIndex];
                        const count = buckets[range];
                        const total = Object.values(buckets).reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                        return [
                            `Rating: ${range}`,
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
                Problems Solved by Difficulty
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

export default SolvedProblemsPieChart;