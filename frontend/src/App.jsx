import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Navbar from './components/Navbar';
import DeviceList from './components/DeviceList';
import FileTransferArea from './components/FileTransferArea';
import RecentTransfers from './components/RecentTransfers';
import DeviceRegistrationModal from './components/DeviceRegistrationModal';

export const socket = io();

function App() {
  const [showRegistration, setShowRegistration] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const deviceName = localStorage.getItem('fileflow_device_name');
    if (!deviceName) {
      setShowRegistration(true);
    } else {
      registerDevice(deviceName);
    }
    
    // Cleanup on unmount
    return () => {
      socket.off('Register-device');
    };
  }, []);

  const registerDevice = async (name) => {
    try {
      let clientIp = '127.0.0.1'; // Fallback if IP fetch fails
      try {
        const ipResponse = await fetch('/getip');
        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          if (ipData.success && ipData.data) {
            // Collect all IPs from all interfaces
            const allIps = Object.values(ipData.data).flat();
            if (allIps.length > 0) {
              // Prefer common LAN ranges: 192.168.x.x, 10.x.x.x, 172.16-31.x.x
              const lanIp = allIps.find(ip => {
                return ip.startsWith('192.168.') || ip.startsWith('10.') ||
                  /^172\.(1[6-9]|2\d|3[01])\./.test(ip);
              });
              clientIp = lanIp || allIps[0];
            }
          }
        }
      } catch (e) {
        console.error('Failed to get IP before registering:', e);
      }

      socket.emit('Register-device', {
        deviceName: name,
        deviceType: 'desktop',
        clientIp
      });
      setIsRegistered(true);
    } catch (error) {
      console.error('Failed to register device:', error);
      setIsRegistered(true); // Continue anyway for now
    }
  };

  const handleRegistrationComplete = (name) => {
    setShowRegistration(false);
    registerDevice(name);
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] selection:bg-white selection:text-black font-sans relative">
      {showRegistration && <DeviceRegistrationModal onComplete={handleRegistrationComplete} />}
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-8">
        <header className="mb-2">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">Overview</h1>
          <p className="text-[var(--color-text-secondary)] mt-2 text-sm">Send and receive files seamlessly on your local network.</p>
        </header>
        
        <DeviceList />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <FileTransferArea />
          <RecentTransfers />
        </div>
      </main>
    </div>
  );
}

export default App;
