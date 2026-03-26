import React from 'react';

interface ScoreBadgeProps {
    score: number;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
    let bgColor = '';
    let textColor = '';
    let label = '';

    if (score > 70) {
        bgColor = 'bg-green-100'; // Or 'bg-badge-green' if you have a custom tailwind class
        textColor = 'text-green-600';
        label = 'Strong';
    } else if (score > 49) {
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-600';
        label = 'Good Start';
    } else {
        bgColor = 'bg-red-100';
        textColor = 'text-red-600';
        label = 'Needs Work';
    }

    return (
        <div className={`px-2 py-1 rounded-full ${bgColor} ${textColor} text-xs font-bold inline-block`}>
            <p>{label}</p>
        </div>
    );
};

export default ScoreBadge;