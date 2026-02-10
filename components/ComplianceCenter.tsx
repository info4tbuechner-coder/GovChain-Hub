
import React, { useEffect, useState } from 'react';
import { ShieldAlert, Search, FileSearch, Scale, Fingerprint, Lock, Download, AlertTriangle, CheckCircle, RefreshCw, XCircle } from 'lucide-react';
import { AuditLog, ComplianceAlert } from '../types';
import { DbService } from '../services/mockDbService';
import { useToast } from './ui/ToastSystem';

const ComplianceCenter: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [integrityStatus, setIntegrityStatus] = useState<'PENDING' | 'VERIFYING' | 'SECURE' | 'COMPROMISED'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { addToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [l, a] = await Promise.all([DbService.getAuditLogs(), DbService.getComplianceAlerts()]);
    setLogs(l);
    setAlerts(a);
    setLoading(false);
  };

  const handleIntegrityCheck = async () => {
      setIntegrityStatus('VERIFYING');
      try {
          const res = await DbService.verifyLogChain();
          if (res.verified) {
              setIntegrityStatus('SECURE');
              addToast(`Blockchain Integrität bestätigt (${res.count} Einträge)`, "success");
          } else {
              setIntegrityStatus('COMPROMISED');
              addToast("Warnung: Hash-Kette inkonsistent!", "error");
          }
      } catch (e) {
          setIntegrityStatus('PENDING');
          addToast("Fehler bei der Verifikation", "error");
      }
  };

  const handleExport = () => {
      const dataStr = JSON.stringify(logs, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-export-${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast("DSGVO-Export erfolgreich erstellt", "success");
  };

  const filteredLogs = logs.filter(l => 
      l.userId.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in">
        
        {/* Header - Stacked on Mobile */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 pb-5 gap-4">
            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Compliance & Integrity Center</h2>
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
                    Forensische Analyse und Integritätsprüfung der Blockchain-Audit-Logs.
                </p>
            </div>
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                <button 
                    onClick={handleExport}
                    className="flex items-center justify-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 text-slate-700 transition-all active:scale-95"
                >
                    <Download className="w-4 h-4 mr-2" />
                    DSGVO Export
                </button>
                <button 
                    onClick={handleIntegrityCheck}
                    disabled={integrityStatus === 'VERIFYING'}
                    className={`flex items-center justify-center px-4 py-2 border rounded-lg text-sm font-bold text-white transition-all active:scale-95
                        ${integrityStatus === 'SECURE' ? 'bg-green-600 border-green-600 hover:bg-green-700' : 
                          integrityStatus === 'COMPROMISED' ? 'bg-red-600 border-red-600' :
                          'bg-gov-blue border-gov-blue hover:bg-blue-800'
                        }`}
                >
                    {integrityStatus === 'VERIFYING' ? <RefreshCw className="w-4 h-4 mr-2 animate-spin"/> : 
                     integrityStatus === 'SECURE' ? <CheckCircle className="w-4 h-4 mr-2"/> :
                     integrityStatus === 'COMPROMISED' ? <XCircle className="w-4 h-4 mr-2"/> :
                     <ShieldAlert className="w-4 h-4 mr-2"/>}
                    {integrityStatus === 'VERIFYING' ? 'Prüfe...' : 
                     integrityStatus === 'SECURE' ? 'System Sicher' : 
                     integrityStatus === 'COMPROMISED' ? 'Integrität verletzt!' : 'Integrität Prüfen'}
                </button>
            </div>
        </div>

        {/* Top Cards - 1 col on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Audit Trail</h3>
                    <FileSearch className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                    <span className="text-2xl sm:text-3xl font-bold text-slate-900">{logs.length}</span>
                    <span className="text-[10px] text-slate-400 ml-2 uppercase font-bold">Einträge</span>
                </div>
            </div>
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Aktive Warnungen</h3>
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                    <span className="text-2xl sm:text-3xl font-bold text-slate-900">{alerts.filter(a => a.status === 'OPEN').length}</span>
                    <span className="text-[10px] text-slate-400 ml-2 uppercase font-bold">Kritisch</span>
                </div>
            </div>
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Integrität</h3>
                    <Scale className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                    <span className="text-lg sm:text-xl font-bold text-slate-900 leading-tight block">{integrityStatus === 'SECURE' ? 'Verifiziert' : 'Ausstehend'}</span>
                </div>
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Left Col: Logs Browser - Responsive Table Wrapper */}
            <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Logs filtern..." 
                                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:outline-none transition-all"
                            />
                        </div>
                    </div>
                    
                    <div className="max-h-[50vh] sm:max-h-[600px] overflow-auto scrollbar-hide">
                        <table className="min-w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-100 text-slate-500 font-bold text-[10px] uppercase tracking-wider sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4">Zeitstempel</th>
                                    <th className="px-6 py-4">Aktion</th>
                                    <th className="px-6 py-4">Benutzer</th>
                                    <th className="px-6 py-4">ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLogs.length > 0 ? filteredLogs.map(log => (
                                    <tr 
                                        key={log.id} 
                                        onClick={() => setSelectedLog(log)}
                                        className={`cursor-pointer hover:bg-blue-50 transition-colors ${selectedLog?.id === log.id ? 'bg-blue-50' : ''}`}
                                    >
                                        <td className="px-6 py-4 font-mono text-[10px] text-slate-500">
                                            {new Date(log.timestamp).toLocaleString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight
                                                ${log.action.includes('ALERT') || log.action.includes('CRISIS') ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">
                                            {log.userId}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-[10px] font-mono">
                                            {log.id.substring(0,8)}...
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400">Keine Einträge gefunden.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Right Col: Details & Alerts */}
            <div className="space-y-6">
                {/* Inspector - Fixed height or scrollable on mobile */}
                <div className="bg-slate-900 rounded-xl p-5 sm:p-6 text-slate-300 shadow-xl border border-slate-800">
                    <h3 className="text-white font-bold mb-5 flex items-center border-b border-slate-800 pb-4">
                        <Fingerprint className="w-5 h-5 mr-2 text-blue-400"/>
                        Forensischer Inspektor
                    </h3>
                    
                    {selectedLog ? (
                        <div className="space-y-5 font-mono text-[10px] sm:text-xs animate-in fade-in">
                            <div>
                                <span className="block text-slate-500 font-bold uppercase mb-1">Log ID</span>
                                <span className="text-white break-all bg-slate-800 p-2 rounded block">{selectedLog.id}</span>
                            </div>
                            <div>
                                <span className="block text-slate-500 font-bold uppercase mb-1">IP Hash (Anonymized)</span>
                                <span className="text-blue-300 break-all">{selectedLog.ipHash}</span>
                            </div>
                            <div>
                                <span className="block text-slate-500 font-bold uppercase mb-1">Payload Metadata</span>
                                <div className="bg-slate-800 p-3 rounded border border-slate-700 text-green-400 whitespace-pre-wrap max-h-40 overflow-auto scrollbar-hide">
                                    {selectedLog.metadata ? JSON.stringify(JSON.parse(selectedLog.metadata), null, 2) : 'No metadata available.'}
                                </div>
                            </div>
                            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                                <span className="flex items-center text-green-500 font-bold">
                                    <Lock className="w-3 h-3 mr-2" />
                                    Signiert
                                </span>
                                <span className="text-[9px] text-slate-600">Ver. 2.4.0</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-600 text-center">
                            <FileSearch className="w-10 h-10 mb-3 opacity-20"/>
                            <p className="text-xs">Wählen Sie einen Log-Eintrag für eine detaillierte technische Analyse aus.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default ComplianceCenter;
