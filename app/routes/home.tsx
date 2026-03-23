import type { Route } from "./+types/home";
import { TypeAnimation } from 'react-type-animation';
import Navbar from "~/components/navbar";
import {resumes} from "../../constants";
import ResumeCard from "../../constants/ResumeCard";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "neural-ai" },
    { name: "description", content: "Smart ai to make your resume job worthy" },
  ];
}

export default function Home() {
  return <main className="bg-[url('/public/images/bg-main.svg')] bg-cover">
      <Navbar />
    <section className="main-section">
          <div className="page-heading">
            <h1>Track Your Application And Get Resume Rating</h1>
            <h2> <TypeAnimation
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
}
