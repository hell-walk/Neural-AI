import { TypeAnimation } from 'react-type-animation';
import {usePuterStore} from "~/lib/puter";
import {useEffect} from "react";
export const meta =()=>([
    {title: 'Neural-Ai | Auth'},
    {name: 'description', content: 'Log Into Your Account'}
])

const Auth = () => {
   const { isLoading, auth } = usePuterStore();
   
   useEffect(() => {
        // Your effect code goes here
   }, []);

    return (
        <main className= "bg-[url('public/public/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center" >
                <div className="gradient-border shadow-lg">
                    <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
                        <div>
                            <h1><TypeAnimation
                               sequence={[
                                   'Welcome to Neural-AI',
                                   1000
                               ]}
                               wrapper="span"
                               speed={50}
                               repeat={Infinity}
                            /></h1>
                            <h2 className="text-center">Log In To Continue Your Job Journey</h2>
                        </div>
                        <div>
                            {  isLoading ?(
                                <button className="auth-button animate-pulse">
                                    <p>Signing You In...</p>
                                </button>
                            ) :(
                                <>
                                    {auth.isAuthenticated ?(
                                        <button className="auth-button">
                                            <p>Log Out</p>
                                        </button>
                                    ) : (
                                        <button className="auth-button" onClick={auth.signOut}>
                                            <p> Log In</p>
                                        </button>
                                    )}
                                </>
                            ) }
                        </div>
                    </section>
                </div>
        </main>
    )
}

export default Auth;