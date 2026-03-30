import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import styles from "../styles/home.css?url";

/* ── Page meta tags ── */
export const meta = () => ([
  { title: "Neural-AI | Home" },
  { name: "description", content: "Track your resume and get AI-powered ratings" }
]);

/* ── Font + CSS links ── */
export const links = () => [
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500;600&display=swap"
  },
  { rel: "stylesheet", href: styles }
];

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function Home() {
  const navigate = useNavigate();
  const { auth, kv } = usePuterStore();
  const [isDemo, setIsDemo] = useState(false);
  const [resumesAnalysed, setResumesAnalysed] = useState<any[]>([]);
  const [resumesBuilt, setResumesBuilt] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const demoMode = params.get('demo') === 'true';
    setIsDemo(demoMode);

    if (!auth.isAuthenticated && !demoMode) {
      navigate('/auth?next=/');
    }
  }, [auth.isAuthenticated, navigate]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Load resumes analysed
      const analysedItems = (await kv.list('resume:*', true)) as any[];
      const parsedAnalysed = (analysedItems || []).map((item: any) => {
        const resume = JSON.parse(item.value);
        return {
          id: resume.id,
          initials: (resume.companyName?.substring(0, 2) || 'NA').toUpperCase(),
          name: `${resume.companyName} - ${resume.jobTitle}`,
          date: "A few days ago", // Placeholder date
          score: resume.feedback.overallScore,
          status: "done",
          label: "Done"
        };
      });
      setResumesAnalysed(parsedAnalysed);

      // Load resumes built
      const builtItems = (await kv.list('builder:*', true)) as any[];
      const parsedBuilt = (builtItems || []).map((item: any) => {
        const resume = JSON.parse(item.value);
        return {
          id: resume.id,
          initials: (resume.personalInfo?.name?.substring(0, 2) || 'NA').toUpperCase(),
          name: resume.personalInfo?.name || 'Untitled Resume',
          date: "A few days ago", // Placeholder date
          status: "done",
          label: "Complete"
        };
      });
      setResumesBuilt(parsedBuilt);

      setLoading(false);
    };

    loadData();
  }, [kv]);


  /* ── Handlers ── */
  const handleResumeBuilder = () => navigate("/builder");
  const handleUploadResume  = () => navigate("/upload");
  const handleLogOut = async () => {
    await auth.signOut();
    navigate("/auth");
  };
  const handleAnalyseNav = (id: string) => navigate(`/resume/${id}`);
  const handleBuildNav = (id: string) => navigate(`/builder?id=${id}`);


  return (
    <>
      {/* ================================================
          BACKGROUND LAYER
      ================================================ */}
      <div className="bg-scene" aria-hidden="true" />

      {/* ================================================
          NAVBAR
      ================================================ */}
      <nav>
        <div className="nav-logo">
          Neural-<span>AI</span>
        </div>
        <div className="nav-buttons">
          <div className="btn-wrap">
            <button className="btn" onClick={handleResumeBuilder}>
              Resume Builder
            </button>
          </div>
          <div className="btn-wrap">
            <button className="btn" onClick={handleUploadResume}>
              Upload Resume
            </button>
          </div>
          <div className="btn-wrap">
            <button className="btn btn-danger" onClick={handleLogOut}>
              Log Out
            </button>
          </div>
        </div>
      </nav>

      {/* ================================================
          MAIN CONTENT
      ================================================ */}
      <main>
        <div className="hero">

          <h1>
            Track And Build Your<br />
            <span className="highlight">Resume</span>
          </h1>
          <p>
            Upload your resume and get instant AI feedback,
            ratings, and application tracking — all in one place.
          </p>
        </div>

        <div className="boxes-section">
          <div className="boxes-row">

            {/* ============================================
                BOX 1 — RESUME ANALYSED
            ============================================ */}
            <div className="box">
              <div className="box-header">
                <div className="box-icon">📄</div>
                <div className="box-title">Resume Analysed</div>
                <div className="box-count">{resumesAnalysed.length} results</div>
              </div>
              <div className="box-scroll">
                {loading ? (
                  <div className="box-empty">Loading...</div>
                ) : resumesAnalysed.length === 0 ? (
                  <div className="box-empty">
                    No resumes analysed yet. Upload one to get started.
                  </div>
                ) : (
                  resumesAnalysed.map((item) => (
                    <div className="row-item" key={item.id} onClick={() => handleAnalyseNav(item.id)} style={{ cursor: 'pointer' }}>
                      <div className="row-avatar">{item.initials}</div>
                      <div className="row-info">
                        <div className="row-name">{item.name}</div>
                        <div className="row-date">{item.date}</div>
                      </div>
                      <div className="row-score">{item.score}/100</div>
                      <div className={`row-badge badge-${item.status}`}>
                        {item.label}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ============================================
                BOX 2 — RESUME BUILT
            ============================================ */}
            <div className="box">
              <div className="box-header">
                <div className="box-icon">🛠️</div>
                <div className="box-title">Resume Built</div>
                <div className="box-count">{resumesBuilt.length} results</div>
              </div>
              <div className="box-scroll">
                {loading ? (
                  <div className="box-empty">Loading...</div>
                ) : resumesBuilt.length === 0 ? (
                  <div className="box-empty">
                    No resumes built yet. Try the Resume Builder.
                  </div>
                ) : (
                  resumesBuilt.map((item) => (
                    <div className="row-item" key={item.id} onClick={() => handleBuildNav(item.id)} style={{ cursor: 'pointer' }}>
                      <div className="row-avatar">{item.initials}</div>
                      <div className="row-info">
                        <div className="row-name">{item.name}</div>
                        <div className="row-date">{item.date}</div>
                      </div>
                      <div className={`row-badge badge-${item.status}`}>
                        {item.label}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}