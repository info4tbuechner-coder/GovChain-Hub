import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AuditLog, Proposal, VerifiableCredential, WorkflowTask } from '../types';
import { DbService } from '../services/mockDbService';
import { RefreshCw, FileText, CheckCircle, Activity, Server, Shield, PenTool, ArrowRight, Vote, Clock } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [credentials, setCredentials] = useState<VerifiableCredential[]>([]);
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const fetchData = async () => {
    setLoading(true);
    const [logs, creds, fetchedTasks, fetchedProposals] = await Promise.all([
      DbService.getAuditLogs(),
      DbService.getCredentials(),
      DbService.getWorkflowTasks(),
      DbService.getProposals()
    ]);
    setAuditLogs(logs);
    setCredentials(creds);
    setTasks(fetchedTasks);
    setProposals(fetchedProposals);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Dynamic Data Calculation ---

  // Chart Data: Group logs by day of week
  const chartData = useMemo(() => {
    const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const counts = new Array(7).fill(0);
    const today = new Date().getDay();
    
    // Initialize with 0 for the last 7 days order
    const data = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        data.push({ name: days[d.getDay()], txs: 0, date: d.toDateString() });
    }

    auditLogs.forEach(log => {
        const logDate = new Date(log.timestamp).toDateString();
        const entry = data.find(d => d.date === logDate);
        if (entry) entry.txs++;
    });

    return data;
  }, [auditLogs]);

  const pendingTasks = tasks.filter(t => t.status === 'PENDING');
  const activeProposal = proposals.find(p => p.status === 'ACTIVE');
  const transferVolume = auditLogs.filter(l => l.action === 'ANCHOR_HASH').length * 2.4; // Mock avg size 2.4MB

  const nodes = [
    { name: 'Bundesdruckerei Node 1', status: 'online', lat: '12ms' },
    { name: 'BMI Node 04', status: 'online', lat: '24ms' },
    { name: 'BSI Validator', status: 'syncing', lat: '45ms' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Personalized Greeting */}
      <div className="bg-gradient-to-r from-gov-blue to-blue-800 rounded-xl p-6 text-white shadow-lg flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Willkommen zurück, {user?.name}</h2>
            <p className="opacity-80 mt-1">{user?.department} • {user?.role}</p>
          </div>
          <div className="hidden md:block">
            <div className="text-right text-xs opacity-70 mb-1">Letzter Login</div>
            <div className="font-mono text-sm">{new Date().toLocaleDateString()} 08:42 Uhr</div>
          </div>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* KPI 1: Signatures */}
        <div 
            onClick={() => onNavigate('signatures')}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Offene Aufgaben</span>
            <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                <PenTool className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-slate-900">{pendingTasks.length}</span>
            {pendingTasks.length > 0 && <span className="ml-2 text-sm font-medium text-amber-600 animate-pulse">● Handlungsbedarf</span>}
          </div>
          <p className="text-xs text-slate-400 mt-2">Dokumente zur Signatur (E-Akte)</p>
        </div>

        {/* KPI 2: Credentials */}
        <div 
            onClick={() => onNavigate('ssi')}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Identitäten</span>
            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-slate-900">{credentials.length}</span>
            <span className="ml-2 text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Active</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Ausgestellte Verifiable Credentials</p>
        </div>
        
        {/* KPI 3: Transfer Volume */}
        <div 
            onClick={() => onNavigate('transfer')}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Transfervolumen</span>
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-baseline">
             <span className="text-3xl font-bold text-slate-900">{transferVolume.toFixed(1)} MB</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Verschlüsselte Dokumente (Total)</p>
        </div>

         {/* KPI 4: Security */}
         <div 
            onClick={() => onNavigate('security')}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Sicherheit</span>
            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Shield className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-slate-900">100%</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Audit Log Integrity Check</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Tasks & Chart */}
        <div className="lg:col-span-2 space-y-8">
            {/* Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Transaktionsaktivität</h3>
                        <p className="text-sm text-slate-500">Hash-Verankerungen & Smart Contract Calls (7 Tage)</p>
                    </div>
                </div>
                <div className="h-72">
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

            {/* My Pending Tasks Widget */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-slate-500"/>
                        Meine Aufgaben
                    </h3>
                    <button 
                        onClick={() => onNavigate('signatures')}
                        className="text-sm text-gov-blue font-medium hover:underline flex items-center"
                    >
                        Alle ansehen <ArrowRight className="w-4 h-4 ml-1"/>
                    </button>
                </div>
                {pendingTasks.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {pendingTasks.slice(0, 3).map(task => (
                            <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`w-2 h-2 rounded-full ${task.priority === 'HIGH' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                                        <h4 className="text-sm font-medium text-slate-900">{task.title}</h4>
                                    </div>
                                    <p className="text-xs text-slate-500 ml-4">{task.type} • {task.requester}</p>
                                </div>
                                <button 
                                    onClick={() => onNavigate('signatures')}
                                    className="px-3 py-1 text-xs border border-slate-300 rounded hover:bg-white hover:border-gov-blue hover:text-gov-blue transition-all opacity-0 group-hover:opacity-100"
                                >
                                    Bearbeiten
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-slate-400 text-sm">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-200" />
                        Alles erledigt! Keine offenen Aufgaben.
                    </div>
                )}
            </div>
        </div>

        {/* Right Column: Voting & Logs */}
        <div className="space-y-8">
             {/* Active Voting Widget */}
             <div className="bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Vote className="w-24 h-24" />
                </div>
                <div className="p-6 relative z-10">
                    <h3 className="text-lg font-bold mb-4 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-green-400"/>
                        Aktuelle Abstimmung
                    </h3>
                    
                    {activeProposal ? (
                        <>
                            <h4 className="font-semibold text-lg leading-tight mb-2">{activeProposal.title}</h4>
                            <p className="text-slate-400 text-sm mb-6 line-clamp-2">{activeProposal.description}</p>
                            
                            <div className="space-y-3 mb-6">
                                <div>
                                    <div className="flex justify-between text-xs mb-1 text-slate-300">
                                        <span>Beteiligung</span>
                                        <span>{activeProposal.totalVoters} Stimmen</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => onNavigate('voting')}
                                className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-medium transition-colors"
                            >
                                Zur Wahlkabine
                            </button>
                        </>
                    ) : (
                        <p className="text-slate-400 text-sm">Derzeit keine aktiven Abstimmungen.</p>
                    )}
                </div>
             </div>

            {/* Audit Log Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col max-h-[400px]">
                <div className="p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
                    <h3 className="text-lg font-bold text-slate-900">Audit Trail</h3>
                    <p className="text-sm text-slate-500">Letzte Blockchain-Interaktionen</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-0">
                    {auditLogs.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-sm">Keine aktuellen Einträge</div>
                    ) : (
                    <div className="divide-y divide-slate-100">
                        {auditLogs.slice(0, 10).map((log) => (
                        <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start">
                            <div className="mt-1">
                                {log.action === 'ANCHOR_HASH' ? <FileText className="h-4 w-4 text-blue-500"/> : 
                                log.action === 'LOGIN' ? <Activity className="h-4 w-4 text-slate-400"/> :
                                log.action === 'SIGN_DOCUMENT' ? <PenTool className="h-4 w-4 text-amber-500"/> :
                                log.action === 'CAST_VOTE' ? <Vote className="h-4 w-4 text-purple-500"/> :
                                <CheckCircle className="h-4 w-4 text-green-500"/>}
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-slate-900">{log.action.replace('_', ' ')}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()} Uhr</p>
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
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;