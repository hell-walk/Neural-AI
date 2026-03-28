import React, { useState } from 'react';

interface ExportButtonProps {
    filename?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ filename = "My_Resume" }) => {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);

        try {
            // Find the element that contains the SVG we want to print
            const element = document.querySelector('.preview-section svg');
            
            if (!element) {
                alert("Preview not found. Please generate a resume first.");
                setIsExporting(false);
                return;
            }

            // Ensure html2pdf is available globally (from our root.tsx script)
            if (typeof window !== 'undefined' && (window as any).html2pdf) {
                const opt = {
                    margin:       0,
                    filename:     `${filename.replace(/\s+/g, '_')}.pdf`,
                    image:        { type: 'jpeg', quality: 1.0 }, // Maximum quality
                    html2canvas:  { scale: 2, useCORS: true }, // Scale 2 prevents blurry text
                    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };

                // Generate and download the PDF
                await (window as any).html2pdf().set(opt).from(element).save();
            } else {
                console.error("html2pdf library not loaded.");
                alert("Export library is missing. Please refresh the page.");
            }
        } catch (error) {
            console.error("Error exporting PDF:", error);
            alert("Failed to export PDF.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button 
            onClick={handleExport}
            disabled={isExporting}
            className="bg-purple-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-purple-700 font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
        >
            {isExporting ? (
                <span className="animate-pulse">Exporting...</span>
            ) : (
                <>
                    <span>📥</span> Export PDF
                </>
            )}
        </button>
    );
};