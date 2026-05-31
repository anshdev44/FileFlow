import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

const icons = {
  success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
  error: <XCircle className="w-5 h-5 text-red-400" />,
  info: <Info className="w-5 h-5 text-blue-400" />,
};

const borderColors = {
  success: 'border-emerald-500/30',
  error: 'border-red-500/30',
  info: 'border-blue-500/30',
};

const glowColors = {
  success: '0 0 20px rgba(16, 185, 129, 0.15)',
  error: '0 0 20px rgba(239, 68, 68, 0.15)',
  info: '0 0 20px rgba(59, 130, 246, 0.15)',
};

export default function Toast({ id, message, type = 'info', onDismiss, duration = 4000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onDismiss(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{ boxShadow: glowColors[type] }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${borderColors[type]} bg-[var(--color-surface)] backdrop-blur-sm min-w-[300px] max-w-[420px]`}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="text-sm text-[var(--color-text-primary)] flex-1">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 p-1 rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 items-end">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
