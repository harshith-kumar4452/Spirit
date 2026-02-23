'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Complaint, ActivityLog } from '@/lib/utils/types';
import { useAuth } from '@/lib/hooks/useAuth';
import { CategoryBadge } from '@/components/complaints/CategoryBadge';
import { StatusBadge } from '@/components/complaints/StatusBadge';
import { LevelIndicator } from '@/components/gamification/LevelIndicator';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toggleUpvote } from '@/lib/firebase/firestore';
import { timeAgo } from '@/lib/utils/helpers';
import { ArrowLeft, Heart, MapPin, Clock, Share2 } from 'lucide-react';
import Link from 'next/link';

const SingleLocationMap = dynamic(
  () => import('@/components/map/SingleLocationMap').then((mod) => mod.SingleLocationMap),
  { ssr: false, loading: () => <div className="h-full w-full bg-slate-100 animate-pulse" /> }
);

export default function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const complaintId = params.id as string;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [upvoting, setUpvoting] = useState(false);

  useEffect(() => {
    if (!complaintId) return;

    const unsubscribe = onSnapshot(
      doc(db, 'complaints', complaintId),
      (snapshot) => {
        if (snapshot.exists()) {
          setComplaint({ id: snapshot.id, ...snapshot.data() } as Complaint);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [complaintId]);

  useEffect(() => {
    if (!complaintId) return;

    const q = query(collection(db, 'complaints', complaintId, 'activity'), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ActivityLog[];
      setActivity(data);
    });

    return () => unsubscribe();
  }, [complaintId]);

  const handleUpvote = async () => {
    if (!user || !complaint || upvoting) return;

    setUpvoting(true);
    try {
      await toggleUpvote(complaint.id, user.uid);
    } catch (error) {
      console.error('Upvote error:', error);
    } finally {
      setUpvoting(false);
    }
  };

  if (loading || !complaint) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const hasUpvoted = user ? complaint.upvotedBy.includes(user.uid) : false;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button className="p-2 text-slate-600 hover:text-slate-900 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Image */}
        <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm mb-6">
          <img
            src={complaint.imageURL}
            alt={complaint.title}
            className="w-full h-80 object-cover"
          />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-4">
            <CategoryBadge category={complaint.category} />
            <StatusBadge status={complaint.status} />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-slate-900 mb-4">{complaint.title}</h1>

          {/* Description */}
          {complaint.description && (
            <p className="text-slate-700 mb-4 leading-relaxed">{complaint.description}</p>
          )}

          {/* Location */}
          <div className="flex items-start gap-2 text-sm text-slate-600 mb-2">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{complaint.location.address}</span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>Submitted {timeAgo(complaint.createdAt)}</span>
          </div>

          {/* Map */}
          <div className="h-48 rounded-xl overflow-hidden border border-slate-200 mb-6">
            <SingleLocationMap
              lat={complaint.location.lat}
              lng={complaint.location.lng}
            />
          </div>

          {/* Upvote and Submitter */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              onClick={handleUpvote}
              disabled={upvoting || !user}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${hasUpvoted
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Heart className={`w-5 h-5 ${hasUpvoted ? 'fill-red-600' : ''}`} />
              <span>{complaint.upvotes} Upvotes</span>
            </button>

            <div className="flex items-center gap-3">
              <img
                src={complaint.userPhotoURL || '/default-avatar.png'}
                alt={complaint.userName || 'User'}
                className="w-10 h-10 rounded-full border-2 border-slate-200"
              />
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{complaint.userName}</p>
                <p className="text-xs text-slate-500">Lv.3 Active Citizen</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        {activity.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Activity</h2>
            <div className="space-y-3">
              {activity.map((log) => (
                <div key={log.id} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">
                      {log.action === 'status_change' && (
                        <>
                          Status changed to <strong>{log.toValue}</strong>
                        </>
                      )}
                      {log.action === 'priority_change' && (
                        <>
                          Priority changed to <strong>{log.toValue}</strong>
                        </>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {timeAgo(log.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
