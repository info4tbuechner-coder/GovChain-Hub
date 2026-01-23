import React, { useEffect, useState } from 'react';
import { Database, Search, Car, Building2, ChevronRight, Hash, Calendar, Shield, User, RefreshCw, ArrowRightLeft, FileCheck } from 'lucide-react';
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
          addToast(`Eigentum von ${updated.id} erfolgreich übertragen`, "success");
      } catch (e) {
          addToast("Fehler beim Übertrag", "error");
      } finally {
          setIsTransferring(false);
      }
  };

  const filteredAssets = assets.filter(a => 
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 animate-in fade-in">
        
        {/* Sidebar: Search & List */}
        <div className="w-full md:w-1/3 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                    <Database className="w-5 h-5 mr-2 text-gov-blue" />
                    Bundes-Register
                </h2>
                <div className="mt-3 relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="FIN, Flurstück oder Name..." 
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-gov-blue focus:border-gov-blue"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-8 text-center text-slate-400">Lade Registerdaten...</div>
                ) : filteredAssets.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {filteredAssets.map(asset => (
                            <div 
                                key={asset.id}
                                onClick={() => setSelectedAsset(asset)}
                                className={`p-4 cursor-pointer transition-colors hover:bg-blue-50 
                                    ${selectedAsset?.id === asset.id ? 'bg-blue-50 border-l-4 border-l-gov-blue' : 'border-l-4 border-l-transparent'}
                                `}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center">
                                        {asset.type === 'VEHICLE' ? <Car className="w-4 h-4 text-slate-500 mr-2"/> : <Building2 className="w-4 h-4 text-slate-500 mr-2"/>}
                                        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1 rounded">{asset.id}</span>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${asset.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {asset.status}
                                    </span>
                                </div>
                                <h4 className={`text-sm font-medium ${selectedAsset?.id === asset.id ? 'text-gov-blue' : 'text-slate-900'}`}>
                                    {asset.title}
                                </h4>
                                <p className="text-xs text-slate-500 mt-1 truncate">
                                    {asset.currentOwner}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-slate-400 text-sm">Keine Einträge gefunden.</div>
                )}
            </div>
        </div>

        {/* Detail View */}
        <div className="w-full md:w-2/3 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
            {selectedAsset ? (
                <div className="flex-1 overflow-y-auto">
                    {/* Header Image/Gradient */}
                    <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900 relative p-6">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="relative z-10 flex justify-between items-end h-full">
                            <div>
                                <span className="inline-flex items-center px-2 py-1 rounded bg-white/10 text-white/80 text-xs font-medium backdrop-blur-sm mb-2">
                                    {selectedAsset.type === 'VEHICLE' ? 'Fahrzeugregister' : 'Grundbuch / Liegenschaften'}
                                </span>
                                <h1 className="text-2xl font-bold text-white">{selectedAsset.title}</h1>
                            </div>
                            <div className="text-right text-white/60 text-xs font-mono">
                                Token ID: {selectedAsset.tokenId}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-8">
                        
                        {/* Status & Contract Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center">
                                    <User className="w-3 h-3 mr-1"/> Aktueller Eigentümer
                                </h3>
                                <p className="font-medium text-slate-900">{selectedAsset.currentOwner}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center">
                                    <Hash className="w-3 h-3 mr-1"/> Smart Contract
                                </h3>
                                <p className="font-mono text-xs text-blue-600 break-all">{selectedAsset.contractAddress}</p>
                            </div>
                        </div>

                        {/* Specs */}
                        <div>
                             <h3 className="text-sm font-bold text-slate-900 mb-3">Technische Daten</h3>
                             <div className="grid grid-cols-2 gap-4 text-sm">
                                 {Object.entries(selectedAsset.specs).map(([k,v]) => (
                                     <div key={k} className="flex justify-between border-b border-slate-100 pb-1">
                                         <span className="text-slate-500">{k}</span>
                                         <span className="font-medium text-slate-900">{v}</span>
                                     </div>
                                 ))}
                             </div>
                        </div>

                        {/* Provenance / History */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
                                <Shield className="w-4 h-4 mr-2 text-green-600"/> 
                                Manipulationssichere Historie (Blockchain)
                            </h3>
                            <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pb-2">
                                {selectedAsset.history.map((event, idx) => (
                                    <div key={event.id} className="relative pl-6">
                                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-slate-300"></div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                                            <div>
                                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-1
                                                    ${event.type === 'TRANSFER' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}
                                                `}>
                                                    {event.type}
                                                </span>
                                                <p className="font-medium text-slate-900 text-sm">{event.description}</p>
                                                <p className="text-xs text-slate-500 mt-1">Autor: {event.actor}</p>
                                            </div>
                                            <div className="text-right mt-1 sm:mt-0">
                                                <div className="flex items-center text-xs text-slate-400 mb-1 sm:justify-end">
                                                    <Calendar className="w-3 h-3 mr-1"/>
                                                    {event.date.toLocaleDateString()}
                                                </div>
                                                <div className="font-mono text-[10px] text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded inline-block cursor-help" title={event.txHash}>
                                                    Tx: {event.txHash.substring(0,8)}...
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Transfer Action */}
                        <div className="border-t border-slate-100 pt-6">
                            <h3 className="text-sm font-bold text-slate-900 mb-4">Eigentum übertragen</h3>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newOwnerInput}
                                    onChange={(e) => setNewOwnerInput(e.target.value)}
                                    placeholder="Name des neuen Eigentümers / Behörde"
                                    className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-gov-blue focus:border-gov-blue"
                                />
                                <button 
                                    onClick={handleTransfer}
                                    disabled={!newOwnerInput || isTransferring}
                                    className="bg-gov-blue text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-800 disabled:bg-slate-300 flex items-center"
                                >
                                    {isTransferring ? <RefreshCw className="animate-spin w-4 h-4"/> : <ArrowRightLeft className="w-4 h-4 mr-2"/>}
                                    Übertragen
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                <FileCheck className="w-3 h-3 inline mr-1"/>
                                Diese Aktion wird unwiderruflich in den Smart Contract geschrieben.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                    <Database className="w-12 h-12 mb-3 text-slate-300" />
                    <p className="font-medium">Wählen Sie ein Asset aus dem Register</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default RegistryManager;