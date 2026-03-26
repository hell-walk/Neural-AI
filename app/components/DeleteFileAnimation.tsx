import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DeleteFileAnimationProps {
    onAnimationComplete: () => void;
}

const DeleteFileAnimation: React.FC<DeleteFileAnimationProps> = ({ onAnimationComplete }) => {
    const [phase, setPhase] = useState<"idle" | "animating">("idle");

    useEffect(() => {
        setPhase("animating");

        const timer = setTimeout(() => {
            onAnimationComplete();
        }, 2200); // slightly faster than upload animation

        return () => clearTimeout(timer);
    }, [onAnimationComplete]);

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
            <AnimatePresence>
                {phase === "animating" && (
                    <>
                        {/* The Dustbin - Appears bottom center, waits, then shakes */}
                        <motion.div
                            initial={{ scale: 0, opacity: 0, y: 50 }}
                            animate={{
                                scale: [0, 1.2, 1, 1, 1.1, 0.9, 1.1, 1, 0],
                                opacity: [0, 1, 1, 1, 1, 1, 1, 1, 0],
                                rotate: [0, 0, 0, 0, -15, 15, -15, 0, 0]
                            }}
                            transition={{
                                duration: 2.0,
                                times: [0, 0.2, 0.3, 0.6, 0.65, 0.7, 0.75, 0.8, 1],
                                ease: "easeInOut"
                            }}
                            className="absolute bottom-[20%] text-6xl drop-shadow-xl"
                        >
                            🗑️
                        </motion.div>

                        {/* The Paper (Document) - Arcs from center up and into the dustbin */}
                        <motion.div
                            initial={{ scale: 1, opacity: 1, x: 0, y: 0 }}
                            animate={{
                                x: [0, -60, 0], // Starts center, arcs slightly left, drops to center dustbin
                                y: [0, -150, 150], // Starts center, arcs high up, drops down to dustbin
                                scale: [1, 1.2, 0.1], // Grows slightly while flying, shrinks rapidly into dustbin
                                rotate: [0, -45, 180], // Spins wildly through the air
                                opacity: [1, 1, 1, 0] // Fades out exactly as it hits the dustbin
                            }}
                            transition={{
                                duration: 1.2,
                                delay: 0.2, // Wait for dustbin to appear
                                times: [0, 0.5, 0.9, 1], // Timing of the arc points
                                ease: "easeInOut"
                            }}
                            className="absolute text-5xl bg-white shadow-2xl rounded-md p-3 border-2 border-red-200"
                        >
                            📄
                        </motion.div>

                        {/* Particle burst effect when paper enters dustbin (Red instead of purple) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ 
                                opacity: [0, 0.8, 0],
                                scale: [0, 1.5, 3]
                            }}
                            transition={{ delay: 1.3, duration: 0.4 }}
                            className="absolute bottom-[23%] w-12 h-12 border-4 border-red-500 rounded-full"
                        />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DeleteFileAnimation;