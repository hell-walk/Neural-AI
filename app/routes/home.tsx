import type { Route } from "./+types/home";
import { TypeAnimation } from 'react-type-animation';
import Navbar from "~/components/navbar";
import { usePuterStore } from "~/lib/puter";
import { useNavigate, Link } from "react-router";
import { useEffect, useState } from "react";
import { exportToWord } from "~/lib/wordExport";
import ScoreCircle from "~/components/ScrollCircle";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "neural-ai" },
    { name: "description", content: "Smart ai to make your resume job worthy" },
  ];
}

const ResumeAnalyzerRow = ({ resume }: { resume: Resume }) => {
  const navigate = useNavigate();

  const handleViewScore = () => {
    navigate(`/resume/${resume.id}`);
  };

  return (
    <tr className="group hover:bg-gray-100">
      <td className="p-4">{resume.companyName} - {resume.jobTitle}</td>
      <td className="p-4">
        <div className="flex items-center justify-end gap-4">
          <ScoreCircle score={resume.feedback.overallScore} />
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleViewScore} className="bg-blue-500 text-white px-4 py-2 rounded">View Score</button>
          </div>
        </div>
      </td>
    </tr>
  );
};

const BuilderResumeRow = ({ resume }: { resume: any }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/builder?id=${resume.id}`);
  };

  const handleExport = () => {
    const filename = `${resume.personalInfo?.name?.replace(/\s+/g, '_') || 'Resume'}.doc`;
    exportToWord(resume, filename);
  };

  return (
    <tr className="group hover:bg-gray-100">
      <td className="p-4">{resume.personalInfo?.name || 'Untitled Resume'}</td>
      <td className="p-4">
        <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={handleEdit} className="bg-blue-500 text-white px-4 py-2 rounded">Edit</button>
          <button onClick={handleExport} className="bg-green-500 text-white px-4 py-2 rounded">Export to Word</button>
        </div>
      </td>
    </tr>
  );
};

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isDemo, setIsDemo] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [builderResumes, setBuilderResumes] = useState<any[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [loadingBuilderResumes, setLoadingBuilderResumes] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const demoMode = params.get('demo') === 'true';
    setIsDemo(demoMode);

    if (!auth.isAuthenticated && !demoMode) {
      navigate('/auth?next=/');
    }
  }, [auth.isAuthenticated, navigate]);

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);
      const resumes = (await kv.list('resume:*', true)) as KVItem[];
      const parsedResumes = resumes?.map((resume) => (
        JSON.parse(resume.value) as Resume
      ));
      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    };

    const loadBuilderResumes = async () => {
      setLoadingBuilderResumes(true);
      const builderResumes = (await kv.list('builder:*', true)) as KVItem[];
      const parsedBuilderResumes = builderResumes?.map((resume) => (
        JSON.parse(resume.value)
      ));
      setBuilderResumes(parsedBuilderResumes || []);
      setLoadingBuilderResumes(false);
    };

    loadResumes();
    loadBuilderResumes();
  }, [kv]);

  return (
    <main className="bg-[url('public/images/bg-main.svg')] bg-cover">
      <Navbar isDemo={isDemo} />

      <section className="main-section relative">
        {isDemo && (
          <div className="absolute inset-0 z-10 cursor-not-allowed" title="Please log in to interact with this page" onClick={() => alert("Please log in to use these features.")}></div>
        )}

        <div className="page-heading">
          <h1>Track Your Application And Get Resume Rating</h1>
          {!loadingResumes && resumes.length === 0 ? (
            <h2> No Resume Found.. Upload Your Resume To Get Feedback</h2>
          ) : (
            <h2><TypeAnimation
              sequence={[
                'Review your submissions and check AI-powered Feedback',
                500,
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
          )}
        </div>

        {loadingResumes && (
          <div className="flex flex-col items-center justify-center">
            <img src="public/public/images/resume-scan-2.gif" className="w-[200px]" />
          </div>
        )}

        {!loadingResumes && resumes.length > 0 && (
          <div className="w-full">
            <table className="min-w-full bg-white rounded-lg shadow">
              <thead>
                <tr className="w-full text-left text-gray-500">
                  <th className="p-4">Details</th>
                  <th className="p-4 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {resumes.map((resume) => (
                  <ResumeAnalyzerRow key={resume.id} resume={resume} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="page-heading">
          <h1>Resume Builder</h1>
          {!loadingBuilderResumes && builderResumes.length === 0 && (
            <h2>No builder resumes found.</h2>
          )}
        </div>

        {loadingBuilderResumes && (
          <div className="flex flex-col items-center justify-center">
            <img src="public/public/images/resume-scan-2.gif" className="w-[200px]" />
          </div>
        )}

        {!loadingBuilderResumes && builderResumes.length > 0 && (
          <div className="w-full">
            <table className="min-w-full bg-white rounded-lg shadow">
              <thead>
                <tr className="w-full text-left text-gray-500">
                  <th className="p-4">Name</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {builderResumes.map((resume) => (
                  <BuilderResumeRow key={resume.id} resume={resume} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}