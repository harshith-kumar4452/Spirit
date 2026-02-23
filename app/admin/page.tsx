'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Complaint } from '@/lib/utils/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  List,
  ArrowRight,
} from 'lucide-react';

const ComplaintMap = dynamic(
  () => import('@/components/map/ComplaintMap').then((mod) => mod.ComplaintMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-slate-800 animate-pulse rounded-xl" /> }
);

export default function AdminHomePage() {
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
    resolved: complaints.filter((c) => c.status === 'resolved').length,
    rejected: complaints.filter((c) => c.status === 'rejected').length,
  };

  return (
    <main className="h-[calc(100vh-4rem)] bg-[#0B1120] overflow-hidden">
      <div className="flex h-full">

        {/* LEFT: Full-height Map */}
        <div className="flex-1 relative">
          <ComplaintMap className="h-full w-full !rounded-none" />

          {/* Map overlay badge */}
          <div className="absolute top-4 left-4 z-[1000]">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0B1120]/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl">
              <Shield className="w-4 h-4 text-brand-400" />
              <span className="text-sm font-semibold text-white">Admin Command Center</span>
            </div>
          </div>

          {/* Map overlay stats pills */}
          <div className="absolute bottom-4 left-4 right-4 z-[1000]">
            <div className="flex gap-3 flex-wrap">
              {[
                { color: 'bg-amber-400', text: `${stats.pending} Pending`, textColor: 'text-amber-400', pulse: true },
                { color: 'bg-blue-400', text: `${stats.inProgress} In Progress`, textColor: 'text-blue-400' },
                { color: 'bg-emerald-400', text: `${stats.resolved} Resolved`, textColor: 'text-emerald-400' },
                { color: 'bg-red-400', text: `${stats.rejected} Rejected`, textColor: 'text-red-400' },
              ].map(({ color, text, textColor, pulse }) => (
                <div key={text} className="flex items-center gap-2 px-3 py-2 bg-[#0B1120]/80 backdrop-blur-xl rounded-lg border border-white/10">
                  <div className={`w-2 h-2 rounded-full ${color} ${pulse ? 'animate-pulse' : ''}`} />
                  <span className={`text-xs font-semibold ${textColor}`}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Action Panel */}
        <div className="w-[380px] flex-shrink-0 flex flex-col h-full p-8 justify-center items-center gap-8 relative overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #0f0c29, #1a1040, #24243e)' }}
        >
          {/* Ambient glow orbs */}
          <div className="absolute top-[-60px] right-[-60px] w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-40px] left-[-40px] w-48 h-48 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Border left accent */}
          <div className="absolute left-0 top-1/4 bottom-1/4 w-[2px] bg-gradient-to-b from-transparent via-violet-500/60 to-transparent" />

          {/* Icon + Title */}
          <div className="text-center relative z-10">
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-400 to-violet-600 rounded-2xl blur-lg opacity-50" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-brand-500/20 to-violet-600/20 border border-violet-500/30 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-[0_0_40px_rgba(139,92,246,0.2)]">
                <Shield className="w-9 h-9 text-violet-300" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Admin Panel</h1>
            <p className="text-sm text-violet-300/60">Manage citizen complaints & city issues</p>
          </div>

          {/* Quick Stats */}
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="w-full grid grid-cols-2 gap-3 relative z-10">
              {[
                { label: 'Total', value: stats.total, icon: FileText, color: 'text-indigo-300', bg: 'from-indigo-500/20 to-blue-500/20', border: 'border-indigo-500/20' },
                { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-300', bg: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/20' },
                { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-emerald-300', bg: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/20' },
                { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-rose-300', bg: 'from-rose-500/20 to-red-500/20', border: 'border-rose-500/20' },
              ].map(({ label, value, icon: Icon, color, bg, border }) => (
                <div key={label} className={`bg-gradient-to-br ${bg} border ${border} rounded-2xl p-4 text-center hover:scale-105 transition-all duration-300 backdrop-blur-sm`}>
                  <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className={`text-xs ${color} mt-0.5 font-semibold opacity-70`}>{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* View Complaints Button */}
          <div className="w-full relative z-10 space-y-3">
            <Link
              href="/admin/complaints"
              className="w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl font-bold text-base transition-all group relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #3b82f6)' }}
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: 'inset 0 0 30px rgba(255,255,255,0.1)' }} />
              <List className="w-5 h-5 text-white relative z-10" />
              <span className="text-white relative z-10">View Complaints</span>
              <ArrowRight className="w-5 h-5 text-white relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Dashboard Link */}
            <Link
              href="/admin/dashboard"
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-violet-300/70 hover:text-violet-200 font-semibold text-sm rounded-xl border border-violet-500/20 hover:border-violet-500/40 transition-all backdrop-blur-sm"
            >
              <AlertCircle className="w-4 h-4" />
              View Full Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
