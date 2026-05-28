import { UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FileTransferArea() {
  return (
    <div className="flex flex-col gap-4 mt-8">
      <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Transfer File</h2>
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="relative border-2 border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)] p-12 flex flex-col items-center justify-center gap-4 transition-colors hover:border-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] cursor-pointer shadow-sm"
      >
        <div className="p-4 bg-[var(--color-background)] rounded-full border border-[var(--color-border)] shadow-sm">
          <UploadCloud className="w-8 h-8 text-[var(--color-text-primary)]" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">Drag and drop your files here</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">or click to browse from your computer</p>
        </div>
      </motion.div>
    </div>
  );
}
