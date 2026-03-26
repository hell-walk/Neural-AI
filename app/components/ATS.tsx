import React from 'react';

interface Suggestion {
    type: "good" | "improve";
    tip: string;
}

interface ATSProps {
    score: number;
    suggestions: Suggestion[];
}

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
    let gradientStart = 'from-red-100';
    let textColor = 'text-red-500';

    if (score > 69) {
        gradientStart = 'from-green-100';
        textColor = 'text-green-500';
    } else if (score > 49) {
        gradientStart = 'from-yellow-100';
        textColor = 'text-yellow-500';
    }

    return (
        <div className={`bg-gradient-to-b ${gradientStart} to-white rounded-2xl p-6 shadow-md border border-gray-100 w-full`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-gray-800">ATS Suitability</h2>
                    <p className="text-sm text-gray-500">How well applicant tracking systems can read your resume</p>
                </div>
                <div className="flex items-baseline gap-1 mt-2 md:mt-0">
                    <span className={`text-4xl font-extrabold ${textColor}`}>{score}</span>
                    <span className="text-xl font-medium text-gray-400">/100</span>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <h3 className="font-semibold text-gray-700 text-lg">Analysis \ Suggestions</h3>
                {suggestions && suggestions.length > 0 ? (
                    <ul className="space-y-3">
                        {suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-3 bg-white/60 p-3 rounded-lg border border-gray-100">
                                <span className="text-xl shrink-0">
                                    {suggestion.type === 'good' ? '✅' : '⚠️'}
                                </span>
                                <p className="text-gray-700 leading-relaxed pt-0.5">
                                    {suggestion.tip}
                                </p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 italic p-4 text-center bg-white/40 rounded-lg">No suggestions available at this time.</p>
                )}
            </div>
        </div>
    );
};

export default ATS;