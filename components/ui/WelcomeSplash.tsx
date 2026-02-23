'use client';

import { useEffect, useState } from 'react';

interface WelcomeSplashProps {
    name: string;
    onFinished: () => void;
}

export function WelcomeSplash({ name, onFinished }: WelcomeSplashProps) {
    const [phase, setPhase] = useState<'video' | 'text' | 'fadeout'>('video');
    const [textVisible, setTextVisible] = useState(false);

    useEffect(() => {
        // After 1.5s of video playing, show welcome text
        const textTimer = setTimeout(() => {
            setPhase('text');
            setTextVisible(true);
        }, 1500);

        // After 3.5s total, start fade-out
        const fadeTimer = setTimeout(() => {
            setPhase('fadeout');
        }, 3500);

        // After 4.5s total, call onFinished to unmount this
        const doneTimer = setTimeout(() => {
            onFinished();
        }, 4500);

        return () => {
            clearTimeout(textTimer);
            clearTimeout(fadeTimer);
            clearTimeout(doneTimer);
        };
    }, [onFinished]);

    return (
        <div
            className={`fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-1000 ${phase === 'fadeout' ? 'opacity-0' : 'opacity-100'
                }`}
        >
            {/* Background Video */}
            <video
                className="absolute inset-0 w-full h-full object-cover"
                src="/signvideo.mp4"
                autoPlay
                muted
                playsInline
                loop
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Welcome Text */}
            <div
                className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ${textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
            >
                {/* Logo glow */}
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-brand-600 rounded-3xl shadow-[0_0_40px_rgba(139,92,246,0.5)] flex items-center justify-center mb-8">
                    <span className="text-white font-bold text-4xl">G</span>
                </div>

                <p className="text-brand-300 text-lg font-medium tracking-[0.3em] uppercase mb-3">
                    Welcome back
                </p>
                <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight drop-shadow-2xl text-center">
                    {name}
                </h1>
                <p className="mt-6 text-white/50 text-base tracking-wide">
                    <span className="text-violet-400 font-bold">Gen</span><span className="text-white font-bold">Sathi</span> — Report. Track. Change.
                </p>
            </div>
        </div>
    );
}
