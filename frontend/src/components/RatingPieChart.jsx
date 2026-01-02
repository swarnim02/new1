import React from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const RatingPieChart = ({ userData }) => {
    const currentRating = userData.rating || 0;
    
    const categories = [
        { name: 'Newbie', range: '<1200', color: '#808080', min: 0, max: 1199 },
        { name: 'Pupil', range: '1200-1399', color: '#008000', min: 1200, max: 1399 },
        { name: 'Specialist', range: '1400-1599', color: '#03A89E', min: 1400, max: 1599 },
        { name: 'Expert', range: '1600-1899', color: '#0000FF', min: 1600, max: 1899 },
        { name: 'Candidate Master', range: '1900-2099', color: '#AA00AA', min: 1900, max: 2099 },
        { name: 'Master', range: '2100-2299', color: '#FF8C00', min: 2100, max: 2299 },
        { name: 'International Master', range: '2300-2399', color: '#FF8C00', min: 2300, max: 2399 },
        { name: 'Grandmaster', range: '2400+', color: '#FF0000', min: 2400, max: Infinity }
    ];

    // Find current category
    let currentCategoryIndex = 0;
    for (let i = 0; i < categories.length; i++) {
        if (currentRating >= categories[i].min && currentRating <= categories[i].max) {
            currentCategoryIndex = i;
            break;
        }
    }

    const data = {
        labels: categories.map(cat => `${cat.name} (${cat.range})`),
        datasets: [
            {
                data: categories.map((_, index) => index === currentCategoryIndex ? 2 : 1),
                backgroundColor: categories.map((cat, index) => 
                    index === currentCategoryIndex ? cat.color : `${cat.color}80`
                ),
                borderColor: categories.map((_, index) => 
                    index === currentCategoryIndex ? '#FFD700' : 'rgba(255, 255, 255, 0.2)'
                ),
                borderWidth: categories.map((_, index) => 
                    index === currentCategoryIndex ? 3 : 1
                ),
                hoverBackgroundColor: categories.map(cat => cat.color),
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
                        const category = categories[context.dataIndex];
                        const isCurrent = context.dataIndex === currentCategoryIndex;
                        return [
                            `${category.name}`,
                            `Range: ${category.range}`,
                            isCurrent ? `Your Rating: ${currentRating}` : ''
                        ].filter(Boolean);
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
                Rating Category Distribution
            </h3>
            <p style={{ color: '#aaa', textAlign: 'center', marginBottom: '1rem' }}>
                Current: {categories[currentCategoryIndex].name} ({currentRating})
            </p>
            <div style={{ height: '400px' }}>
                <Pie data={data} options={options} />
            </div>
        </div>
    );
};

export default RatingPieChart;