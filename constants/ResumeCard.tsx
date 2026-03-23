import { Link } from "react-router"; // or "react-router-dom" depending on your package.json
import ScoreCircle from "~/components/ScrollCircle";

const ResumeCard = ({ resume: {id,companyName, jobTitle,feedback,imagePath } }: { resume: any }) => {
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
                        src={imagePath}
                        alt="resume"
                        className="w-full h-87.5 max-sm:h-50 object-cover object-top"
                    />
                </div>
            </div>
        </Link>
    );
};

// THIS IS THE MOST IMPORTANT LINE
export default ResumeCard;