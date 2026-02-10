
import React, { useEffect, useState, useRef } from 'react';
import { AlertOctagon, Activity, Server, Zap, CheckCircle, Lock, Unlock, TrendingUp, Radio, ShieldAlert, Cpu, Globe, Map } from 'lucide-react';
import { CrisisScenario } from '../types';
import { DbService } from '../services/mockDbService';
import { useUser } from '../contexts/UserContext';
import { useToast } from './ui/ToastSystem';

const CrisisCenter: React.FC = () => {
  const [scenarios, setScenarios] = useState<CrisisScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<CrisisScenario | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<number | null>(null);
  const lastVibrationRef = useRef<number>(0);
  
  const { user } = useUser();
  const { addToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await DbService.getScenarios();
    setScenarios(data);
    if(data.length > 0) setSelectedScenario(data[0]);
  };

  const startHold = () => {
    if (isActivating || selectedScenario?.active) return;
    
    holdTimerRef.current = window.setInterval(() => {
      setHoldProgress(prev => {
        const next = prev + 2.5;
        
        // Haptic Feedback during progress
        if (next >= 25 && prev < 25) navigator.vibrate?.(20);
        if (next >= 50 && prev < 50) navigator.vibrate?.(20);
        if (next >= 75 && prev < 75) navigator.vibrate?.(30);
        
        if (next >= 100) {
          clearInterval(holdTimerRef.current!);
          navigator.vibrate?.([100, 50, 100]); // Confirmation vibration
          triggerAction();
          return 100;
        }
        return next;
      });
    }, 25);
  };

  const endHold = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdProgress < 100) {
      setHoldProgress(0);
    }
  };

  const triggerAction = async () => {
      if (!selectedScenario || !user) return;
      setIsActivating(true);
      try {
          await new Promise(r => setTimeout(r, 1500)); 
          const updated = await DbService.triggerCrisis(selectedScenario.id, user.id);
          setSelectedScenario(updated);
          setScenarios(prev => prev.map(s => s.id === updated.id ? updated : s));
          addToast("NOTFALL-PROTOKOLL AKTIVIERT", "warning");
      } catch (e) {
          addToast("Aktivierung fehlgeschlagen", "error");
      } finally {
          setIsActivating(false);
          setHoldProgress(0);
      }
  };

  return (
    <div className="bg-slate-950 min-h-screen -m-4 sm:-m-8 p-4 sm:p-8 text-slate-300 pb-safe">
        
        {/* Top Status Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center border-b border-slate-800 pb-6 mb-6 sm:mb-8 gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="p-2 sm:p-3 bg-red-900/20 border border-red-900 rounded-lg animate-pulse">
                    <AlertOctagon className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                </div>
                <div>
                    <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight">LAGEZENTRUM</h1>
                    <div className="flex items-center gap-3 text-[10px] font-mono mt-1">
                        <span className="text-red-500">● MONITORING</span>
                        <span className="text-slate-600 hidden sm:inline">|</span>
                        <span className="text-slate-500">ENCRYPTED</span>
                    </div>
                </div>
            </div>
            <div className="text-center sm:text-right w-full sm:w-auto">
                <div className="text-2xl sm:text-4xl font-mono font-bold text-slate-700">00:00:00</div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            <div className="lg:col-span-3 space-y-4">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Szenarien</h3>
                <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 gap-3 scrollbar-hide scroll-container">
                    {scenarios.map(sc => (
                        <div 
                            key={sc.id} 
                            onClick={() => setSelectedScenario(sc)}
                            className={`flex-shrink-0 w-64 lg:w-full p-4 cursor-pointer border rounded-xl transition-all active-scale ${selectedScenario?.id === sc.id ? 'bg-red-950/30 border-red-800' : 'bg-slate-900 border-slate-800'}`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className={`text-[10px] font-bold uppercase ${selectedScenario?.id === sc.id ? 'text-red-400' : 'text-slate-500'}`}>Level {sc.severity}</span>
                                {sc.active && <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>}
                            </div>
                            <h4 className="text-sm font-bold text-white mb-1">{sc.name}</h4>
                            <p className="text-[10px] text-slate-500 line-clamp-1">{sc.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="lg:col-span-6 flex flex-col gap-6">
                <div className="flex-1 bg-slate-900/50 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px]">
                    <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full text-slate-600" fill="currentColor">
                            <pattern id="grid-crisis" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                            </pattern>
                            <rect width="100%" height="100%" fill="url(#grid-crisis)" />
                        </svg>
                    </div>
                    
                    {selectedScenario?.active ? (
                        <div className="relative z-10 text-center animate-in zoom-in duration-500 p-6">
                            <div className="inline-block p-4 sm:p-6 rounded-full bg-red-500/10 border border-red-500/50 mb-6 animate-pulse">
                                <ShieldAlert className="w-16 h-16 sm:w-24 sm:h-24 text-red-500" />
                            </div>
                            <h2 className="text-xl sm:text-3xl font-bold text-white mb-2 uppercase tracking-tighter">ALARMSTUFE ROT</h2>
                            <p className="text-red-500 font-mono text-xs sm:text-sm tracking-widest">PROTOKOLL EINGELEITET</p>
                        </div>
                    ) : (
                        <div className="relative z-10 text-center opacity-40">
                            <Globe className="w-16 h-16 sm:w-24 sm:h-24 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-500 font-mono text-[10px] sm:text-xs uppercase">Bereitschaftsmodus</p>
                        </div>
                    )}
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl flex flex-col items-center gap-6">
                    <div className="text-center w-full">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-4">Sicherheits-Auslöser</p>
                        
                        {!selectedScenario?.active ? (
                            <div className="relative w-full max-w-sm mx-auto">
                                <button 
                                    onMouseDown={startHold}
                                    onMouseUp={endHold}
                                    onMouseLeave={endHold}
                                    onTouchStart={startHold}
                                    onTouchEnd={endHold}
                                    className={`w-full py-5 rounded-xl font-black text-sm uppercase tracking-[0.2em] transition-all relative overflow-hidden flex items-center justify-center gap-3 touch-none select-none
                                        ${holdProgress > 0 ? 'bg-red-900/50 text-white' : 'bg-red-600 hover:bg-red-700 text-white shadow-lg'}
                                    `}
                                >
                                    {/* Progress Background */}
                                    <div 
                                        className="absolute left-0 top-0 bottom-0 bg-red-500 opacity-50 transition-all duration-75"
                                        style={{ width: `${holdProgress}%` }}
                                    ></div>
                                    
                                    <span className="relative z-10 flex items-center gap-2">
                                        {isActivating ? <Zap className="animate-spin w-5 h-5"/> : <Lock className="w-5 h-5"/>}
                                        {holdProgress > 0 ? `HALTEN (${Math.round(holdProgress)}%)` : 'GEDRÜCKT HALTEN'}
                                    </span>
                                </button>
                                <p className="text-[10px] text-slate-500 mt-4 italic">Zweistufiger Bestätigungsmechanismus mit haptischem Feedback.</p>
                            </div>
                        ) : (
                            <div className="w-full py-5 bg-red-950/40 border border-red-900 rounded-xl text-red-500 font-black text-sm uppercase flex items-center justify-center animate-pulse">
                                <Unlock className="w-5 h-5 mr-3" /> Protokoll Läuft
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-64 lg:h-auto">
                <div className="p-3 border-b border-slate-800 bg-slate-950">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Execution Log</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-[10px] scroll-container">
                    {selectedScenario?.automatedActions.map((action, idx) => (
                        <div key={idx} className={`p-3 rounded-lg border ${action.status === 'EXECUTED' ? 'bg-green-950/10 border-green-900/40' : 'bg-slate-800/30 border-slate-800/50'}`}>
                            <div className="flex justify-between mb-1">
                                <span className={action.status === 'EXECUTED' ? 'text-green-500 font-bold' : 'text-slate-600'}>
                                    {action.status === 'EXECUTED' ? '[OK]' : '[...]'}
                                </span>
                            </div>
                            <p className="text-slate-300 mb-1 leading-tight">{action.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default CrisisCenter;
