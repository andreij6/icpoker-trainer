import React, { useEffect } from 'react';

export interface Toast {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'error' | 'action';
}

interface ToastNotificationProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

/**
 * A single toast notification component that displays a message and auto-dismisses.
 */
const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3000); // Auto-dismiss after 3 seconds

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const typeStyles = {
    info: 'bg-blue-600/90 border-blue-400',
    success: 'bg-green-600/90 border-green-400',
    error: 'bg-red-600/90 border-red-400',
    action: 'bg-purple-600/90 border-purple-400',
  };

  const style = typeStyles[toast.type || 'info'];

  return (
    <div
      className={`${style} border-2 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-[300px] max-w-[500px] animate-slide-in`}
      role="alert"
    >
      <span className="font-semibold">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-4 text-white/80 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
};

export default ToastNotification;

