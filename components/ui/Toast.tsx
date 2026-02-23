'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

interface ToastProps {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: () => void;
}

export function Toast({ type, title, message, duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (type === 'success' && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [type, duration, onClose]);

  const styles = {
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-green-600',
      title: 'text-green-800',
      message: 'text-green-600',
      button: 'text-green-400 hover:text-green-600',
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-600',
      title: 'text-red-800',
      message: 'text-red-600',
      button: 'text-red-400 hover:text-red-600',
    },
  };

  const style = styles[type];
  const Icon = type === 'success' ? CheckCircle : XCircle;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 border rounded-xl shadow-lg max-w-sm transition-all duration-300 ${
        style.container
      } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${style.icon}`} />
      <div className="flex-1">
        <p className={`text-sm font-medium ${style.title}`}>{title}</p>
        {message && <p className={`text-xs ${style.message}`}>{message}</p>}
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className={`p-1 ${style.button} transition-colors`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
