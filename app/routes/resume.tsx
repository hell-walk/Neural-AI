import { Link, useParams , useNavigate} from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

export const meta = () => ([
  { title: 'Neural-Ai | Review' },
  { name: 'description', content: 'Detailed Overview Of Your Resume' }
])

const Resume = () => {
  const { auth,fs, kv , isLoading} = usePuterStore();
  const { id } = useParams();

  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
  }, [isLoading])


  useEffect(() => {
    const loadResume = async () => {
      // Keys are stored as resume:uuid in upload.tsx
      const storedData = await kv.get(`resume:${id}`);

      if (!storedData) return;

      const data = JSON.parse(storedData);
      setFeedback(data.feedback);

      // Load PDF
      const pdfBytes = await fs.read(data.resumePath);
      if (pdfBytes) {
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        setResumeUrl(URL.createObjectURL(pdfBlob));
      }

      // Load Image
      const imageBytes = await fs.read(data.imagePath);
      if (imageBytes) {
        const imageBlob = new Blob([imageBytes], { type: 'image/png' });
        setImageUrl(URL.createObjectURL(imageBlob));
      }
    };

    if (id) {
      loadResume();
    }

    // Cleanup URLs
    return () => {
      if (resumeUrl) URL.revokeObjectURL(resumeUrl);
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [id, fs, kv]);

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="resume-nav p-4 bg-white shadow-sm">
        <Link to="/" className="back-button flex items-center gap-2">
          <img src="/public/icons/back.svg" alt="Back" className="w-2.5 h-2.5" />
          <span className="text-gray-800 text-sm font-semibold">Back To Homepage</span>
        </Link>
      </nav>


      <div className="flex flex-row w-full max-lg:flex-col-reverse p-6 gap-6">
        <section className="feedback-section bg-[url('/public/images/bg-main.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
          {imageUrl && resumeUrl ? (
              <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                  <img
                      src={imageUrl}
                      className="w-full h-full object-contain rounded-2xl"
                      title="resume"
                  />
                </a>
              </div>
          ) : (
              <div className="flex items-center justify-center h-full w-full">
                  <img src="/public/images/resume-scan.gif" alt="Loading" className="max-w-md" />
              </div>
          )}
        </section>
        <section className="feedback-section">
            <h2 className="text-4xl text-black font-bold">Resume Review</h2>
            {feedback ? (
                <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                  <Summary feedback={feedback}/>
                  <ATS score = {feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []}/>
                  <Details feedback={feedback}/>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full w-full">
                  <img src="/public/images/resume-scan.gif" alt="Loading" className="max-w-md" />
                </div>
            )}
        </section>

      </div>
    </main>
  );
}

export default Resume;
