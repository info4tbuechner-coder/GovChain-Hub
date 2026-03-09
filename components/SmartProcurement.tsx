
import React, { useEffect, useState } from 'react';
import { Briefcase, Calendar, Clock, Lock, FileText, ChevronRight, Hash, ShieldCheck, UserPlus, Info, ChevronLeft, Plus, Eye } from 'lucide-react';
import { Tender } from '../types';
import { DbService } from '../services/mockDbService';
import { useToast } from './ui/ToastSystem';
import { useUser } from '../contexts/UserContext';

const SmartProcurement: React.FC = () => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [isSimulatingBid, setIsSimulatingBid] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // New Tender Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newBudget, setNewBudget] = useState('');

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
          await DbService.createAuditLog('system-sim', 'SUBMIT_BID', JSON.stringify({ tenderId: updated.id }));
          setTenders(prev => prev.map(t => t.id === updated.id ? updated : t));
          setSelectedTender(updated);
          addToast("Neues Angebot verschlüsselt empfangen", "info");
      } catch (e) {
          addToast("Simulation fehlgeschlagen", "error");
      } finally {
          setIsSimulatingBid(false);
      }
  };

  const handleCreateTender = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription || !newDeadline) {
      addToast("Bitte füllen Sie alle Pflichtfelder aus.", "error");
      return;
    }

    const newTender: Tender = {
      id: `t-${Date.now()}`,
      title: newTitle,
      description: newDescription,
      status: 'OPEN',
      deadline: new Date(newDeadline),
      budget: newBudget || 'Nicht spezifiziert',
      refNumber: `VERG-${Math.floor(Math.random() * 10000)}`,
      contractAddress: `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`,
      bids: []
    };

    // In a real app, this would be a DbService call to create the tender
    setTenders([newTender, ...tenders]);
    setIsCreating(false);
    setNewTitle('');
    setNewDescription('');
    setNewDeadline('');
    setNewBudget('');
    addToast("Neue Vergabe erfolgreich im Register eingetragen.", "success");
    await DbService.createAuditLog(user?.id || 'anon', 'CREATE_TENDER', JSON.stringify({ tenderId: newTender.id }));
  };

  const getStatusBadge = (status: Tender['status']) => {
      switch(status) {
          case 'OPEN': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 uppercase">Laufend</span>;
          case 'REVIEW': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">Prüfung</span>;
          case 'AWARDED': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">Vergeben</span>;
      }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 animate-in fade-in h-full min-h-[600px] pb-12">
        {/* List View - Hidden on mobile if detail is active */}
        <div className={`w-full md:w-1/3 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${selectedTender || isCreating ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-gov-blue" />
                    Vergaben
                </h2>
                {user?.role === 'ADMIN' && (
                  <button 
                    onClick={() => { setSelectedTender(null); setIsCreating(true); }}
                    className="p-2 bg-gov-blue text-white rounded-lg hover:bg-blue-800 transition-colors"
                    title="Neue Vergabe"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
            </div>
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-8 text-center text-slate-400">Lade Vergaben...</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {tenders.map(tender => (
                            <button key={tender.id} onClick={() => { setIsCreating(false); setSelectedTender(tender); }} className={`w-full text-left p-4 sm:p-5 transition-all active:bg-slate-100 ${selectedTender?.id === tender.id ? 'bg-blue-50 border-r-4 border-r-gov-blue' : ''}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-mono text-slate-400">{tender.refNumber}</span>
                                    {getStatusBadge(tender.status)}
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm truncate">{tender.title}</h4>
                                <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-2"><Clock className="w-3 h-3" /> {tender.deadline.toLocaleDateString()}</p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Detail View - Shown on mobile if active */}
        <div className={`flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-col ${selectedTender || isCreating ? 'flex' : 'hidden md:flex'}`}>
            {isCreating ? (
              <div className="flex-1 flex flex-col overflow-y-auto animate-in slide-in-from-right-4 p-6 sm:p-8">
                <div className="flex items-center mb-6">
                  <button onClick={() => setIsCreating(false)} className="md:hidden p-2 -ml-2 mr-2 text-slate-400 hover:text-slate-900 active-scale"><ChevronLeft className="w-6 h-6" /></button>
                  <h2 className="text-xl font-bold text-slate-900">Neue Vergabe eintragen</h2>
                </div>
                <form onSubmit={handleCreateTender} className="space-y-6 max-w-2xl">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Titel der Vergabe *</label>
                    <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} required className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gov-blue focus:outline-none" placeholder="z.B. Beschaffung von IT-Hardware" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Beschreibung *</label>
                    <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} required rows={4} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gov-blue focus:outline-none" placeholder="Detaillierte Beschreibung der Anforderungen..."></textarea>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Fälligkeitsdatum *</label>
                      <input type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} required className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gov-blue focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Budget (Optional)</label>
                      <input type="text" value={newBudget} onChange={e => setNewBudget(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gov-blue focus:outline-none" placeholder="z.B. 50.000 €" />
                    </div>
                  </div>
                  <div className="pt-4 flex gap-4">
                    <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors">Abbrechen</button>
                    <button type="submit" className="px-6 py-2 bg-gov-blue text-white font-bold rounded-lg hover:bg-blue-800 transition-colors">Vergabe eintragen</button>
                  </div>
                </form>
              </div>
            ) : selectedTender ? (
                <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-right-4">
                    <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center gap-4 bg-white sticky top-0 z-10">
                        <button onClick={() => setSelectedTender(null)} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-900 active-scale"><ChevronLeft className="w-6 h-6" /></button>
                        <div className="min-w-0">
                            <h2 className="text-base sm:text-xl font-bold text-slate-900 truncate">{selectedTender.title}</h2>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">{selectedTender.refNumber} • Budget: {selectedTender.budget}</p>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
                        <section>
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center"><Info className="w-4 h-4 mr-2" /> Beschreibung</h3>
                            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{selectedTender.description}</p>
                        </section>

                        <section>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center"><Hash className="w-4 h-4 mr-2" /> Angebote ({selectedTender.bids.length})</h3>
                                {selectedTender.status === 'OPEN' && (
                                    <button onClick={handleSimulateBid} disabled={isSimulatingBid} className="text-[10px] font-bold bg-gov-blue text-white px-3 py-1.5 rounded-lg active-scale disabled:opacity-50">Bieter simulieren</button>
                                )}
                            </div>
                            <div className="space-y-3">
                                {selectedTender.bids.length === 0 ? (
                                  <p className="text-sm text-slate-500 italic">Noch keine Angebote eingegangen.</p>
                                ) : (
                                  selectedTender.bids.map(bid => (
                                      <div key={bid.id} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm flex flex-col gap-3">
                                          <div className="flex items-center gap-4">
                                            <div className="p-2 bg-slate-100 rounded-lg text-slate-400"><Lock className="w-4 h-4" /></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between text-[10px] mb-1">
                                                    <span className="font-mono text-slate-500">Bieter-ID: {bid.bidderHash}</span>
                                                    <span className="text-slate-400">{bid.timestamp.toLocaleDateString()}</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="bg-slate-200 h-full w-full"></div>
                                                </div>
                                            </div>
                                          </div>
                                          
                                          {user?.role === 'ADMIN' && (
                                            <div className="mt-2 pt-3 border-t border-slate-100 flex items-start gap-2">
                                              <Eye className="w-4 h-4 text-gov-blue mt-0.5 shrink-0" />
                                              <div className="text-xs">
                                                <p className="font-bold text-slate-700 mb-1">Verschlüsselte Angebotsdetails (Admin View)</p>
                                                <p className="font-mono text-[9px] text-slate-500 break-all bg-slate-50 p-2 rounded border border-slate-200">
                                                  {btoa(`Offer details for bid ${bid.id} by ${bid.bidderHash}. Price: ${Math.floor(Math.random() * 100000)} EUR`)}
                                                </p>
                                              </div>
                                            </div>
                                          )}
                                      </div>
                                  ))
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col justify-center items-center text-slate-400 p-8 text-center bg-slate-50/50">
                    <Briefcase className="w-16 h-16 mb-4 opacity-10" />
                    <h3 className="text-lg font-bold text-slate-500">Keine Auswahl</h3>
                    <p className="text-xs max-w-xs mt-1">Wählen Sie eine Vergabe aus der Liste für Details oder erstellen Sie eine neue.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default SmartProcurement;
