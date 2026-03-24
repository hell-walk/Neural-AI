import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ResumeAnalyzerAnimationProps {
    onAnimationComplete: () => void;
}

const ResumeAnalyzerAnimation: React.FC<ResumeAnalyzerAnimationProps> = ({ onAnimationComplete }) => {
    const [phase, setPhase] = useState<"idle" | "animating">("idle");

    useEffect(() => {
        // Start animation as soon as component mounts
        setPhase("animating");

        // The entire animation sequence takes about 2.5 seconds
        const timer = setTimeout(() => {
            onAnimationComplete();
        }, 2500);

        return () => clearTimeout(timer);
    }, [onAnimationComplete]);

    return (
        <div className="relative w-full max-w-md h-64 mx-auto flex items-center justify-center overflow-visible my-8">
            <AnimatePresence>
                {phase === "animating" && (
                    <>
                        {/* The File Folder (Dustbin/Target) - Appears bottom left, waits, then shakes */}
                        <motion.div
                            initial={{ scale: 0, opacity: 0, x: -100, y: 50 }}
                            animate={{
                                scale: [0, 1.2, 1, 1, 1.1, 0.9, 1.1, 1, 0],
                                opacity: [0, 1, 1, 1, 1, 1, 1, 1, 0],
                                rotate: [0, 0, 0, 0, -15, 15, -15, 0, 0]
                            }}
                            transition={{
                                duration: 2.2,
                                times: [0, 0.2, 0.3, 0.6, 0.65, 0.7, 0.75, 0.8, 1],
                                ease: "easeInOut"
                            }}
                            className="absolute bottom-4 left-[20%] text-6xl z-10"
                        >
                            📁
                        </motion.div>

                        {/* The Paper (Document) - Arcs from center to the folder */}
                        <motion.div
                            initial={{ scale: 1, opacity: 0, x: 50, y: 50 }}
                            animate={{
                                x: [50, 0, -100], // Starts right, arcs up to center, shoots left to folder
                                y: [50, -120, 50], // Starts low, Arcs high up, drops down to folder
                                scale: [1, 1.3, 0.2], // Grows while flying, shrinks when entering folder
                                rotate: [0, 25, -180], // Spins through the air
                                opacity: [0, 1, 1, 0] // Fades in, stays visible, fades out as it hits folder
                            }}
                            transition={{
                                duration: 1.5,
                                delay: 0.3, // Wait for folder to appear slightly
                                times: [0, 0.4, 0.9, 1], // Timing of the arc points
                                ease: "easeInOut"
                            }}
                            className="absolute text-5xl z-20 bg-white shadow-2xl rounded-md p-3 border-2 border-purple-200"
                        >
                            📄
                        </motion.div>

                        {/* Particle burst effect when paper enters folder */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ 
                                opacity: [0, 0.8, 0],
                                scale: [0, 2, 3.5]
                            }}
                            transition={{ delay: 1.6, duration: 0.4 }}
                            className="absolute bottom-10 left-[23%] w-12 h-12 border-4 border-purple-400 rounded-full z-0"
                        />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ResumeAnalyzerAnimation;