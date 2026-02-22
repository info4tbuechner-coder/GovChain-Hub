import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

const OfflineIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-slate-900 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
      <WifiOff className="w-3 h-3" />
      <span>Sie sind offline. Änderungen werden lokal gespeichert.</span>
    </div>
  );
};

export default OfflineIndicator;
