import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { DbService } from '../services/mockDbService';
import { AuditLog } from '../types';
import { Shield, Key, FileCheck, Lock, Activity, Eye, UserCog, Calendar, CheckCircle } from 'lucide-react';
import { useToast } from './ui/ToastSystem';

const UserProfile: React.FC = () => {
  const { user } = useUser();
  const [activities, setActivities] = useState<AuditLog[]>([]);
  const [highContrast, setHighContrast] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchActivity = async () => {
      if (user) {
        const logs = await DbService.getUserActivity(user.id);
        setActivities(logs);
      }
    };
    fetchActivity();
  }, [user]);

  // Handle High Contrast Toggle
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('contrast-more');
      document.body.style.filter = 'contrast(1.25) saturate(0.8)';
      document.body.style.backgroundColor = '#f0f0f0';
    } else {
      document.documentElement.classList.remove('contrast-more');
      document.body.style.filter = '';
      document.body.style.backgroundColor = '';
    }
  }, [highContrast]);

  const toggleHighContrast = () => {
      setHighContrast(!highContrast);
      addToast(highContrast ? "Standard-Ansicht aktiviert" : "Hoher Kontrast aktiviert (BITV 2.0)", "info");
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2">
      
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 h-32 relative">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
             <div className="absolute -bottom-10 left-8">
                 <div className="w-24 h-24 bg-white rounded-full p-1.5 shadow-lg">
                     <div className="w-full h-full bg-gov-blue rounded-full flex items-center justify-center text-3xl font-bold text-white">
                         {user.name.charAt(0)}
                     </div>
                 </div>
             </div>
        </div>
        <div className="pt-12 pb-6 px-8 flex justify-between items-start">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
                <p className="text-slate-500">{user.department}</p>
                <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        {user.role}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Authentifiziert (eID)
                    </span>
                </div>
            </div>
            <div className="flex gap-3">
                 <button 
                    onClick={toggleHighContrast}
                    className={`flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors
                    ${highContrast ? 'bg-black text-yellow-300 border-black' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                 >
                     <Eye className="w-4 h-4 mr-2" />
                     {highContrast ? 'Kontrast: Hoch' : 'Kontrast: Standard'}
                 </button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Certificates */}
          <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-gov-blue"/> Zertifikatsverwaltung
              </h2>
              
              {/* Virtual Smartcard */}
              <div className="bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl p-6 shadow-md border border-slate-300 relative overflow-hidden h-56 flex flex-col justify-between">
                  {/* Card Chip */}
                  <div className="w-12 h-10 bg-yellow-200 rounded border border-yellow-400 flex items-center justify-center shadow-inner">
                      <div className="grid grid-cols-2 gap-1 opacity-50">
                          <div className="w-2 h-2 border border-yellow-600 rounded-sm"></div>
                          <div className="w-2 h-2 border border-yellow-600 rounded-sm"></div>
                          <div className="w-2 h-2 border border-yellow-600 rounded-sm"></div>
                          <div className="w-2 h-2 border border-yellow-600 rounded-sm"></div>
                      </div>
                  </div>

                  <div className="text-slate-800">
                      <p className="text-xs uppercase tracking-widest mb-1 opacity-60">Dienstausweis Bund</p>
                      <p className="font-mono font-bold text-lg tracking-wider">8372 1928 4710 3921</p>
                  </div>

                  <div className="flex justify-between items-end">
                       <div className="text-xs">
                           <p className="uppercase opacity-60">Inhaber</p>
                           <p className="font-semibold">{user.name}</p>
                       </div>
                       <div className="text-xs text-right">
                           <p className="uppercase opacity-60">Gültig bis</p>
                           <p className="font-mono">12/29</p>
                       </div>
                  </div>

                  {/* Hologram Overlay */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>
              </div>

              {/* Certificate List */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 font-medium text-sm text-slate-700">
                      Aktive Zertifikate
                  </div>
                  <div className="divide-y divide-slate-100">
                      <div className="p-4 flex items-center gap-3">
                          <div className="bg-green-100 p-2 rounded text-green-600">
                              <Key className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                              <p className="text-sm font-bold text-slate-900">Signatur (QES)</p>
                              <p className="text-xs text-slate-500">Qualifizierte Elektronische Signatur</p>
                          </div>
                          <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">Aktiv</span>
                      </div>
                      <div className="p-4 flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded text-blue-600">
                              <Lock className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                              <p className="text-sm font-bold text-slate-900">Verschlüsselung</p>
                              <p className="text-xs text-slate-500">S/MIME Zertifikat (VS-NfD)</p>
                          </div>
                          <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">Aktiv</span>
                      </div>
                  </div>
                  <div className="bg-slate-50 p-3 text-center border-t border-slate-100">
                      <button className="text-xs text-gov-blue font-medium hover:underline">
                          Zertifikate sperren / erneuern
                      </button>
                  </div>
              </div>
          </div>

          {/* Column 2 & 3: Activity Log */}
          <div className="lg:col-span-2 space-y-6">
               <h2 className="text-lg font-bold text-slate-900 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-gov-blue"/> Persönliches Audit-Log
              </h2>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                  <div className="p-6 border-b border-slate-100">
                      <p className="text-sm text-slate-600">
                          Dieses Protokoll listet alle kryptografischen Operationen auf, die mit Ihrer Identität durchgeführt wurden. 
                          Die Daten sind unveränderlich in der privaten Permissioned Chain gespeichert.
                      </p>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                      {activities.length > 0 ? (
                          activities.map(log => (
                              <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4">
                                  <div className={`mt-1 p-1.5 rounded-full flex-shrink-0 
                                      ${log.action.includes('SIGN') ? 'bg-amber-100 text-amber-600' : 
                                        log.action.includes('VOTE') ? 'bg-purple-100 text-purple-600' :
                                        'bg-blue-100 text-blue-600'}`}>
                                      {log.action.includes('SIGN') ? <FileCheck className="w-4 h-4" /> : 
                                       log.action.includes('VOTE') ? <UserCog className="w-4 h-4" /> :
                                       <Activity className="w-4 h-4" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-slate-900">
                                          {log.action.replace(/_/g, ' ')}
                                      </p>
                                      <p className="text-xs text-slate-500 mt-0.5 font-mono truncate">
                                          Hash: {log.id.split('-').pop()}... • IP-Hash: {log.ipHash.substring(0,8)}...
                                      </p>
                                      {log.metadata && (
                                          <div className="mt-2 text-xs bg-slate-50 p-2 rounded border border-slate-100 font-mono text-slate-600 overflow-x-auto">
                                              {log.metadata}
                                          </div>
                                      )}
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                      <div className="flex items-center text-xs text-slate-500 mb-1">
                                          <Calendar className="w-3 h-3 mr-1" />
                                          {new Date(log.timestamp).toLocaleDateString()}
                                      </div>
                                      <div className="text-xs text-slate-400">
                                          {new Date(log.timestamp).toLocaleTimeString()}
                                      </div>
                                  </div>
                              </div>
                          ))
                      ) : (
                          <div className="p-12 text-center text-slate-400">
                              Keine Aktivitäten gefunden.
                          </div>
                      )}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default UserProfile;