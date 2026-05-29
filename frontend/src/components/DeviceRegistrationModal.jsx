import { useState } from 'react';

export default function DeviceRegistrationModal({ onComplete }) {
  const [deviceName, setDeviceName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = deviceName.trim();
    if (trimmed) {
      localStorage.setItem('fileflow_device_name', trimmed);
      onComplete(trimmed);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-2xl shadow-xl w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-2 text-[var(--color-text-primary)]">Welcome to FileFlow</h2>
        <p className="text-[var(--color-text-secondary)] text-sm mb-6">
          Please enter a name for this device so others on the network can identify you.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="e.g., Alex's MacBook Pro"
            autoFocus
            className="w-full px-4 py-2 bg-[var(--color-background)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-text-primary)] transition-colors"
            required
          />
          <button
            type="submit"
            disabled={!deviceName.trim()}
            className="w-full py-2 bg-[var(--color-text-primary)] text-black font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
