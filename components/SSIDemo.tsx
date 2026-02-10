
import React, { useState } from 'react';
import { Smartphone, Shield, QrCode, CheckCircle, UserPlus, CreditCard, Scan, ArrowRight, Loader2, Database, ShieldAlert, Cpu } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useToast } from './ui/ToastSystem';
import { DbService } from '../services/mockDbService';
import { VerifiableCredential } from '../types';

const SSIDemo: React.FC = () => {
  const { user } = useUser();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'ISSUER' | 'WALLET' | 'VERIFIER'>('ISSUER');
  
  // Issuance State
  const [holderName, setHolderName] = useState('Max Bürger');
  const [idType, setIdType] = useState<VerifiableCredential['type']>('IdentityCard');
  const [isIssuing, setIsIssuing] = useState(false);

  // Wallet State
  const [walletCreds, setWalletCreds] = useState<VerifiableCredential[]>([]);
  const [selectedCard, setSelectedCard] = useState<VerifiableCredential | null>(null);

  // Verification State
  const [isScanning, setIsScanning] = useState(false);
  const [verifyResult, setVerifyResult] = useState<'VALID' | 'INVALID' | null>(null);
  const [zkpStep, setZkpStep] = useState<string>('');

  const handleIssue = async () => {
    if (!user) return;
    setIsIssuing(true);
    
    try {
      await new Promise(r => setTimeout(r, 2000));
      const claims: Record<string, string> = {
          "Nationality": "DE",
          "BirthDate": "1985-04-12",
          "Authority": user.department
      };
      if (idType === 'DriverLicense') {
          claims["Class"] = "B, A1";
      }
      const vc = await DbService.issueCredential(`did:web:bund.de:${user.role.toLowerCase()}`, holderName, idType, claims);
      setWalletCreds(prev => [vc, ...prev]);
      addToast("Digitaler Nachweis ausgestellt", "success");
      setActiveTab('WALLET');
    } finally {
      setIsIssuing(false);
    }
  };

  const handleVerify = async () => {
      setIsScanning(true);
      setVerifyResult(null);
      
      const steps = [
          "DIDComm Session...",
          "Selective Disclosure...",
          "ZK-Proof (Groth16)...",
          "On-Chain Nullifiers...",
          "Proof Validated!"
      ];

      for (const step of steps) {
          setZkpStep(step);
          await new Promise(r => setTimeout(r, 600));
      }

      setIsScanning(false);
      setVerifyResult('VALID');
      addToast("Nachweis kryptografisch verifiziert", "success");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="text-center mb-6 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Digitale Identität (SSI)</h2>
        <p className="mt-2 text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto">
          Souveräne Identitätsverwaltung ohne zentrale Datenbanken mittels eIDAS 2.0 Standards.
        </p>
      </div>

      <div className="flex justify-center mb-6">
        <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm inline-flex w-full sm:w-auto">
          <button onClick={() => setActiveTab('ISSUER')} className={`flex-1 sm:flex-none flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 text-[10px] sm:text-sm font-bold rounded-lg transition-all ${activeTab === 'ISSUER' ? 'bg-gov-blue text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
             <Shield className="w-4 h-4 mr-2" /> Behörde
          </button>
          <button onClick={() => setActiveTab('WALLET')} className={`flex-1 sm:flex-none flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 text-[10px] sm:text-sm font-bold rounded-lg transition-all ${activeTab === 'WALLET' ? 'bg-gov-blue text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
             <Smartphone className="w-4 h-4 mr-2" /> Bürger
          </button>
          <button onClick={() => setActiveTab('VERIFIER')} className={`flex-1 sm:flex-none flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 text-[10px] sm:text-sm font-bold rounded-lg transition-all ${activeTab === 'VERIFIER' ? 'bg-gov-blue text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
             <Scan className="w-4 h-4 mr-2" /> Prüfer
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-7 space-y-6">
            {activeTab === 'ISSUER' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 animate-in fade-in">
                    <div className="border-b border-slate-100 pb-4 mb-6">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center">
                            <UserPlus className="w-5 h-5 mr-3 text-gov-blue"/> Ausweis-Emission
                        </h3>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Inhaber-Name</label>
                            <input type="text" value={holderName} onChange={(e) => setHolderName(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gov-blue outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Nachweis-Typ</label>
                            <select value={idType} onChange={(e) => setIdType(e.target.value as any)} className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gov-blue outline-none bg-white">
                                <option value="IdentityCard">Personalausweis (eID)</option>
                                <option value="DriverLicense">Führerschein</option>
                                <option value="EmployeeBadge">Dienstausweis</option>
                            </select>
                        </div>
                        <button onClick={handleIssue} disabled={isIssuing} className="w-full py-4 bg-gov-blue text-white rounded-xl font-bold shadow-lg hover:bg-blue-800 disabled:opacity-50 transition-all flex justify-center items-center active:scale-95">
                            {isIssuing ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Shield className="w-5 h-5 mr-2" />}
                            Credential Signieren
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'WALLET' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 animate-in fade-in">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 flex items-center">
                        <CreditCard className="w-5 h-5 mr-3 text-gov-blue"/> Identity Wallet
                    </h3>
                    {walletCreds.length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                            <p className="text-slate-400 font-medium text-sm">Wallet leer - bitte zuerst ausstellen.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {walletCreds.map(c => (
                                <button key={c.id} onClick={() => setSelectedCard(c)} className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all active:bg-slate-100 ${selectedCard?.id === c.id ? 'border-gov-blue bg-blue-50 shadow-md' : 'border-slate-100 bg-white'}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
                                                <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-slate-900 text-sm">{c.type}</h4>
                                                <p className="text-[10px] text-slate-500 truncate">DID: {c.holderDid.substring(0,20)}...</p>
                                            </div>
                                        </div>
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'VERIFIER' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 animate-in fade-in">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 flex items-center">
                        <Scan className="w-5 h-5 mr-3 text-gov-blue"/> Proof Verification
                    </h3>
                    <div className="flex flex-col items-center">
                        <div className={`w-full max-w-[280px] sm:max-w-sm rounded-3xl bg-slate-900 aspect-square p-6 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 ${isScanning ? 'ring-8 ring-blue-500/20' : ''}`}>
                            {isScanning ? (
                                <div className="text-center space-y-6 relative z-10 animate-in zoom-in">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                                        <Cpu className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400 animate-pulse" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-blue-400 font-mono text-[10px] sm:text-sm tracking-wider uppercase">{zkpStep}</p>
                                        <div className="flex justify-center gap-1">
                                            <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></span>
                                            <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-75"></span>
                                            <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-150"></span>
                                        </div>
                                    </div>
                                </div>
                            ) : verifyResult === 'VALID' ? (
                                <div className="text-center animate-in zoom-in duration-500">
                                    <div className="bg-green-500 w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                                        <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                                    </div>
                                    <h4 className="text-lg sm:text-2xl font-bold text-white mb-1 uppercase tracking-tight">VERIFIZIERT</h4>
                                    <p className="text-green-400 font-mono text-[8px] sm:text-[10px] uppercase tracking-widest">Echtheit bestätigt</p>
                                </div>
                            ) : (
                                <div className="text-center opacity-40">
                                    <QrCode className="w-24 h-24 sm:w-32 sm:h-32 text-slate-600 mb-6 mx-auto" />
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Bereit zum Scan</p>
                                </div>
                            )}
                            {isScanning && <div className="absolute top-0 left-0 w-full h-1 bg-blue-400/50 shadow-[0_0_15px_#60a5fa] animate-scan"></div>}
                        </div>
                        
                        <div className="mt-8 w-full max-w-[280px] sm:max-w-sm">
                             <button onClick={handleVerify} disabled={isScanning || walletCreds.length === 0} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-30 transition-all flex justify-center items-center gap-2 active:scale-95">
                                 <Scan className="w-5 h-5" /> {isScanning ? 'Verifiziere...' : 'Nachweis prüfen'}
                             </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

        <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-800 rounded-[2rem] sm:rounded-[2.5rem] border-[6px] sm:border-[10px] border-slate-950 p-2 sm:p-4 shadow-2xl relative overflow-hidden min-h-[480px] sm:min-h-[550px] max-w-[320px] mx-auto lg:max-w-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-5 sm:h-7 bg-slate-950 rounded-b-2xl z-20"></div>
                <div className="h-full bg-slate-50 rounded-[1.5rem] sm:rounded-[1.8rem] overflow-hidden flex flex-col relative">
                    <div className="h-16 sm:h-20 bg-gov-blue text-white p-4 sm:p-6 pt-8 sm:pt-10 flex items-center justify-between">
                         <span className="font-bold tracking-tight text-xs sm:text-base">BundesWallet</span>
                         <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/10 rounded-full"></div>
                    </div>
                    <div className="p-3 sm:p-4 flex-1">
                        {activeTab === 'WALLET' && selectedCard ? (
                            <div className="animate-in slide-in-from-bottom-10">
                                <div className="aspect-[1.58] bg-slate-900 rounded-xl p-4 sm:p-5 text-white shadow-xl relative overflow-hidden mb-6">
                                     <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
                                     <div className="flex justify-between items-start mb-4 sm:mb-6">
                                         <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400"/>
                                         <span className="text-[7px] sm:text-[8px] font-mono opacity-40 uppercase">V-ID Secure</span>
                                     </div>
                                     <p className="text-[8px] sm:text-[10px] opacity-40 uppercase mb-0.5 sm:mb-1">Inhaber</p>
                                     <p className="font-bold text-xs sm:text-sm mb-3 sm:mb-4 truncate">{selectedCard.holderName}</p>
                                     <div className="flex justify-between items-end">
                                         <div className="min-w-0">
                                            <p className="text-[8px] sm:text-[10px] opacity-40 uppercase">DID Ref</p>
                                            <p className="font-mono text-[7px] sm:text-[8px] truncate">{selectedCard.holderDid.substring(0,18)}...</p>
                                         </div>
                                         <div className="p-1 sm:p-2 bg-white rounded-md flex-shrink-0">
                                             <QrCode className="w-8 h-8 sm:w-10 sm:h-10 text-slate-900"/>
                                         </div>
                                     </div>
                                </div>
                                <button onClick={() => setSelectedCard(null)} className="text-[10px] font-bold text-center w-full text-slate-400 hover:text-slate-600 transition-colors uppercase">Zurück</button>
                            </div>
                        ) : (
                            <div className="space-y-2 sm:space-y-3 pt-2 sm:pt-4">
                                {walletCreds.map(c => (
                                    <div key={c.id} className="bg-white p-3 sm:p-4 rounded-xl shadow-sm flex items-center gap-3 border border-slate-100">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-50 rounded-full flex items-center justify-center text-gov-blue">
                                            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-[10px] sm:text-xs text-slate-900 truncate">{c.type}</p>
                                            <p className="text-[8px] text-slate-400 uppercase tracking-tighter">Validiert • Souverän</p>
                                        </div>
                                    </div>
                                ))}
                                {walletCreds.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-40 opacity-20">
                                        <Database className="w-10 h-10 mb-2"/>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Keine Daten</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SSIDemo;
