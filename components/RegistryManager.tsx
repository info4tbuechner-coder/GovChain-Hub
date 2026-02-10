
import React, { useEffect, useState } from 'react';
import { Database, Search, Car, Building2, ChevronRight, Hash, Calendar, Shield, User, RefreshCw, ArrowRightLeft, FileCheck, MapPin, ExternalLink, Activity, ChevronLeft } from 'lucide-react';
import { RegistryAsset } from '../types';
import { DbService } from '../services/mockDbService';
import { useUser } from '../contexts/UserContext';
import { useToast } from './ui/ToastSystem';

const RegistryManager: React.FC = () => {
  const [assets, setAssets] = useState<RegistryAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<RegistryAsset | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [newOwnerInput, setNewOwnerInput] = useState('');
  
  const { user } = useUser();
  const { addToast } = useToast();

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    const data = await DbService.getRegistryAssets();
    setAssets(data);
    setLoading(false);
  };

  const handleTransfer = async () => {
      if (!selectedAsset || !newOwnerInput || !user) return;
      setIsTransferring(true);
      try {
          const updated = await DbService.transferAsset(selectedAsset.id, newOwnerInput, user.name);
          await DbService.createAuditLog(user.id, 'TRANSFER_ASSET', JSON.stringify({ assetId: updated.id, to: newOwnerInput }));
          setAssets(prev => prev.map(a => a.id === updated.id ? updated : a));
          setSelectedAsset(updated);
          setNewOwnerInput('');
          addToast(`Eigentumsübertrag erfolgreich`, "success");
      } finally {
          setIsTransferring(false);
      }
  };

  const filteredAssets = assets.filter(a => 
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row gap-6 animate-in fade-in pb-10 h-full min-h-[600px]">
        
        {/* Left: Search & Navigation - Hidden on mobile if asset is selected */}
        <div className={`w-full md:w-1/3 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${selectedAsset ? 'hidden md:flex' : 'flex'}`}>
             <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center">
                        <Database className="w-5 h-5 mr-2 text-gov-blue" />
                        Staats-Register
                    </h2>
                    <span className="text-[10px] font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-500">IVBB</span>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="ID oder Name suchen..." 
                        className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-blue focus:outline-none transition-all outline-none"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-8 text-center text-slate-400">Lade Daten...</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredAssets.map(asset => (
                            <button 
                                key={asset.id} 
                                onClick={() => setSelectedAsset(asset)} 
                                className={`w-full text-left p-4 sm:p-5 transition-all hover:bg-slate-50 active:bg-slate-100 touch-target ${selectedAsset?.id === asset.id ? 'bg-blue-50 border-r-4 border-r-gov-blue' : ''}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {asset.type === 'VEHICLE' ? <Car className="w-4 h-4 text-slate-400"/> : <Building2 className="w-4 h-4 text-slate-400"/>}
                                        <span className="text-[10px] font-mono text-slate-500">{asset.id}</span>
                                    </div>
                                    <span className={`h-2 w-2 rounded-full ${asset.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm truncate">{asset.title}</h4>
                                <p className="text-xs text-slate-500 mt-1 truncate">{asset.currentOwner}</p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Right: Asset Detail View - Full screen on mobile if selected */}
        <div className={`flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-col ${selectedAsset ? 'flex' : 'hidden md:flex'}`}>
            {selectedAsset ? (
                <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-right-4">
                    {/* Header with Back Button */}
                    <div className="p-4 sm:p-8 bg-slate-900 text-white relative">
                        <button 
                            onClick={() => setSelectedAsset(null)}
                            className="md:hidden p-2 -ml-2 mb-4 text-white/60 hover:text-white touch-target flex items-center gap-1"
                        >
                            <ChevronLeft className="w-6 h-6" /> <span className="text-sm font-bold">Registerliste</span>
                        </button>

                        <div className="absolute top-0 right-0 p-8 opacity-5 hidden sm:block">
                            {selectedAsset.type === 'VEHICLE' ? <Car className="w-40 h-40" /> : <Building2 className="w-40 h-40" />}
                        </div>
                        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                                    <MapPin className="w-3 h-3" /> Digitaler Zwilling
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{selectedAsset.title}</h1>
                                <p className="text-slate-400 mt-1 font-mono text-xs truncate">Asset-ID: {selectedAsset.id}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-2 sm:p-3 rounded-xl border border-white/10 text-left sm:text-right w-full sm:w-auto">
                                <p className="text-[9px] opacity-40 uppercase font-bold mb-0.5">Blockchain Sync</p>
                                <p className="text-[10px] font-mono font-bold text-blue-400">Verifiziert: 0x{Math.random().toString(16).substring(2, 10)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-6 sm:space-y-8">
                                <section>
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                                        <Shield className="w-4 h-4 mr-2 text-blue-500" /> Aktueller Status
                                    </h3>
                                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <div>
                                            <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">Rechtlicher Inhaber</p>
                                            <p className="font-bold text-slate-900 text-sm">{selectedAsset.currentOwner}</p>
                                        </div>
                                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">Aktiv im Ledger</span>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                                        <Activity className="w-4 h-4 mr-2 text-blue-500" /> Transaktions-Historie
                                    </h3>
                                    <div className="space-y-4">
                                        {selectedAsset.history.map((h, i) => (
                                            <div key={i} className="flex gap-4 relative">
                                                {i !== selectedAsset.history.length - 1 && <div className="absolute left-3 top-7 bottom-0 w-0.5 bg-slate-100"></div>}
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${h.type === 'REGISTRATION' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                                    <FileCheck className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="flex-1 pb-4 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate mr-2">{h.description}</h4>
                                                        <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">{h.date.toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 mt-0.5">Akteur: {h.actor}</p>
                                                    <div className="mt-2 flex items-center gap-2 overflow-hidden">
                                                        <span className="text-[8px] font-mono bg-slate-50 px-1.5 py-0.5 rounded text-slate-400 border border-slate-100 truncate">{h.txHash}</span>
                                                        <ExternalLink className="w-3 h-3 text-slate-300 flex-shrink-0" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <div className="space-y-6 sm:space-y-8">
                                <section className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200">
                                    <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-5">Eigentums-Transfer</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-2 ml-1">Neuer Eigentümer (Behörden-ID)</label>
                                            <input type="text" value={newOwnerInput} onChange={(e) => setNewOwnerInput(e.target.value)} placeholder="0x..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gov-blue outline-none transition-all" />
                                        </div>
                                        <button onClick={handleTransfer} disabled={!newOwnerInput || isTransferring} className="w-full py-4 bg-gov-blue text-white rounded-xl font-bold text-xs uppercase shadow-lg shadow-blue-900/20 hover:bg-blue-800 disabled:opacity-50 transition-all flex justify-center items-center gap-2 active:scale-95">
                                            {isTransferring ? <RefreshCw className="animate-spin w-4 h-4" /> : <ArrowRightLeft className="w-4 h-4" />}
                                            Eigentümer ändern
                                        </button>
                                        <p className="text-[9px] text-center text-slate-400 leading-relaxed italic px-2">
                                            Vorgang erzeugt einen neuen Block im Staatsregister. Unwiderruflich und manipulationssicher.
                                        </p>
                                    </div>
                                </section>

                                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                                     <h4 className="text-[10px] font-bold text-blue-900 flex items-center mb-2 uppercase tracking-tight">
                                         <Shield className="w-3.5 h-3.5 mr-2" /> Asset Tokenisierung
                                     </h4>
                                     <p className="text-[10px] text-blue-800/70 leading-relaxed">
                                         Dieses Asset ist als <strong>Non-Fungible Token (NFT)</strong> im souveränen Bundesnetzwerk verankert. Die Historie ist lückenlos bis zur Erstzulassung nachvollziehbar.
                                     </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col justify-center items-center text-slate-300 p-12 text-center bg-slate-50/50">
                    <Database className="w-16 h-16 mb-4 opacity-10" />
                    <h3 className="text-lg font-bold text-slate-500">Kein Datensatz gewählt</h3>
                    <p className="text-xs max-w-xs mt-1">Wählen Sie einen Datensatz aus dem Register, um die Blockchain-Historie zu prüfen.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default RegistryManager;
