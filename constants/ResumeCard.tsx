import { Link } from "react-router"; 
import ScoreCircle from "~/components/ScrollCircle";

const ResumeCard = ({ resume: {id,companyName, jobTitle,feedback,imagePath } }: { resume: any }) => {
    // The images are actually located inside /public/images/ relative to the static server
    // Since Vite serves everything inside the outer 'public' directory at the root '/',
    // and you have a nested 'public' folder inside it, the path needs to be adjusted.
    const fixedImagePath = imagePath.replace('public/public/images/', '/public/images/');

    return (
        <Link
            to={`/resume/${id}`}
            className="resume-card animate-in fade-in duration-1000"
        >
            <div className="resume-card-header">
                <div className="flex flex-col gap-2">
                    <h2>{jobTitle}</h2>
                    <p className="font-bold">{companyName}</p>
                </div>
                <div className="shrink-0">
                    <ScoreCircle score={feedback.overallScore}></ScoreCircle>
                </div>
            </div>
            <div className="gradient-border animate-in fade-in duration-1000">
                <div className="w-full h-full">
                    <img
                        src={fixedImagePath}
                        alt="resume"
                        className="w-full h-87.5 max-sm:h-50 object-cover object-top"
                    />
                </div>
            </div>
        </Link>
    );
};

export default ResumeCard;