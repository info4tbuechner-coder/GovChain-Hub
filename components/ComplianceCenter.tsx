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
      l.userId.includes(searchTerm) || 
      l.action.includes(searchTerm) || 
      l.id.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 pb-5">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Compliance & Integrity Center</h2>
                <p className="mt-2 text-slate-600 max-w-2xl">
                    Forensische Analyse, Integritätsprüfung und Auditing der Blockchain-Daten.
                </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-3">
                <button 
                    onClick={handleExport}
                    className="flex items-center px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium hover:bg-slate-50 text-slate-700"
                >
                    <Download className="w-4 h-4 mr-2" />
                    DSGVO Export
                </button>
                <button 
                    onClick={handleIntegrityCheck}
                    disabled={integrityStatus === 'VERIFYING'}
                    className={`flex items-center px-4 py-2 border rounded-md text-sm font-medium text-white transition-colors
                        ${integrityStatus === 'SECURE' ? 'bg-green-600 border-green-600 hover:bg-green-700' : 
                          integrityStatus === 'COMPROMISED' ? 'bg-red-600 border-red-600' :
                          'bg-gov-blue border-gov-blue hover:bg-blue-800'
                        }`}
                >
                    {integrityStatus === 'VERIFYING' ? <RefreshCw className="w-4 h-4 mr-2 animate-spin"/> : 
                     integrityStatus === 'SECURE' ? <CheckCircle className="w-4 h-4 mr-2"/> :
                     integrityStatus === 'COMPROMISED' ? <XCircle className="w-4 h-4 mr-2"/> :
                     <ShieldAlert className="w-4 h-4 mr-2"/>}
                    {integrityStatus === 'VERIFYING' ? 'Prüfe Chain...' : 
                     integrityStatus === 'SECURE' ? 'System Sicher' : 
                     integrityStatus === 'COMPROMISED' ? 'Integrität verletzt!' : 'Integrität Prüfen'}
                </button>
            </div>
        </div>

        {/* Top Cards */}
        <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-slate-700">Audit Trail</h3>
                    <FileSearch className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                    <span className="text-3xl font-bold text-slate-900">{logs.length}</span>
                    <span className="text-xs text-slate-500 ml-2">Einträge total</span>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-slate-700">Aktive Warnungen</h3>
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                    <span className="text-3xl font-bold text-slate-900">{alerts.filter(a => a.status === 'OPEN').length}</span>
                    <span className="text-xs text-slate-500 ml-2">Offen</span>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-slate-700">Letzte Prüfung</h3>
                    <Scale className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                    <span className="text-lg font-bold text-slate-900">{integrityStatus === 'SECURE' ? 'Verifiziert' : 'Ausstehend'}</span>
                    <span className="text-xs text-slate-500 block">Merkle-Root Check</span>
                </div>
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Col: Logs Browser */}
            <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Logs durchsuchen (User, ID, Action)..." 
                                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-gov-blue focus:border-gov-blue"
                            />
                        </div>
                    </div>
                    
                    <div className="max-h-[600px] overflow-y-auto">
                        <table className="min-w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-100 text-slate-500 font-medium sticky top-0">
                                <tr>
                                    <th className="px-6 py-3">Zeitstempel</th>
                                    <th className="px-6 py-3">Aktion</th>
                                    <th className="px-6 py-3">Benutzer</th>
                                    <th className="px-6 py-3">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLogs.map(log => (
                                    <tr 
                                        key={log.id} 
                                        onClick={() => setSelectedLog(log)}
                                        className={`cursor-pointer hover:bg-blue-50 transition-colors ${selectedLog?.id === log.id ? 'bg-blue-50' : ''}`}
                                    >
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                                                ${log.action.includes('ALERT') ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {log.userId}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-xs font-mono">
                                            ID: {log.id.substring(0,8)}...
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Right Col: Details & Alerts */}
            <div className="space-y-6">
                
                {/* Alerts Section */}
                {alerts.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
                        <div className="p-4 bg-red-50 border-b border-red-100">
                             <h3 className="font-bold text-red-800 flex items-center">
                                 <AlertTriangle className="w-4 h-4 mr-2" /> Sicherheitswarnungen
                             </h3>
                        </div>
                        <div className="divide-y divide-red-50">
                            {alerts.map(alert => (
                                <div key={alert.id} className="p-4 hover:bg-red-50/50">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border
                                            ${alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-amber-100 text-amber-800 border-amber-200'}
                                        `}>
                                            {alert.severity}
                                        </span>
                                        <span className="text-[10px] text-slate-400">{alert.timestamp.toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm font-medium text-slate-800 mb-1">{alert.message}</p>
                                    <p className="text-xs text-slate-500">Kategorie: {alert.category}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Inspector */}
                <div className="bg-slate-900 rounded-xl p-6 text-slate-300 shadow-lg min-h-[300px]">
                    <h3 className="text-white font-bold mb-4 flex items-center border-b border-slate-700 pb-4">
                        <Fingerprint className="w-5 h-5 mr-2 text-blue-400"/>
                        Forensischer Inspektor
                    </h3>
                    
                    {selectedLog ? (
                        <div className="space-y-4 font-mono text-xs animate-in fade-in">
                            <div>
                                <span className="block text-slate-500 mb-1">Log ID (Immutable Ref)</span>
                                <span className="text-white break-all">{selectedLog.id}</span>
                            </div>
                            <div>
                                <span className="block text-slate-500 mb-1">IP Hash (Anonymized)</span>
                                <span className="text-blue-300 break-all">{selectedLog.ipHash}</span>
                            </div>
                            <div>
                                <span className="block text-slate-500 mb-1">Payload Metadata</span>
                                <div className="bg-slate-800 p-3 rounded border border-slate-700 text-green-300 whitespace-pre-wrap">
                                    {selectedLog.metadata ? JSON.stringify(JSON.parse(selectedLog.metadata), null, 2) : 'No metadata'}
                                </div>
                            </div>
                            <div className="pt-4 mt-4 border-t border-slate-700">
                                <span className="flex items-center text-green-500">
                                    <Lock className="w-3 h-3 mr-2" />
                                    Kryptografisch versiegelt
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                            <FileSearch className="w-12 h-12 mb-3 opacity-20"/>
                            <p>Wählen Sie einen Eintrag zur Analyse</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default ComplianceCenter;