import { Laptop, Smartphone, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { socket } from '../App';

const getIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'smartphone': return <Smartphone className="w-5 h-5 text-[var(--color-text-secondary)]" />;
    case 'desktop': return <Monitor className="w-5 h-5 text-[var(--color-text-secondary)]" />;
    default: return <Laptop className="w-5 h-5 text-[var(--color-text-secondary)]" />;
  }
};

export default function DeviceList() {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const handleDevicesUpdated = (activeDevices) => {
      // Filter out our own device
      const nearbyDevices = activeDevices.filter(device => device.socketId !== socket.id);
      
      const mappedDevices = nearbyDevices.map(device => ({
        id: device.socketId,
        name: device.deviceName,
        type: device.deviceType,
        ip: device.ipAddress,
        status: 'online'
      }));
      
      setDevices(mappedDevices);
    };

    socket.on('NETWORK_DEVICES_UPDATED', handleDevicesUpdated);

    return () => {
      socket.off('NETWORK_DEVICES_UPDATED', handleDevicesUpdated);
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Nearby Devices</h2>
      
      {devices.length === 0 ? (
        <div className="p-8 border border-dashed border-[var(--color-border)] rounded-xl flex flex-col items-center justify-center text-center bg-[var(--color-surface)] opacity-70">
          <Laptop className="w-8 h-8 mb-3 text-[var(--color-text-secondary)] opacity-50" />
          <p className="text-[var(--color-text-secondary)] text-sm">No other devices found on this network yet.</p>
          <p className="text-xs text-[var(--color-text-secondary)] opacity-60 mt-1">Waiting for others to connect...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {devices.map((device) => (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={device.id}
              className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-text-primary)] cursor-pointer transition-colors shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-[var(--color-background)] rounded-lg border border-[var(--color-border)]">
                  {getIcon(device.type)}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-[var(--color-text-primary)]">{device.name}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs text-[var(--color-text-secondary)] capitalize">{device.status} ({device.ip})</span>
                  </div>
                </div>
              </div>
              <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--color-text-primary)] text-black hover:bg-gray-200 transition-colors shadow-sm">
                Send
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
