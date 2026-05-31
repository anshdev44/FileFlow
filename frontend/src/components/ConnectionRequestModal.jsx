import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Laptop, Smartphone, X, Check } from 'lucide-react';

export default function ConnectionRequestModal({ senderName, onAccept, onDecline }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="relative w-full max-w-sm mx-4 p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
          style={{ boxShadow: '0 0 60px rgba(0,0,0,0.5)' }}
        >
          {/* Pulse ring animation */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.6, 1.6], opacity: [0.4, 0, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full border-2 border-emerald-400"
              />
              <motion.div
                animate={{ scale: [1, 1.35, 1.35], opacity: [0.3, 0, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
                className="absolute inset-0 rounded-full border-2 border-emerald-400"
              />
              <div className="relative w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Monitor className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>

          <h3 className="text-center text-lg font-semibold text-[var(--color-text-primary)] mb-1">
            Connection Request
          </h3>
          <p className="text-center text-sm text-[var(--color-text-secondary)] mb-6">
            <span className="text-[var(--color-text-primary)] font-medium">{senderName}</span> wants to connect and send you files.
          </p>

          <div className="flex gap-3">
            <button
              id="decline-connection-btn"
              onClick={onDecline}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text-secondary)] hover:text-red-400 hover:border-red-500/40 transition-all duration-200 text-sm font-medium"
            >
              <X className="w-4 h-4" />
              Decline
            </button>
            <button
              id="accept-connection-btn"
              onClick={onAccept}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black transition-all duration-200 text-sm font-semibold shadow-lg shadow-emerald-500/20"
            >
              <Check className="w-4 h-4" />
              Accept
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
