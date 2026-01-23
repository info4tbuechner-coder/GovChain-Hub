import React, { useEffect, useState } from 'react';
import { Briefcase, Calendar, Clock, Lock, FileText, ChevronRight, Hash, ShieldCheck, UserPlus, Info } from 'lucide-react';
import { Tender } from '../types';
import { DbService } from '../services/mockDbService';
import { useToast } from './ui/ToastSystem';
import { useUser } from '../contexts/UserContext';

const SmartProcurement: React.FC = () => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [isSimulatingBid, setIsSimulatingBid] = useState(false);
  
  const { addToast } = useToast();
  const { user } = useUser();

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
      const data = await DbService.getTenders();
      setTenders(data);
      setLoading(false);
  };

  const handleSimulateBid = async () => {
      if (!selectedTender || !user) return;
      setIsSimulatingBid(true);
      try {
          const updated = await DbService.submitMockBid(selectedTender.id);
          // Log as "system" since user simulates external party
          await DbService.createAuditLog('system-sim', 'SUBMIT_BID', JSON.stringify({ tenderId: updated.id }));
          
          // Refresh list locally
          setTenders(prev => prev.map(t => t.id === updated.id ? updated : t));
          setSelectedTender(updated);
          addToast("Neues Angebot verschlüsselt auf der Blockchain empfangen", "info");
      } catch (e) {
          addToast("Fehler bei der Gebotssimulation", "error");
      } finally {
          setIsSimulatingBid(false);
      }
  };

  const getStatusBadge = (status: Tender['status']) => {
      switch(status) {
          case 'OPEN': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800">Laufend</span>;
          case 'REVIEW': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">Prüfung (Locked)</span>;
          case 'AWARDED': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">Vergeben</span>;
      }
  };

  if (selectedTender) {
      return (
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-right-4">
             <button 
                onClick={() => setSelectedTender(null)}
                className="mb-6 text-sm font-medium text-slate-500 hover:text-gov-blue flex items-center transition-colors"
            >
                <ChevronRight className="w-4 h-4 mr-1 rotate-180" /> Zurück zur Übersicht
            </button>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{selectedTender.refNumber}</span>
                                <h1 className="text-2xl font-bold text-slate-900 mt-2">{selectedTender.title}</h1>
                            </div>
                            {getStatusBadge(selectedTender.status)}
                        </div>
                        
                        <p className="text-slate-600 leading-relaxed mb-6">{selectedTender.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-6 border-t border-slate-100 pt-4">
                            <div>
                                <span className="block text-slate-400 text-xs uppercase mb-1">Budgetrahmen</span>
                                <span className="font-semibold text-slate-900">{selectedTender.budget}</span>
                            </div>
                            <div>
                                <span className="block text-slate-400 text-xs uppercase mb-1">Einreichungsfrist</span>
                                <span className="font-semibold text-slate-900">{selectedTender.deadline.toLocaleDateString()}</span>
                            </div>
                        </div>

                        {selectedTender.status === 'OPEN' && (
                             <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                                <Info className="w-5 h-5 text-gov-blue flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-bold mb-1">Commit-Reveal Verfahren aktiv</p>
                                    <p>
                                        Angebote werden als verschlüsselte Hashes eingereicht. 
                                        Der Inhalt ist bis zur Deadline (Smart Contract Lock) für niemanden sichtbar – auch nicht für die Behörde.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bids List */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                             <h3 className="font-bold text-slate-800 flex items-center">
                                 <Hash className="w-4 h-4 mr-2 text-gov-blue"/> Eingegangene Angebote ({selectedTender.bids.length})
                             </h3>
                             {selectedTender.status === 'OPEN' && (
                                 <button 
                                    onClick={handleSimulateBid}
                                    disabled={isSimulatingBid}
                                    className="text-xs bg-white border border-slate-300 px-3 py-1.5 rounded hover:bg-slate-50 flex items-center shadow-sm disabled:opacity-50"
                                 >
                                     <UserPlus className="w-3 h-3 mr-1" />
                                     {isSimulatingBid ? 'Simuliere...' : 'Bieter simulieren'}
                                 </button>
                             )}
                        </div>
                        <div className="divide-y divide-slate-100">
                            {selectedTender.bids.map((bid) => (
                                <div key={bid.id} className="p-4 flex items-center gap-4 text-sm">
                                    <div className={`p-2 rounded-full ${bid.status === 'SEALED' ? 'bg-slate-100 text-slate-400' : 'bg-green-100 text-green-600'}`}>
                                        {bid.status === 'SEALED' ? <Lock className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-mono text-slate-500 text-xs">Bieter: {bid.bidderHash}</span>
                                            <span className="text-slate-400 text-xs">{bid.timestamp.toLocaleString()}</span>
                                        </div>
                                        {bid.status === 'SEALED' ? (
                                            <div className="text-slate-400 italic flex items-center">
                                                <span className="w-full bg-slate-100 h-4 rounded animate-pulse block max-w-[200px]"></span>
                                            </div>
                                        ) : (
                                            <div className="font-medium text-slate-900">
                                                Angebotssumme: {bid.amount?.toLocaleString('de-DE')} €
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-mono text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded inline-block" title={bid.offerHash}>
                                            Hash: {bid.offerHash.substring(0,8)}...
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {selectedTender.bids.length === 0 && (
                                <div className="p-8 text-center text-slate-400">Noch keine Angebote eingegangen.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
                        <h3 className="font-bold mb-4 flex items-center text-green-400">
                            <ShieldCheck className="w-5 h-5 mr-2"/> Smart Contract
                        </h3>
                        <div className="space-y-4 text-sm">
                            <div>
                                <span className="block text-slate-500 text-xs uppercase">Contract Address</span>
                                <span className="font-mono text-blue-300 break-all">{selectedTender.contractAddress}</span>
                            </div>
                            <div>
                                <span className="block text-slate-500 text-xs uppercase">Lock State</span>
                                <span className={`inline-flex items-center mt-1 px-2 py-1 rounded text-xs font-bold ${selectedTender.status === 'OPEN' ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'}`}>
                                    {selectedTender.status === 'OPEN' ? 'UNLOCKED (Accepting)' : 'LOCKED (Review)'}
                                </span>
                            </div>
                            <div>
                                <span className="block text-slate-500 text-xs uppercase">Block Height</span>
                                <span className="font-mono">#19,284,042</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // List View
  return (
    <div className="space-y-8 animate-in fade-in">
        <div className="border-b border-slate-200 pb-5 flex justify-between items-end">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Öffentliche Vergabe (e-Tendering)</h2>
                <p className="mt-2 text-slate-600 max-w-2xl">
                    Manipulationssichere Ausschreibungen mittels Blockchain.
                </p>
            </div>
             <div className="hidden md:block">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-gov-blue">
                    <Briefcase className="w-3 h-3 mr-2" />
                    Vergabeplattform v2.0
                </span>
            </div>
        </div>

        {loading ? (
             <div className="p-12 text-center text-slate-400">Lade Ausschreibungen...</div>
        ) : (
            <div className="grid gap-6">
                {tenders.map(tender => (
                    <div 
                        key={tender.id}
                        onClick={() => setSelectedTender(tender)}
                        className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-gov-blue transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-slate-100 rounded text-slate-500 group-hover:bg-blue-50 group-hover:text-gov-blue transition-colors">
                                     <FileText className="w-6 h-6" />
                                 </div>
                                 <div>
                                     <h3 className="text-lg font-bold text-slate-900">{tender.title}</h3>
                                     <span className="text-xs font-mono text-slate-500">{tender.refNumber}</span>
                                 </div>
                             </div>
                             {getStatusBadge(tender.status)}
                        </div>

                        <div className="mt-4 flex items-center justify-between text-sm text-slate-500 pl-11">
                             <div className="flex gap-6">
                                 <span className="flex items-center"><Hash className="w-4 h-4 mr-1"/> {tender.bids.length} Gebote</span>
                                 <span className="flex items-center"><Clock className="w-4 h-4 mr-1"/> Frist: {tender.deadline.toLocaleDateString()}</span>
                             </div>
                             <span className="text-gov-blue font-medium flex items-center group-hover:translate-x-1 transition-transform">
                                Details <ChevronRight className="w-4 h-4 ml-1" />
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default SmartProcurement;