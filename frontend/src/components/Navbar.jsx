import { Layers, Wifi, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [networkStatus, setNetworkStatus] = useState({ connected: false, bssid: null, loading: true });

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const response = await fetch('/network');
        const data = await response.json();
        
        if (data.success && data.data?.connections?.length > 0) {
          setNetworkStatus({ 
            connected: true, 
            bssid: data.data.connections[0].bssid || 'Local Network',
            loading: false 
          });
        } else {
          setNetworkStatus({ connected: false, bssid: null, loading: false });
        }
      } catch (error) {
        console.error('Error checking network:', error);
        setNetworkStatus({ connected: false, bssid: null, loading: false });
      }
    };

    checkNetwork();
    // Poll every 10 seconds to keep network status updated
    const intervalId = setInterval(checkNetwork, 10000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <nav className="flex items-center justify-between py-6 px-8 border-b border-[var(--color-border)]">
      <div className="flex items-center gap-3">
        <Layers className="w-6 h-6 text-[var(--color-accent)]" />
        <span className="font-medium text-lg tracking-tight">FileFlow</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        {networkStatus.loading ? (
          <span className="text-[var(--color-text-secondary)]">Checking network...</span>
        ) : networkStatus.connected ? (
          <>
            <Wifi className="w-4 h-4 text-green-500" />
            <span className="text-[var(--color-text-secondary)]">
              Connected to {networkStatus.bssid}
            </span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-500" />
            <span className="text-red-500 font-medium">Not Connected</span>
          </>
        )}
      </div>
    </nav>
  );
}
