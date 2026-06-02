import { Layers, Wifi, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [networkStatus, setNetworkStatus] = useState({ connected: false, bssid: null, ip: null, loading: true });

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        let ip = null;
        let isConnected = false;
        let networkName = 'Local Network';
        try {
          const ipResponse = await fetch('/getip');
          if (ipResponse.ok) {
            const ipData = await ipResponse.json();
            if (ipData.success && ipData.data) {
              const interfaces = Object.values(ipData.data);
              if (interfaces.length > 0 && interfaces[0].length > 0) {
                ip = interfaces[0][0];
                isConnected = true;
              }
            }
          }
        } catch (e) {
          console.error('Error fetching IP:', e);
        }

    
        try {
          const wifiResponse = await fetch('/network');
          if (wifiResponse.ok) {
            const data = await wifiResponse.json();
            if (data.success && data.data?.connections?.length > 0) {
              networkName = data.data.connections[0].bssid || 'Wi-Fi Network';
              isConnected = true;
            }
          }
        } catch (e) {
          console.error('Error checking wifi:', e);
        }

        setNetworkStatus({ 
          connected: isConnected, 
          bssid: isConnected ? networkName : null,
          ip: ip,
          loading: false 
        });
      } catch (error) {
        console.error('Network check failed:', error);
        setNetworkStatus({ connected: false, bssid: null, ip: null, loading: false });
      }
    };

    checkNetwork();
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
              Connected to {networkStatus.bssid} {networkStatus.ip ? `(${networkStatus.ip})` : ''}
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
