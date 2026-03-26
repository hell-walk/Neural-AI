import React, { useState } from 'react';

interface FileUploaderProps {
    onFileSelect: (file: File | null) => void;
}

const Fileuploader: React.FC<FileUploaderProps> = ({ onFileSelect }) => {
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        
        if (file) {
            setFileName(file.name);
            onFileSelect(file);
        } else {
            setFileName(null);
            onFileSelect(null);
        }
    };

    return (
        <div className="w-full">
            <input
                type="file"
                name="resume-upload"
                id="resume-upload"
                onChange={handleFileChange}
                className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                accept=".pdf,.doc,.docx"
                required
            />
            {fileName && (
                <p className="text-green-600 text-sm mt-2 text-center font-medium">
                    ✅ Selected: {fileName}
                </p>
            )}
        </div>
    );
};

export default Fileuploader;