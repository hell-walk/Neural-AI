import { Link, useNavigate, useLocation } from "react-router";
import { usePuterStore } from "~/lib/puter";
import styles from "../styles/navbar.css?url";

export const links = () => [
    { rel: "stylesheet", href: styles }
];

export interface NavbarProps {
    isDemo?: boolean;
}

const Navbar = ({ isDemo = false }: NavbarProps) => {
    const { auth } = usePuterStore();
    const navigate = useNavigate();
    const location = useLocation();

    const isUploadPage = location.pathname === '/upload';
    const isBuilderPage = location.pathname === '/builder';

    const handleSignOut = async () => {
        await auth.signOut();
        navigate('/auth?next=/');
    };

    return (
        <nav className="navbar flex justify-between items-center p-4 relative z-50 bg-transparent">
            <div />
            
            <div className="flex items-center gap-4">
                {/* Conditionally render the Resume Builder button */}
                {!isBuilderPage && (
                    <div className="btn-wrap">
                        <Link to={isDemo ? "/?demo=true" : "/builder"} onClick={(e) => {
                            if (isDemo) {
                                e.preventDefault();
                                alert("Please log in to use the Resume Builder.");
                            }
                        }} className="btn">
                            Resume Builder
                        </Link>
                    </div>
                )}

                {/* Only show the Upload Resume button if we are NOT already on the upload page */}
                {!isUploadPage && (
                    <div className="btn-wrap">
                        <Link to={isDemo ? "/?demo=true" : "/upload"} onClick={(e) => {
                            if (isDemo) {
                                e.preventDefault();
                                alert("Please log in to upload a resume.");
                            }
                        }} className="btn">
                            Upload Resume
                        </Link>
                    </div>
                )}
                
                {auth.isAuthenticated ? (
                    <div className="btn-wrap">
                        <button 
                            onClick={handleSignOut}
                            className="btn btn-danger"
                        >
                            Log Out
                        </button>
                    </div>
                ) : isDemo ? (
                    <div className="btn-wrap">
                        <button 
                            onClick={() => navigate('/auth')}
                            className="btn"
                        >
                            Log In
                        </button>
                    </div>
                ) : null}
            </div>
        </nav>
    );
};

export default Navbar;