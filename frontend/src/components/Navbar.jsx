import { Layers } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between py-6 px-8 border-b border-[var(--color-border)]">
      <div className="flex items-center gap-3">
        <Layers className="w-6 h-6 text-[var(--color-accent)]" />
        <span className="font-medium text-lg tracking-tight">FileFlow</span>
      </div>
      <div className="text-sm text-[var(--color-text-secondary)]">
        Connected to Local Network
      </div>
    </nav>
  );
}
