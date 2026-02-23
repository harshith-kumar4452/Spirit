'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Complaint } from '@/lib/utils/types';
import { CategoryBadge } from '@/components/complaints/CategoryBadge';
import { StatusBadge } from '@/components/complaints/StatusBadge';
import { timeAgo } from '@/lib/utils/helpers';
import { Heart, MapPin } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';

interface RecentActivityProps {
  userId: string;
}

export function RecentActivity({ userId }: RecentActivityProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'complaints'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Complaint[];
      setComplaints(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h2>
        <EmptyState
          icon={<MapPin className="w-12 h-12" />}
          title="No reports yet"
          description="You haven't submitted any reports yet"
          action={
            <Link
              href="/dashboard/submit"
              className="inline-flex items-center justify-center px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition-colors"
            >
              Submit a Report
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Recent Activity</h2>
        <Link
          href="/dashboard/my-reports"
          className="text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          View All →
        </Link>
      </div>

      <div className="space-y-3">
        {complaints.map((complaint) => (
          <Link
            key={complaint.id}
            href={`/complaint/${complaint.id}`}
            className="block p-4 bg-white rounded-xl border border-slate-100 transition-all duration-300 hover:bg-brand-50 hover:border-brand-300 hover:shadow-md hover:-translate-y-1"
          >
            <div className="flex items-center gap-2 mb-1">
              <CategoryBadge category={complaint.category} small />
              <StatusBadge status={complaint.status} small />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 truncate mb-1">
              {complaint.title}
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                {complaint.location.area} • {timeAgo(complaint.createdAt)}
              </p>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Heart className="w-3 h-3" />
                {complaint.upvotes}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
