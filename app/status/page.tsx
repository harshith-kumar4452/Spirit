'use client';

// Force Turbopack recognition

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { XPProgressBar } from '@/components/dashboard/XPProgressBar';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function StatusPage() {
    const { userData } = useAuth();
    const [userRank, setUserRank] = useState(0);

    useEffect(() => {
        // Calculate user rank
        const fetchRank = async () => {
            if (!userData) return;

            const q = query(collection(db, 'users'), orderBy('xp', 'desc'));
            const snapshot = await getDocs(q);

            const rank = snapshot.docs.findIndex((doc) => doc.id === userData.uid) + 1;
            setUserRank(rank || 999);
        };

        fetchRank();
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
        <main className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                        {greeting()}, {userData.displayName?.split(' ')[0]} 👋
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                        {userData.levelTitle} • Level {userData.level} • {userData.xp} XP
                    </p>
                </div>

                {/* Stats Cards */}
                <StatsCards userData={userData} rank={userRank} />

                {/* XP Progress Bar */}
                <div className="mt-6">
                    <XPProgressBar xp={userData.xp} level={userData.level} levelTitle={userData.levelTitle} />
                </div>

                {/* Activity Feed */}
                <div className="mt-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-hidden">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            Your Recent Activity
                        </h2>
                        <RecentActivity userId={userData.uid} />
                    </div>
                </div>
            </div>
        </main>
    );
}
