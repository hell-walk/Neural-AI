import React, { useEffect, useState, useCallback } from "react";
import Navbar from "~/components/navbar";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import Fileuploader from "~/components/Fileuploader";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utility";
import { prepareInstructions, AIResponseFormat } from "../../constants";
import { extractTextFromPdf } from "~/lib/pdfUtils";
import ClearTextButton from "~/components/ClearTextButton";
import { GoogleGenerativeAI } from "@google/generative-ai";

// *** ADDED LOGGING FOR API KEY ***
const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
console.log("Checking Gemini API Key:", apiKey ? "Loaded" : "MISSING or empty");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const Upload = () => {
    const { auth, isLoading, fs, kv} = usePuterStore();
    const navigate = useNavigate();

    // Basic state for our form
    const [isProcessing,setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState(' ');
    const [jobTitle, setJobTitle] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [extractedText, setExtractedText] = useState<string | null>(null);

    // Watch for unauthenticated state and redirect to home
    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate('/');
        }
    }, [auth.isAuthenticated, isLoading, navigate]);

    // Effect to extract text when a file is selected
    useEffect(() => {
        const processFile = async () => {
            if (file) {
                setStatusText('Extracting text from resume...');
                try {
                    const text = await extractTextFromPdf(file);
                    setExtractedText(text);
                    setStatusText('Text extraction complete.');
                } catch (error) {
                    console.error("Error extracting text:", error);
                    setExtractedText(null);
                    setStatusText('Error extracting text from resume.');
                }
            } else {
                setExtractedText(null);
            }
        };
        processFile();
    }, [file]);


    const handleFileSelect = (selectedFile: File | null) => {
        setFile(selectedFile);
    };

    const handleClearText = () => {
        setJobTitle("");
        setCompanyName("");
        setJobDescription("");
        setFile(null);
    };

    const handleAnalyze = useCallback(async () => {
        setIsProcessing(true);
        setStatusText("Processing your input...");

        if (!file || !jobTitle.trim() || !companyName.trim() || !jobDescription.trim() || !extractedText) {
            setStatusText('Error: Missing required data (file, job details, or extracted text).');
            setIsProcessing(false);
            return;
        }

        try {
            setStatusText('Uploading the file...');
            const uploadedFile = await fs.upload([file]);
            if(!uploadedFile) {
                setStatusText('Error: File Upload Failed');
                setIsProcessing(false);
                return;
            }

            setStatusText('Converting To Image...');
            const imageFile = await convertPdfToImage(file);
            if(!imageFile.file) {
                setStatusText('Error: Image Conversion Failed');
                setIsProcessing(false);
                return;
            }

            setStatusText('Uploading the Image....');
            const uploadedImage = await fs.upload([imageFile.file]);
            if(!uploadedImage) {
                setStatusText('Error: Image Upload Failed');
                setIsProcessing(false);
                return;
            }

            setStatusText('Preparing Data');
            const uuid = generateUUID();

            const data = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName, jobTitle, jobDescription,
                extractedText,
                feedback: ' ',
            };
            
            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            setStatusText('Analyzing with Gemini...');
            const systemPrompt = prepareInstructions({ jobTitle, jobDescription, AIResponseFormat });
            
            const fullPrompt = `${systemPrompt}\n\nResume Content:\n${extractedText}`;
            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            const geminiFeedbackText = response.text();

            console.log('Gemini raw response:', geminiFeedbackText);

            let parsedFeedback;
            try {
                const jsonMatch = geminiFeedbackText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    parsedFeedback = JSON.parse(jsonMatch[0]);
                } else {
                    parsedFeedback = JSON.parse(geminiFeedbackText);
                }
            } catch (jsonError) {
                console.error("Failed to parse Gemini JSON response:", geminiFeedbackText, jsonError);
                setStatusText('Error: Gemini returned invalid format.');
                setIsProcessing(false);
                return;
            }

            data.feedback = parsedFeedback;
            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            
            setStatusText('Analysis Complete, Redirecting...');
            console.log("Final Data with UUID:", data);
            
            setTimeout(() => {
                navigate(`/resume/${uuid}`);
            }, 1000);

        } catch (error) {
            console.error("Analysis pipeline error:", error);
            setStatusText(`Error: ${error instanceof Error ? error.message : String(error)}`);
            setIsProcessing(false);
        }
    }, [file, jobTitle, companyName, jobDescription, extractedText, fs, kv, navigate]);


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!file || !jobTitle.trim() || !companyName.trim() || !jobDescription.trim()) {
            alert("Please upload a resume and provide all job details.");
            return;
        }
        handleAnalyze();
    };

    const hasData = jobTitle.trim() !== "" || companyName.trim() !== "" || jobDescription.trim() !== "" || file !== null;

    return (
        <main className="bg-cover min-h-screen flex flex-col" style={{ backgroundImage: "url('/public/images/background.svg')" }}>
            <Navbar />

            <section className="main-section grow flex flex-col justify-center items-center px-4 py-12">
                 <div className="page-heading text-center w-full max-w-3xl flex flex-col items-center relative">
                     
                     <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'whitesmoke' }}>Smart Feedback For Your Dream Job</h1>
                     
                     {isProcessing ? (
                         <>
                             <h2 className="text-xl md:text-2xl mb-8" style={{ color: 'whitesmoke' }}>{statusText}</h2>
                             <img src="/public/images/resume-scan.gif" alt="Scanning animation" className="w-full max-w-md mx-auto"/>
                         </>
                     ) : (
                         <h2 className="text-xl md:text-2xl mb-8" style={{ color: 'whitesmoke' }}>Drop Your Resume Ats Score And Improvement Tips </h2>
                     )}

                     {!isProcessing && (
                         <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-6 w-full mt-4">
                                <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full relative">
                                    
                                    <ClearTextButton 
                                        onClear={handleClearText} 
                                        isVisible={hasData} 
                                    />

                                    <div className="form-div flex flex-col text-left w-full p-4 rounded-lg">
                                        <label htmlFor="job-title" className="font-bold mb-2 ml-1 text-sm text-center" style={{ color: 'whitesmoke' }}>
                                            Target Job Title
                                        </label>
                                        <input 
                                            type="text" 
                                            name="job-title" 
                                            id="job-title"
                                            value={jobTitle}
                                            onChange={(e) => setJobTitle(e.target.value)}
                                            placeholder="e.g. Frontend Developer"
                                            className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-purple-500 bg-opacity-50 backdrop-blur-sm text-center"
                                            required
                                        />
                                    </div>

                                    <div className="form-div flex flex-col text-left w-full p-4 rounded-lg">
                                        <label htmlFor="company-name" className="font-bold mb-2 ml-1 text-sm text-center" style={{ color: 'whitesmoke' }}>
                                            Dream Company
                                        </label>
                                        <input 
                                            type="text" 
                                            name="company-name" 
                                            id="company-name"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            placeholder="e.g. Google"
                                            className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-purple-500 bg-opacity-50 backdrop-blur-sm text-center"
                                            required
                                        />
                                    </div>

                                    <div className="form-div flex flex-col text-left w-full p-4 rounded-lg">
                                        <label htmlFor="job-description" className="font-bold mb-2 ml-1 text-sm text-center" style={{ color: 'whitesmoke' }}>
                                            Job Description
                                        </label>
                                        <textarea 
                                            name="job-description" 
                                            id="job-description"
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            placeholder="Paste the full job description here..."
                                            rows={4}
                                            className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-purple-500 bg-opacity-50  backdrop-blur-sm resize-none text-center"
                                            required
                                        />
                                    </div>

                                    <div className="form-div flex flex-col text-left w-full p-4 rounded-lg">
                                        <label className="font-bold mb-2 ml-1 text-sm text-center" style={{ color: 'whitesmoke' }}>
                                            Upload Your Resume
                                        </label>
                                        <Fileuploader 
                                            onFileSelect={handleFileSelect} 
                                            currentFile={file} 
                                        />
                                    </div>

                                </div>

                                <button 
                                    type="submit" 
                                    className="bg-linear-to-r from-[#7b7fdb] to-[#9b8fe8] hover:brightness-110 active:brightness-95 text-white font-bold py-4 px-8 rounded-full transition-all duration-200 shadow-md mt-6 w-full max-w-sm mx-auto text-lg cursor-pointer"
                                >
                                    Submit
                                </button>
                         </form>
                     )}
                 </div>
            </section>
        </main>
    );
}

export default Upload;