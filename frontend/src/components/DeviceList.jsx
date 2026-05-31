import { Laptop, Smartphone, Monitor, RefreshCw, Loader2 } from 'lucide-react';
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

export default function DeviceList({ onConnect, pendingDeviceId, connectedDeviceId }) {
  const [devices, setDevices] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNearbyDevices = async () => {
    setRefreshing(true);
    try {
      let clientIp = '127.0.0.1';
      try {
        const ipResponse = await fetch('/getip');
        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          if (ipData.success && ipData.data) {
            const allIps = Object.values(ipData.data).flat();
            if (allIps.length > 0) {
              const lanIp = allIps.find(ip => {
                return ip.startsWith('192.168.') || ip.startsWith('10.') ||
                  /^172\.(1[6-9]|2\d|3[01])\./.test(ip);
              });
              clientIp = lanIp || allIps[0];
            }
          }
        }
      } catch (e) {
        console.error('Failed to get IP for refresh:', e);
      }
      socket.emit('Get-Nearby-Devices', { clientip: clientIp });
    } catch (err) {
      console.error('Failed to refresh devices:', err);
    }
    setTimeout(() => setRefreshing(false), 600);
  };

  useEffect(() => {
    const handleDevicesUpdated = (activeDevices) => {
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
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Nearby Devices</h2>
        <button
          id="refresh-devices-btn"
          onClick={fetchNearbyDevices}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-primary)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
          />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {devices.length === 0 ? (
        <div className="p-8 border border-dashed border-[var(--color-border)] rounded-xl flex flex-col items-center justify-center text-center bg-[var(--color-surface)] opacity-70">
          <Laptop className="w-8 h-8 mb-3 text-[var(--color-text-secondary)] opacity-50" />
          <p className="text-[var(--color-text-secondary)] text-sm">No other devices found on this network yet.</p>
          <p className="text-xs text-[var(--color-text-secondary)] opacity-60 mt-1">Waiting for others to connect...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {devices.map((device) => {
            const isPending = pendingDeviceId === device.id;
            const isConnected = connectedDeviceId === device.id;
            return (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={device.id}
                className={`flex items-center justify-between p-4 rounded-xl border bg-[var(--color-surface)] cursor-pointer transition-colors shadow-sm ${
                  isConnected 
                    ? 'border-emerald-500/30 bg-emerald-500/5' 
                    : 'border-[var(--color-border)] hover:border-[var(--color-text-primary)]'
                }`}
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
                {isConnected ? (
                  <div className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Connected
                  </div>
                ) : (
                  <button
                    id={`connect-device-${device.id}`}
                    onClick={() => onConnect?.(device)}
                    disabled={isPending || connectedDeviceId}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shadow-sm flex items-center gap-1.5 disabled:cursor-not-allowed ${
                      isPending
                        ? 'bg-[var(--color-border)] text-[var(--color-text-secondary)]'
                        : connectedDeviceId 
                          ? 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] opacity-50'
                          : 'bg-[var(--color-text-primary)] text-black hover:bg-gray-200'
                    }`}
                  >
                    {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                    {isPending ? 'Pending...' : 'Send'}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
