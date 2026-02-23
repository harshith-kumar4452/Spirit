'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Complaint, ActivityLog, ComplaintStatus, Priority } from '@/lib/utils/types';
import { useAuth } from '@/lib/hooks/useAuth';
import { CategoryBadge } from '@/components/complaints/CategoryBadge';
import { StatusBadge } from '@/components/complaints/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Toast, ToastType } from '@/components/ui/Toast';
import { updateComplaintStatus } from '@/lib/firebase/firestore';
import { uploadComplaintImage } from '@/lib/firebase/storage';
import { timeAgo } from '@/lib/utils/helpers';
import {
  ArrowLeft, Heart, MapPin, Clock, Upload, X,
  ImagePlus, CheckCircle2, User, Activity,
} from 'lucide-react';
import { STATUS_LABELS } from '@/lib/utils/constants';

const SingleLocationMap = dynamic(
  () => import('@/components/map/SingleLocationMap').then((mod) => mod.SingleLocationMap),
  { ssr: false, loading: () => <div className="h-full w-full bg-white/5 animate-pulse rounded-xl" /> }
);

/* ── Reusable image picker ── */
function ImagePicker({
  label, hint, required, file, onSelect, onClear,
}: {
  label: string; hint?: string; required?: boolean;
  file: File | null; onSelect: (f: File) => void; onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = file ? URL.createObjectURL(file) : null;

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-white/70 mb-1.5">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-white/30 mb-2">{hint}</p>}

      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-white/10 group">
          <img src={preview} alt="preview" className="w-full h-36 object-cover" />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 text-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-xs text-white/70 truncate">{file?.name}</p>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-36 border-2 border-dashed border-white/10 hover:border-brand-500/50 bg-white/5 hover:bg-white/10 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group"
        >
          <ImagePlus className="w-8 h-8 text-white/20 group-hover:text-brand-400 transition-colors" />
          <span className="text-sm text-white/30 group-hover:text-white/60 font-medium transition-colors">
            Click to upload
          </span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onSelect(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}

/* ── Main Page ── */
export default function AdminComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userData } = useAuth();
  const complaintId = params.id as string;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>('submitted');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('medium');
  const [notes, setNotes] = useState('');
  const [toast, setToast] = useState<{ type: ToastType; title: string; message?: string } | null>(null);

  const [statusImage, setStatusImage] = useState<File | null>(null);
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);

  const isResolving = selectedStatus === 'resolved';

  useEffect(() => {
    if (!complaintId) return;
    const unsubscribe = onSnapshot(doc(db, 'complaints', complaintId), (snapshot) => {
      if (snapshot.exists()) {
        const data = { id: snapshot.id, ...snapshot.data() } as Complaint;
        setComplaint(data);
        setSelectedStatus(data.status);
        setSelectedPriority(data.priority);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [complaintId]);

  useEffect(() => {
    if (!complaintId) return;
    const q = query(collection(db, 'complaints', complaintId, 'activity'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as ActivityLog[];
      setActivity(data);
    });
    return () => unsubscribe();
  }, [complaintId]);

  const handleUpdate = async () => {
    if (!user || !userData || !complaint || updating) return;

    if (isResolving) {
      if (!beforeImage || !afterImage) {
        setToast({ type: 'error', title: 'Images Required', message: 'Upload both Before & After repair photos to resolve.' });
        return;
      }
    } else if (!statusImage) {
      setToast({ type: 'error', title: 'Image Required', message: 'Upload a proof image for this status update.' });
      return;
    }

    setUpdating(true);
    try {
      let uploadedBeforeURL: string | undefined;
      let uploadedAfterURL: string | undefined;
      let uploadedStatusURL: string | undefined;

      if (isResolving && beforeImage && afterImage) {
        const [b, a] = await Promise.all([
          uploadComplaintImage(beforeImage, `${complaintId}/before`),
          uploadComplaintImage(afterImage, `${complaintId}/after`),
        ]);
        uploadedBeforeURL = b.url;
        uploadedAfterURL = a.url;
      } else if (statusImage) {
        const result = await uploadComplaintImage(statusImage, complaintId);
        uploadedStatusURL = result.url;
      }

      const enrichedNotes = [
        notes,
        uploadedBeforeURL ? `Before repair: ${uploadedBeforeURL}` : '',
        uploadedAfterURL ? `After repair: ${uploadedAfterURL}` : '',
        uploadedStatusURL ? `Proof image: ${uploadedStatusURL}` : '',
      ].filter(Boolean).join('\n');

      await updateComplaintStatus(
        complaint.id, selectedStatus, user.uid,
        userData.displayName, enrichedNotes || undefined, selectedPriority
      );

      setToast({ type: 'success', title: 'Complaint Updated', message: 'Status and images saved.' });
      setNotes(''); setStatusImage(null); setBeforeImage(null); setAfterImage(null);
    } catch (error) {
      setToast({ type: 'error', title: 'Update Failed', message: 'Please try again.' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !complaint) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B1120]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: Main Content */}
          <div className="lg:col-span-2 space-y-5">

            {/* Hero Image */}
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.6)] relative">
              <img src={complaint.imageURL} alt={complaint.title} className="w-full h-72 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <CategoryBadge category={complaint.category} />
                <StatusBadge status={complaint.status} />
              </div>
            </div>

            {/* Details Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
              <h1 className="text-2xl font-bold text-white mb-3">{complaint.title}</h1>

              {complaint.description && (
                <p className="text-white/60 mb-5 leading-relaxed">{complaint.description}</p>
              )}

              <div className="space-y-2.5 mb-6">
                <div className="flex items-start gap-2.5 text-sm text-white/50">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-brand-400" />
                  <span>{complaint.location.address}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-white/50">
                  <Clock className="w-4 h-4 flex-shrink-0 text-brand-400" />
                  <span>Submitted {timeAgo(complaint.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-white/50">
                  <Heart className="w-4 h-4 flex-shrink-0 text-pink-400" />
                  <span>{complaint.upvotes} upvotes from the community</span>
                </div>
              </div>

              {/* Map */}
              <div className="h-48 rounded-xl overflow-hidden border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <SingleLocationMap lat={complaint.location.lat} lng={complaint.location.lng} />
              </div>

              {/* Reporter */}
              <div className="flex items-center gap-3 mt-5 pt-5 border-t border-white/10">
                <User className="w-4 h-4 text-white/30" />
                <img
                  src={complaint.userPhotoURL || '/default-avatar.png'}
                  alt={complaint.userName}
                  className="w-9 h-9 rounded-full border-2 border-white/10 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                />
                <div>
                  <p className="text-sm font-semibold text-white">{complaint.userName}</p>
                  <p className="text-xs text-white/40">Reporter</p>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            {activity.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-2 mb-5">
                  <Activity className="w-4 h-4 text-brand-400" />
                  <h2 className="text-base font-bold text-white">Activity Log</h2>
                </div>
                <div className="space-y-4">
                  {activity.map((log) => (
                    <div key={log.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-500 mt-1 flex-shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                        <div className="w-px flex-1 bg-white/5 mt-1" />
                      </div>
                      <div className="flex-1 pb-3">
                        <p className="text-sm text-white/80">
                          {log.action === 'status_change' && <>Status → <span className="font-bold text-white">{log.toValue}</span></>}
                          {log.action === 'priority_change' && <>Priority → <span className="font-bold text-white">{log.toValue}</span></>}
                        </p>
                        <p className="text-xs text-white/30 mt-0.5">
                          by {log.performedByName} · {timeAgo(log.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Admin Actions */}
          <div className="lg:col-span-1">
            <div
              className="rounded-2xl border border-white/10 p-6 sticky top-20 space-y-5 backdrop-blur-sm shadow-[0_8px_50px_rgba(99,51,246,0.15),0_4px_30px_rgba(0,0,0,0.5)]"
              style={{ background: 'linear-gradient(160deg, #0f0c29cc, #1a1040cc, #24243ecc)' }}
            >
              <h2 className="text-lg font-bold text-white">Admin Actions</h2>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value as ComplaintStatus);
                    setStatusImage(null); setBeforeImage(null); setAfterImage(null);
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
                >
                  <option value="submitted" className="bg-[#1a1040]">{STATUS_LABELS.submitted}</option>
                  <option value="under_review" className="bg-[#1a1040]">{STATUS_LABELS.under_review}</option>
                  <option value="in_progress" className="bg-[#1a1040]">{STATUS_LABELS.in_progress}</option>
                  <option value="resolved" className="bg-[#1a1040]">{STATUS_LABELS.resolved}</option>
                  <option value="rejected" className="bg-[#1a1040]">{STATUS_LABELS.rejected}</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Priority</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['low', 'medium', 'high', 'critical'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSelectedPriority(p)}
                      className={`py-2.5 rounded-xl text-xs font-bold capitalize transition-all border ${selectedPriority === p
                        ? p === 'critical' ? 'bg-red-500/20 border-red-500/40 text-red-300'
                          : p === 'high' ? 'bg-orange-500/20 border-orange-500/40 text-orange-300'
                            : p === 'medium' ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                              : 'bg-slate-500/20 border-slate-500/40 text-slate-300'
                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/70'
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add internal notes..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 resize-none transition-all"
                />
              </div>

              {/* Image Uploads */}
              <div className="border-t border-white/10 pt-4">
                {isResolving ? (
                  <>
                    <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <p className="text-xs font-semibold text-emerald-300">Before &amp; After photos required to resolve</p>
                    </div>
                    <ImagePicker label="Before Repair" hint="Photo of the issue before fixing" required
                      file={beforeImage} onSelect={setBeforeImage} onClear={() => setBeforeImage(null)} />
                    <ImagePicker label="After Repair" hint="Photo showing the fix is complete" required
                      file={afterImage} onSelect={setAfterImage} onClear={() => setAfterImage(null)} />
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-brand-500/10 border border-brand-500/20">
                      <Upload className="w-4 h-4 text-brand-400 flex-shrink-0" />
                      <p className="text-xs font-semibold text-brand-300">A proof image is required to update status</p>
                    </div>
                    <ImagePicker label="Proof / Update Image" hint="Current state of the issue" required
                      file={statusImage} onSelect={setStatusImage} onClear={() => setStatusImage(null)} />
                  </>
                )}
              </div>

              {/* Submit */}
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="w-full px-6 py-3.5 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: updating ? undefined : 'linear-gradient(135deg, #6366f1, #8b5cf6, #3b82f6)', boxShadow: updating ? undefined : '0 0 25px rgba(99,102,241,0.4), 0 4px 15px rgba(0,0,0,0.3)' }}
              >
                {updating ? (
                  <><LoadingSpinner /><span className="text-white">Uploading...</span></>
                ) : (
                  <><Upload className="w-4 h-4 text-white" /><span className="text-white">Update Complaint</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />
      )}
    </main>
  );
}
