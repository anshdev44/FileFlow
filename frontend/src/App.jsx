import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DeviceList from './components/DeviceList';
import FileTransferArea from './components/FileTransferArea';
import RecentTransfers from './components/RecentTransfers';
import DeviceRegistrationModal from './components/DeviceRegistrationModal';

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
  }, []);

  const registerDevice = async (name) => {
    try {
      await fetch('/api/discovery/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceName: name,
          deviceType: 'desktop'
        }),
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
