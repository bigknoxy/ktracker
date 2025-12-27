import React, { useEffect, useRef } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastNotificationProps {
  message: string;
  type: ToastType;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  type,
  visible,
  onDismiss,
  duration = 5000,
  position = 'top-right'
}) => {
  const toastRef = useRef<HTMLDivElement>(null);

  // Auto-dismiss after duration
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, duration, onDismiss]);

  // Type-specific styling
  const typeStyles = {
    success: {
      bg: 'bg-emerald-500/95 dark:bg-emerald-600/95',
      text: 'text-white',
      icon: <CheckCircle size={20} />,
      border: 'border-emerald-400/50'
    },
    error: {
      bg: 'bg-red-500/95 dark:bg-red-600/95',
      text: 'text-white',
      icon: <XCircle size={20} />,
      border: 'border-red-400/50'
    },
    warning: {
      bg: 'bg-amber-500/95 dark:bg-amber-600/95',
      text: 'text-white',
      icon: <AlertCircle size={20} />,
      border: 'border-amber-400/50'
    },
    info: {
      bg: 'bg-blue-500/95 dark:bg-blue-600/95',
      text: 'text-white',
      icon: <Info size={20} />,
      border: 'border-blue-400/50'
    }
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  if (!visible) return null;

  return (
    <div
      ref={toastRef}
      className={`
        fixed ${positionClasses[position]} z-50
        ${typeStyles[type].bg} ${typeStyles[type].text} ${typeStyles[type].border}
        rounded-xl shadow-soft-lg border backdrop-blur-sm
        transform transition-all duration-300 ease-soft
        animate-toast-enter
        max-w-md w-full
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex-shrink-0 mt-0.5">
          <div className="animate-toast-icon">
            {typeStyles[type].icon}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium tracking-tight">
            {message}
          </p>
        </div>

        <button
          onClick={onDismiss}
          className="
            flex-shrink-0 ml-2 p-1 rounded-full hover:bg-white/20
            transition-colors duration-200 ease-soft focus:outline-none focus:ring-2 focus:ring-white/50
          "
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress bar indicating auto-dismiss */}
      <div className="h-1 bg-white/20 rounded-b-xl overflow-hidden">
        <div
          className="h-full bg-white/40 animate-toast-progress"
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  );
};

export default ToastNotification;
