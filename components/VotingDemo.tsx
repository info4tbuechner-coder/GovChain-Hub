import React, { useEffect, useState } from 'react';
import { Vote, Users, Calendar, BarChart2, Check, Lock, ChevronRight, Info, AlertCircle } from 'lucide-react';
import { Proposal } from '../types';
import { DbService } from '../services/mockDbService';
import { useUser } from '../contexts/UserContext';
import { useToast } from './ui/ToastSystem';
import { useNotifications } from '../contexts/NotificationContext';

const VotingDemo: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [userVoted, setUserVoted] = useState<Record<string, boolean>>({}); // Local session state
  
  const { user } = useUser();
  const { addToast } = useToast();
  const { dispatchNotification } = useNotifications();

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    const data = await DbService.getProposals();
    setProposals(data);
    setLoading(false);
  };

  const handleVote = async (choice: 'FOR' | 'AGAINST' | 'ABSTAIN') => {
    if (!selectedProposal || !user) return;
    setIsVoting(true);

    try {
        // 1. Simulate blockchain interaction
        await DbService.castVote(selectedProposal.id, choice);
        
        // 2. Audit Log
        await DbService.createAuditLog(user.id, 'CAST_VOTE', JSON.stringify({ 
            proposalId: selectedProposal.id, 
            choiceHas: '***HIDDEN***' // Privacy check
        }));

        // 3. Update Local State
        setUserVoted(prev => ({ ...prev, [selectedProposal.id]: true }));
        addToast("Stimme erfolgreich auf der Blockchain registriert", "success");
        
        // 4. Trigger Global Notification
        dispatchNotification(
            "Wahlbeteiligung bestätigt",
            `Ihre Stimme für "${selectedProposal.title.substring(0, 30)}..." wurde sicher gezählt.`,
            "SUCCESS",
            "voting"
        );
        
        // 5. Refresh Data
        await fetchProposals();
        
        // 6. Update Selected View
        const updated = proposals.find(p => p.id === selectedProposal.id);
        if(updated) setSelectedProposal(updated);

    } catch (e) {
        addToast("Fehler bei der Stimmabgabe", "error");
    } finally {
        setIsVoting(false);
    }
  };

  const calculatePercentage = (val: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((val / total) * 100);
  };

  if (loading) {
      return <div className="p-12 text-center text-slate-400">Lade Wahlvorschläge...</div>;
  }

  // Detail View
  if (selectedProposal) {
      const total = selectedProposal.totalVoters;
      const pFor = calculatePercentage(selectedProposal.votesFor, total);
      const pAgainst = calculatePercentage(selectedProposal.votesAgainst, total);
      const pAbstain = calculatePercentage(selectedProposal.votesAbstain, total);
      const hasVoted = userVoted[selectedProposal.id];

      return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-4">
            <button 
                onClick={() => setSelectedProposal(null)}
                className="mb-6 text-sm font-medium text-slate-500 hover:text-gov-blue flex items-center transition-colors"
            >
                <ChevronRight className="w-4 h-4 mr-1 rotate-180" /> Zurück zur Übersicht
            </button>

            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 p-8 text-white">
                    <div className="flex items-center gap-2 mb-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide border 
                            ${selectedProposal.status === 'ACTIVE' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-slate-700 border-slate-600 text-slate-400'}`}>
                            {selectedProposal.status === 'ACTIVE' ? 'Laufende Abstimmung' : 'Abgeschlossen'}
                        </span>
                        <span className="text-slate-400 text-xs flex items-center">
                            <Lock className="w-3 h-3 mr-1" /> Secure Vote Chain
                        </span>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">{selectedProposal.title}</h2>
                    <div className="flex gap-6 text-sm text-slate-400 mt-4">
                        <span className="flex items-center"><Calendar className="w-4 h-4 mr-2"/> Ende: {selectedProposal.endDate.toLocaleDateString()}</span>
                        <span className="flex items-center"><Users className="w-4 h-4 mr-2"/> {selectedProposal.totalVoters} Stimmen abgegeben</span>
                    </div>
                </div>

                <div className="p-8">
                    <div className="prose prose-slate max-w-none mb-10">
                        <h4 className="text-lg font-bold text-slate-900 mb-2">Beschreibung des Vorhabens</h4>
                        <p className="text-slate-600 leading-relaxed">{selectedProposal.description}</p>
                    </div>

                    {hasVoted || selectedProposal.status === 'CLOSED' ? (
                        /* RESULTS VIEW */
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                                <BarChart2 className="w-5 h-5 mr-2 text-gov-blue"/>
                                Vorläufiges Ergebnis
                            </h3>
                            
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm font-medium mb-1">
                                        <span className="text-green-700">Dafür (Ja)</span>
                                        <span className="text-slate-900">{pFor}% ({selectedProposal.votesFor})</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                                        <div className="bg-green-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${pFor}%` }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm font-medium mb-1">
                                        <span className="text-red-700">Dagegen (Nein)</span>
                                        <span className="text-slate-900">{pAgainst}% ({selectedProposal.votesAgainst})</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                                        <div className="bg-red-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${pAgainst}%` }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm font-medium mb-1">
                                        <span className="text-slate-600">Enthaltung</span>
                                        <span className="text-slate-900">{pAbstain}% ({selectedProposal.votesAbstain})</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                                        <div className="bg-slate-400 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${pAbstain}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex items-start p-4 bg-blue-50 text-blue-800 rounded text-sm border border-blue-100">
                                <Info className="w-5 h-5 mr-2 flex-shrink-0" />
                                <p>
                                    Ihre Stimme wurde kryptografisch verschlüsselt und in Block #192849 verankert. 
                                    Aufgrund der <strong>Ring-Signaturen</strong> ist nicht öffentlich einsehbar, wie Sie abgestimmt haben, 
                                    nur <em>dass</em> Sie wahlberechtigt waren und abgestimmt haben.
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* VOTING ACTION VIEW */
                        <div className="grid md:grid-cols-3 gap-4">
                            <button
                                onClick={() => handleVote('FOR')}
                                disabled={isVoting}
                                className="group p-6 border-2 border-slate-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left disabled:opacity-50"
                            >
                                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Check className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-slate-900">Zustimmen</h4>
                                <p className="text-xs text-slate-500 mt-1">Ja, ich unterstütze diesen Vorschlag.</p>
                            </button>

                            <button
                                onClick={() => handleVote('AGAINST')}
                                disabled={isVoting}
                                className="group p-6 border-2 border-slate-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all text-left disabled:opacity-50"
                            >
                                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-slate-900">Ablehnen</h4>
                                <p className="text-xs text-slate-500 mt-1">Nein, ich bin gegen diesen Vorschlag.</p>
                            </button>

                            <button
                                onClick={() => handleVote('ABSTAIN')}
                                disabled={isVoting}
                                className="group p-6 border-2 border-slate-200 rounded-xl hover:border-slate-500 hover:bg-slate-50 transition-all text-left disabled:opacity-50"
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <div className="w-4 h-4 rounded-full border-2 border-current"></div>
                                </div>
                                <h4 className="font-bold text-slate-900">Enthalten</h4>
                                <p className="text-xs text-slate-500 mt-1">Ich möchte mich nicht festlegen.</p>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      );
  }

  // List View
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-slate-200 pb-5">
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Digitale Bürgerbeteiligung</h2>
            <p className="mt-2 text-slate-600 max-w-2xl">
            Nehmen Sie sicher und anonym an öffentlichen Abstimmungen teil. Ihre Stimme zählt – und die Blockchain beweist es.
            </p>
        </div>
        <div className="hidden md:block">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-gov-blue">
                <Vote className="w-3 h-3 mr-2" />
                GovChain Voting Module v1.0
            </span>
        </div>
      </div>

      <div className="grid gap-6">
        {proposals.map((proposal) => (
            <div 
                key={proposal.id}
                onClick={() => setSelectedProposal(proposal)}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-gov-blue transition-all cursor-pointer group"
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${proposal.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                            <Vote className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-gov-blue transition-colors">{proposal.title}</h3>
                            <span className="text-xs text-slate-500">ID: {proposal.id}</span>
                        </div>
                    </div>
                    {proposal.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Aktiv
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            Beendet
                        </span>
                    )}
                </div>

                <p className="text-slate-600 text-sm mb-6 line-clamp-2">{proposal.description}</p>

                <div className="flex items-center justify-between text-sm text-slate-500 border-t border-slate-50 pt-4">
                    <div className="flex gap-4">
                        <span className="flex items-center"><Users className="w-4 h-4 mr-1"/> {proposal.totalVoters} Stimmen</span>
                        <span className="flex items-center"><Calendar className="w-4 h-4 mr-1"/> bis {proposal.endDate.toLocaleDateString()}</span>
                    </div>
                    <span className="text-gov-blue font-medium flex items-center group-hover:translate-x-1 transition-transform">
                        Details ansehen <ChevronRight className="w-4 h-4 ml-1" />
                    </span>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default VotingDemo;