import React, { useState } from "react";

interface FileUploaderProps {
    onFileSelect: (file: File | null) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect }) => {
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        
        if (file) {
            setFileName(file.name);
            onFileSelect(file);
        } else {
            setFileName(null);
            onFileSelect(null);
        }
    };

    return (
        <div className="form-div flex flex-col text-left w-full">
            <label htmlFor="resume-upload" className="text-gray-700 font-semibold mb-2 ml-1 text-sm text-center">
                Upload Your Resume
            </label>
            
            <input 
                type="file" 
                name="resume-upload" 
                id="resume-upload"
                onChange={handleFileChange}
                className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                accept=".pdf,.doc,.docx"
                required
            />

            {/* Optional: Show selected file name below the input for extra clarity */}
            {fileName && (
                <p className="text-green-600 text-sm mt-2 text-center font-medium">
                    ✅ Selected: {fileName}
                </p>
            )}
        </div>
    );
};

export default FileUploader;