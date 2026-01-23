import React, { useState } from 'react';
import { Smartphone, Shield, QrCode, CheckCircle, UserPlus, CreditCard, Scan, ArrowRight, Loader2 } from 'lucide-react';
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

  const handleIssue = async () => {
    if (!user) return;
    setIsIssuing(true);
    
    try {
      // Simulate signing delay
      await new Promise(r => setTimeout(r, 2000));
      
      const claims: Record<string, string> = {
          "Nationality": "DE",
          "BirthDate": "1985-04-12",
          "Authority": user.department
      };

      if (idType === 'DriverLicense') {
          claims["Class"] = "B, A1";
          claims["ValidUntil"] = "2035-04-12";
      }

      const vc = await DbService.issueCredential(
          `did:web:bund.de:${user.role.toLowerCase()}`,
          holderName,
          idType,
          claims
      );

      await DbService.createAuditLog(user.id, 'ISSUE_CREDENTIAL', JSON.stringify({ type: idType, vcId: vc.id }));
      
      setWalletCreds(prev => [vc, ...prev]);
      addToast("Digitaler Nachweis erfolgreich signiert & ausgestellt", "success");
      setActiveTab('WALLET');
    } catch (e) {
      addToast("Fehler bei der Ausstellung", "error");
    } finally {
      setIsIssuing(false);
    }
  };

  const handleVerify = () => {
      setIsScanning(true);
      setVerifyResult(null);
      setTimeout(() => {
          setIsScanning(false);
          setVerifyResult('VALID');
          DbService.createAuditLog(user?.id || 'anon', 'VERIFY_CREDENTIAL', 'QR-Scan success');
          addToast("Nachweis kryptografisch verifiziert (ZKP)", "success");
      }, 2500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Self-Sovereign Identity (SSI)</h2>
        <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
          Der komplette Lebenszyklus einer digitalen Identität: Von der behördlichen Ausstellung in die Bürger-Wallet bis zur Prüfung.
        </p>
      </div>

      {/* Role Switcher Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm inline-flex">
          <button 
             onClick={() => setActiveTab('ISSUER')}
             className={`flex items-center px-6 py-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'ISSUER' ? 'bg-gov-blue text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
          >
             <Shield className="w-4 h-4 mr-2" />
             Behörde (Issuer)
          </button>
          <button 
             onClick={() => setActiveTab('WALLET')}
             className={`flex items-center px-6 py-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'WALLET' ? 'bg-gov-blue text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
          >
             <Smartphone className="w-4 h-4 mr-2" />
             Bürger (Wallet)
          </button>
          <button 
             onClick={() => setActiveTab('VERIFIER')}
             className={`flex items-center px-6 py-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'VERIFIER' ? 'bg-gov-blue text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
          >
             <Scan className="w-4 h-4 mr-2" />
             Prüfer (Verifier)
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        
        {/* Main Interaction Area */}
        <div className="md:col-span-7 space-y-6">
            
            {activeTab === 'ISSUER' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 animate-in fade-in slide-in-from-left-4">
                    <div className="border-b border-slate-100 pb-4 mb-6">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center">
                            <UserPlus className="w-6 h-6 mr-3 text-gov-blue"/>
                            Neuen Ausweis ausstellen
                        </h3>
                        <p className="text-slate-500 text-sm mt-1">Ausstellende Stelle: {user?.department || 'Bundesdruckerei'}</p>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name des Bürgers</label>
                            <input 
                                type="text" 
                                value={holderName}
                                onChange={(e) => setHolderName(e.target.value)}
                                className="block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-gov-blue focus:border-gov-blue"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Art des Nachweises</label>
                            <select 
                                value={idType}
                                onChange={(e) => setIdType(e.target.value as any)}
                                className="block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-gov-blue focus:border-gov-blue"
                            >
                                <option value="IdentityCard">Personalausweis (eID)</option>
                                <option value="DriverLicense">Führerschein</option>
                                <option value="EmployeeBadge">Dienstausweis (Bund)</option>
                            </select>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600">
                            <h4 className="font-semibold mb-2 flex items-center"><Shield className="w-3 h-3 mr-1"/> Trust Chain</h4>
                            <p>Das Credential wird mit dem privaten Schlüssel der Behörde ({user?.role}) signiert. Der Public Key ist im DID Registry Smart Contract hinterlegt.</p>
                        </div>

                        <button
                            onClick={handleIssue}
                            disabled={isIssuing}
                            className="w-full flex items-center justify-center py-3 px-4 bg-gov-blue text-white rounded-lg hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-70"
                        >
                            {isIssuing ? (
                                <><Loader2 className="animate-spin w-5 h-5 mr-2" /> Signiere & Stelle aus...</>
                            ) : (
                                <>Credential Ausstellen <ArrowRight className="w-5 h-5 ml-2"/></>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'WALLET' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 animate-in fade-in slide-in-from-right-4">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                        <CreditCard className="w-6 h-6 mr-3 text-gov-blue"/>
                        Meine Digitale Brieftasche
                    </h3>

                    {walletCreds.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                            <Smartphone className="w-12 h-12 text-slate-300 mx-auto mb-3"/>
                            <p className="text-slate-500 font-medium">Wallet ist leer</p>
                            <p className="text-xs text-slate-400">Wechseln Sie zum "Issuer" Tab um Ausweise zu erhalten.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {walletCreds.map((cred) => (
                                <div 
                                    key={cred.id} 
                                    onClick={() => setSelectedCard(cred)}
                                    className={`cursor-pointer p-4 rounded-xl border transition-all hover:shadow-md relative overflow-hidden group
                                        ${selectedCard?.id === cred.id ? 'border-gov-blue ring-1 ring-gov-blue bg-blue-50' : 'border-slate-200 bg-white'}
                                    `}
                                >
                                    <div className="flex justify-between items-start relative z-10">
                                        <div>
                                            <h4 className="font-bold text-slate-900">
                                                {cred.type === 'IdentityCard' ? 'Bundespersonalausweis' : 
                                                 cred.type === 'DriverLicense' ? 'Führerschein' : 'Dienstausweis'}
                                            </h4>
                                            <p className="text-sm text-slate-500 mt-1">{cred.holderName}</p>
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                            {cred.type === 'IdentityCard' ? <UserPlus className="w-4 h-4"/> : <CreditCard className="w-4 h-4"/>}
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center text-xs text-slate-400 gap-4">
                                        <span>Gültig bis: 2035</span>
                                        <span className="flex items-center text-green-600"><CheckCircle className="w-3 h-3 mr-1"/> Verifiziert</span>
                                    </div>
                                    {/* Decorative bg */}
                                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'VERIFIER' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 animate-in fade-in">
                     <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                        <Scan className="w-6 h-6 mr-3 text-gov-blue"/>
                        Nachweis Prüfen
                    </h3>
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="relative">
                            <div className={`w-64 h-64 bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden relative ${isScanning ? 'ring-4 ring-gov-blue ring-opacity-50' : ''}`}>
                                {!verifyResult && !isScanning && (
                                    <QrCode className="w-32 h-32 text-slate-700 opacity-50" />
                                )}
                                {isScanning && (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent w-full h-8 animate-scan top-0"></div>
                                        <p className="text-blue-400 font-mono text-xs absolute bottom-4">Verifying ZK-Proof...</p>
                                    </>
                                )}
                                {verifyResult === 'VALID' && (
                                    <div className="bg-green-500 rounded-full p-4 animate-in zoom-in">
                                        <CheckCircle className="w-16 h-16 text-white" />
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="mt-8 w-full max-w-xs">
                             <button
                                onClick={handleVerify}
                                disabled={isScanning || walletCreds.length === 0}
                                className="w-full py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                             >
                                 {isScanning ? 'Prüfung läuft...' : walletCreds.length === 0 ? 'Kein Ausweis in Wallet' : 'QR-Code Scannen'}
                             </button>
                             {verifyResult === 'VALID' && (
                                 <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                                     <p className="text-green-800 font-bold">Gültiger Nachweis</p>
                                     <p className="text-xs text-green-600 mt-1">Signatur der Bundesdruckerei bestätigt.</p>
                                 </div>
                             )}
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Info / Visualisation Sidebar */}
        <div className="md:col-span-5 space-y-6">
            {/* Phone Mockup for Wallet View */}
            <div className="bg-slate-800 rounded-[2.5rem] border-[8px] border-slate-900 p-4 shadow-2xl relative overflow-hidden min-h-[500px]">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-xl z-20"></div>
                
                {/* Screen Content */}
                <div className="h-full bg-white rounded-[1.5rem] overflow-hidden flex flex-col relative">
                    {/* Status Bar */}
                    <div className="h-8 bg-slate-100 w-full flex justify-between px-6 items-center text-[10px] text-slate-500">
                        <span>14:32</span>
                        <div className="flex gap-1">
                            <span>5G</span>
                            <span>100%</span>
                        </div>
                    </div>

                    {/* App Header */}
                    <div className="bg-gov-blue text-white p-6 pt-8">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-bold text-lg">BundesIdent</span>
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                                {user?.name.charAt(0) || 'U'}
                            </div>
                        </div>
                        <p className="text-blue-200 text-xs">Willkommen zurück</p>
                    </div>

                    {/* App Body */}
                    <div className="p-4 flex-1 bg-slate-50 overflow-y-auto">
                        {activeTab === 'WALLET' && selectedCard ? (
                             <div className="animate-in slide-in-from-bottom-10 duration-500">
                                 {/* Digital Card Visual */}
                                 <div className="aspect-[1.58] bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-5 text-white shadow-xl relative overflow-hidden mb-6">
                                     {/* Hologram effect */}
                                     <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                                     <div className="absolute bottom-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                     
                                     <div className="flex justify-between items-start mb-6">
                                         <div className="flex items-center gap-2">
                                             <Shield className="w-4 h-4 text-gov-accent"/>
                                             <span className="text-[10px] uppercase tracking-widest opacity-80">Bundesrepublik Deutschland</span>
                                         </div>
                                         <span className="font-mono text-xs opacity-60">IDD</span>
                                     </div>
                                     
                                     <div className="flex gap-4">
                                         <div className="w-16 h-20 bg-slate-500/30 rounded border border-white/10"></div>
                                         <div className="space-y-1">
                                             <p className="text-[10px] uppercase opacity-60">Name</p>
                                             <p className="font-bold text-sm">{selectedCard.holderName}</p>
                                             <p className="text-[10px] uppercase opacity-60 mt-2">Ausweis-Nr.</p>
                                             <p className="font-mono text-xs">{selectedCard.id.substring(0,8).toUpperCase()}</p>
                                         </div>
                                     </div>
                                 </div>

                                 <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                                     <h5 className="font-bold text-slate-900 mb-2">Datenfreigabe</h5>
                                     <p className="text-xs text-slate-500 mb-4">Generiere QR-Code für Prüfer</p>
                                     <div className="flex justify-center">
                                         <QrCode className="w-32 h-32 text-slate-900"/>
                                     </div>
                                 </div>
                                 
                                 <button onClick={() => setSelectedCard(null)} className="text-sm text-center w-full text-slate-500 hover:text-slate-800">
                                     Zurück zur Übersicht
                                 </button>
                             </div>
                        ) : (
                            /* Wallet List / Empty State inside Phone */
                            <div className="space-y-3">
                                {walletCreds.length > 0 ? (
                                    walletCreds.map(c => (
                                        <div key={c.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3 border border-slate-100">
                                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-gov-blue">
                                                {c.type === 'DriverLicense' ? <CreditCard className="w-5 h-5"/> : <UserPlus className="w-5 h-5"/>}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-sm text-slate-900">{c.type}</p>
                                                <p className="text-[10px] text-slate-400">Gültig</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center pt-10 opacity-50">
                                        <Smartphone className="w-8 h-8 mx-auto mb-2"/>
                                        <p className="text-xs">Keine Ausweise</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Bottom Nav Mockup */}
                    <div className="h-14 bg-white border-t border-slate-100 flex justify-around items-center px-4">
                        <div className="w-6 h-6 bg-slate-200 rounded-full"></div>
                        <div className="w-6 h-6 bg-slate-100 rounded-full"></div>
                        <div className="w-6 h-6 bg-slate-100 rounded-full"></div>
                    </div>
                </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800">
                <h4 className="font-bold mb-2 flex items-center"><Info className="w-4 h-4 mr-2"/> DID-Technologie</h4>
                <p>
                    Hier wird das <strong>W3C DID (Decentralized Identifier)</strong> Protokoll simuliert. 
                    Der Nutzer hält seine Identität auf dem Endgerät (Edge), die Behörde signiert nur den Hash. 
                    Bei der Prüfung werden keine Daten an einen Server gesendet (Privacy-by-Design).
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

// Helper components
function Info(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
}

export default SSIDemo;