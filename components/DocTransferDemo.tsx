import React, { useState, useRef } from 'react';
import { Upload, Lock, FileText, Check, Link, ShieldAlert, ArrowRight, FileCheck, Server, Search, BadgeCheck, Download } from 'lucide-react';
import { hashFile, anchorHashOnChain, verifyDocumentOnChain } from '../services/blockchainService';
import { DbService } from '../services/mockDbService';
import { DocStatus } from '../types';
import { useToast } from './ui/ToastSystem';
import { useUser } from '../contexts/UserContext';

const steps = [
  { id: DocStatus.UPLOADED, label: 'Upload & Hashing', icon: Upload },
  { id: DocStatus.HASHING, label: 'Blockchain Anker', icon: Server },
  { id: DocStatus.ANCHORED, label: 'Verifizierung', icon: Check },
];

const DocTransferDemo: React.FC = () => {
  const { addToast } = useToast();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'SEND' | 'VERIFY'>('SEND');
  
  // Send State
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<DocStatus | null>(null);
  const [hash, setHash] = useState<string>('');
  const [txId, setTxId] = useState<string>('');
  const [anchorTimestamp, setAnchorTimestamp] = useState<number | null>(null);
  
  // Verify State
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [verifyHash, setVerifyHash] = useState<string>('');
  const [verifyTxId, setVerifyTxId] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<{valid: boolean, timestamp?: number, issuer?: string} | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const verifyInputRef = useRef<HTMLInputElement>(null);

  // --- Logic: Perform Anchoring ---
  // Extracted function to allow automatic calling
  const performAnchoring = async (targetHash: string, targetFileName: string) => {
    setStatus(DocStatus.HASHING);
    try {
      const userId = user?.id || 'anon-user';
      await DbService.createAuditLog(userId, 'ANCHOR_HASH', JSON.stringify({ fileName: targetFileName }));
      
      const receipt = await anchorHashOnChain(targetHash);
      
      setTxId(receipt.txHash);
      setAnchorTimestamp(receipt.timestamp);
      setStatus(DocStatus.ANCHORED);
      
      await DbService.createAuditLog(userId, 'VERIFY_CREDENTIAL', JSON.stringify({ tx: receipt.txHash }));
      addToast("Dokument-Hash erfolgreich auf der Blockchain verankert!", "success");
    } catch (error) {
      console.error("Anchoring failed", error);
      setStatus(DocStatus.UPLOADED);
      addToast("Fehler bei der Blockchain-Transaktion", "error");
    }
  };

  // --- Send Logic ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setStatus(DocStatus.UPLOADED);
      
      // Auto-start hashing for UX
      setTimeout(async () => {
        try {
          const computedHash = await hashFile(selectedFile);
          setHash(computedHash);
          addToast("SHA-256 Hash lokal berechnet", "info");
          
          // AUTOMATION: Trigger anchoring immediately after hashing
          await performAnchoring(computedHash, selectedFile.name);
          
        } catch (err) {
          addToast("Fehler bei der Hash-Berechnung", "error");
        }
      }, 600);
    }
  };

  // Manual trigger (kept for fallback/retry scenarios)
  const handleManualAnchor = async () => {
    if (!file || !hash) return;
    await performAnchoring(hash, file.name);
  };

  const downloadProof = () => {
    if (!file || !hash || !txId) return;
    try {
        const proof = {
        version: "1.0",
        document: { name: file.name, hash: hash, size: file.size },
        blockchain: { 
            network: "Polygon PoS", 
            txHash: txId, 
            timestamp: anchorTimestamp ? new Date(anchorTimestamp).toISOString() : new Date().toISOString() 
        },
        issuer: "GovChain Hub Demonstrator"
        };
        const blob = new Blob([JSON.stringify(proof, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `proof-${file.name}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addToast("Proof-Datei heruntergeladen", "success");
    } catch (e) {
        addToast("Download fehlgeschlagen", "error");
    }
  };

  const resetSend = () => {
    setFile(null);
    setHash('');
    setTxId('');
    setAnchorTimestamp(null);
    setStatus(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Verify Logic ---
  const handleVerifyFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const f = e.target.files[0];
          setVerifyFile(f);
          setVerificationResult(null);
          const h = await hashFile(f);
          setVerifyHash(h);
      }
  };

  const handleVerify = async () => {
      if (!verifyHash || !verifyTxId) return;
      setIsVerifying(true);
      try {
          const result = await verifyDocumentOnChain(verifyHash, verifyTxId);
          setVerificationResult(result);
          if (result.valid) {
              addToast("Validierung erfolgreich: Hash stimmt überein", "success");
          } else {
              addToast("Validierung fehlgeschlagen: Hash oder Transaktion ungültig", "error");
          }
      } catch (e) {
          setVerificationResult({ valid: false });
          addToast("Systemfehler bei der Prüfung", "error");
      }
      setIsVerifying(false);
  };

  // Helper to determine step state
  const getStepState = (stepId: DocStatus) => {
    if (status === DocStatus.ANCHORED) return 'completed';
    if (status === DocStatus.HASHING && stepId === DocStatus.HASHING) return 'current';
    if (status === DocStatus.UPLOADED && stepId === DocStatus.UPLOADED) return 'current';
    if (status === DocStatus.HASHING && stepId === DocStatus.UPLOADED) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Sicherer Dokumententransfer</h2>
        <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
          Manipulationssichere Zustellung & Verifikation mittels Blockchain.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm inline-flex">
              <button 
                onClick={() => setActiveTab('SEND')}
                className={`px-6 py-2.5 text-sm font-medium rounded-md transition-all ${activeTab === 'SEND' ? 'bg-gov-blue text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                  <Upload className="inline-block w-4 h-4 mr-2" />
                  Dokument Senden (Notarisieren)
              </button>
              <button 
                onClick={() => setActiveTab('VERIFY')}
                className={`px-6 py-2.5 text-sm font-medium rounded-md transition-all ${activeTab === 'VERIFY' ? 'bg-gov-blue text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                  <BadgeCheck className="inline-block w-4 h-4 mr-2" />
                  Echtheit Prüfen (Validieren)
              </button>
          </div>
      </div>

      {activeTab === 'SEND' ? (
      <>
        {/* Visual Stepper */}
        <nav aria-label="Progress">
            <ol role="list" className="overflow-hidden rounded-md lg:flex lg:rounded-none lg:border-l lg:border-r lg:border-gray-200 mb-8">
            {steps.map((step, stepIdx) => {
                const state = getStepState(step.id);
                return (
                <li key={step.id} className="relative overflow-hidden lg:flex-1">
                    <div className={`border-b-4 border-t-4 py-5 px-4 text-center text-sm font-medium lg:border-t-0 lg:border-b-0 lg:border-r 
                    ${state === 'completed' ? 'border-gov-blue bg-blue-50' : 
                        state === 'current' ? 'border-gov-accent bg-white' : 'border-gray-200 bg-gray-50'}`}>
                    
                    <span className={`flex flex-col items-center gap-2
                        ${state === 'completed' ? 'text-gov-blue' : 
                        state === 'current' ? 'text-gov-accent' : 'text-gray-500'}`}>
                        <step.icon className="h-6 w-6" />
                        <span className="uppercase tracking-wider text-xs">{step.label}</span>
                    </span>
                    </div>
                </li>
                );
            })}
            </ol>
        </nav>

        <div className="grid md:grid-cols-5 gap-8">
            
            {/* Left Col: Upload Area */}
            <div className="md:col-span-3 space-y-6">
            <div className={`transition-all duration-300 transform ${status === DocStatus.ANCHORED ? 'opacity-60 scale-95 pointer-events-none grayscale' : 'opacity-100'}`}>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative h-64 flex flex-col items-center justify-center bg-white shadow-sm">
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={!!status && status !== DocStatus.UPLOADED}
                />
                {file ? (
                    <div className="flex flex-col items-center z-0 animate-in fade-in zoom-in duration-300">
                    <div className="bg-blue-100 p-4 rounded-full mb-4">
                        <FileText className="h-8 w-8 text-gov-blue" />
                    </div>
                    <p className="font-bold text-slate-900 text-lg">{file.name}</p>
                    <p className="text-sm text-slate-500 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                    {hash && (
                        <div className="mt-3 inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium">
                        <Lock className="w-3 h-3 mr-1" />
                        Client-Side Hashed
                        </div>
                    )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center z-0">
                    <div className="bg-slate-100 p-4 rounded-full mb-4">
                        <Upload className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="font-medium text-slate-700 text-lg">Dokument auswählen</p>
                    <p className="text-sm text-slate-400 mt-2">PDF, DOCX (Max 10MB)</p>
                    <button className="mt-6 px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                        Datei suchen
                    </button>
                    </div>
                )}
                </div>
            </div>

            {/* File Details Section */}
            {file && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm animate-in fade-in slide-in-from-top-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Dokumenten-Status</h3>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center overflow-hidden">
                    <div className="bg-white p-2 rounded border border-slate-200 mr-3">
                        <FileText className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate max-w-[150px] sm:max-w-xs">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    </div>
                    
                    <div className="flex-shrink-0 ml-4">
                    {!hash ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        <Upload className="w-3 h-3 mr-1" /> Uploading
                        </span>
                    ) : status === DocStatus.ANCHORED ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" /> Verankert
                        </span>
                    ) : status === DocStatus.HASHING ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Server className="w-3 h-3 mr-1 animate-pulse" /> Verarbeitung
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Lock className="w-3 h-3 mr-1" /> Hashed
                        </span>
                    )}
                    </div>
                </div>
                </div>
            )}

            {/* Action Button Area */}
            {hash && status !== DocStatus.ANCHORED && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-bottom-2">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Aktion erforderlich</h3>
                <p className="text-sm text-slate-600 mb-6">
                    Der digitale Fingerabdruck wird nun automatisch an die Blockchain übertragen.
                </p>
                <button
                    onClick={handleManualAnchor}
                    disabled={status === DocStatus.HASHING}
                    className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white transition-all
                    ${status === DocStatus.HASHING ? 'bg-slate-400 cursor-wait' : 'bg-gov-blue hover:bg-blue-800 hover:shadow-md'} 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gov-blue`}
                >
                    {status === DocStatus.HASHING ? (
                    <>
                        <Server className="animate-pulse mr-2 h-5 w-5" />
                        Smart Contract Interaktion...
                    </>
                    ) : (
                    <>
                        Hash auf Blockchain verankern
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                    )}
                </button>
                </div>
            )}
            </div>

            {/* Right Col: Technical Details */}
            <div className="md:col-span-2 space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 text-slate-300 shadow-lg font-mono text-xs overflow-hidden">
                <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
                <span className="text-slate-100 font-bold flex items-center">
                    <ShieldAlert className="w-4 h-4 mr-2 text-green-400" />
                    SECURITY CONTEXT
                </span>
                <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                </div>
                </div>
                
                <div className="space-y-4">
                <div>
                    <span className="text-slate-500 block mb-1">FILE HASH (SHA-256)</span>
                    <div className="break-all text-green-400 bg-slate-800 p-2 rounded border border-slate-700">
                    {hash || <span className="text-slate-600 animate-pulse">Waiting for input...</span>}
                    </div>
                </div>

                {txId && (
                    <div className="animate-in fade-in duration-500">
                    <span className="text-slate-500 block mb-1">TRANSACTION ID</span>
                    <div className="break-all text-blue-400 bg-slate-800 p-2 rounded border border-slate-700">
                        {txId}
                    </div>
                    <div className="mt-2 text-slate-500">
                        Block: <span className="text-slate-300">19,283,746</span>
                    </div>
                    </div>
                )}
                </div>
            </div>

            {status === DocStatus.ANCHORED && (
                <div className="bg-green-50 p-6 rounded-xl border border-green-100 shadow-sm animate-in zoom-in duration-300">
                <div className="flex items-center mb-3">
                    <FileCheck className="h-6 w-6 text-green-600 mr-2" />
                    <h3 className="font-bold text-green-900">Übertragung abgeschlossen</h3>
                </div>
                <p className="text-sm text-green-800 mb-4">
                    Das Dokument wurde erfolgreich notariell beglaubigt.
                </p>
                <div className="flex flex-col gap-2">
                    <button 
                        onClick={downloadProof}
                        className="w-full bg-white border border-green-200 text-green-700 py-2 rounded font-medium text-sm hover:bg-green-100 flex items-center justify-center transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download Nachweis (JSON)
                    </button>
                    <button onClick={resetSend} className="w-full text-green-600 text-sm hover:underline py-1">
                        Weiteres Dokument senden
                    </button>
                </div>
                </div>
            )}
            </div>
        </div>
      </>
      ) : (
      /* VERIFY TAB CONTENT */
      <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2">
          <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                      <Search className="w-5 h-5 mr-2 text-slate-500"/>
                      1. Originaldokument wählen
                  </h3>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors relative">
                    <input 
                        type="file" 
                        ref={verifyInputRef}
                        onChange={handleVerifyFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center">
                        {verifyFile ? (
                             <>
                             <FileCheck className="h-10 w-10 text-green-500 mb-2"/>
                             <p className="font-medium text-slate-900">{verifyFile.name}</p>
                             </>
                        ) : (
                            <>
                            <Upload className="h-8 w-8 text-slate-400 mb-2"/>
                            <p className="text-sm text-slate-500">Datei hier ablegen</p>
                            </>
                        )}
                    </div>
                  </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                      <Link className="w-5 h-5 mr-2 text-slate-500"/>
                      2. Transaktions-ID / Proof
                  </h3>
                  <div className="space-y-3">
                      <label className="block text-sm font-medium text-slate-700">TxHash oder Proof-ID</label>
                      <input 
                        type="text" 
                        value={verifyTxId}
                        onChange={(e) => setVerifyTxId(e.target.value)}
                        placeholder="0x..."
                        className="block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gov-blue focus:border-gov-blue sm:text-sm font-mono"
                      />
                      <p className="text-xs text-slate-500">
                          Geben Sie die Transaction ID aus dem JSON-Nachweis ein.
                      </p>
                  </div>
              </div>

              <button
                onClick={handleVerify}
                disabled={!verifyFile || !verifyTxId || isVerifying}
                className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white transition-all
                  ${(!verifyFile || !verifyTxId) ? 'bg-slate-300 cursor-not-allowed' : 'bg-gov-blue hover:bg-blue-800'}`}
              >
                  {isVerifying ? 'Prüfe Blockchain...' : 'Dokument Validieren'}
              </button>
          </div>

          <div className="space-y-6">
              <div className="bg-slate-900 rounded-xl p-6 text-slate-300 shadow-lg min-h-[300px] flex flex-col">
                 <h3 className="text-white font-bold mb-6 flex items-center border-b border-slate-700 pb-4">
                     <Server className="w-5 h-5 mr-2 text-blue-400"/>
                     VALIDATION RESULTS
                 </h3>
                 
                 {verificationResult ? (
                     <div className="flex-grow animate-in zoom-in duration-300">
                         <div className={`rounded-lg p-4 mb-6 text-center ${verificationResult.valid ? 'bg-green-900/30 border border-green-800' : 'bg-red-900/30 border border-red-800'}`}>
                             {verificationResult.valid ? (
                                 <>
                                    <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-2"/>
                                    <h4 className="text-xl font-bold text-green-400">AUTHENTISCH</h4>
                                    <p className="text-sm text-green-200">Hash-Match bestätigt</p>
                                 </>
                             ) : (
                                 <>
                                    <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-2"/>
                                    <h4 className="text-xl font-bold text-red-400">FEHLGESCHLAGEN</h4>
                                    <p className="text-sm text-red-200">Dokument wurde verändert oder Hash unbekannt</p>
                                 </>
                             )}
                         </div>

                         {verificationResult.valid && (
                             <div className="space-y-4 font-mono text-sm">
                                 <div>
                                     <span className="block text-slate-500 text-xs">ZEITSTEMPEL</span>
                                     <span className="text-white">{new Date(verificationResult.timestamp || 0).toLocaleString()}</span>
                                 </div>
                                 <div>
                                     <span className="block text-slate-500 text-xs">ISSUER DID</span>
                                     <span className="text-blue-300 break-all">{verificationResult.issuer}</span>
                                 </div>
                                 <div>
                                     <span className="block text-slate-500 text-xs">ON-CHAIN ROOT</span>
                                     <span className="text-green-300 break-all text-xs">{verifyHash}</span>
                                 </div>
                             </div>
                         )}
                     </div>
                 ) : (
                     <div className="flex-grow flex items-center justify-center text-slate-500">
                         <div className="text-center">
                             <Search className="w-12 h-12 mx-auto mb-2 opacity-20"/>
                             <p>Warte auf Eingabe...</p>
                         </div>
                     </div>
                 )}
              </div>
          </div>
      </div>
      )}
    </div>
  );
};

// Helper Icon
function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
}

export default DocTransferDemo;