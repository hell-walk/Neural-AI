import type { Route } from "./+types/home";
import { TypeAnimation } from 'react-type-animation';
import Navbar from "~/components/navbar";
import {resumes} from "../../constants";
import ResumeCard from "../../constants/ResumeCard";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {useEffect, useState} from "react";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "neural-ai" },
    { name: "description", content: "Smart ai to make your resume job worthy" },
  ];
}

export default function Home() {
    const {auth} = usePuterStore();
    const navigate = useNavigate();
    const [isDemo, setIsDemo] = useState(false);

    useEffect(() => {
        // Check if we are in demo mode via URL parameter or local storage (if needed later)
        const params = new URLSearchParams(window.location.search);
        const demoMode = params.get('demo') === 'true';
        setIsDemo(demoMode);

        // If not authenticated AND not in demo mode, redirect to auth
        if (!auth.isAuthenticated && !demoMode) {
            navigate('/auth?next=/');
        }
    }, [auth.isAuthenticated, navigate]);

    return (
        <main className="bg-[url('public/public/images/bg-main.svg')] bg-cover">
            {/* Added a key to force re-render if isDemo changes, though React usually handles prop updates fine.
                The main issue was likely TypeScript complaining about the unexported interface in navbar.tsx. */}
            <Navbar isDemo={isDemo} />

            <section className="main-section relative">
                {/* Demo mode overlay to block interaction with the main content */}
                {isDemo && (
                    <div className="absolute inset-0 z-10 cursor-not-allowed" title="Please log in to interact with this page" onClick={() => alert("Please log in to use these features.")}></div>
                )}

                <div className="page-heading">
                    <h1>Track Your Application And Get Resume Rating</h1>
                    <h2><TypeAnimation
                        sequence={[
                            'Review your submissions and check AI-powered Feedback',
                            500,          // pause before dots start
                            'Review your submissions and check AI-powered Feedback.',
                            500,
                            'Review your submissions and check AI-powered Feedback..',
                            500,
                            'Review your submissions and check AI-powered Feedback...',
                            2000
                        ]}
                        wrapper="span"
                        speed={50}
                        repeat={Infinity}
                    /></h2>
                </div>
                {resumes.length > 0 && (
                    <div className="resumes-section">
                        {resumes.map((resume) => {
                            return (
                                <ResumeCard key={resume.id} resume={resume}/>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}
