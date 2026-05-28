import Navbar from './components/Navbar';
import DeviceList from './components/DeviceList';
import FileTransferArea from './components/FileTransferArea';
import RecentTransfers from './components/RecentTransfers';

function App() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] selection:bg-white selection:text-black font-sans">
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
