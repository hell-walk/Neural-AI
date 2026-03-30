import { TypeAnimation } from 'react-type-animation';
import { usePuterStore } from "~/lib/puter";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import styles from "../styles/auth.css?url";

export const meta = () => ([
    { title: 'Neural-Ai | Auth' },
    { name: 'description', content: 'Log Into Your Account' }
]);

export const links = () => [
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap"
    },
    { rel: "stylesheet", href: styles }
];

export default function Auth() {
    const { isLoading, auth, puterReady } = usePuterStore();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const next = searchParams.get('next') || '/';
    const navigate = useNavigate();

    useEffect(() => {
        if (auth.isAuthenticated && puterReady) navigate(next);
    }, [auth.isAuthenticated, puterReady, navigate, next]);

    return (
        <main>
            {/* Dark grid background */}
            <div className="bg-grid" />

            {/* Glowing blobs */}
            <div className="blob blob-1" />
            <div className="blob blob-2" />
            <div className="blob blob-3" />

            {/* Watermark */}
            <div className="watermark">Neural-AI</div>

            {/* Card */}
            <div className="card">
                <div className="badge">AI Powered</div>

                <h1>
                    <TypeAnimation
                        sequence={['Welcome to Neural-AI', 2000, '']}
                        wrapper="span"
                        speed={50}
                        repeat={Infinity}
                    />
                </h1>

                <p className="subtitle">Log In To Continue Your Job Journey</p>

                {/* Loading state */}
                {isLoading || !puterReady ? (
                    <div className="btn-group">
                        <div className="btn-wrap">
                            <button className="btn" style={{ opacity: 0.5, cursor: 'wait' }}>
                                Loading...
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="btn-group">
                        {auth.isAuthenticated ? (
                            /* Logged-in: show sign out */
                            <div className="btn-wrap">
                                <button className="btn btn-login" onClick={auth.signOut}>
                                    Log Out
                                </button>
                            </div>
                        ) : (
                            /* Not logged in: show all three buttons */
                            <>
                                <div className="btn-wrap">
                                    <button className="btn btn-signin" onClick={auth.signIn}>
                                        Sign In
                                    </button>
                                </div>
                                <div className="btn-wrap">
                                    <button className="btn btn-login" onClick={auth.signIn}>
                                        Log In
                                    </button>
                                </div>
                                <div className="btn-wrap">
                                    <button
                                        className="btn btn-demo"
                                        onClick={() => navigate('/?demo=true')}
                                    >
                                        📷 Try Demo
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div className="footer-text">
                    Don't have an account?{' '}
                    <a onClick={auth.signIn} style={{ cursor: 'pointer' }}>
                        Create one free
                    </a>
                </div>
            </div>
        </main>
    );
}