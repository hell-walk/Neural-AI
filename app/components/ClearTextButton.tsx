import React from 'react';

interface ClearTextButtonProps {
    onClear: () => void;
    isVisible: boolean;
}

const ClearTextButton: React.FC<ClearTextButtonProps> = ({ onClear, isVisible }) => {
    if (!isVisible) return null;

    return (
        <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 text-sm text-red-500 hover:text-red-700 transition-colors z-10 flex items-center gap-1 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md border border-red-100 shadow-sm"
            title="Clear all fields"
        >
            <span>✕</span> Clear
        </button>
    );
};

export default ClearTextButton;