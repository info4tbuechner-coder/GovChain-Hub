import React, { useState, useRef } from 'react';
import { Upload, Lock, FileText, Check, Link, ShieldAlert, ArrowRight, FileCheck, Server } from 'lucide-react';
import { hashFile, anchorHashOnChain } from '../services/blockchainService';
import { DbService } from '../services/mockDbService';
import { DocStatus } from '../types';

const steps = [
  { id: DocStatus.UPLOADED, label: 'Upload & Hashing', icon: Upload },
  { id: DocStatus.HASHING, label: 'Blockchain Anker', icon: Server },
  { id: DocStatus.ANCHORED, label: 'Verifizierung', icon: Check },
];

const DocTransferDemo: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<DocStatus | null>(null);
  const [hash, setHash] = useState<string>('');
  const [txId, setTxId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setStatus(DocStatus.UPLOADED);
      
      // Auto-start hashing for UX
      // We use a slight delay to simulate the computation time visually
      setTimeout(async () => {
        const computedHash = await hashFile(selectedFile);
        setHash(computedHash);
      }, 600);
    }
  };

  const handleAnchor = async () => {
    if (!file || !hash) return;
    
    setStatus(DocStatus.HASHING);
    
    try {
      await DbService.createAuditLog('current-user', 'ANCHOR_HASH', JSON.stringify({ fileName: file.name }));
      const receipt = await anchorHashOnChain(hash);
      setTxId(receipt.txHash);
      setStatus(DocStatus.ANCHORED);
      await DbService.createAuditLog('current-user', 'VERIFY_CREDENTIAL', JSON.stringify({ tx: receipt.txHash }));
    } catch (error) {
      console.error("Anchoring failed", error);
      setStatus(DocStatus.UPLOADED);
    }
  };

  const reset = () => {
    setFile(null);
    setHash('');
    setTxId('');
    setStatus(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    <div className="max-w-4xl mx-auto space-y-10">
      
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900">Sicherer Dokumententransfer</h2>
        <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
          Manipulationssichere Zustellung mittels Blockchain-Timestamping.
        </p>
      </div>

      {/* Visual Stepper */}
      <nav aria-label="Progress">
        <ol role="list" className="overflow-hidden rounded-md lg:flex lg:rounded-none lg:border-l lg:border-r lg:border-gray-200">
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

          {/* New File Details Section */}
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
                Der digitale Fingerabdruck (Hash) wurde lokal erzeugt. 
                Übertragen Sie diesen nun an die Blockchain zur zeitlichen Verankerung.
              </p>
              <button
                onClick={handleAnchor}
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
                  <button className="w-full bg-white border border-green-200 text-green-700 py-2 rounded font-medium text-sm hover:bg-green-100 flex items-center justify-center">
                    <Link className="w-4 h-4 mr-2" />
                    Download Nachweis (JSON)
                  </button>
                  <button onClick={reset} className="w-full text-green-600 text-sm hover:underline py-1">
                    Weiteres Dokument senden
                  </button>
               </div>
             </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DocTransferDemo;