import React from "react";

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
            className="absolute -top-8 right-2 text-sm text-red-500 hover:text-red-700 font-semibold transition-colors flex items-center gap-1 z-10"
            title="Clear all text fields"
        >
            <span>✕</span> Clear Text
        </button>
    );
};

export default ClearTextButton;