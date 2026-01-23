import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AuditLog, VerifiableCredential } from '../types';
import { DbService } from '../services/mockDbService';
import { RefreshCw, FileText, CheckCircle, AlertTriangle, Activity, Server, Shield } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

const Dashboard: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [credentials, setCredentials] = useState<VerifiableCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const fetchData = async () => {
    setLoading(true);
    const [logs, creds] = await Promise.all([
      DbService.getAuditLogs(),
      DbService.getCredentials()
    ]);
    setAuditLogs(logs);
    setCredentials(creds);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Mock data for the chart
  const chartData = [
    { name: 'Mo', txs: 12 },
    { name: 'Di', txs: 19 },
    { name: 'Mi', txs: 15 },
    { name: 'Do', txs: 22 },
    { name: 'Fr', txs: 28 },
    { name: 'Sa', txs: 8 },
    { name: 'So', txs: 5 },
  ];

  const nodes = [
    { name: 'Bundesdruckerei Node 1', status: 'online', lat: '12ms' },
    { name: 'BMI Node 04', status: 'online', lat: '24ms' },
    { name: 'BSI Validator', status: 'syncing', lat: '45ms' },
  ];

  return (
    <div className="space-y-8">
      {/* Personalized Greeting */}
      <div className="bg-gradient-to-r from-gov-blue to-blue-800 rounded-xl p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold">Willkommen zurück, {user?.name}</h2>
          <p className="opacity-80 mt-1">{user?.department} • {user?.role}</p>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
           <h2 className="text-xl font-bold text-slate-900">Lagebild Digitalisierung</h2>
           <p className="text-slate-500 text-sm mt-1">Echtzeit-Übersicht der Blockchain-Infrastruktur</p>
        </div>
        <button 
          onClick={fetchData} 
          className="flex items-center justify-center px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium hover:bg-slate-50 shadow-sm transition-colors text-slate-700"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Daten aktualisieren
        </button>
      </div>

      {/* Network Health Strip */}
      <div className="bg-slate-900 rounded-lg p-4 text-slate-300 flex flex-wrap gap-6 items-center shadow-md">
        <div className="flex items-center text-sm font-semibold text-white border-r border-slate-700 pr-6">
          <Activity className="h-5 w-5 mr-2 text-green-400" />
          SYSTEM STATUS: STABLE
        </div>
        {nodes.map((node, idx) => (
            <div key={idx} className="flex items-center space-x-2 text-xs">
                <Server className={`h-3 w-3 ${node.status === 'online' ? 'text-green-500' : 'text-yellow-500'}`} />
                <span className="text-slate-200">{node.name}</span>
                <span className="text-slate-500 font-mono">[{node.lat}]</span>
            </div>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Credentials</span>
            <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-slate-900">{credentials.length + 1240}</span>
            <span className="ml-2 text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+12%</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Ausgestellte Identitätsnachweise</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Transfervolumen</span>
            <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-baseline">
             <span className="text-3xl font-bold text-slate-900">84.2 MB</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Verschlüsselte Dokumente heute</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Sicherheit</span>
            <div className="p-2 bg-amber-100 rounded-lg">
                <Shield className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-slate-900">99.9%</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Uptime der Validator Nodes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Transaktionsvolumen</h3>
            <p className="text-sm text-slate-500">Hash-Verankerungen im Polygon PoS Netzwerk</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="txs" fill="#1e3a8a" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Audit Log Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Audit Trail</h3>
            <p className="text-sm text-slate-500">Unveränderliches Protokoll</p>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[340px] p-0">
            {auditLogs.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">Keine aktuellen Einträge</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start">
                      <div className="mt-1">
                        {log.action === 'ANCHOR_HASH' ? <FileText className="h-4 w-4 text-blue-500"/> : 
                         log.action === 'LOGIN' ? <Activity className="h-4 w-4 text-slate-400"/> :
                         <CheckCircle className="h-4 w-4 text-green-500"/>}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-slate-900">{log.action.replace('_', ' ')}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{new Date(log.timestamp).toLocaleTimeString()} Uhr</p>
                        <div className="mt-1 flex items-center gap-2">
                           <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 truncate max-w-[120px]">
                             {log.userId}
                           </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <button className="text-xs font-medium text-gov-blue hover:text-blue-700">Vollständiges Log exportieren</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;