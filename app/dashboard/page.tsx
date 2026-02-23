'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { WelcomeSplash } from '@/components/ui/WelcomeSplash';
import { Plus } from 'lucide-react';
import Link from 'next/link';

// Dynamic import for map to avoid SSR issues with Leaflet
const ComplaintMap = dynamic(
  () => import('@/components/map/ComplaintMap').then((mod) => mod.ComplaintMap),
  { ssr: false, loading: () => <div className="h-[500px] bg-slate-100 rounded-xl animate-pulse" /> }
);

export default function DashboardPage() {
  const { userData } = useAuth();
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Only show the welcome splash once per browser session
    if (userData && !sessionStorage.getItem('welcomeShown')) {
      setShowSplash(true);
      sessionStorage.setItem('welcomeShown', 'true');
    }
  }, [userData]);

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      {/* Welcome Splash — shown once per session after login */}
      {showSplash && (
        <WelcomeSplash
          name={userData.displayName?.split(' ')[0] || 'Welcome'}
          onFinished={() => setShowSplash(false)}
        />
      )}

      <main className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {greeting()}, {userData.displayName?.split(' ')[0]} 👋
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              What would you like to report today?
            </p>
          </div>

          {/* Main Content Split: Map and Action */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Content - 2/3 width on desktop */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 h-full">
                <ComplaintMap />
              </div>
            </div>

            {/* Action Sidebar - 1/3 width on desktop */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 h-full flex flex-col items-center justify-center text-center">
                <Link
                  href="/dashboard/submit"
                  className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-6 hover:bg-brand-100 transition-colors shadow-sm hover:shadow"
                >
                  <Plus className="w-10 h-10 text-brand-500" />
                </Link>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Notice an Issue?</h2>
                <p className="text-slate-600 mb-8 max-w-[250px]">
                  Help keep your community clean and safe. Report it directly.
                </p>

                <Link
                  href="/dashboard/submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold flex-shrink-0 rounded-xl transition-all shadow-md hover:shadow-lg text-lg"
                >
                  File a Complaint
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile Floating Action Button */}
          <Link
            href="/dashboard/submit"
            className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-xl flex items-center justify-center z-50 transition-colors"
          >
            <Plus className="w-6 h-6" />
          </Link>
        </div>
      </main>
    </>
  );
}
