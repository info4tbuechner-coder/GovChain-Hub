import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-in slide-in-from-bottom duration-500 lg:bottom-4 lg:left-auto lg:right-4 lg:w-96">
      <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">GovChain Hub installieren</p>
            <p className="text-xs text-slate-400">Für Offline-Zugriff & Push-Nachrichten</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsVisible(false)}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <button 
              onClick={handleInstallClick}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Installieren
            </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
