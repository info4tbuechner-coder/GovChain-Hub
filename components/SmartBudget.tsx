
import React, { useEffect, useState } from 'react';
import { CreditCard, ArrowRight, Wallet, History, Lock, ShieldCheck, Coins, Send, PieChart, Euro, Activity, ChevronRight, Zap } from 'lucide-react';
import { BudgetAccount, TokenTransaction } from '../types';
import { DbService } from '../services/mockDbService';
import { useToast } from './ui/ToastSystem';
import { useUser } from '../contexts/UserContext';

const SmartBudget: React.FC = () => {
  const [budgets, setBudgets] = useState<BudgetAccount[]>([]);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<BudgetAccount | null>(null);
  
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [smartRule, setSmartRule] = useState('NONE');
  const [isProcessing, setIsProcessing] = useState(false);

  const { addToast } = useToast();
  const { user } = useUser();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
        const [b, t] = await Promise.all([DbService.getBudgets(), DbService.getTransactions()]);
        setBudgets(b);
        setTransactions(t);
    } catch (e) {
        addToast("Daten konnten nicht geladen werden.", "error");
    } finally {
        setLoading(false);
    }
  };

  const handleTransfer = async () => {
      if(!selectedAccount || !recipient || !amount || !user) return;
      
      const val = parseFloat(amount.replace(',', '.'));
      if (isNaN(val) || val <= 0) {
          addToast("Bitte einen gültigen Betrag eingeben.", "warning");
          return;
      }
      
      if (val > selectedAccount.balance) {
          addToast("Unzureichende Deckung auf dem Haushaltskonto.", "error");
          return;
      }

      setIsProcessing(true);
      try {
          await DbService.executeTransfer(selectedAccount.id, recipient, val, smartRule);
          await DbService.createAuditLog(user.id, 'TRANSFER_FUNDS', JSON.stringify({
              from: selectedAccount.id,
              to: recipient,
              amt: val,
              rule: smartRule
          }));

          addToast("Zahlung per Smart Contract ausgeführt", "success");
          setRecipient('');
          setAmount('');
          await fetchData();
      } catch (e) {
          addToast("Blockchain-Transaktion abgelehnt.", "error");
      } finally {
          setIsProcessing(false);
      }
  };

  const getTotalLiquidity = () => {
      return budgets.reduce((acc, b) => b.currency === 'eEUR' ? acc + b.balance : acc, 0);
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Lade Haushaltsdaten...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12 pr-safe pl-safe">
        
        {/* Metric Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-blue-600">Liquidität Gesamt</p>
                <h3 className="text-2xl sm:text-3xl font-mono font-bold text-slate-900">
                    {getTotalLiquidity().toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </h3>
            </div>
            <div className="hidden md:block bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gebundene Mittel</p>
                <h3 className="text-3xl font-mono font-bold text-amber-600">
                    {(getTotalLiquidity() * 0.15).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Zahlungslauf Status</p>
                    <h3 className="text-lg font-bold text-green-600">BEREIT</h3>
                </div>
                <Activity className="w-8 h-8 text-green-500 opacity-20" />
            </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
            
            {/* Account Grid */}
            <div className="lg:col-span-3 grid md:grid-cols-2 gap-4 auto-rows-max">
                {budgets.map(acc => (
                    <div 
                        key={acc.id}
                        onClick={() => setSelectedAccount(acc)}
                        className={`p-6 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group active-scale
                            ${selectedAccount?.id === acc.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 bg-white hover:border-blue-200'}
                        `}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-xl ${acc.type === 'MAIN' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                <Euro className="w-5 h-5"/>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-mono text-slate-400">#{acc.id}</p>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${acc.type === 'ESCROW' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {acc.type}
                                </span>
                            </div>
                        </div>
                        <h4 className="font-bold text-slate-900 mb-1">{acc.name}</h4>
                        <div className="text-xl sm:text-2xl font-mono font-bold text-slate-900 mb-4">
                            {acc.balance.toLocaleString('de-DE')} <span className="text-xs font-sans text-slate-400 uppercase tracking-widest ml-1">{acc.currency}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {acc.restrictions.map(r => (
                                <span key={r} className="text-[9px] font-bold bg-white px-2 py-1 rounded-full border border-slate-200 text-slate-500 flex items-center shadow-sm">
                                    <ShieldCheck className="w-2.5 h-2.5 mr-1 text-blue-500"/> {r}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Recent Transactions List */}
                <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center">
                            <History className="w-4 h-4 mr-2 text-slate-400"/> Ledger History
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {transactions.slice(0, 5).map(tx => (
                            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors touch-target">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${tx.from.includes('Haushalt') ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                                        <ArrowRight className={`w-3.5 h-3.5 ${tx.from.includes('Haushalt') ? '-rotate-45' : 'rotate-45'}`}/>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{tx.to}</p>
                                        <p className="text-[10px] text-slate-500 font-mono truncate">{tx.txHash.substring(0,12)}...</p>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
                                    <p className={`font-mono font-bold text-sm ${tx.from.includes('Haushalt') ? 'text-red-600' : 'text-green-600'}`}>
                                        {tx.from.includes('Haushalt') ? '-' : '+'}{tx.amount.toLocaleString('de-DE')} €
                                    </p>
                                    <p className="text-[10px] text-slate-400">{new Date(tx.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sidebar: Control Panel */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-slate-900 rounded-2xl shadow-2xl p-6 text-white sticky top-24 border border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-600 p-2 rounded-xl">
                            <Send className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold">Mittelabfluss</h3>
                    </div>

                    {!selectedAccount ? (
                        <div className="py-12 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                            <Euro className="w-8 h-8 mx-auto mb-3 opacity-20" />
                            <p className="text-xs">Konto auswählen</p>
                        </div>
                    ) : (
                        <div className="space-y-5 animate-in slide-in-from-right-4">
                            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                                <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Quelle</p>
                                <p className="text-sm font-bold truncate">{selectedAccount.name}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Empfänger (DID / Adresse)</label>
                                <input 
                                    type="text" 
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    placeholder="did:ethr:0x..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Betrag (eEUR)</label>
                                <input 
                                    type="text" 
                                    inputMode="decimal"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0,00"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                                />
                            </div>

                            <button 
                                onClick={handleTransfer}
                                disabled={isProcessing || !amount || !recipient}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg active-scale transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isProcessing ? <Activity className="w-4 h-4 animate-spin"/> : <Zap className="w-4 h-4"/>}
                                {isProcessing ? 'Verarbeite...' : 'Transaktion Signieren'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default SmartBudget;
