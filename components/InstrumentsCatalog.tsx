import React, { useEffect, useState } from 'react';
import { Instrument } from '../types';
import { DbService } from '../services/mockDbService';
import { Server, Smartphone, Lock, Vote, Info, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const InstrumentsCatalog: React.FC = () => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await DbService.getInstruments();
      setInstruments(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const getIcon = (type: Instrument['type']) => {
    switch (type) {
      case 'SSI': return <Smartphone className="h-6 w-6" />;
      case 'NOTARIZATION': return <Lock className="h-6 w-6" />;
      case 'VOTING': return <Vote className="h-6 w-6" />;
      default: return <Server className="h-6 w-6" />;
    }
  };

  const getStatusBadge = (status: Instrument['maturityLevel']) => {
    switch (status) {
      case 'PRODUCTION':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Produktion
          </span>
        );
      case 'PILOT':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            Pilotphase
          </span>
        );
      case 'DEPRECATED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Abgekündigt
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold text-slate-900">Technische Instrumente</h2>
        <p className="mt-2 text-slate-600 max-w-2xl">
          Katalog der verfügbaren Blockchain-Komponenten und Smart Contracts für die öffentliche Verwaltung.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="h-48 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instruments.map((inst) => (
            <div key={inst.id} className="group bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 text-gov-blue rounded-lg group-hover:bg-gov-blue group-hover:text-white transition-colors">
                    {getIcon(inst.type)}
                  </div>
                  {getStatusBadge(inst.maturityLevel)}
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2">{inst.name}</h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                  {inst.description}
                </p>
                
                <div className="bg-slate-50 rounded-md p-3 border border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                    <Info className="w-3 h-3 mr-1" /> Tech Specs
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(inst.technicalSpecs).map(([key, value]) => (
                      <div key={key}>
                        <dt className="text-xs text-slate-400 capitalize">{key}</dt>
                        <dd className="text-xs font-mono text-slate-700 font-medium">{value}</dd>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-400">ID: {inst.id}</span>
                <button className="text-sm font-medium text-gov-blue hover:text-blue-800">
                  Dokumentation &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstrumentsCatalog;