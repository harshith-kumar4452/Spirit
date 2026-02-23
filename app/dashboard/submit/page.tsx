'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, AlertTriangle, ThumbsUp, X } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { CategoryPicker } from '@/components/complaints/CategoryPicker';
import { ImageUpload } from '@/components/complaints/ImageUpload';
import { LocationCapture } from '@/components/complaints/LocationCapture';
import { Toast, ToastType } from '@/components/ui/Toast';
import { ComplaintCategory, Complaint } from '@/lib/utils/types';
import { ValidationResult } from '@/lib/validation/imageValidator';
import { GeocodedAddress } from '@/lib/geo/reverseGeocode';
import { uploadComplaintImage } from '@/lib/cloudinary/upload';
import { createComplaint } from '@/lib/firebase/firestore';
import { serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { CATEGORY_LABELS } from '@/lib/utils/constants';
import Link from 'next/link';

const STEPS = ['Category', 'Photo', 'Location', 'Details', 'Review'];

export default function SubmitPage() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [category, setCategory] = useState<ComplaintCategory | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imageValidation, setImageValidation] = useState<ValidationResult | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState<GeocodedAddress | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Toast state
  const [toast, setToast] = useState<{ type: ToastType; title: string; message?: string } | null>(null);

  // Duplicate detection
  const [nearbyDuplicate, setNearbyDuplicate] = useState<Complaint | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);

  // Haversine distance in metres between two lat/lng points
  const haversineMetres = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return category !== null;
      case 1:
        return image !== null && imageValidation?.passed;
      case 2:
        return location !== null && address !== null;
      case 3:
        return title.trim().length > 0 && title.length <= 100;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (!canProceed() || currentStep >= STEPS.length - 1) return;

    // Check for nearby duplicates when leaving the location step
    if (currentStep === 2 && location) {
      setCheckingDuplicates(true);
      try {
        const q = query(
          collection(db, 'complaints'),
          where('status', 'in', ['submitted', 'under_review', 'in_progress'])
        );
        const snapshot = await getDocs(q);
        const nearby = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Complaint))
          .find(c =>
            haversineMetres(location.lat, location.lng, c.location.lat, c.location.lng) < 150
          );

        if (nearby) {
          setNearbyDuplicate(nearby);
          setShowDuplicateModal(true);
          setCheckingDuplicates(false);
          return; // Don't proceed — let user decide via modal
        }
      } catch (e) {
        // If check fails, allow submission to proceed
      }
      setCheckingDuplicates(false);
    }

    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user || !userData || !category || !image || !imageValidation || !location || !address) {
      return;
    }

    setSubmitting(true);

    try {
      // Create a temporary complaint ID
      const tempId = `temp_${Date.now()}`;

      // Upload image
      const { url, path } = await uploadComplaintImage(image, tempId);

      // Create complaint
      const complaintId = await createComplaint({
        userId: user.uid,
        userName: userData.displayName,
        userPhotoURL: userData.photoURL,
        title: title.trim(),
        description: description.trim(),
        category,
        imageURL: url,
        imagePath: path,
        location: {
          lat: location.lat,
          lng: location.lng,
          address: address.address,
          area: address.area,
        },
        status: 'submitted',
        priority: 'medium',
        adminNotes: '',
        assignedTo: null,
        upvotes: 0,
        upvotedBy: [],
        imageValidation: {
          passed: imageValidation.passed,
          checks: {
            fileType: imageValidation.checks.fileType.passed,
            resolution: imageValidation.checks.resolution.passed,
            isNotAi: imageValidation.checks.isNotAi.passed,
            hasExif: imageValidation.checks.hasExif.passed,
            fileSize: imageValidation.checks.fileSize.passed,
          },
        },
        resolvedAt: null,
      } as any);

      setToast({
        type: 'success',
        title: 'Report Submitted!',
        message: '+10 XP earned',
      });

      setTimeout(() => {
        router.push(`/complaint/${complaintId}`);
      }, 1500);
    } catch (error) {
      console.error('Submit error:', error);
      setToast({
        type: 'error',
        title: 'Submission Failed',
        message: 'Please try again',
      });
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Report an Issue</h1>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${i < currentStep
                  ? 'bg-brand-500 text-white'
                  : i === currentStep
                    ? 'bg-brand-500 text-white ring-4 ring-brand-100'
                    : 'bg-slate-200 text-slate-500'
                  }`}
              >
                {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-12 md:w-24 h-0.5 mx-2 ${i < currentStep ? 'bg-brand-500' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 mb-6">
          {currentStep === 0 && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">What type of issue?</h2>
              <CategoryPicker selected={category} onSelect={setCategory} />
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Upload a photo</h2>
              <ImageUpload
                onImageSelect={(file, validation) => {
                  setImage(file);
                  setImageValidation(validation);
                }}
                selectedFile={image}
                validation={imageValidation}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Confirm location</h2>
              <LocationCapture
                onLocationSelect={(loc, addr) => {
                  setLocation(loc);
                  setAddress(addr);
                }}
                selectedLocation={location}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Add details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                    placeholder="Brief description of the issue"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    {title.length}/100 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder="Additional details about the issue..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    {description.length}/500 characters
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Review and submit</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Category</p>
                  <p className="text-sm text-slate-900">{category && CATEGORY_LABELS[category]}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Photo</p>
                  {image && (
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Location</p>
                  <p className="text-sm text-slate-900">{address?.area}</p>
                  <p className="text-xs text-slate-500">{address?.address}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Title</p>
                  <p className="text-sm text-slate-900">{title}</p>
                </div>

                {description && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Description</p>
                    <p className="text-sm text-slate-900">{description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-6 py-3 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-medium rounded-xl border border-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed() || checkingDuplicates}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkingDuplicates ? 'Checking...' : 'Next'}
              {!checkingDuplicates && <ArrowRight className="w-4 h-4" />}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !canProceed()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Nearby Duplicate Warning Modal ── */}
      {showDuplicateModal && nearbyDuplicate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-amber-500/30 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.8)] w-full max-w-md overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center gap-3 p-5 border-b border-white/10">
              <div className="p-2.5 bg-amber-500/10 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-white">Similar Issue Nearby!</h2>
                <p className="text-xs text-white/40 mt-0.5">There is already an open complaint within 150 metres of your location.</p>
              </div>
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="p-1.5 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Existing Complaint Preview */}
            <div className="p-5">
              <div className="flex gap-3 p-3 bg-white/5 border border-white/10 rounded-xl mb-5">
                <img
                  src={nearbyDuplicate.imageURL}
                  alt={nearbyDuplicate.title}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-white/10"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white line-clamp-2 mb-1">{nearbyDuplicate.title}</p>
                  <p className="text-xs text-white/40 truncate">📍 {nearbyDuplicate.location.area}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <ThumbsUp className="w-3 h-3 text-pink-400" />
                    <span className="text-xs text-white/50">{nearbyDuplicate.upvotes} upvotes</span>
                    <span className="text-xs text-white/20 ml-1">· {nearbyDuplicate.status.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-white/60 mb-5">
                Instead of filing a duplicate, <strong className="text-white">upvoting</strong> the existing complaint boosts its priority and helps it get resolved faster — and earns you XP too!
              </p>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Link
                  href={`/complaint/${nearbyDuplicate.id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-brand-500 to-violet-600 text-white font-bold rounded-xl transition-all hover:opacity-90 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Upvote the Existing Complaint
                </Link>
                <button
                  onClick={() => {
                    setShowDuplicateModal(false);
                    setCurrentStep(currentStep + 1);
                  }}
                  className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-sm font-medium rounded-xl border border-white/10 transition-all"
                >
                  It's different — file anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
