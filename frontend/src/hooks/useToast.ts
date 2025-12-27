import { useState, useCallback } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showSuccess = useCallback((message: string, options?: { duration?: number }) => {
    const id = Date.now().toString();
    const toast: Toast = { id, message, type: 'success', duration: options?.duration };
    setToasts((prev) => [...prev, toast]);
    
    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration || 5000);
    }
  }, []);

  const showToastError = useCallback((message: string, options?: { duration?: number }) => {
    const id = Date.now().toString();
    const toast: Toast = { id, message, type: 'error', duration: options?.duration };
    setToasts((prev) => [...prev, toast]);
    
    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration || 5000);
    }
  }, []);

  const clearToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    toasts,
    showSuccess,
    showToastError,
    clearToast,
  };
};
