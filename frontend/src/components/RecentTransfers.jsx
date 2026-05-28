import { File, Download, CheckCircle2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const MOCK_TRANSFERS = [
  { id: 1, name: 'project_assets.zip', size: '24.5 MB', time: '2 mins ago', type: 'received' },
  { id: 2, name: 'Q3_Report_Final.pdf', size: '3.2 MB', time: '1 hour ago', type: 'sent' },
];

export default function RecentTransfers() {
  return (
    <div className="flex flex-col gap-4 mt-8">
      <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Recent Transfers</h2>
      <div className="flex flex-col gap-3">
        {MOCK_TRANSFERS.map((file) => (
          <div key={file.id} className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] transition-colors shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-[var(--color-background)] rounded-lg border border-[var(--color-border)]">
                <File className="w-5 h-5 text-[var(--color-text-secondary)]" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-sm text-[var(--color-text-primary)]">{file.name}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[var(--color-text-secondary)]">{file.size}</span>
                  <span className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
                  <span className="text-xs text-[var(--color-text-secondary)]">{file.time}</span>
                  <span className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
                  <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                    {file.type === 'received' ? <ArrowDownLeft className="w-3 h-3 text-green-500" /> : <ArrowUpRight className="w-3 h-3 text-blue-500" />}
                    {file.type === 'received' ? 'Received' : 'Sent'}
                  </span>
                </div>
              </div>
            </div>
            {file.type === 'received' && (
              <button className="p-2 rounded-lg hover:bg-[var(--color-background)] transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-transparent hover:border-[var(--color-border)]">
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
