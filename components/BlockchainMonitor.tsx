
import React, { useEffect, useState } from 'react';
import { Block, NetworkNode } from '../types';
import { DbService } from '../services/mockDbService';
// Added X to the list of icons imported from lucide-react to fix 'Cannot find name' error
import { Server, Activity, Globe, Cpu, Box, Clock, Layers, Zap, Wifi, X } from 'lucide-react';

const BlockchainMonitor: React.FC = () => {
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);

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
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-12 text-center text-slate-400">Netzwerk-Synchronisation...</div>;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in pr-safe pl-safe">
      
      {/* Header Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-lg border border-slate-700 relative overflow-hidden group active-scale">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Block Height</p>
            <p className="text-xl sm:text-2xl font-mono font-bold text-blue-400">#{blocks[0]?.height.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-lg border border-slate-700 relative overflow-hidden group active-scale">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Peers</p>
            <p className="text-xl sm:text-2xl font-mono font-bold text-purple-400">{nodes.length + 12}</p>
        </div>
        <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-lg border border-slate-700 relative overflow-hidden hidden sm:block">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Throughput</p>
            <p className="text-2xl font-mono font-bold text-green-400">1,420 TPS</p>
        </div>
        <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-lg border border-slate-700 relative overflow-hidden hidden sm:block">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Block Time</p>
            <p className="text-2xl font-mono font-bold text-amber-400">12.0s</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Live Block Feed - Responsive Wrapper */}
          <div className="lg:col-span-3 space-y-4">
               <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center">
                      <Box className="w-5 h-5 mr-2 text-gov-blue" />
                      Live Ledger Feed
                  </h3>
              </div>

              <div className="relative group">
                  {/* Visual Indicator for scroll */}
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 sm:hidden opacity-50 group-hover:opacity-0 transition-opacity"></div>
                  
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto scrollbar-hide">
                      <table className="min-w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-widest border-b border-slate-100">
                              <tr>
                                  <th className="px-6 py-4">Height</th>
                                  <th className="px-6 py-4">Validator</th>
                                  <th className="px-6 py-4">TXs</th>
                                  <th className="px-6 py-4">Timestamp</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {blocks.map((block, index) => (
                                  <tr key={block.hash} className={`hover:bg-blue-50 transition-colors ${index === 0 ? 'bg-blue-50/20' : ''}`}>
                                      <td className="px-6 py-4 font-mono font-bold text-gov-blue">
                                          #{block.height}
                                      </td>
                                      <td className="px-6 py-4">
                                          <div className="flex items-center">
                                              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] mr-2 text-slate-500 font-bold border border-slate-200">
                                                  {block.proposer.charAt(0)}
                                              </div>
                                              <span className="text-slate-600 font-medium">{block.proposer}</span>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                              {block.txCount}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4 text-slate-400 text-[10px]">
                                          {block.timestamp.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', second: '2-digit'})}
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>

          {/* Infrastructure Map - Smaller/Full width on mobile */}
          <div className="lg:col-span-1 space-y-4">
               <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-gov-blue" />
                  Validator Nodes
              </h3>
              <div className="bg-slate-950 rounded-2xl shadow-xl border border-slate-800 aspect-square sm:aspect-auto sm:h-[400px] relative overflow-hidden touch-none">
                  {/* Grid Background */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

                  {nodes.map(node => (
                      <div 
                        key={node.id}
                        className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${node.coordinates.x}%`, top: `${node.coordinates.y}%` }}
                        onClick={() => setSelectedNode(node)}
                      >
                          <div className="relative group">
                              <span className={`block w-2.5 h-2.5 rounded-full ${node.status === 'ACTIVE' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-slate-600'}`}></span>
                              <span className={`absolute -inset-1 rounded-full opacity-20 animate-ping ${node.status === 'ACTIVE' ? 'bg-blue-400' : ''}`}></span>
                          </div>
                      </div>
                  ))}

                  {selectedNode && (
                      <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700 text-[10px] animate-in slide-in-from-bottom-2">
                          <div className="flex justify-between items-start mb-2">
                              <p className="font-bold text-white">{selectedNode.name}</p>
                              <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white"><X className="w-3 h-3"/></button>
                          </div>
                          <div className="flex gap-4 text-slate-400">
                              <span>Latency: <b className="text-blue-400">{selectedNode.latency}ms</b></span>
                              <span>Status: <b className="text-green-500">{selectedNode.status}</b></span>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default BlockchainMonitor;
