'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Camera, MapPin, CheckCircle } from 'lucide-react';

const PublicMap = dynamic(
  () => import('@/components/map/PublicMap').then((mod) => mod.PublicMap),
  { ssr: false, loading: () => <div className="h-[400px] bg-slate-100 rounded-xl animate-pulse" /> }
);

export default function LandingPage() {
  const [videoFinished, setVideoFinished] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      {/* Video Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          className={`w-full h-full object-cover transition-opacity duration-1000 ${videoFinished ? 'opacity-80' : 'opacity-100'}`}
          autoPlay
          muted
          playsInline
          onEnded={() => setVideoFinished(true)}
        >
          <source src="/landing.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Dark overlay that fades in when video finishes for text legibility */}
        <div className={`absolute inset-0 bg-black/60 z-0 transition-opacity duration-1000 ${videoFinished ? 'opacity-100' : 'opacity-0'}`} />

        {/* Skip button for the video */}
        {!videoFinished && (
          <button
            onClick={() => setVideoFinished(true)}
            className="absolute bottom-8 right-8 text-white/70 hover:text-white transition-colors text-sm font-medium z-10 bg-black/30 hover:bg-black/50 px-4 py-2 rounded-full backdrop-blur-md"
          >
            Skip Intro
          </button>
        )}
      </div>

      {/* Main Content Layer (Fades in when video finishes) */}
      <div className={`relative z-10 w-full min-h-screen overflow-y-auto transition-all duration-1000 transform ${videoFinished ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto pt-10 md:pt-20">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
              See Something?
              <br />
              <span className="text-brand-400">Say Something.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 mb-4 drop-shadow-md">
              Report civic issues in 60 seconds.
            </p>
            <p className="text-lg text-slate-300 mb-8 drop-shadow-md">
              Track real change in your neighbourhood.
            </p>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-xl hover:shadow-brand-500/25 text-lg"
            >
              Get Started →
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 shadow-2xl text-center transition-all hover:-translate-y-2 hover:shadow-brand-500/20 border border-white/10">
              <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-500/30">
                <Camera className="w-8 h-8 text-brand-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 tracking-wide">Snap a Photo</h3>
              <p className="text-slate-300 font-medium">
                Take a quick photo of the issue with your phone
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 shadow-2xl text-center transition-all hover:-translate-y-2 hover:shadow-brand-500/20 border border-white/10">
              <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-500/30">
                <MapPin className="w-8 h-8 text-brand-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 tracking-wide">Auto Location</h3>
              <p className="text-slate-300 font-medium">
                We automatically capture the exact location
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 shadow-2xl text-center transition-all hover:-translate-y-2 hover:shadow-brand-500/20 border border-white/10">
              <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-500/30">
                <CheckCircle className="w-8 h-8 text-brand-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 tracking-wide">Track Progress</h3>
              <p className="text-slate-300 font-medium">
                See when your report gets reviewed and resolved
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 pb-16 text-center">
            <p className="text-sm text-slate-300 mb-4 drop-shadow">
              Join hundreds of active citizens making a difference
            </p>
            <Link
              href="/login"
              className="text-brand-400 hover:text-brand-300 font-semibold drop-shadow transition-colors"
            >
              Start Reporting Issues →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
