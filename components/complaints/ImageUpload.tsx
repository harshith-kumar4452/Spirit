'use client';

import { useState, useRef } from 'react';
import { Camera, X, CheckCircle, XCircle, UploadCloud } from 'lucide-react';
import { validateImage, ValidationResult } from '@/lib/validation/imageValidator';

interface ImageUploadProps {
  onImageSelect: (file: File, validation: ValidationResult) => void;
  selectedFile: File | null;
  validation: ValidationResult | null;
}

export function ImageUpload({ onImageSelect, selectedFile, validation }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    const validationResult = await validateImage(file);
    onImageSelect(file, validationResult);

    if (validationResult.passed) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/jpg" || file.type === "image/png")) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageSelect(null as any, null as any);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const ValidationCheckItem = ({ passed, label }: { passed: boolean; label: string }) => (
    <div className="flex items-center gap-2">
      {passed ? (
        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
      )}
      <span className={`text-xs ${passed ? 'text-green-700' : 'text-red-700'}`}>{label}</span>
    </div>
  );

  if (preview && validation?.passed) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-slate-200">
        <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-1.5">
          <ValidationCheckItem passed={validation.checks.fileType.passed} label={validation.checks.fileType.message} />
          <ValidationCheckItem passed={validation.checks.resolution.passed} label={validation.checks.resolution.message} />
          <ValidationCheckItem passed={validation.checks.isNotAi.passed} label={validation.checks.isNotAi.message} />
          <ValidationCheckItem passed={validation.checks.hasExif.passed} label={validation.checks.hasExif.message} />
          <ValidationCheckItem passed={validation.checks.fileSize.passed} label={validation.checks.fileSize.message} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileChange}
        className="hidden"
        id="image-upload"
      />
      <label
        htmlFor="image-upload"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer block ${isDragging
          ? 'border-brand-500 bg-brand-50/70 scale-[1.02]'
          : 'border-slate-300 hover:border-brand-400 hover:bg-brand-50/50'
          }`}
      >
        {isDragging ? (
          <UploadCloud className="w-12 h-12 text-brand-500 mx-auto mb-3 animate-bounce" />
        ) : (
          <Camera className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        )}
        <p className={`text-sm font-medium ${isDragging ? 'text-brand-700' : 'text-slate-700'}`}>
          {isDragging ? 'Drop image here!' : 'Tap or drag to upload a photo'}
        </p>
        <p className="text-xs text-slate-500 mt-1">JPG or PNG, max 10MB</p>
      </label>

      {validation && !validation.passed && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg space-y-1.5">
          {!validation.checks.fileType.passed && (
            <ValidationCheckItem passed={false} label={validation.checks.fileType.message} />
          )}
          {!validation.checks.resolution.passed && (
            <ValidationCheckItem passed={false} label={validation.checks.resolution.message} />
          )}
          {!validation.checks.hasExif.passed && (
            <ValidationCheckItem passed={false} label={validation.checks.hasExif.message} />
          )}
          {!validation.checks.fileSize.passed && (
            <ValidationCheckItem passed={false} label={validation.checks.fileSize.message} />
          )}
          {!validation.checks.isNotAi.passed && (
            <ValidationCheckItem passed={false} label={validation.checks.isNotAi.message} />
          )}
        </div>
      )}
    </div>
  );
}
