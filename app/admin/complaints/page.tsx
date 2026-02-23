'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Complaint, ComplaintStatus } from '@/lib/utils/types';
import { CategoryBadge } from '@/components/complaints/CategoryBadge';
import { StatusBadge } from '@/components/complaints/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Toast, ToastType } from '@/components/ui/Toast';
import { updateComplaintStatus } from '@/lib/firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { timeAgo } from '@/lib/utils/helpers';
import {
    FileText,
    MapPin,
    Clock,
    Heart,
    Eye,
    ThumbsUp,
    ThumbsDown,
    ArrowLeft,
    Search,
    Flame,
} from 'lucide-react';

export default function AdminComplaintsPage() {
    const { user, userData } = useAuth();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [toast, setToast] = useState<{ type: ToastType; title: string; message?: string } | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        let q;
        if (filter === 'pending') {
            q = query(
                collection(db, 'complaints'),
                where('status', 'in', ['submitted', 'under_review', 'in_progress']),
                orderBy('createdAt', 'desc')
            );
        } else if (filter === 'resolved') {
            q = query(
                collection(db, 'complaints'),
                where('status', '==', 'resolved'),
                orderBy('createdAt', 'desc')
            );
        } else {
            q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
        }
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Complaint[];
            setComplaints(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [filter]);

    const handleQuickAction = async (complaintId: string, status: ComplaintStatus) => {
        if (!user || !userData) return;
        setActionLoading(complaintId);
        try {
            await updateComplaintStatus(
                complaintId,
                status,
                user.uid,
                userData.displayName,
                status === 'rejected' ? 'Rejected by admin' : 'Accepted by admin',
                undefined
            );
            setToast({
                type: 'success',
                title: status === 'rejected' ? 'Complaint Rejected' : 'Complaint Accepted',
                message: `Complaint has been ${status === 'rejected' ? 'rejected' : 'moved to review'}`,
            });
        } catch {
            setToast({ type: 'error', title: 'Action Failed', message: 'Please try again' });
        } finally {
            setActionLoading(null);
        }
    };

    const TRENDING_THRESHOLD = 5; // complaints with 5+ upvotes are "trending"

    const filtered = complaints
        .filter((c) =>
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.location.area.toLowerCase().includes(search.toLowerCase())
        )
        // Sort: trending (high upvotes) first, then by date
        .sort((a, b) => {
            const aHot = (a.upvotes || 0) >= TRENDING_THRESHOLD;
            const bHot = (b.upvotes || 0) >= TRENDING_THRESHOLD;
            if (aHot && !bHot) return -1;
            if (!aHot && bHot) return 1;
            return (b.upvotes || 0) - (a.upvotes || 0);
        });

    return (
        <main className="min-h-screen bg-[#0B1120]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link
                        href="/admin"
                        className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white">All Complaints</h1>
                        <p className="text-sm text-white/40">{filtered.length} complaint{filtered.length !== 1 ? 's' : ''} found</p>
                    </div>
                    {/* Trending legend */}
                    <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-pink-500/10 border border-pink-500/20 rounded-xl">
                        <Flame className="w-4 h-4 text-pink-400" />
                        <span className="text-xs font-semibold text-pink-300">{TRENDING_THRESHOLD}+ upvotes = Trending</span>
                    </div>
                </div>

                {/* Search + Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by title or area..."
                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2">
                        {(['all', 'pending', 'resolved'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-5 py-3 text-sm font-semibold rounded-xl transition-all ${filter === f
                                    ? 'bg-brand-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10'
                                    }`}
                            >
                                {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : 'Resolved'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cards Grid */}
                {loading ? (
                    <div className="flex justify-center py-24">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24">
                        <FileText className="w-16 h-16 text-white/10 mx-auto mb-4" />
                        <p className="text-white/30 text-lg">No complaints found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filtered.map((complaint) => {
                            const isTrending = (complaint.upvotes || 0) >= TRENDING_THRESHOLD;
                            return (
                                <div
                                    key={complaint.id}
                                    className={`rounded-2xl overflow-hidden transition-all duration-300 group flex flex-col relative ${isTrending
                                            ? 'border-2 border-pink-500/50 bg-pink-500/5 hover:border-pink-400/70 shadow-[0_0_20px_rgba(236,72,153,0.2)]'
                                            : 'border border-white/10 bg-white/5 hover:border-white/20'
                                        }`}
                                >
                                    <div className="relative h-44 overflow-hidden flex-shrink-0">
                                        <img
                                            src={complaint.imageURL}
                                            alt={complaint.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />

                                        {/* Trending badge — top banner */}
                                        {isTrending && (
                                            <div className="absolute top-0 left-0 right-0 flex items-center justify-center gap-1.5 py-1.5 bg-gradient-to-r from-pink-600/80 to-rose-600/80 backdrop-blur-sm">
                                                <Flame className="w-3 h-3 text-white" />
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Trending · {complaint.upvotes} upvotes</span>
                                            </div>
                                        )}

                                        {/* Priority badge */}
                                        <div className="absolute top-3 left-3" style={{ top: isTrending ? '2rem' : '0.75rem' }}>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg backdrop-blur-md border ${complaint.priority === 'critical' ? 'bg-red-500/30 text-red-300 border-red-500/30' :
                                                complaint.priority === 'high' ? 'bg-orange-500/30 text-orange-300 border-orange-500/30' :
                                                    complaint.priority === 'medium' ? 'bg-amber-500/30 text-amber-300 border-amber-500/30' :
                                                        'bg-slate-500/30 text-slate-300 border-slate-500/30'
                                                }`}>
                                                {complaint.priority}
                                            </span>
                                        </div>

                                        {/* Upvotes pill — glows pink when trending */}
                                        <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg backdrop-blur-md ${isTrending
                                                ? 'bg-pink-500/40 border border-pink-400/40 shadow-[0_0_10px_rgba(236,72,153,0.4)]'
                                                : 'bg-black/40'
                                            }`}>
                                            <Heart className={`w-3 h-3 ${isTrending ? 'text-pink-300' : 'text-pink-400'}`} />
                                            <span className={`text-xs font-bold ${isTrending ? 'text-pink-200' : 'text-white'}`}>{complaint.upvotes}</span>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-4 flex flex-col flex-1">
                                        {/* Badges */}
                                        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                                            <CategoryBadge category={complaint.category} small />
                                            <StatusBadge status={complaint.status} small />
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 leading-snug flex-1">
                                            {complaint.title}
                                        </h3>

                                        {/* Location + Time */}
                                        <div className="flex items-center gap-3 text-xs text-white/40 mb-4">
                                            <div className="flex items-center gap-1.5 truncate">
                                                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span className="truncate">{complaint.location.area}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{timeAgo(complaint.createdAt)}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 pt-3 border-t border-white/5 mt-auto">
                                            <Link
                                                href={`/admin/complaint/${complaint.id}`}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                Details
                                            </Link>

                                            {complaint.status === 'submitted' && (
                                                <>
                                                    <button
                                                        onClick={() => handleQuickAction(complaint.id, 'under_review')}
                                                        disabled={actionLoading === complaint.id}
                                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl transition-all border border-emerald-500/20 disabled:opacity-50"
                                                    >
                                                        <ThumbsUp className="w-3.5 h-3.5" />
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleQuickAction(complaint.id, 'rejected')}
                                                        disabled={actionLoading === complaint.id}
                                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all border border-red-500/20 disabled:opacity-50"
                                                    >
                                                        <ThumbsDown className="w-3.5 h-3.5" />
                                                        Reject
                                                    </button>
                                                </>
                                            )}

                                            {actionLoading === complaint.id && <LoadingSpinner />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {toast && (
                <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />
            )}
        </main>
    );
}
