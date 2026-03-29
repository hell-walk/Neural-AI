import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from "react-router";
import ClearTextButton from "~/components/ClearTextButton";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utility";
import { ResumeAIResponseFormat, prepareResumeGenerationInstructions } from '../../constants';
import LivePreview from '~/components/LivePreview';
import { ExportButton } from '~/components/ExportButton';
import { exportToWord } from '~/lib/wordExport'; // Import the Word export utility

// Import Gemini SDK
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini (ensure VITE_GEMINI_API_KEY is set in .env.example)
// WARNING: Exposing API keys directly in client-side code is not recommended for production.
// For production, consider using a backend proxy.
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Changed model to "gemini-2.5-flash"

const Builder = () => {
    const navigate = useNavigate();
    const routeLocation = useLocation();
    const { kv } = usePuterStore(); // Removed 'ai' from here
    const [isProcessing, setIsProcessing] = useState(false);
    const [resumeId, setResumeId] = useState<string | null>(null);

    // Form States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [userLocation, setUserLocation] = useState(''); // Renamed from location
    const [linkedin, setLinkedin] = useState(''); // Added linkedin
    const [github, setGithub] = useState(''); // Added github
    const [hasExperience, setHasExperience] = useState<boolean | null>(null); // Added experience toggle
    const [skills, setSkills] = useState('');
    const [softSkills, setSoftSkills] = useState(''); // Added soft skills
    const [experience, setExperience] = useState('');
    const [project, setProject] = useState('');
    const [education, setEducation] = useState('');
    const [certification, setCertification] = useState('');
    const [extracurricularActivities, setExtracurricularActivities] = useState('');
    const [description, setDescription] = useState('');

    // Template State
    const [selectedTemplate, setSelectedTemplate] = useState<"template1" | "template2" | "template3">("template1");

    // Result State
    const [generatedResumeData, setGeneratedResumeData] = useState<any>(null);

    useEffect(() => {
        const params = new URLSearchParams(routeLocation.search);
        const id = params.get('id');
        if (id) {
            setResumeId(id);
            const loadResumeData = async () => {
                const resumeData = await kv.get(`builder:${id}`);
                if (resumeData) {
                    const parsedData = JSON.parse(resumeData);
                    setName(parsedData.personalInfo?.name || '');
                    setEmail(parsedData.personalInfo?.email || '');
                    setPhoneNumber(parsedData.personalInfo?.phone || '');
                    setUserLocation(parsedData.personalInfo?.location || '');
                    setLinkedin(parsedData.personalInfo?.linkedin || '');
                    setGithub(parsedData.personalInfo?.github || '');
                    setHasExperience(parsedData.experience?.length > 0);
                    setSkills(parsedData.skills?.hardSkills?.join(', ') || '');
                    setSoftSkills(parsedData.skills?.softSkills?.join(', ') || '');
                    setExperience(parsedData.experience?.map((exp: any) => `${exp.company}, ${exp.role}, ${exp.duration}\n${exp.responsibilities.join('\n')}`).join('\n\n') || '');
                    setProject(parsedData.projects?.map((proj: any) => `${proj.name}: ${proj.description}`).join('\n\n') || '');
                    setEducation(parsedData.education?.map((edu: any) => `${edu.degree}, ${edu.institution}, ${edu.duration}`).join('\n') || '');
                    setCertification(parsedData.certifications?.join(', ') || '');
                    setExtracurricularActivities(parsedData.extracurricular?.join('\n') || '');
                    setDescription(parsedData.personalInfo?.summary || '');
                    setSelectedTemplate(parsedData.template || 'template1');
                    setGeneratedResumeData(parsedData);
                }
            };
            loadResumeData();
        }
    }, [routeLocation.search, kv]);

    const handleClearText = () => {
        setName("");
        setEmail("");
        setPhoneNumber("");
        setUserLocation("");
        setLinkedin("");
        setGithub("");
        setHasExperience(null);
        setSkills("");
        setSoftSkills("");
        setExperience("");
        setProject("");
        setEducation("");
        setCertification("");
        setExtracurricularActivities("");
        setDescription("");
        setGeneratedResumeData(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setGeneratedResumeData(null);

        try {
            const uuid = resumeId || generateUUID();

            const userInput = {
                name,
                email,
                phoneNumber,
                location: userLocation,
                linkedin,
                github,
                hasExperience,
                skills: skills.split(',').map(s => s.trim()).filter(Boolean),
                softSkills: softSkills.split(',').map(s => s.trim()).filter(Boolean),
                experience: hasExperience ? experience.split('\n').filter(Boolean) : [],
                projects: project.split('\n').filter(Boolean),
                education: education.split('\n').filter(Boolean),
                certifications: certification.split(',').map(c => c.trim()).filter(Boolean),
                extracurricularActivities: extracurricularActivities.split('\n').filter(Boolean),
                description,
                selectedTemplate
            };

            const systemPrompt = prepareResumeGenerationInstructions(userInput);

            // --- Gemini Integration Start ---
            const fullPrompt = `${systemPrompt}\n\nPlease generate the resume JSON based on the information I provided.`;
            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            const geminiResponseText = response.text(); // Gemini's response is directly accessible via .text()

            console.log('Gemini raw response for builder:', geminiResponseText);

            // Attempt to parse JSON, handle potential markdown wrapping
            let generatedResume;
            try {
                const jsonMatch = geminiResponseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    generatedResume = JSON.parse(jsonMatch[0]);
                } else {
                    generatedResume = JSON.parse(geminiResponseText);
                }
            } catch (jsonParseError) {
                console.error("Failed to parse Gemini JSON response for builder:", geminiResponseText, jsonParseError);
                throw new Error("AI did not return valid JSON.");
            }
            // --- Gemini Integration End ---

            const finalData = {
                id: uuid,
                template: selectedTemplate,
                ...generatedResume
            };

            console.log("Submitting builder data:", finalData);

            await kv.set(`builder:${uuid}`, JSON.stringify(finalData));

            setGeneratedResumeData(finalData);

            setTimeout(() => {
                setIsProcessing(false);
            }, 1000);

        } catch (error) {
            console.error("Failed to save builder data:", error);
            setIsProcessing(false);
            alert("Failed to generate resume. Please try again.");
        }
    };

    // Handler for Export to Word button
    const handleExportWord = () => {
        if (generatedResumeData) {
            const filename = `${generatedResumeData.personalInfo?.name?.replace(/\s+/g, '_') || 'Resume'}.doc`;
            exportToWord(generatedResumeData, filename);
        }
    };

    const hasData = name.trim() !== "" ||
                    email.trim() !== "" ||
                    phoneNumber.trim() !== "";

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            <nav className="resume-nav p-4 bg-white shadow-sm relative z-50 flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/" className="back-button flex items-center gap-2 w-fit">
                        <img src="/public/icons/back.svg" alt="Back" className="w-2.5 h-2.5" />
                        <span className="text-gray-800 text-sm font-semibold hidden md:inline-block">Back To Homepage</span>
                    </Link>

                    {/* Export Buttons (only visible when resume is generated) */}
                    {generatedResumeData && (
                        <div className="hidden lg:flex border-l border-gray-200 pl-4 ml-2 gap-2">
                             <ExportButton filename={generatedResumeData.personalInfo?.name || "My_Resume"} />
                             <button
                                onClick={handleExportWord}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 font-medium text-sm transition-colors flex items-center gap-2"
                             >
                                 <span>📄</span> Export Word
                             </button>
                        </div>
                    )}
                </div>

                {/* Template Selection Toggle */}
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setSelectedTemplate('template1')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedTemplate === 'template1' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        Classic
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedTemplate('template2')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedTemplate === 'template2' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        Sidebar
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedTemplate('template3')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedTemplate === 'template3' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        Minimal
                    </button>
                </div>
            </nav>

            <div className="flex flex-row w-full max-lg:flex-col p-6 gap-6 grow">
                {/* Preview/Side Section */}
                <section className="preview-section bg-gray-200 lg:sticky lg:top-6 h-[80vh] lg:w-1/2 rounded-2xl flex items-center justify-center overflow-hidden relative shadow-inner">
                    <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-purple-700 shadow-sm border border-purple-100 uppercase tracking-wide">
                        {selectedTemplate} Active
                    </div>

                    {/* Mobile Export Buttons (only visible on small screens when generated) */}
                    {generatedResumeData && (
                        <div className="absolute bottom-4 right-4 z-10 lg:hidden flex flex-col gap-2">
                            <ExportButton filename={generatedResumeData.personalInfo?.name || "My_Resume"} />
                            <button
                                onClick={handleExportWord}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 font-medium text-sm transition-colors flex items-center gap-2 justify-center"
                             >
                                 <span>📄</span> Export Word
                             </button>
                        </div>
                    )}

                    {isProcessing ? (
                        <div className="flex flex-col items-center gap-4">
                            <img src="/public/images/resume-scan.gif" alt="Loading" className="max-w-xs" />
                            <p className="text-purple-600 font-medium animate-pulse">Generating your professional layout...</p>
                        </div>
                    ) : generatedResumeData ? (
                        <LivePreview
                            templateId={selectedTemplate}
                            resumeData={generatedResumeData}
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-gray-400">
                             <span className="text-6xl">📄</span>
                             <p className="font-medium">Fill out the form and click generate to see your preview.</p>
                        </div>
                    )}
                </section>

                {/* Builder Form Section */}
                <section className="builder-section lg:w-1/2 bg-white rounded-2xl p-8 shadow-sm overflow-y-auto">
                    <div className="max-w-2xl mx-auto relative">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800">Enter Your Details</h2>
                            <ClearTextButton
                                onClear={handleClearText}
                                isVisible={hasData && !isProcessing}
                            />
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                            {/* --- PERSONAL INFO --- */}
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-div flex flex-col">
                                        <label htmlFor="name" className="text-gray-700 font-semibold mb-2 text-sm">Full Name</label>
                                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white" required />
                                    </div>
                                    <div className="form-div flex flex-col">
                                        <label htmlFor="email" className="text-gray-700 font-semibold mb-2 text-sm">Email</label>
                                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white" required />
                                    </div>
                                    <div className="form-div flex flex-col">
                                        <label htmlFor="phone" className="text-gray-700 font-semibold mb-2 text-sm">Phone</label>
                                        <input type="tel" id="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="(555) 123-4567" className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white" required />
                                    </div>
                                    <div className="form-div flex flex-col">
                                        <label htmlFor="location" className="text-gray-700 font-semibold mb-2 text-sm">Location</label>
                                        <input type="text" id="location" value={userLocation} onChange={(e) => setUserLocation(e.target.value)} placeholder="City, State" className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white" />
                                    </div>
                                </div>
                            </div>

                            {/* --- LINKS --- */}
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Links</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-div flex flex-col">
                                        <label htmlFor="linkedin" className="text-gray-700 font-semibold mb-2 text-sm">LinkedIn URL</label>
                                        <input type="url" id="linkedin" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white" />
                                    </div>
                                    <div className="form-div flex flex-col">
                                        <label htmlFor="github" className="text-gray-700 font-semibold mb-2 text-sm">GitHub / Portfolio URL</label>
                                        <input type="url" id="github" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/..." className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white" />
                                    </div>
                                </div>
                            </div>

                            {/* --- EXPERIENCE TOGGLE --- */}
                            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                                <h3 className="text-lg font-bold text-purple-900 mb-4 border-b border-purple-200 pb-2">Professional Experience</h3>
                                <div className="flex gap-4 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setHasExperience(true)}
                                        className={`flex-1 py-3 rounded-lg font-semibold transition-all ${hasExperience === true ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-purple-600 border border-purple-200 hover:bg-purple-100'}`}
                                    >
                                        I have experience
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setHasExperience(false);
                                            setExperience(""); // Clear experience if they say no
                                        }}
                                        className={`flex-1 py-3 rounded-lg font-semibold transition-all ${hasExperience === false ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-purple-600 border border-purple-200 hover:bg-purple-100'}`}
                                    >
                                        I am a fresher
                                    </button>
                                </div>

                                {hasExperience === true && (
                                    <div className="form-div flex flex-col mt-4 animate-in fade-in slide-in-from-top-2">
                                        <label htmlFor="experience" className="text-gray-700 font-semibold mb-2 text-sm">Work Experience Details</label>
                                        <textarea
                                            id="experience" value={experience} onChange={(e) => setExperience(e.target.value)}
                                            rows={5}
                                            placeholder="Company Name, Job Title, Dates&#10;• Bullet point 1&#10;• Bullet point 2"
                                            className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white resize-none"
                                            required={hasExperience}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* --- SKILLS --- */}
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Skills</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="form-div flex flex-col">
                                        <label htmlFor="skills" className="text-gray-700 font-semibold mb-2 text-sm">Hard Skills (Comma-separated)</label>
                                        <input type="text" id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Python, Data Analysis..." className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white" required />
                                    </div>
                                    <div className="form-div flex flex-col">
                                        <label htmlFor="softSkills" className="text-gray-700 font-semibold mb-2 text-sm">Soft Skills (Comma-separated)</label>
                                        <input type="text" id="softSkills" value={softSkills} onChange={(e) => setSoftSkills(e.target.value)} placeholder="Leadership, Communication, Problem Solving..." className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white" />
                                    </div>
                                </div>
                            </div>

                            {/* --- OTHER DETAILS --- */}
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-6">
                                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Additional Details</h3>

                                <div className="form-div flex flex-col">
                                    <label htmlFor="project" className="text-gray-700 font-semibold mb-2 text-sm">Projects</label>
                                    <textarea id="project" value={project} onChange={(e) => setProject(e.target.value)} rows={3} placeholder="Project Name: Description of what you built and technologies used." className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white resize-none" />
                                </div>

                                <div className="form-div flex flex-col">
                                    <label htmlFor="education" className="text-gray-700 font-semibold mb-2 text-sm">Education</label>
                                    <textarea id="education" value={education} onChange={(e) => setEducation(e.target.value)} rows={2} placeholder="BS Computer Science, University Name, 2020-2024" className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white resize-none" required />
                                </div>

                                <div className="form-div flex flex-col">
                                    <label htmlFor="certification" className="text-gray-700 font-semibold mb-2 text-sm">Certifications</label>
                                    <textarea id="certification" value={certification} onChange={(e) => setCertification(e.target.value)} rows={2} placeholder="AWS Certified Cloud Practitioner, 2023" className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white resize-none" />
                                </div>

                                <div className="form-div flex flex-col">
                                    <label htmlFor="description" className="text-gray-700 font-semibold mb-2 text-sm">Professional Summary</label>
                                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="A brief summary of your background and career goals." className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white resize-none" required />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isProcessing}
                                className={`bg-linear-to-r from-[#7b7fdb] to-[#9b8fe8] hover:brightness-110 active:brightness-95 text-white font-bold py-4 px-8 rounded-full transition-all duration-200 shadow-md mt-6 w-full max-w-sm mx-auto text-lg ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                {isProcessing ? 'Updating...' : (resumeId ? 'Update Resume' : 'Generate Resume')}
                            </button>
                        </form>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Builder;