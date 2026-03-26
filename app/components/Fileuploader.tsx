import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import type { FileRejection } from 'react-dropzone';
import { formatSize } from '~/lib/utility';
import DeleteFileAnimation from '~/components/DeleteFileAnimation';

interface FileUploaderProps {
    onFileSelect: (file: File | null) => void;
    currentFile: File | null;
}

const Fileuploader: React.FC<FileUploaderProps> = ({ onFileSelect, currentFile }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
        if (fileRejections.length > 0) {
            const error = fileRejections[0].errors[0];
            if (error.code === 'too-many-files') {
                alert('Please upload only one file at a time.');
            } else if (error.code === 'file-too-large') {
                alert('File is larger than 10MB. Please upload a smaller file.');
            } else if (error.code === 'file-invalid-type') {
                alert('Invalid file type. Please upload a PDF or Word document.');
            }
            onFileSelect(null);
            return;
        }

        if (acceptedFiles && acceptedFiles.length > 0) {
            onFileSelect(acceptedFiles[0]);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        maxFiles: 1,
        multiple: false,
        maxSize: 10 * 1024 * 1024, // 10MB
        disabled: isDeleting || currentFile !== null
    });

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDeleting(true);
    };

    const handleDeleteAnimationComplete = () => {
        setIsDeleting(false);
        onFileSelect(null);
    };

    return (
        <div className="w-full relative">
            {isDeleting && <DeleteFileAnimation onAnimationComplete={handleDeleteAnimationComplete} />}
            <div 
                {...getRootProps()} 
                className={`w-full border-2 border-dashed rounded-xl p-8 text-center backdrop-blur-sm transition-all duration-300 shadow-sm flex flex-col items-center justify-center relative
                    ${isDeleting 
                        ? 'opacity-0 scale-95'
                        : isDragReject 
                            ? 'border-red-500 bg-red-50/90 scale-105 cursor-no-drop' 
                            : isDragActive 
                                ? 'border-purple-600 bg-purple-50/90 scale-105 cursor-copy' 
                                : currentFile 
                                    ? 'border-green-400 bg-green-50/80 cursor-default' 
                                    : 'border-purple-300 bg-white/60 hover:bg-white/90 hover:border-purple-500 cursor-pointer'}`}
            >
                <input {...getInputProps()} />
                
                {currentFile && !isDeleting && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="absolute top-4 right-4 bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-full transition-colors z-10"
                        title="Remove file"
                    >
                        🗑️
                    </button>
                )}

                <div className="pointer-events-none flex flex-col items-center">
                    <span className="text-4xl mb-2" role="img" aria-label="Document">
                        {isDragReject ? '❌' : currentFile ? '✅' : '📄'}
                    </span>
                    <p className={`font-semibold mb-1 ${isDragReject ? 'text-red-600' : 'text-gray-800'}`}>
                        {isDragReject 
                            ? 'File rejected!' 
                            : currentFile 
                                ? currentFile.name 
                                : isDragActive 
                                    ? 'Drop it here!' 
                                    : 'Click or drag to upload'}
                    </p>
                    <p className={`text-sm ${isDragReject ? 'text-red-500 font-semibold' : currentFile ? 'text-green-600' : 'text-gray-500'}`}>
                        {isDragReject 
                            ? 'Max 10MB, PDF/DOC only' 
                            : currentFile 
                                ? `(${formatSize(currentFile.size)})`
                                : 'PDF, DOC, DOCX (Max 10MB)'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Fileuploader;