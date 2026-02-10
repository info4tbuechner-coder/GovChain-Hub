
import React, { useEffect, useState, useRef } from 'react';
import { FileText, CheckCircle, Clock, Search, Briefcase, PenTool, Lock, AlertCircle, FileCheck, ChevronLeft, Hash, X, RefreshCw } from 'lucide-react';
import { WorkflowTask } from '../types';
import { DbService } from '../services/mockDbService';
import { useUser } from '../contexts/UserContext';
import { useToast } from './ui/ToastSystem';

const SignatureFolder: React.FC = () => {
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<WorkflowTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const pinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const { user } = useUser();
  const { addToast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const data = await DbService.getWorkflowTasks();
    setTasks(data);
    setLoading(false);
  };

  const handlePinChange = (index: number, value: string) => {
    // Check if user pasted a full code or multiple digits
    if (value.length > 1) {
        const digits = value.replace(/\D/g, '').split('').slice(0, 6);
        const newPin = [...pin];
        digits.forEach((d, i) => {
            if (i < 6) newPin[i] = d;
        });
        setPin(newPin);
        
        // Focus the last filled field or the next empty one
        const nextIdx = Math.min(digits.length, 5);
        pinRefs[nextIdx].current?.focus();
        return;
    }

    const char = value.slice(-1);
    if (!/^\d*$/.test(char)) return;

    const newPin = [...pin];
    newPin[index] = char;
    setPin(newPin);

    if (char !== '' && index < 5) {
      pinRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && pin[index] === '' && index > 0) {
      pinRefs[index - 1].current?.focus();
    }
  };

  const handleSign = async () => {
    const fullPin = pin.join('');
    if (!selectedTask || !user) return;
    if (fullPin.length < 6) {
        addToast("Bitte geben Sie Ihre vollständige 6-stellige eID PIN ein.", "warning");
        return;
    }

    setIsSigning(true);
    try {
        await DbService.signTask(selectedTask.id, user.id);
        await DbService.createAuditLog(user.id, 'SIGN_DOCUMENT', JSON.stringify({ 
            taskId: selectedTask.id, 
            docRef: selectedTask.documentRef,
            level: 'QES' 
        }));
        
        addToast("Dokument qualifiziert elektronisch signiert (QES)", "success");
        setPin(['', '', '', '', '', '']);
        await fetchTasks();
        setSelectedTask(prev => prev ? { ...prev, status: 'SIGNED', signedAt: new Date(), signatureHash: '0x' + Math.random().toString(16).substring(2, 12) } : null);
    } catch (e) {
        addToast("Signaturfehler: Smartcard nicht erkannt.", "error");
    } finally {
        setIsSigning(false);
    }
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
        case 'HIGH': return 'text-red-600 bg-red-50 border-red-100';
        case 'MEDIUM': return 'text-amber-600 bg-amber-50 border-amber-100';
        default: return 'text-blue-600 bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[600px] h-full pb-safe">
      
      <div className={`w-full md:w-1/3 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${selectedTask ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-gov-blue" />
                Unterschriftenmappe
            </h2>
            <div className="mt-3 relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Vorgang suchen..." 
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-gov-blue focus:border-gov-blue outline-none"
                />
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scroll-container scrollbar-hide">
            {loading ? (
                <div className="p-8 text-center text-slate-400 text-sm">Lade Vorgänge...</div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {tasks.map(task => (
                        <button 
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className={`w-full text-left p-4 transition-colors hover:bg-blue-50 active:bg-slate-100 touch-target
                                ${selectedTask?.id === task.id ? 'bg-blue-50 border-l-4 border-l-gov-blue' : 'border-l-4 border-l-transparent'}
                            `}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                </span>
                                <span className="text-xs text-slate-400">
                                    {task.createdAt.toLocaleDateString()}
                                </span>
                            </div>
                            <h4 className={`text-sm font-semibold mb-1 ${selectedTask?.id === task.id ? 'text-gov-blue' : 'text-slate-900'}`}>
                                {task.title}
                            </h4>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-slate-500 flex items-center">
                                    <FileText className="w-3 h-3 mr-1" /> {task.type}
                                </span>
                                {task.status === 'SIGNED' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Clock className="w-5 h-5 text-amber-500" />}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
      </div>

      <div className={`w-full md:w-2/3 flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative ${selectedTask ? 'flex' : 'hidden md:flex'}`}>
          {selectedTask ? (
              <>
                <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center bg-white sticky top-0 z-10">
                    <button 
                        onClick={() => setSelectedTask(null)}
                        className="md:hidden p-2 mr-3 -ml-2 text-slate-400 hover:text-slate-900 touch-target active-scale"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                            <h2 className="text-base sm:text-xl font-bold text-slate-900 truncate">{selectedTask.title}</h2>
                            {selectedTask.status === 'SIGNED' && (
                                <span className="hidden sm:flex px-1.5 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold rounded items-center">
                                    <Lock className="w-3 h-3 mr-1" /> SIGNIERT
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">Ref: {selectedTask.id} • {selectedTask.requester}</p>
                    </div>
                </div>

                <div className="flex-1 bg-slate-100 p-3 sm:p-8 overflow-y-auto scroll-container">
                    <div className="max-w-3xl mx-auto bg-white shadow-lg min-h-[600px] p-6 sm:p-12 relative overflow-hidden selectable-text">
                        <div className="border-b-2 border-slate-900 mb-6 sm:mb-8 pb-4 flex justify-between items-end">
                            <div>
                                <h1 className="text-lg sm:text-2xl font-serif text-slate-900 uppercase">Bundesverwaltungsamt</h1>
                                <p className="text-[10px] sm:text-sm text-slate-600">Referat Z I 2 - Innerer Dienst</p>
                            </div>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Coat_of_arms_of_Germany.svg/186px-Coat_of_arms_of_Germany.svg.png" alt="Bundsadler" className="h-10 sm:h-16 opacity-80" />
                        </div>

                        <div className="space-y-4 sm:space-y-6 font-serif text-slate-800 leading-relaxed text-sm sm:text-base">
                            <p><strong>Betreff: {selectedTask.title}</strong></p>
                            <p>Hiermit wird die qualifizierte Zeichnung des Vorgangs angefordert. Dieses Dokument wurde gemäß geltenden Archivierungsstandards im Blockchain-Netzwerk des Bundes indiziert.</p>
                            <p>Die Integrität dieses Schreibens wird durch kryptografische Hash-Verfahren sichergestellt. Jede nachträgliche Änderung führt zur Ungültigkeit der Signatur.</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white border-t border-slate-200 flex flex-col gap-4 sticky bottom-0 z-20">
                    {selectedTask.status === 'PENDING' ? (
                        <div className="space-y-4">
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">eID 6-Stelliger PIN-Code</span>
                                <div className="flex gap-2">
                                    {pin.map((digit, i) => (
                                        <input 
                                            key={i}
                                            ref={pinRefs[i]}
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            autoComplete="one-time-code"
                                            value={digit}
                                            onChange={(e) => handlePinChange(i, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(i, e)}
                                            className="w-10 h-12 text-center text-xl font-bold bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-blue outline-none transition-all shadow-sm"
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2 w-full pb-safe">
                                <button className="flex-1 px-4 py-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl text-sm font-semibold transition-colors active-scale">
                                    Ablehnen
                                </button>
                                <button 
                                    onClick={handleSign}
                                    disabled={isSigning}
                                    className="flex-[2] px-6 py-4 bg-gov-blue text-white rounded-xl shadow-lg hover:bg-blue-800 text-sm font-bold flex items-center justify-center transition-all disabled:opacity-70 active-scale"
                                >
                                    {isSigning ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <PenTool className="w-4 h-4 mr-2" />}
                                    {isSigning ? 'Signiere...' : 'QES Signatur ausführen'}
                                </button>
                            </div>
                        </div>
                    ) : (
                         <div className="text-sm text-green-600 font-bold flex items-center w-full justify-center py-4 pb-safe">
                             <CheckCircle className="w-5 h-5 mr-2" />
                             Vorgang abgeschlossen ({selectedTask.signedAt?.toLocaleDateString()})
                         </div>
                    )}
                </div>
              </>
          ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50 p-8 text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                      <Briefcase className="w-8 h-8 text-slate-200" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-600">Kein Vorgang ausgewählt</h3>
                  <p className="text-sm mt-1">Bitte wählen Sie einen Vorgang aus der Liste links.</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default SignatureFolder;
