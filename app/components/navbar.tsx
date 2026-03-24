import { Link, useNavigate, useLocation } from "react-router";
import { usePuterStore } from "~/lib/puter";

export interface NavbarProps {
    isDemo?: boolean;
}

const Navbar = ({ isDemo = false }: NavbarProps) => {
    const { auth } = usePuterStore();
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we are currently on the upload page
    const isUploadPage = location.pathname === '/upload';

    const handleSignOut = async () => {
        await auth.signOut();
        // Since we are logging out, we definitely want to be on the auth page.
        // We pass the current path as 'next' so they can return here if they log in again.
        navigate(`/auth?next=${location.pathname}`);
    };

    return (
        <nav className="navbar flex justify-between items-center p-4 relative z-50 bg-white backdrop-blur-md">
            <Link to={isDemo ? "/?demo=true" : "/"}>
                <p className="text-xl font-bold text-gradient">
                    Neural-AI
                </p>
            </Link>
            
            <div className="flex items-center gap-4">
                {/* Only show the Upload Resume button if we are NOT already on the upload page */}
                {!isUploadPage && (
                    <Link to={isDemo ? "/?demo=true" : "/upload"} onClick={(e) => {
                        if (isDemo) {
                            e.preventDefault();
                            alert("Please log in to upload a resume.");
                        }
                    }} className="primary-button w-fit">
                        Upload Resume
                    </Link>
                )}
                
                {auth.isAuthenticated ? (
                    <button 
                        onClick={handleSignOut}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
                    >
                        Log Out
                    </button>
                ) : isDemo ? (
                    <button 
                        onClick={() => navigate('/auth')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
                    >
                        Log In
                    </button>
                ) : null}
            </div>
        </nav>
    );
};

export default Navbar;