import { Laptop, Smartphone, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_DEVICES = [
  { id: 1, name: 'Alex’s MacBook Pro', type: 'laptop', status: 'online' },
  { id: 2, name: 'iPhone 14 Pro', type: 'smartphone', status: 'online' },
  { id: 3, name: 'Office Desktop', type: 'desktop', status: 'offline' },
];

const getIcon = (type) => {
  switch (type) {
    case 'smartphone': return <Smartphone className="w-5 h-5 text-[var(--color-text-secondary)]" />;
    case 'desktop': return <Monitor className="w-5 h-5 text-[var(--color-text-secondary)]" />;
    default: return <Laptop className="w-5 h-5 text-[var(--color-text-secondary)]" />;
  }
};

export default function DeviceList() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Nearby Devices</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {MOCK_DEVICES.map((device) => (
          <motion.div
            whileHover={device.status === 'online' ? { scale: 1.02 } : {}}
            whileTap={device.status === 'online' ? { scale: 0.98 } : {}}
            key={device.id}
            className={`flex items-center justify-between p-4 rounded-xl border ${
              device.status === 'online' 
                ? 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-text-primary)] cursor-pointer' 
                : 'border-transparent bg-[var(--color-surface)] opacity-40'
            } transition-colors shadow-sm`}
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-[var(--color-background)] rounded-lg border border-[var(--color-border)]">
                {getIcon(device.type)}
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-sm text-[var(--color-text-primary)]">{device.name}</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-2 h-2 rounded-full ${device.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <span className="text-xs text-[var(--color-text-secondary)] capitalize">{device.status}</span>
                </div>
              </div>
            </div>
            {device.status === 'online' && (
              <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--color-text-primary)] text-black hover:bg-gray-200 transition-colors shadow-sm">
                Send
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
