import React, {useState, useRef, useCallback} from "react";
import Navbar from "~/components/navbar";
import ResumeAnalyzerAnimation from "~/components/ResumeAnalyzerAnimation";

const Upload = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);
    const [statusText, setStatusText] = useState(' ');
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [jobTitle, setJobTitle] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleFileSelection = useCallback((file: File) => {
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (validTypes.includes(file.type)) {
            setSelectedFile(file);
        } else {
            alert("Please upload a PDF or Word document.");
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileSelection(files[0]);
        }
    }, [handleFileSelection]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelection(files[0]);
        }
    }, [handleFileSelection]);

    const handleEnhanceWithAI = () => {
        // Placeholder function for AI enhancement logic
        alert("This will send the current job title & company to AI to auto-generate or enhance the description!");
        // Here you would normally call your Puter AI service:
        // const response = await puter.ai.chat(`Enhance this job description for a ${jobTitle} at ${companyName}...`);
        // setJobDescription(response);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!selectedFile && (!jobTitle.trim() || !companyName.trim() || !jobDescription.trim())) {
             alert("Please either upload a resume, or provide the job details.");
             return;
        }

        setShowAnimation(true);
        setStatusText(selectedFile ? `Uploading ${selectedFile.name}...` : `Processing job details...`);
    };

    const handleAnimationComplete = useCallback(() => {
        setShowAnimation(false);
        setIsProcessing(true);
        setStatusText("Analyzing data...");
        
        // Add actual logic here later
    }, []);

    const isFormValid = selectedFile !== null || (jobTitle.trim() !== "" && companyName.trim() !== "" && jobDescription.trim() !== "");

    return (
        <main className="bg-[url('/public/images/bg-main.svg')] bg-cover min-h-screen flex flex-col">
            <Navbar />

            <section className="main-section flex-grow flex flex-col justify-center items-center px-4 py-12">
                 <div className="page-heading text-center w-full max-w-3xl">
                     <h1 className="text-4xl md:text-5xl font-bold mb-4">Smart Feedback For Your Dream Job</h1>
                     
                     {showAnimation ? (
                         <div className="min-h-[300px] flex flex-col items-center justify-center">
                            <h2 className="text-xl md:text-2xl text-gray-600 mb-2">{statusText}</h2>
                            <ResumeAnalyzerAnimation onAnimationComplete={handleAnimationComplete} />
                         </div>
                     ) : isProcessing ? (
                         <div className="min-h-[300px] flex flex-col items-center justify-center">
                           <h2 className="text-xl md:text-2xl text-gray-600 mb-8">{statusText}</h2>
                            <img src={'/public/images/resume-scan.gif'} alt="Scanning Resume" className="w-full max-w-md mx-auto mt-4 rounded-xl shadow-lg"/>
                         </div>
                     ):(
                         <h2 className="text-xl md:text-2xl text-gray-600 mb-8">Tell us about the job, or upload your resume for a general score</h2>
                     )}
                     
                     {!isProcessing && !showAnimation && (
                         <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-6 w-full mt-4">
                            
                            {/* Top Section: Three centered text areas for Job Details */}
                            <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full">
                                <div className="form-div flex flex-col text-left">
                                    <label htmlFor="job-title" className="text-gray-700 font-semibold mb-2 ml-1 text-sm text-center">
                                        Target Job Title
                                    </label>
                                    <input 
                                        type="text" 
                                        name="job-title" 
                                        id="job-title"
                                        value={jobTitle}
                                        onChange={(e) => setJobTitle(e.target.value)}
                                        placeholder="e.g. Frontend Developer"
                                        className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white/80 backdrop-blur-sm text-center"
                                    />
                                </div>

                                <div className="form-div flex flex-col text-left">
                                    <label htmlFor="company-name" className="text-gray-700 font-semibold mb-2 ml-1 text-sm text-center">
                                        Company Name
                                    </label>
                                    <input 
                                        type="text" 
                                        name="company-name" 
                                        id="company-name"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="e.g. Google"
                                        className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white/80 backdrop-blur-sm text-center"
                                    />
                                </div>

                                <div className="form-div flex flex-col text-left relative">
                                    <div className="flex justify-between items-end mb-2 ml-1 px-2">
                                        <label htmlFor="job-description" className="text-gray-700 font-semibold text-sm mx-auto">
                                            Job Description
                                        </label>
                                    </div>
                                    <textarea 
                                        name="job-description" 
                                        id="job-description"
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Paste the full job description here..."
                                        rows={4}
                                        className="w-full px-4 py-3 pb-10 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white/80 backdrop-blur-sm resize-none"
                                    />
                                    <button 
                                        type="button"
                                        onClick={handleEnhanceWithAI}
                                        className="absolute bottom-2 right-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                                        title="Use AI to generate or enhance based on Title & Company"
                                    >
                                        <span>✨</span> Enhance with AI
                                    </button>
                                </div>
                            </div>

                            {/* Stylized OR divider */}
                            <div className="flex items-center w-full my-4 max-w-2xl mx-auto">
                                <div className="flex-1 h-px bg-gray-300"></div>
                                <span className="px-4 text-gray-500 font-medium text-sm">OR</span>
                                <div className="flex-1 h-px bg-gray-300"></div>
                            </div>

                            {/* Bottom Section: File Upload with Drag & Drop */}
                            <div className="flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
                                <p className="text-gray-600 font-medium mb-3">Upload your resume directly for a general scan</p>
                                
                                <div 
                                    className={`w-full border-2 border-dashed rounded-xl p-8 text-center backdrop-blur-sm cursor-pointer transition-all duration-300 shadow-sm flex flex-col items-center justify-center
                                        ${isDragging 
                                            ? 'border-purple-600 bg-purple-50/90 scale-105' 
                                            : selectedFile 
                                                ? 'border-green-400 bg-green-50/80 hover:bg-green-50/90' 
                                                : 'border-purple-300 bg-white/60 hover:bg-white/90 hover:border-purple-500'}`}
                                    onDragEnter={handleDragEnter}
                                    onDragLeave={handleDragLeave}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="pointer-events-none flex flex-col items-center">
                                        <span className="text-4xl mb-2" role="img" aria-label="Document">
                                            {selectedFile ? '✅' : '📄'}
                                        </span>
                                        <p className="text-gray-800 font-semibold mb-1">
                                            {selectedFile ? selectedFile.name : (isDragging ? 'Drop it here!' : 'Click to browse or drag your file here')}
                                        </p>
                                        <p className={`text-sm ${selectedFile ? 'text-green-600' : 'text-gray-500'}`}>
                                            {selectedFile ? `(${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)` : 'PDF, DOC, DOCX (Up to 5MB)'}
                                        </p>
                                    </div>
                                    
                                    <input 
                                        type="file" 
                                        id="resume-upload" 
                                        ref={fileInputRef}
                                        onChange={handleFileInput}
                                        className="hidden" 
                                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    />
                                </div>
                            </div>
                            
                            {/* The Analyze Button */}
                            <button 
                                type="submit" 
                                disabled={!isFormValid}
                                className={`font-bold py-4 px-8 rounded-full transition-all duration-200 shadow-md mt-6 w-full max-w-sm mx-auto text-lg
                                    ${isFormValid
                                        ? 'bg-gradient-to-r from-[#7b7fdb] to-[#9b8fe8] hover:brightness-110 active:brightness-95 text-white hover:shadow-lg cursor-pointer' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                            >
                                Analyze Options
                            </button>
                         </form>
                     )}
                 </div>
            </section>
        </main>
    )
}

export default Upload;