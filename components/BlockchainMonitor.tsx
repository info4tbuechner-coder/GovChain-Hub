import React, { useEffect, useState } from 'react';
import { Block, NetworkNode } from '../types';
import { DbService } from '../services/mockDbService';
import { Server, Activity, Globe, Cpu, Box, Clock, Layers, Zap, Wifi } from 'lucide-react';

const BlockchainMonitor: React.FC = () => {
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  // Poll for new blocks to simulate live feed
  useEffect(() => {
    const fetchInitial = async () => {
      const n = await DbService.getNetworkNodes();
      const b = await DbService.getRecentBlocks();
      setNodes(n);
      setBlocks(b);
      setLoading(false);
    };
    fetchInitial();

    const interval = setInterval(async () => {
      const b = await DbService.getRecentBlocks();
      setBlocks(b);
    }, 4000); // Fast polling for demo effect

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-12 text-center text-slate-400">Initialisiere Netzwerk-Verbindung...</div>;

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Header Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 rounded-xl p-4 text-white shadow-lg border border-slate-700 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Layers className="w-12 h-12" />
            </div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Block Height</p>
            <p className="text-2xl font-mono font-bold text-blue-400 mt-1">#{blocks[0]?.height.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900 rounded-xl p-4 text-white shadow-lg border border-slate-700 relative overflow-hidden group">
             <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap className="w-12 h-12" />
            </div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Throughput</p>
            <p className="text-2xl font-mono font-bold text-green-400 mt-1">1,420 TPS</p>
        </div>
        <div className="bg-slate-900 rounded-xl p-4 text-white shadow-lg border border-slate-700 relative overflow-hidden group">
             <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Globe className="w-12 h-12" />
            </div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Peers</p>
            <p className="text-2xl font-mono font-bold text-purple-400 mt-1">{nodes.length + 12}</p>
        </div>
        <div className="bg-slate-900 rounded-xl p-4 text-white shadow-lg border border-slate-700 relative overflow-hidden group">
             <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Clock className="w-12 h-12" />
            </div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Block Time</p>
            <p className="text-2xl font-mono font-bold text-amber-400 mt-1">12.0s</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Network Topology / Node List */}
          <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center">
                      <Server className="w-5 h-5 mr-2 text-gov-blue" />
                      Infrastruktur Knoten
                  </h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                      All Systems Operational
                  </span>
              </div>
              
              <div className="space-y-3">
                  {nodes.map(node => (
                      <div key={node.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3 hover:shadow-md transition-shadow">
                          <div className={`mt-1 w-3 h-3 rounded-full ${node.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                          <div className="flex-1">
                              <div className="flex justify-between items-start">
                                  <h4 className="font-bold text-sm text-slate-900">{node.name}</h4>
                                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1 rounded">{node.version}</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">{node.organization}</p>
                              
                              <div className="flex gap-4 mt-3 text-xs text-slate-400">
                                  <span className="flex items-center"><Wifi className="w-3 h-3 mr-1"/> {node.latency}ms</span>
                                  <span className="flex items-center"><Globe className="w-3 h-3 mr-1"/> {node.peers} Peers</span>
                                  <span className="flex items-center uppercase text-[10px] font-bold tracking-wide border border-slate-200 px-1 rounded">
                                      {node.role}
                                  </span>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* Live Block Feed */}
          <div className="lg:col-span-2 space-y-4">
               <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center">
                      <Box className="w-5 h-5 mr-2 text-gov-blue" />
                      Live Block Feed
                  </h3>
                  <div className="flex items-center text-xs text-slate-500">
                      <Activity className="w-4 h-4 mr-1 text-gov-blue animate-pulse" />
                      Echtzeit-Synchronisation
                  </div>
              </div>

              <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-slate-100 text-slate-500 font-medium">
                              <tr>
                                  <th className="px-6 py-3">Block Height</th>
                                  <th className="px-6 py-3">Hash</th>
                                  <th className="px-6 py-3">Proposer (Validator)</th>
                                  <th className="px-6 py-3">TXs</th>
                                  <th className="px-6 py-3">Zeit</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                              {blocks.map((block, index) => (
                                  <tr key={block.hash} className={`hover:bg-blue-50 transition-colors ${index === 0 ? 'animate-in slide-in-from-top-2 bg-blue-50/30' : ''}`}>
                                      <td className="px-6 py-4 font-mono font-bold text-gov-blue">
                                          #{block.height}
                                      </td>
                                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                          {block.hash.substring(0, 10)}...{block.hash.substring(block.hash.length - 4)}
                                      </td>
                                      <td className="px-6 py-4">
                                          <div className="flex items-center">
                                              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] mr-2 text-slate-600 font-bold">
                                                  {block.proposer.charAt(0)}
                                              </div>
                                              <span className="text-slate-700 font-medium">{block.proposer}</span>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                                              {block.txCount}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4 text-slate-500 text-xs">
                                          {block.timestamp.toLocaleTimeString()}
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
              
              <div className="p-4 bg-blue-900 rounded-lg text-blue-100 text-sm flex items-start gap-3 mt-4">
                  <Cpu className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-300" />
                  <div>
                      <p className="font-bold mb-1">Konsens-Mechanismus: Proof of Authority (PoA)</p>
                      <p className="opacity-80">
                          In diesem Regierungs-Netzwerk dürfen nur autorisierte Knoten (Validatoren) neue Blöcke erstellen. 
                          Dies garantiert DSGVO-Konformität und hohe Transaktionsraten bei minimalem Energieverbrauch.
                      </p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default BlockchainMonitor;