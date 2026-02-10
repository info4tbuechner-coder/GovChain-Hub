
import React, { useEffect, useState } from 'react';
import { Network, Share2, FileKey, Plus, Check, X, Search, ShieldCheck, Scale, Database, Lock, RefreshCw, Key, FileInput, Info, ChevronLeft } from 'lucide-react';
import { DataRequest } from '../types';
import { DbService } from '../services/mockDbService';
import { useUser } from '../contexts/UserContext';
import { useToast } from './ui/ToastSystem';

const DataExchange: React.FC = () => {
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'INCOMING' | 'OUTGOING' | 'CATALOG'>('INCOMING');
  const [selectedRequest, setSelectedRequest] = useState<DataRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  const { user } = useUser();
  const { addToast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const data = await DbService.getDataRequests();
    setRequests(data);
  };

  const incomingRequests = requests.filter(r => r.requesterDept !== user?.department);

  return (
    <div className="flex flex-col md:flex-row gap-6 animate-in fade-in h-full min-h-[600px]">
        {/* List Side */}
        <div className={`w-full md:w-1/3 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${selectedRequest ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex gap-2 p-1 bg-slate-200 rounded-lg mb-4">
                    <button onClick={() => { setActiveTab('INCOMING'); setSelectedRequest(null); }} className={`flex-1 text-[10px] font-bold py-1.5 rounded-md ${activeTab === 'INCOMING' ? 'bg-white text-gov-blue shadow-sm' : 'text-slate-500'}`}>EINGANG</button>
                    <button onClick={() => { setActiveTab('OUTGOING'); setSelectedRequest(null); }} className={`flex-1 text-[10px] font-bold py-1.5 rounded-md ${activeTab === 'OUTGOING' ? 'bg-white text-gov-blue shadow-sm' : 'text-slate-500'}`}>AUSGANG</button>
                </div>
                <h2 className="text-base font-bold text-slate-900 flex items-center">
                    <Share2 className="w-5 h-5 mr-2 text-gov-blue" /> Amtshilfe
                </h2>
            </div>
            <div className="flex-1 overflow-y-auto">
                {(activeTab === 'INCOMING' ? incomingRequests : []).map(req => (
                    <button key={req.id} onClick={() => setSelectedRequest(req)} className={`w-full text-left p-4 sm:p-5 border-b border-slate-50 active:bg-slate-100 transition-all ${selectedRequest?.id === req.id ? 'bg-blue-50 border-r-4 border-r-gov-blue' : ''}`}>
                         <div className="flex justify-between items-center mb-1">
                             <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${req.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{req.status}</span>
                             <span className="text-[10px] text-slate-400">{req.requestDate.toLocaleDateString()}</span>
                         </div>
                         <h4 className="font-bold text-slate-900 text-sm truncate">{req.targetDataset}</h4>
                         <p className="text-[10px] text-slate-500 truncate">{req.requesterDept}</p>
                    </button>
                ))}
            </div>
        </div>

        {/* Detail Side */}
        <div className={`flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-col ${selectedRequest ? 'flex' : 'hidden md:flex'}`}>
            {selectedRequest ? (
                <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-right-4">
                    <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center gap-4 bg-white">
                        <button onClick={() => setSelectedRequest(null)} className="md:hidden p-2 -ml-2 text-slate-400 active-scale"><ChevronLeft className="w-6 h-6" /></button>
                        <div>
                            <h2 className="text-base sm:text-xl font-bold text-slate-900 truncate">{selectedRequest.targetDataset}</h2>
                            <p className="text-[10px] text-slate-500 uppercase">Anfrage von: {selectedRequest.requesterDept}</p>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-6">
                            <section>
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center"><Info className="w-4 h-4 mr-2" /> Zweckbindung</h3>
                                <p className="text-sm text-slate-800 font-medium">{selectedRequest.purpose}</p>
                            </section>
                            <section>
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center"><Scale className="w-4 h-4 mr-2" /> Rechtsgrundlage</h3>
                                <p className="text-sm font-mono text-gov-blue font-bold">{selectedRequest.legalBasis}</p>
                            </section>
                        </div>

                        {selectedRequest.status === 'PENDING' && (
                             <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
                                 <button className="flex-1 py-4 bg-gov-blue text-white rounded-xl font-bold active-scale shadow-lg shadow-blue-900/20">Genehmigen</button>
                                 <button className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold active-scale">Ablehnen</button>
                             </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col justify-center items-center text-slate-300 p-12 text-center bg-slate-50/50">
                    <Share2 className="w-16 h-16 mb-4 opacity-10" />
                    <h3 className="text-lg font-bold text-slate-500">Datenaustausch</h3>
                    <p className="text-xs max-w-xs mt-1">Wählen Sie einen Antrag zur Bearbeitung aus.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default DataExchange;
