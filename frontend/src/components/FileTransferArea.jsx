import { UploadCloud, X } from 'lucide-react';
import { motion } from 'framer-motion';
import CircularProgress from './CircularProgress';

export default function FileTransferArea({ connectedDevice, transactionRoomId, transferProgress, onDisconnect }) {
  if (!connectedDevice) {
    return (
      <div className="flex flex-col gap-4 mt-8">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Transfer File</h2>
        <div className="relative border-2 border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)] p-12 flex flex-col items-center justify-center gap-4 opacity-50">
          <div className="p-4 bg-[var(--color-background)] rounded-full border border-[var(--color-border)] shadow-sm">
            <UploadCloud className="w-8 h-8 text-[var(--color-text-secondary)]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">Select a device to connect</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">You need to connect to a device before transferring files.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
          Connected to {connectedDevice.name}
        </h2>
        <button
          onClick={onDisconnect}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-red-400 hover:text-red-300 hover:border-red-500/40 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Disconnect
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="relative border-2 border-dashed border-[var(--color-accent)] border-opacity-50 rounded-2xl bg-[var(--color-surface)] p-12 flex flex-col items-center justify-center gap-4 transition-colors hover:border-opacity-100 cursor-pointer shadow-sm"
        >
          <div className="p-4 bg-[var(--color-background)] rounded-full border border-[var(--color-border)] shadow-sm">
            <UploadCloud className="w-8 h-8 text-[var(--color-text-primary)]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">Drag and drop your files here</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">or click to browse from your computer</p>
          </div>
        </motion.div>
        
        <div className="flex flex-col items-center justify-center border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)] p-8">
           <CircularProgress progress={transferProgress} label="Ready to transfer" />
        </div>
      </div>
    </div>
  );
}
