import { TypeAnimation } from 'react-type-animation';
import {usePuterStore} from "~/lib/puter";
import {useEffect} from "react";
import{useLocation, useNavigate } from "react-router"
import styles from "../styles/auth.css?url";

export const meta =()=>([
    {title: 'Neural-Ai | Auth'},
    {name: 'description', content: 'Log Into Your Account'}
])

export const links = () => [
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap" },
  { rel: "stylesheet", href: styles }
];

export default function Auth() {
   const { isLoading, auth, puterReady } = usePuterStore();
   const location = useLocation();
   const searchParams = new URLSearchParams(location.search);
   const next = searchParams.get('next') || '/';
   const navigate = useNavigate();
   
   useEffect(() => {
       if(auth.isAuthenticated && puterReady) navigate(next);
   }, [auth.isAuthenticated, puterReady, navigate, next]);

    return (
        <main className="auth-body">
            <div className="auth-screen">
                <div className="auth-card">
                    <h1>
                        <TypeAnimation
                           sequence={[
                               'Welcome to Neural-AI',
                               1000
                           ]}
                           wrapper="span"
                           speed={50}
                           repeat={Infinity}
                        />
                    </h1>
                    <p>Log In To Continue Your Job Journey</p>
                    
                    {isLoading || !puterReady ? (
                        <div className="flex flex-col gap-3 w-full mt-4">
                            <button className="btn-login" style={{ opacity: 0.7, cursor: 'wait' }}>
                                Loading...
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 w-full mt-4">
                            {auth.isAuthenticated ? (
                                <button className="btn-login" onClick={auth.signOut}>
                                    Log Out
                                </button>
                            ) : (
                                <>
                                    <button className="btn-login" onClick={auth.signIn}>
                                        Sign In
                                    </button>
                                    <button className="btn-login" style={{ background: 'linear-gradient(90deg, #4ade80 0%, #22c55e 100%)' }} onClick={auth.signIn}>
                                        Log In
                                    </button>
                                    <button className="btn-login" style={{ background: 'linear-gradient(90deg, #9ca3af 0%, #6b7280 100%)' }} onClick={() => navigate('/?demo=true')}>
                                        Try Demo
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
