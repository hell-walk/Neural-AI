import React, { useEffect, useState } from "react";
import Navbar from "~/components/navbar";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import Fileuploader from "~/components/Fileuploader";
import * as fs from "node:fs";
import {convertPdfToImage} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/utility";
import {prepareInstructions} from "../../constants";

const Upload = () => {
    const { auth, isLoading, fs, ai, kv} = usePuterStore();
    const navigate = useNavigate();

    // Basic state for our form
    const [isProcessing,setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState(' ');
    const [jobTitle, setJobTitle] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);

    // Watch for unauthenticated state and redirect to home
    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate('/');
        }
    }, [auth.isAuthenticated, isLoading, navigate]);

    const handleFileSelect = (selectedFile: File | null) => {
        setFile(selectedFile);
    };


    const handleAnalyze=async({companyName,jobTitle,jobDescription,file} : {companyName:string,jobTitle:string,jobDescription:string,file:File}) => {
        setIsProcessing(true);
        setStatusText("Processing your input...");
        const uploadedFile=await fs.upload([file]);

        if(!uploadedFile) return setStatusText('Error : File Upload Failed');

        setStatusText('Converting To Image...');
        const imageFile = await convertPdfToImage(file);
        if(!imageFile.file) return setStatusText('Error : Image Conversion Failed');

        setStatusText('Uploading the Image....');

        const uploadedImage=await fs.upload([imageFile.file]);
        if(!uploadedImage) return setStatusText('Error : Image Upload Failed');

        setStatusText('Preparing Data');

        const uuid= generateUUID();

        const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            companyName, jobTitle, jobDescription,
            feedback: ' ',
        }
        await kv.set(` resume:${uuid}`, JSON.stringify(data));
        setStatusText('Analyzing...');

        const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({ jobTitle,jobDescription })
        )
        if(!feedback) return setStatusText('Error: Failed To Analyze Resume')

        const feedbackText =typeof feedback.message.content === 'string'
            ? feedback.message.content
            : feedback.message.content[0].text;

        data.feedback = JSON.parse(feedbackText);
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText('Analysis Complete, Redirecting...');
        console.log(data);
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Ensure a file is selected before proceeding
        if (!file) {
            alert("Please upload a file.");
            return;
        }

        // Alternatively, since you are using state, you can just use the state values directly!
        console.log({
            companyName: companyName, 
            jobTitle: jobTitle, 
            jobDescription: jobDescription, 
            file: file
        });
        

        handleAnalyze({companyName,jobTitle,jobDescription,file})
    };

    return (
        <main className="bg-[url('/public/images/bg-main.svg')] bg-cover min-h-screen flex flex-col">
            <Navbar />

            <section className="main-section grow flex flex-col justify-center items-center px-4 py-12">
                 <div className="page-heading text-center w-full max-w-3xl flex flex-col items-center">
                     <h1 className="text-4xl md:text-5xl font-bold mb-4">Smart Feedback For Your Dream Job</h1>
                     
                     {isProcessing ? (
                         <>
                             <h2 className="text-xl md:text-2xl text-gray-600 mb-8">{statusText}</h2>
                             <img src="/public/images/resume-scan.gif" alt="Scanning animation" className="w-full max-w-md mx-auto"/>
                         </>
                     ) : (
                         <h2 className="text-xl md:text-2xl text-gray-600 mb-8">Drop Your Resume Ats Score And Improvement Tips </h2>
                     )}

                     {!isProcessing && (
                         <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-6 w-full mt-4">
                                <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full">
                                    
                                    {/* 1. Job Title Div */}
                                    <div className="form-div flex flex-col text-left w-full">
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
                                            required
                                        />
                                    </div>

                                    {/* 2. Company Name Div */}
                                    <div className="form-div flex flex-col text-left w-full">
                                        <label htmlFor="company-name" className="text-gray-700 font-semibold mb-2 ml-1 text-sm text-center">
                                            Dream Company
                                        </label>
                                        <input 
                                            type="text" 
                                            name="company-name" 
                                            id="company-name"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            placeholder="e.g. Google"
                                            className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white/80 backdrop-blur-sm text-center"
                                            required
                                        />
                                    </div>

                                    {/* 3. Job Description Div */}
                                    <div className="form-div flex flex-col text-left w-full">
                                        <label htmlFor="job-description" className="text-gray-700 font-semibold mb-2 ml-1 text-sm text-center">
                                            Job Description
                                        </label>
                                        <textarea 
                                            name="job-description" 
                                            id="job-description"
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            placeholder="Paste the full job description here..."
                                            rows={4}
                                            className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white/80 backdrop-blur-sm resize-none text-center"
                                            required
                                        />
                                    </div>

                                    {/* 4. File Uploader Component */}
                                    <div className="form-div flex flex-col text-left w-full">
                                        <label className="text-gray-700 font-semibold mb-2 ml-1 text-sm text-center">
                                            Upload Your Resume
                                        </label>
                                        <Fileuploader onFileSelect={handleFileSelect}/>
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