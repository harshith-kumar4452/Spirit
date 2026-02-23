'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Complaint } from '@/lib/utils/types';
import { CategoryBadge } from '@/components/complaints/CategoryBadge';
import { StatusBadge } from '@/components/complaints/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { timeAgo } from '@/lib/utils/helpers';
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    TrendingUp,
    ArrowRight,
    BarChart2,
    MapPin,
    Heart,
} from 'lucide-react';

export default function AdminDashboardStatsPage() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Complaint[];
            setComplaints(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const stats = {
        total: complaints.length,
        pending: complaints.filter((c) => c.status === 'submitted').length,
        inProgress: complaints.filter((c) => c.status === 'in_progress').length,
        underReview: complaints.filter((c) => c.status === 'under_review').length,
        resolved: complaints.filter((c) => c.status === 'resolved').length,
        rejected: complaints.filter((c) => c.status === 'rejected').length,
    };

    const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

    // Category breakdown
    const categoryCount = complaints.reduce((acc, c) => {
        acc[c.category] = (acc[c.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const recentComplaints = complaints.slice(0, 6);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#0B1120]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
                        <p className="text-sm text-white/40">Live analytics & complaint overview</p>
                    </div>
                    <Link
                        href="/admin"
                        className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-400 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    >
                        View Map + Complaints
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                    {[
                        { label: 'Total', value: stats.total, icon: FileText, color: 'brand', glow: 'rgba(59,130,246,0.3)' },
                        { label: 'Pending', value: stats.pending, icon: Clock, color: 'amber', glow: 'rgba(245,158,11,0.3)' },
                        { label: 'In Progress', value: stats.inProgress, icon: AlertCircle, color: 'blue', glow: 'rgba(59,130,246,0.3)' },
                        { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'emerald', glow: 'rgba(16,185,129,0.3)' },
                        { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'red', glow: 'rgba(239,68,68,0.3)' },
                    ].map(({ label, value, icon: Icon, color, glow }) => (
                        <div
                            key={label}
                            className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 group"
                        >
                            <div className={`p-2.5 rounded-xl bg-${color}-500/10 w-fit mb-4 group-hover:bg-${color}-500/20 transition-colors`}>
                                <Icon className={`w-5 h-5 text-${color}-400`} />
                            </div>
                            <p className="text-3xl font-bold text-white mb-1">{value}</p>
                            <p className="text-xs text-white/40 uppercase tracking-wider font-medium">{label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Resolution Rate */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2 rounded-xl bg-emerald-500/10">
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                </div>
                                <h2 className="text-base font-bold text-white">Resolution Rate</h2>
                                <span className="ml-auto text-3xl font-bold text-emerald-400">{resolutionRate}%</span>
                            </div>
                            <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${resolutionRate}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-3 text-xs text-white/30">
                                <span>0%</span>
                                <span>50%</span>
                                <span>100%</span>
                            </div>
                        </div>

                        {/* Status Breakdown */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2 rounded-xl bg-brand-500/10">
                                    <BarChart2 className="w-5 h-5 text-brand-400" />
                                </div>
                                <h2 className="text-base font-bold text-white">Status Breakdown</h2>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { label: 'Submitted', value: stats.pending, color: 'bg-amber-400', max: stats.total },
                                    { label: 'Under Review', value: stats.underReview, color: 'bg-blue-400', max: stats.total },
                                    { label: 'In Progress', value: stats.inProgress, color: 'bg-purple-400', max: stats.total },
                                    { label: 'Resolved', value: stats.resolved, color: 'bg-emerald-400', max: stats.total },
                                    { label: 'Rejected', value: stats.rejected, color: 'bg-red-400', max: stats.total },
                                ].map(({ label, value, color, max }) => (
                                    <div key={label} className="flex items-center gap-3">
                                        <span className="text-xs text-white/40 w-28 flex-shrink-0">{label}</span>
                                        <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${color} rounded-full transition-all duration-700`}
                                                style={{ width: max > 0 ? `${(value / max) * 100}%` : '0%' }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-white w-6 text-right">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Complaints */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-base font-bold text-white">Recent Complaints</h2>
                                <Link href="/admin" className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors">
                                    View All →
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {recentComplaints.map((c) => (
                                    <Link
                                        href={`/admin/complaint/${c.id}`}
                                        key={c.id}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group"
                                    >
                                        <img src={c.imageURL} alt="" className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-white truncate mb-1">{c.title}</p>
                                            <div className="flex items-center gap-2">
                                                <StatusBadge status={c.status} small />
                                                <span className="text-xs text-white/30">{timeAgo(c.createdAt)}</span>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors flex-shrink-0" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">

                        {/* Top Categories */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h2 className="text-base font-bold text-white mb-5">Top Categories</h2>
                            <div className="space-y-3">
                                {topCategories.map(([category, count]) => (
                                    <div key={category} className="flex items-center gap-3">
                                        <CategoryBadge category={category as any} small />
                                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-brand-500/70 rounded-full"
                                                style={{ width: stats.total > 0 ? `${(count / stats.total) * 100}%` : '0%' }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-white/60 w-5 text-right">{count}</span>
                                    </div>
                                ))}
                                {topCategories.length === 0 && (
                                    <p className="text-sm text-white/30 text-center py-4">No data yet</p>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h2 className="text-base font-bold text-white mb-5">Quick Action</h2>
                            <Link
                                href="/admin"
                                className="block w-full py-4 px-5 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 text-brand-400 font-semibold text-sm rounded-xl transition-all text-center mb-3"
                            >
                                🗺️ Open Map View
                            </Link>
                            <Link
                                href="/admin"
                                className="block w-full py-4 px-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white font-semibold text-sm rounded-xl transition-all text-center"
                            >
                                📋 View All Complaints
                            </Link>
                        </div>

                        {/* Total Upvotes */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <Heart className="w-5 h-5 text-pink-400" />
                                <h2 className="text-base font-bold text-white">Community Engagement</h2>
                            </div>
                            <p className="text-4xl font-bold text-white mb-1">
                                {complaints.reduce((sum, c) => sum + (c.upvotes || 0), 0)}
                            </p>
                            <p className="text-xs text-white/40 uppercase tracking-wider">Total Upvotes Received</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
