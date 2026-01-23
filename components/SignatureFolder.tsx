import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, Clock, Search, Briefcase, PenTool, Lock, AlertCircle, FileCheck, ChevronRight, Hash } from 'lucide-react';
import { WorkflowTask } from '../types';
import { DbService } from '../services/mockDbService';
import { useUser } from '../contexts/UserContext';
import { useToast } from './ui/ToastSystem';

const SignatureFolder: React.FC = () => {
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<WorkflowTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [pin, setPin] = useState('');
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

  const handleSign = async () => {
    if (!selectedTask || !user) return;
    if (pin.length < 4) {
        addToast("Bitte geben Sie Ihre 6-stellige eID PIN ein.", "warning");
        return;
    }

    setIsSigning(true);
    try {
        await DbService.signTask(selectedTask.id, user.id);
        await DbService.createAuditLog(user.id, 'SIGN_DOCUMENT', JSON.stringify({ 
            taskId: selectedTask.id, 
            docRef: selectedTask.documentRef,
            level: 'QES' // Qualified Electronic Signature
        }));
        
        addToast("Dokument qualifiziert elektronisch signiert (QES)", "success");
        setPin('');
        await fetchTasks();
        // Update local selection to reflect changes
        setSelectedTask(prev => prev ? { ...prev, status: 'SIGNED', signedAt: new Date(), signatureHash: '0xPending...' } : null);
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

  const getStatusIcon = (s: string) => {
      if (s === 'SIGNED') return <CheckCircle className="w-5 h-5 text-green-500" />;
      return <Clock className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6">
      {/* Sidebar / List View */}
      <div className="w-full md:w-1/3 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-gov-blue focus:border-gov-blue"
                />
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
            {loading ? (
                <div className="p-8 text-center text-slate-400 text-sm">Lade Vorgänge...</div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {tasks.map(task => (
                        <div 
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className={`p-4 cursor-pointer transition-colors hover:bg-blue-50 
                                ${selectedTask?.id === task.id ? 'bg-blue-50 border-l-4 border-l-gov-blue' : 'border-l-4 border-l-transparent'}
                            `}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                                    {task.priority === 'HIGH' ? 'EILT' : task.priority === 'MEDIUM' ? 'NORMAL' : 'NIEDRIG'}
                                </span>
                                <span className="text-xs text-slate-400">
                                    {task.createdAt.toLocaleDateString()}
                                </span>
                            </div>
                            <h4 className={`text-sm font-medium mb-1 ${selectedTask?.id === task.id ? 'text-gov-blue' : 'text-slate-900'}`}>
                                {task.title}
                            </h4>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-slate-500 flex items-center">
                                    <FileText className="w-3 h-3 mr-1" /> {task.type}
                                </span>
                                {getStatusIcon(task.status)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* Main Content / Document Viewer */}
      <div className="w-full md:w-2/3 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
          {selectedTask ? (
              <>
                {/* Header */}
                <div className="p-6 border-b border-slate-200 flex justify-between items-start bg-white">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-xl font-bold text-slate-900">{selectedTask.title}</h2>
                            {selectedTask.status === 'SIGNED' && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded flex items-center">
                                    <Lock className="w-3 h-3 mr-1" /> SIGNIERT
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-500">
                            Antragsteller: <span className="font-medium text-slate-700">{selectedTask.requester}</span> • Ref: {selectedTask.id}
                        </p>
                    </div>
                </div>

                {/* Mock Document Viewer */}
                <div className="flex-1 bg-slate-100 p-8 overflow-y-auto">
                    <div className="max-w-3xl mx-auto bg-white shadow-lg min-h-[600px] p-12 relative">
                        {/* Watermark for signed docs */}
                        {selectedTask.status === 'SIGNED' && (
                            <div className="absolute top-10 right-10 border-4 border-green-600 text-green-600 rounded-lg p-2 opacity-30 transform rotate-12 pointer-events-none">
                                <div className="text-4xl font-black uppercase">GENEHMIGT</div>
                                <div className="text-xs font-bold text-center mt-1">{new Date().toLocaleDateString()}</div>
                            </div>
                        )}

                        <div className="border-b-2 border-slate-900 mb-8 pb-4 flex justify-between items-end">
                            <div>
                                <h1 className="text-2xl font-serif text-slate-900">Bundesverwaltungsamt</h1>
                                <p className="text-sm text-slate-600">Referat Z I 2 - Innerer Dienst</p>
                            </div>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Coat_of_arms_of_Germany.svg/186px-Coat_of_arms_of_Germany.svg.png" alt="Bundsadler" className="h-16 opacity-80" />
                        </div>

                        <div className="space-y-6 font-serif text-slate-800 leading-relaxed">
                            <p><strong>Betreff: {selectedTask.title}</strong></p>
                            <p>Sehr geehrte Damen und Herren,</p>
                            <p>
                                hiermit beantrage ich die Genehmigung des oben genannten Vorgangs gemäß
                                § 45 der Bundeshaushaltsordnung (BHO). Die erforderlichen Mittel sind im Haushaltstitel
                                543 01 "Geschäftsbedarf und Kommunikation" veranschlagt und verfügbar.
                            </p>
                            <p>
                                Begründung:<br/>
                                Die aktuelle Hardware-Ausstattung der Abteilung 4 entspricht nicht mehr den
                                Sicherheitsanforderungen des BSI-Grundschutzes (siehe Anlage 1). Ein Austausch
                                ist zwingend erforderlich, um die Arbeitsfähigkeit sicherzustellen.
                            </p>
                            <p>
                                Ich bitte um zeitnahe Prüfung und elektronische Zeichnung.
                            </p>
                            <br/>
                            <p>Mit freundlichen Grüßen</p>
                            <p className="italic">Im Auftrag<br/>Müller</p>
                        </div>

                        {/* Signature Block Simulation */}
                        <div className="mt-20 border-t border-slate-300 pt-8">
                            <div className="flex justify-between items-end">
                                <div className="text-sm text-slate-500">
                                    Dieses Dokument wurde elektronisch erstellt.
                                </div>
                                {selectedTask.status === 'SIGNED' && (
                                    <div className="border border-gov-blue bg-blue-50 p-3 rounded text-xs text-gov-blue w-64">
                                        <div className="flex items-center gap-2 mb-1 font-bold">
                                            <FileCheck className="w-4 h-4" /> Qualifizierte Signatur
                                        </div>
                                        <div className="truncate">Signee: {user?.name}</div>
                                        <div className="truncate text-[10px] text-slate-400 mt-1">Hash: {selectedTask.signatureHash}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action Bar */}
                <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-4 items-center">
                    {selectedTask.status === 'PENDING' ? (
                        <>
                            <div className="flex items-center gap-2 mr-4">
                                <span className="text-xs font-bold text-slate-500 uppercase">eID PIN:</span>
                                <input 
                                    type="password" 
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    maxLength={6}
                                    className="w-24 px-2 py-1.5 border border-slate-300 rounded text-center tracking-widest font-mono focus:ring-gov-blue focus:border-gov-blue"
                                    placeholder="••••••"
                                />
                            </div>
                            <button className="px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded text-sm font-medium transition-colors">
                                Ablehnen & Rückgabe
                            </button>
                            <button 
                                onClick={handleSign}
                                disabled={isSigning}
                                className="px-6 py-2 bg-gov-blue text-white rounded shadow-sm hover:bg-blue-800 text-sm font-medium flex items-center transition-all disabled:opacity-70 disabled:cursor-wait"
                            >
                                {isSigning ? (
                                    <>Signiere...</>
                                ) : (
                                    <>
                                        <PenTool className="w-4 h-4 mr-2" />
                                        Qualifiziert Zeichnen
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                         <div className="text-sm text-green-600 font-medium flex items-center">
                             <CheckCircle className="w-4 h-4 mr-2" />
                             Vorgang erfolgreich abgeschlossen am {selectedTask.signedAt?.toLocaleDateString()}
                         </div>
                    )}
                </div>
              </>
          ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                      <Briefcase className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-600">Kein Vorgang ausgewählt</h3>
                  <p className="text-sm mt-1">Wählen Sie ein Dokument aus der Liste zur Bearbeitung.</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default SignatureFolder;