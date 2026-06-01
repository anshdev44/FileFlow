import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import Navbar from './components/Navbar';
import DeviceList from './components/DeviceList';
import FileTransferArea from './components/FileTransferArea';
import DeviceRegistrationModal from './components/DeviceRegistrationModal';
import ConnectionRequestModal from './components/ConnectionRequestModal';
import { ToastContainer } from './components/Toast';

export const socket = io();

let toastIdCounter = 0;

function App() {
  const [showRegistration, setShowRegistration] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [pendingDeviceId, setPendingDeviceId] = useState(null);
  const [connectionRequest, setConnectionRequest] = useState(null); // { senderName, senderSocketId }
  const [connectedDevice, setConnectedDevice] = useState(null); // { name, socketId }
  const [transactionRoomId, setTransactionRoomId] = useState(null);
  const [transferProgress, setTransferProgress] = useState(0);

  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

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

  // Connection flow socket listeners
  useEffect(() => {
    // Someone is requesting to connect to us
    const handleConnectionRequest = ({ senderName, SenderSocketid }) => {
      setConnectionRequest({ senderName, senderSocketId: SenderSocketid });
    };

    // Our request was accepted
    const handleConnectionAccepted = ({ transactionRoomId, acceptorName, acceptorSocketId }) => {
      setTransactionRoomId(transactionRoomId);
      setConnectedDevice({ name: acceptorName, socketId: acceptorSocketId });
      setPendingDeviceId(null);
      addToast('Connection accepted! You are now connected.', 'success');
    };

    // Our request was declined
    const handleConnectionDeclined = () => {
      setPendingDeviceId(null);
      addToast('Connection request was declined.', 'error');
    };

    // Room was closed by the other user
    const handleRoomClosed = () => {
      const deviceName = connectedDevice?.name || 'device';
      setConnectedDevice(null);
      setTransactionRoomId(null);
      setTransferProgress(0);
      addToast(`${deviceName} has disconnected from the room.`, 'info');
    };

    socket.on('Connection-Request', handleConnectionRequest);
    socket.on('Connection-Accepted', handleConnectionAccepted);
    socket.on('Connection-Declined', handleConnectionDeclined);
    socket.on('Room-Closed-Req', handleRoomClosed);

    return () => {
      socket.off('Connection-Request', handleConnectionRequest);
      socket.off('Connection-Accepted', handleConnectionAccepted);
      socket.off('Connection-Declined', handleConnectionDeclined);
      socket.off('Room-Closed-Req', handleRoomClosed);
    };
  }, [addToast, connectedDevice?.name]);

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

  // Send connection request to a device
  const handleConnect = (device) => {
    const senderName = localStorage.getItem('fileflow_device_name') || 'Unknown';
    setPendingDeviceId(device.id);
    socket.emit('Connection', {
      socketID: device.id,
      senderName
    });
    addToast(`Connection request sent to ${device.name}`, 'info');
  };

  // Accept incoming connection
  const handleAcceptConnection = () => {
    if (!connectionRequest) return;
    const myName = localStorage.getItem('fileflow_device_name') || 'Unknown';
    socket.emit('Respond-Connection', {
      accepted: true,
      senderSocketId: connectionRequest.senderSocketId,
      acceptorName: myName
    });
    setConnectedDevice({ name: connectionRequest.senderName, socketId: connectionRequest.senderSocketId });
    // The room ID follows the backend pattern: {senderSocketId}-{acceptorSocketId}
    setTransactionRoomId(`${connectionRequest.senderSocketId}-${socket.id}`);
    addToast(`Connected with ${connectionRequest.senderName}!`, 'success');
    setConnectionRequest(null);
  };

  // Decline incoming connection
  const handleDeclineConnection = () => {
    if (!connectionRequest) return;
    socket.emit('Respond-Connection', {
      accepted: false,
      senderSocketId: connectionRequest.senderSocketId
    });
    addToast('Connection request declined.', 'info');
    setConnectionRequest(null);
  };

  // Disconnect from current session
  const handleDisconnect = () => {
    if (transactionRoomId) {
      socket.emit('Disconnect-room', {
        RoomName: transactionRoomId
      });
    }
    addToast(`Disconnected from ${connectedDevice?.name || 'device'}.`, 'info');
    setConnectedDevice(null);
    setTransactionRoomId(null);
    setTransferProgress(0);
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] selection:bg-white selection:text-black font-sans relative">
      {showRegistration && <DeviceRegistrationModal onComplete={handleRegistrationComplete} />}
      
      {connectionRequest && (
        <ConnectionRequestModal
          senderName={connectionRequest.senderName}
          onAccept={handleAcceptConnection}
          onDecline={handleDeclineConnection}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-8">
        <header className="mb-2">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">Overview</h1>
          <p className="text-[var(--color-text-secondary)] mt-2 text-sm">Send and receive files seamlessly on your local network.</p>
        </header>
        
        <DeviceList
          onConnect={handleConnect}
          pendingDeviceId={pendingDeviceId}
          connectedDeviceId={connectedDevice?.socketId}
        />
        
        <div className="flex flex-col gap-8">
          <FileTransferArea
            connectedDevice={connectedDevice}
            transactionRoomId={transactionRoomId}
            transferProgress={transferProgress}
            onDisconnect={handleDisconnect}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
