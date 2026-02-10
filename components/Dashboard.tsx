
import React, { useEffect, useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { AuditLog, Proposal, VerifiableCredential, WorkflowTask } from '../types';
import { DbService } from '../services/mockDbService';
import { RefreshCw, FileText, CheckCircle, Activity, Server, Shield, PenTool, ArrowRight, Vote, Clock, TrendingUp, Zap, Users, AlertTriangle, ChevronRight, Lock } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [credentials, setCredentials] = useState<VerifiableCredential[]>([]);
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const fetchData = async () => {
    setLoading(true);
    const [logs, creds, fetchedTasks] = await Promise.all([
      DbService.getAuditLogs(),
      DbService.getCredentials(),
      DbService.getWorkflowTasks()
    ]);
    setAuditLogs(logs);
    setCredentials(creds);
    setTasks(fetchedTasks);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const trafficData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 24; i >= 0; i--) {
        const hour = new Date(now.getTime() - i * 3600000);
        let val = Math.floor(Math.random() * 20) + 10;
        const h = hour.getHours();
        if (h > 8 && h < 17) val += 30;
        data.push({
            time: `${h}:00`,
            txs: val,
            security: Math.floor(val * 0.9)
        });
    }
    return data;
  }, [auditLogs]);

  const pendingTasks = tasks.filter(t => t.status === 'PENDING');
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* 1. Mission Control Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gov-dark border border-slate-800 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between p-8 gap-6">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 text-blue-400/80">
                    <Shield className="w-4 h-4" />
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase">GovChain Command Node</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                    {user?.name}
                </h1>
                <div className="flex items-center gap-3 text-slate-400 text-sm">
                    <span className="flex items-center text-green-400">
                        <Activity className="w-3 h-3 mr-1.5" /> System Normal
                    </span>
                    <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                    <span>{user?.department}</span>
                </div>
            </div>

            <div className="flex gap-3">
                <div className="glass-panel-dark rounded-xl p-4 flex flex-col justify-center min-w-[140px] hover:bg-white/5 transition-colors">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Block Height</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-mono font-bold text-white">#19.2M</span>
                        <span className="text-[10px] text-green-400 animate-pulse">●</span>
                    </div>
                </div>
                <div className="glass-panel-dark rounded-xl p-4 flex flex-col justify-center min-w-[140px] hover:bg-white/5 transition-colors">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Netzwerk</span>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-mono font-bold text-blue-400">42</span>
                        <span className="text-xs text-slate-500">Peers</span>
                    </div>
                </div>
            </div>
          </div>
      </div>

      {/* 2. Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
          
          {/* Main Chart - Spans 2 cols, 2 rows */}
          <div className="md:col-span-2 md:row-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                  <div>
                      <h3 className="text-base font-bold text-slate-900">Netzwerk-Aktivität</h3>
                      <p className="text-xs text-slate-500">Transaktionen pro Stunde (PoA Consensus)</p>
                  </div>
                  <button onClick={fetchData} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                      <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                  </button>
              </div>
              <div className="flex-1 w-full min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trafficData}>
                          <defs>
                              <linearGradient id="colorTxs" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                          <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
                              itemStyle={{ color: '#e2e8f0' }}
                          />
                          <Area type="monotone" dataKey="txs" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTxs)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Task Widget */}
          <div onClick={() => onNavigate('signatures')} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <FileText className="w-24 h-24 text-blue-600 transform rotate-12 translate-x-4 -translate-y-4" />
              </div>
              <div>
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <PenTool className="w-5 h-5" />
                      </div>
                      {pendingTasks.length > 0 && <span className="flex h-2 w-2 rounded-full bg-red-500"></span>}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">{pendingTasks.length}</h3>
                  <p className="text-sm text-slate-500 font-medium">Offene E-Akten</p>
              </div>
              <div className="mt-4 text-xs font-semibold text-blue-600 flex items-center group-hover:translate-x-1 transition-transform">
                  Zur Mappe <ChevronRight className="w-3 h-3 ml-1" />
              </div>
          </div>

          {/* Identity Widget */}
          <div onClick={() => onNavigate('ssi')} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-green-300 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Users className="w-24 h-24 text-green-600 transform rotate-12 translate-x-4 -translate-y-4" />
              </div>
              <div>
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                          <CheckCircle className="w-5 h-5" />
                      </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">{credentials.length}</h3>
                  <p className="text-sm text-slate-500 font-medium">Aktive IDs</p>
              </div>
              <div className="mt-4 text-xs font-semibold text-green-600 flex items-center group-hover:translate-x-1 transition-transform">
                  Wallet öffnen <ChevronRight className="w-3 h-3 ml-1" />
              </div>
          </div>

          {/* Audit Log Feed - Tall vertical */}
          <div className="md:col-span-1 md:row-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 backdrop-blur-sm flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 text-sm">Live Audit</h3>
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono">IMMUTABLE</span>
              </div>
              <div className="flex-1 overflow-y-auto p-0">
                  <div className="divide-y divide-slate-100">
                      {auditLogs.slice(0, 8).map((log) => (
                          <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors flex gap-3 group">
                              <div className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 
                                ${log.action.includes('ALERT') ? 'bg-red-500' : 'bg-blue-400'}`}></div>
                              <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-slate-700 truncate group-hover:text-blue-600 transition-colors">{log.action}</p>
                                  <p className="text-[10px] text-slate-400 font-mono truncate">{log.userId}</p>
                              </div>
                              <div className="text-[10px] text-slate-400 whitespace-nowrap font-medium">
                                  {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                  <button onClick={() => onNavigate('compliance')} className="text-xs font-bold text-slate-600 hover:text-blue-600 uppercase tracking-wide">
                      Full Log
                  </button>
              </div>
          </div>

          {/* Quick Actions - Wide */}
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
              <button onClick={() => onNavigate('data-exchange')} className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-purple-300 transition-all group">
                  <Server className="w-6 h-6 text-slate-400 group-hover:text-purple-600 mb-2 transition-colors" />
                  <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">Registerabfrage</span>
              </button>
              <button onClick={() => onNavigate('crisis')} className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-red-300 transition-all group">
                  <AlertTriangle className="w-6 h-6 text-slate-400 group-hover:text-red-600 mb-2 transition-colors" />
                  <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">Lagezentrum</span>
              </button>
              <button onClick={() => onNavigate('procurement')} className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-orange-300 transition-all group">
                  <Lock className="w-6 h-6 text-slate-400 group-hover:text-orange-600 mb-2 transition-colors" />
                  <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">Vergabe (Sealed)</span>
              </button>
              <button onClick={() => onNavigate('network')} className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-blue-300 transition-all group">
                  <Activity className="w-6 h-6 text-slate-400 group-hover:text-blue-600 mb-2 transition-colors" />
                  <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">Infrastruktur</span>
              </button>
          </div>

      </div>
    </div>
  );
};

export default Dashboard;
