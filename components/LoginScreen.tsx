import React, { useState } from 'react';
import { Shield, Lock, ArrowRight, CreditCard, Loader2, UserCog, User } from 'lucide-react';
import { useToast } from './ui/ToastSystem';
import { useUser } from '../contexts/UserContext';

const LoginScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'EDITOR' | null>(null);
  const { addToast } = useToast();
  const { login } = useUser();

  const handleSimulatedAuth = (role: 'ADMIN' | 'EDITOR') => {
    if (isLoading) return;
    setSelectedRole(role);
    setIsLoading(true);
    
    // Simulation stages of a smart card handshake
    const steps = [
        { time: 800, msg: "NFC-Verbindung zum Ausweis hergestellt...", type: "info" as const },
        { time: 2000, msg: role === 'ADMIN' ? "Admin-Zertifikat (VS-NfD) verifiziert" : "Dienstausweis BVA verifiziert", type: "info" as const },
        { time: 3000, msg: "Authentifizierung erfolgreich", type: "success" as const }
    ];

    steps.forEach(({ time, msg, type }) => {
        setTimeout(() => {
            addToast(msg, type);
            if (msg === "Authentifizierung erfolgreich") {
                setIsLoading(false);
                login(role);
            }
        }, time);
    });
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
                    <h3 className="text-lg font-semibold text-slate-900">
                        {selectedRole === 'ADMIN' ? 'Prüfe Admin-Berechtigung...' : 'Lese Ausweisdaten...'}
                    </h3>
                    <p className="text-slate-500 text-sm mt-2 text-center max-w-xs">
                        Bitte entfernen Sie Ihre Karte nicht vom Lesegerät.
                        Kryptografischer Handshake läuft.
                    </p>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-8 overflow-hidden">
                        <div className="bg-gov-blue h-full rounded-full animate-progress origin-left w-full" style={{animationDuration: '2.5s'}}></div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                        <Lock className="h-5 w-5 text-gov-blue flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-900">
                            Wählen Sie eine Persona für die Demonstration:
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Admin Persona */}
                        <div 
                            className="group relative border-2 border-slate-200 hover:border-gov-blue rounded-xl p-4 cursor-pointer transition-all hover:bg-slate-50 hover:shadow-md" 
                            onClick={() => handleSimulatedAuth('ADMIN')}
                        >
                            <div className="flex items-center">
                                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm mr-4">
                                    <UserCog className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-slate-900">Als Administrator anmelden</h4>
                                    <p className="text-xs text-slate-500">Ref. Leitung (Vollzugriff)</p>
                                </div>
                                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-gov-blue" />
                            </div>
                        </div>

                        {/* Editor Persona */}
                        <div 
                            className="group relative border-2 border-slate-200 hover:border-gov-blue rounded-xl p-4 cursor-pointer transition-all hover:bg-slate-50 hover:shadow-md" 
                            onClick={() => handleSimulatedAuth('EDITOR')}
                        >
                            <div className="flex items-center">
                                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm mr-4">
                                    <User className="h-6 w-6 text-gov-blue" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-slate-900">Als Sachbearbeiter anmelden</h4>
                                    <p className="text-xs text-slate-500">BVA Standardzugriff</p>
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

export default LoginScreen;