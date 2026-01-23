import React, { useState } from 'react';
import { Shield, Lock, ArrowRight, CreditCard, Loader2 } from 'lucide-react';
import { useToast } from './ui/ToastSystem';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'ID_CARD' | 'PIN'>('ID_CARD');
  const { addToast } = useToast();

  const handleSimulatedAuth = () => {
    setIsLoading(true);
    
    // Simulation stages of a smart card handshake
    setTimeout(() => {
        addToast("NFC-Verbindung zum Ausweis hergestellt...", "info");
    }, 800);

    setTimeout(() => {
        addToast("Zertifikat 'Bundesdruckerei GmbH' verifiziert", "info");
    }, 2000);

    setTimeout(() => {
        addToast("Authentifizierung erfolgreich", "success");
        setIsLoading(false);
        onLogin();
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      
      {/* Official Header Look */}
      <div className="absolute top-0 w-full bg-white border-b border-slate-200 h-16 flex items-center px-8">
         <div className="flex items-center gap-3">
             <div className="bg-slate-900 p-1.5 rounded">
                <Shield className="h-5 w-5 text-white" />
             </div>
             <span className="font-bold text-slate-900 tracking-tight">GovChain<span className="font-light">ID</span></span>
         </div>
         <div className="ml-auto text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
             Sichere Verbindung • TLS 1.3
         </div>
      </div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gov-blue p-8 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-blue-900/20 pattern-grid-lg"></div>
           <div className="relative z-10">
               <Shield className="h-12 w-12 text-white mx-auto mb-4" />
               <h2 className="text-2xl font-bold text-white">Behördenzugang</h2>
               <p className="text-blue-100 text-sm mt-2">Bitte authentifizieren Sie sich mit Ihrer Dienstkarte oder dem nPA.</p>
           </div>
        </div>

        {/* Content Section */}
        <div className="p-8">
            {isLoading ? (
                <div className="flex flex-col items-center py-8">
                    <Loader2 className="h-12 w-12 text-gov-blue animate-spin mb-6" />
                    <h3 className="text-lg font-semibold text-slate-900">Prüfe Identität...</h3>
                    <p className="text-slate-500 text-sm mt-2 text-center max-w-xs">
                        Bitte entfernen Sie Ihre Karte nicht vom Lesegerät.
                        Kryptografischer Handshake läuft.
                    </p>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-8 overflow-hidden">
                        <div className="bg-gov-blue h-full rounded-full animate-progress origin-left w-full" style={{animationDuration: '3s'}}></div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                        <Info className="h-5 w-5 text-gov-blue flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-900">
                            Dieser Bereich ist nur für autorisiertes Personal der Bundesverwaltung zugänglich (VS-NfD).
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="group relative border-2 border-slate-200 hover:border-gov-blue rounded-xl p-4 cursor-pointer transition-all hover:bg-slate-50" onClick={handleSimulatedAuth}>
                            <div className="flex items-center">
                                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm mr-4">
                                    <CreditCard className="h-6 w-6 text-gov-blue" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-slate-900">Mit AusweisApp2 anmelden</h4>
                                    <p className="text-xs text-slate-500">Für Personalausweis & eID-Karte</p>
                                </div>
                                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-gov-blue" />
                            </div>
                        </div>

                        <div className="group relative border-2 border-slate-200 hover:border-gov-blue rounded-xl p-4 cursor-pointer transition-all hover:bg-slate-50" onClick={handleSimulatedAuth}>
                            <div className="flex items-center">
                                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm mr-4">
                                    <Lock className="h-6 w-6 text-gov-blue" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-slate-900">Dienstzertifikat (Soft-Token)</h4>
                                    <p className="text-xs text-slate-500">Für mobile Endgeräte</p>
                                </div>
                                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-gov-blue" />
                            </div>
                        </div>
                    </div>

                    <div className="text-center pt-4">
                        <a href="#" className="text-xs text-slate-400 hover:text-gov-blue">Hilfe bei der Anmeldung?</a>
                    </div>
                </div>
            )}
        </div>
        
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
            <span>v2.4.0-stable</span>
            <span>Datenschutz & Impressum</span>
        </div>
      </div>
    </div>
  );
};

function Info(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
}

export default LoginScreen;