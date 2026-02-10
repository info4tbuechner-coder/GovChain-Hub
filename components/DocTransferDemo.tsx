
import React, { useState, useRef } from 'react';
import { Upload, Lock, FileText, Check, Link, ShieldAlert, ArrowRight, FileCheck, Server, Search, BadgeCheck, Download, Printer, ShieldCheck, RefreshCw } from 'lucide-react';
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

  const performAnchoring = async (targetHash: string, targetFileName: string) => {
    setStatus(DocStatus.HASHING);
    try {
      const userId = user?.id || 'anon-user';
      await DbService.createAuditLog(userId, 'ANCHOR_HASH', JSON.stringify({ fileName: targetFileName }));
      
      const receipt = await anchorHashOnChain(targetHash);
      
      setTxId(receipt.txHash);
      setAnchorTimestamp(receipt.timestamp);
      setStatus(DocStatus.ANCHORED);
      
      addToast("Dokument-Hash erfolgreich auf der Blockchain verankert!", "success");
    } catch (error) {
      console.error("Anchoring failed", error);
      setStatus(DocStatus.UPLOADED);
      addToast("Fehler bei der Blockchain-Transaktion", "error");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setStatus(DocStatus.UPLOADED);
      
      setTimeout(async () => {
        try {
          const computedHash = await hashFile(selectedFile);
          setHash(computedHash);
          addToast("SHA-256 Hash lokal berechnet", "info");
          await performAnchoring(computedHash, selectedFile.name);
        } catch (err) {
          addToast("Fehler bei der Hash-Berechnung", "error");
        }
      }, 600);
    }
  };

  const downloadProof = () => {
    if (!file || !hash || !txId) return;
    const proof = {
      version: "1.0",
      document: { name: file.name, hash: hash, size: file.size },
      blockchain: { network: "Polygon PoS", txHash: txId, timestamp: new Date(anchorTimestamp!).toISOString() },
      issuer: "GovChain Hub Demonstrator"
    };
    const blob = new Blob([JSON.stringify(proof, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `proof-${file.name}.json`;
    link.click();
    addToast("Proof-Datei heruntergeladen", "success");
  };

  const resetSend = () => {
    setFile(null);
    setHash('');
    setTxId('');
    setAnchorTimestamp(null);
    setStatus(null);
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
              addToast("Validierung fehlgeschlagen", "error");
          }
      } catch (e) {
          setVerificationResult({ valid: false });
      }
      setIsVerifying(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Dokumenten-Notar</h2>
        <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
          Manipulationssichere Verankerung amtlicher Dokumente in der Bundes-Blockchain.
        </p>
      </div>

      <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm inline-flex">
              <button 
                onClick={() => setActiveTab('SEND')}
                className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'SEND' ? 'bg-gov-blue text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
              >
                  <Upload className="inline-block w-4 h-4 mr-2" />
                  Verankern
              </button>
              <button 
                onClick={() => setActiveTab('VERIFY')}
                className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'VERIFY' ? 'bg-gov-blue text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
              >
                  <BadgeCheck className="inline-block w-4 h-4 mr-2" />
                  Prüfen
              </button>
          </div>
      </div>

      {activeTab === 'SEND' ? (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Action Card */}
            <div className="lg:col-span-7 space-y-6">
                <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-8 transition-all duration-500 ${status === DocStatus.ANCHORED ? 'bg-slate-50 opacity-60' : ''}`}>
                    <div className="mb-6 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Workflow: Schritt 1/2</h3>
                        <div className="flex gap-1">
                             <div className={`h-1.5 w-6 rounded-full ${status ? 'bg-gov-blue' : 'bg-slate-200'}`}></div>
                             <div className={`h-1.5 w-6 rounded-full ${status === DocStatus.ANCHORED ? 'bg-gov-blue' : 'bg-slate-200'}`}></div>
                        </div>
                    </div>

                    {!file ? (
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:bg-slate-50 transition-all cursor-pointer relative group">
                            <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="h-8 w-8 text-slate-400" />
                            </div>
                            <p className="text-lg font-bold text-slate-800">Datei auswählen</p>
                            <p className="text-sm text-slate-500 mt-2">Die Datei wird nur lokal im Browser gehasht (DSGVO-konform).</p>
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center gap-4 animate-in fade-in zoom-in">
                            <div className="p-3 bg-blue-50 rounded-lg text-gov-blue">
                                <FileText className="h-8 w-8" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-900 truncate">{file.name}</p>
                                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB • {new Date().toLocaleDateString()}</p>
                            </div>
                            {status === DocStatus.ANCHORED && (
                                <div className="p-2 bg-green-100 text-green-600 rounded-full">
                                    <Check className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                    )}

                    {status === DocStatus.HASHING && (
                        <div className="mt-6 p-6 bg-slate-900 rounded-xl text-white animate-pulse">
                            <div className="flex items-center gap-3 mb-4">
                                <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                                <span className="font-bold tracking-wide">Blockchain Transaktion läuft...</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full animate-progress origin-left"></div>
                            </div>
                        </div>
                    )}
                </div>

                {status === DocStatus.ANCHORED && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex justify-between items-center animate-in slide-in-from-bottom-4">
                        <div>
                            <h4 className="font-bold text-slate-900">Vorgang abgeschlossen</h4>
                            <p className="text-sm text-slate-500 mt-1">Sie können nun den fälschungssicheren Nachweis herunterladen.</p>
                        </div>
                        <button onClick={resetSend} className="text-sm font-bold text-gov-blue hover:underline">
                            Neuer Vorgang
                        </button>
                    </div>
                )}
            </div>

            {/* Right: The "Certificate" Visual */}
            <div className="lg:col-span-5">
                {status === DocStatus.ANCHORED ? (
                    <div className="bg-white border-2 border-slate-900 p-10 rounded-sm shadow-2xl relative overflow-hidden animate-in zoom-in duration-700">
                        {/* Gov Seal Background */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                            <ShieldCheck className="w-96 h-96" />
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-12 border-b-2 border-slate-900 pb-6">
                                <div>
                                    <h3 className="font-serif text-xl font-bold uppercase tracking-tight">Authentizitäts-Zertifikat</h3>
                                    <p className="text-[10px] font-mono text-slate-500 uppercase mt-1">Blockchain Verification Service // GovChain Hub</p>
                                </div>
                                <ShieldCheck className="w-12 h-12 text-slate-900" />
                            </div>

                            <div className="space-y-6 text-sm">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Dokumenten-Integrität</p>
                                    <p className="font-serif italic text-slate-800">Hiermit wird bestätigt, dass der kryptografische Fingerabdruck des Dokuments <strong>"{file?.name}"</strong> unveränderlich im Distributed Ledger verankert wurde.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Datum/Zeit</p>
                                        <p className="font-mono font-bold text-slate-900 text-xs">{new Date(anchorTimestamp!).toLocaleString('de-DE')}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Blockchain ID</p>
                                        <p className="font-mono font-bold text-slate-900 text-xs">#19,284,042</p>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Transaktions-Hash</p>
                                    <p className="font-mono text-[10px] break-all bg-slate-50 p-2 border border-slate-100 rounded">{txId}</p>
                                </div>

                                <div className="pt-4">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Root Hash (SHA-256)</p>
                                    <p className="font-mono text-[10px] break-all bg-slate-50 p-2 border border-slate-100 rounded text-blue-600">{hash}</p>
                                </div>
                            </div>

                            <div className="mt-12 flex justify-between items-end border-t border-slate-200 pt-6">
                                <div className="flex gap-3">
                                    <button onClick={downloadProof} className="p-3 bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors shadow-lg">
                                        <Download className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => window.print()} className="p-3 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                                        <Printer className="w-5 h-5 text-slate-600" />
                                    </button>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-bold uppercase text-slate-400">Digital Signiert durch</p>
                                    <p className="text-[10px] font-bold text-slate-900">Validator-BMI-01.bund.de</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-900 rounded-2xl aspect-[3/4] p-8 flex flex-col justify-center items-center text-center text-slate-500 border border-slate-800">
                        <Lock className="w-16 h-16 mb-6 opacity-10" />
                        <h4 className="font-bold text-slate-400 mb-2">Warte auf Verankerung</h4>
                        <p className="text-sm max-w-[200px]">Nach der Blockchain-Transaktion wird hier das Zertifikat generiert.</p>
                    </div>
                )}
            </div>
        </div>
      ) : (
        /* VERIFY TAB (Minimal change to focus on Send UX) */
        <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-2">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center">
                    <Search className="w-5 h-5 mr-2 text-gov-blue" />
                    Validierungs-Assistent
                </h3>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Originaldatei</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-all cursor-pointer relative">
                            <input type="file" onChange={(e) => {
                                if(e.target.files?.[0]) {
                                    setVerifyFile(e.target.files[0]);
                                    hashFile(e.target.files[0]).then(setVerifyHash);
                                }
                            }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            {verifyFile ? (
                                <p className="text-sm font-bold text-gov-blue">{verifyFile.name}</p>
                            ) : (
                                <p className="text-xs text-slate-500">Datei hier ablegen oder klicken</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Transaktions-ID / Hash</label>
                        <input 
                            type="text" 
                            value={verifyTxId} 
                            onChange={(e) => setVerifyTxId(e.target.value)} 
                            placeholder="0x..." 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-gov-blue focus:outline-none"
                        />
                    </div>

                    <button 
                        onClick={handleVerify}
                        disabled={!verifyHash || !verifyTxId || isVerifying}
                        className="w-full py-4 bg-gov-blue text-white rounded-xl font-bold shadow-lg hover:bg-blue-800 disabled:opacity-50 transition-all"
                    >
                        {isVerifying ? 'Blockchain Scan...' : 'Echtheit prüfen'}
                    </button>
                </div>
            </div>

            {verificationResult && (
                <div className={`p-8 rounded-2xl border animate-in zoom-in ${verificationResult.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-full ${verificationResult.valid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {verificationResult.valid ? <FileCheck className="w-8 h-8"/> : <ShieldAlert className="w-8 h-8"/>}
                        </div>
                        <div>
                            <h4 className={`text-xl font-bold ${verificationResult.valid ? 'text-green-800' : 'text-red-800'}`}>
                                {verificationResult.valid ? 'Zertifikat Valide' : 'Integrität verletzt'}
                            </h4>
                            <p className="text-sm opacity-80">{verificationResult.valid ? 'Das Dokument entspricht exakt dem Blockchain-Eintrag.' : 'Dateiinhalt oder Transaktion stimmen nicht überein.'}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default DocTransferDemo;
