import React, { useEffect, useState } from 'react';
import { CreditCard, ArrowRight, Wallet, History, Lock, ShieldCheck, Coins, Send, PieChart, Info, Euro } from 'lucide-react';
import { BudgetAccount, TokenTransaction } from '../types';
import { DbService } from '../services/mockDbService';
import { useToast } from './ui/ToastSystem';
import { useUser } from '../contexts/UserContext';

const SmartBudget: React.FC = () => {
  const [budgets, setBudgets] = useState<BudgetAccount[]>([]);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<BudgetAccount | null>(null);
  
  // Transfer Form State
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
    const [b, t] = await Promise.all([DbService.getBudgets(), DbService.getTransactions()]);
    setBudgets(b);
    setTransactions(t);
    setLoading(false);
  };

  const handleTransfer = async () => {
      if(!selectedAccount || !recipient || !amount || !user) return;
      setIsProcessing(true);
      
      try {
          const val = parseFloat(amount);
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
          addToast("Zahlung fehlgeschlagen", "error");
      } finally {
          setIsProcessing(false);
      }
  };

  const getTotalLiquidity = () => {
      return budgets.reduce((acc, b) => b.currency === 'eEUR' ? acc + b.balance : acc, 0);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 pb-5">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Digitales Haushaltswesen</h2>
                <p className="mt-2 text-slate-600 max-w-2xl">
                    Programmierbares Geld (e-Euro & Token) für automatisierte Mittelbewirtschaftung.
                </p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col items-end">
                <span className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Gesamtliquidität (eEUR)</span>
                <span className="text-3xl font-mono font-bold text-slate-900">
                    {loading ? '...' : getTotalLiquidity().toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </span>
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Column: Accounts */}
            <div className="lg:col-span-2 space-y-6">
                
                <h3 className="font-bold text-slate-800 flex items-center">
                    <Wallet className="w-5 h-5 mr-2 text-gov-blue"/> Behörden-Konten (Wallets)
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                    {budgets.map(acc => (
                        <div 
                            key={acc.id}
                            onClick={() => setSelectedAccount(acc)}
                            className={`p-6 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden group
                                ${selectedAccount?.id === acc.id ? 'border-gov-blue bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-200'}
                            `}
                        >
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2 rounded-lg ${acc.type === 'MAIN' ? 'bg-blue-100 text-gov-blue' : acc.type === 'ESCROW' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>
                                        {acc.type === 'MAIN' ? <Euro className="w-5 h-5"/> : acc.type === 'ESCROW' ? <Lock className="w-5 h-5"/> : <Coins className="w-5 h-5"/>}
                                    </div>
                                    <span className="text-xs font-mono text-slate-400">{acc.id}</span>
                                </div>
                                
                                <h4 className="font-bold text-slate-900 truncate" title={acc.name}>{acc.name}</h4>
                                <p className="text-xs text-slate-500 mb-4">{acc.type === 'ESCROW' ? 'Treuhandkonto' : acc.currency === 'eEUR' ? 'Haushaltstitel' : 'Zweckgebundener Token'}</p>
                                
                                <div className="text-2xl font-mono font-bold text-slate-900">
                                    {acc.balance.toLocaleString('de-DE', { minimumFractionDigits: 2 })} <span className="text-sm font-sans text-slate-500">{acc.currency}</span>
                                </div>

                                {acc.restrictions.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {acc.restrictions.map(r => (
                                            <span key={r} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                <ShieldCheck className="w-3 h-3 mr-1"/> {r}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Decorative Bg */}
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-800 flex items-center">
                            <History className="w-5 h-5 mr-2 text-slate-500"/> Transaktionshistorie
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {transactions.map(tx => (
                            <div key={tx.id} className="p-4 flex items-center justify-between text-sm hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${tx.from === selectedAccount?.name ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                        <ArrowRight className={`w-4 h-4 ${tx.from === selectedAccount?.name ? '-rotate-45' : 'rotate-45'}`}/>
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{tx.to}</p>
                                        <p className="text-xs text-slate-500">{new Date(tx.timestamp).toLocaleDateString()} • {tx.smartRule || 'Standardüberweisung'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-mono font-bold ${tx.from.includes(selectedAccount?.name || 'x') ? 'text-red-600' : 'text-green-600'}`}>
                                        {tx.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-mono" title={tx.txHash}>Tx: {tx.txHash.substring(0,8)}...</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Right Column: Action Panel */}
            <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 sticky top-24">
                     <h3 className="font-bold text-slate-900 mb-6 flex items-center border-b border-slate-100 pb-4">
                        <Send className="w-5 h-5 mr-2 text-gov-blue"/> 
                        {selectedAccount ? 'Mittelabfluss anweisen' : 'Konto wählen'}
                    </h3>

                    {selectedAccount ? (
                        <div className="space-y-4">
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded text-sm text-blue-900 mb-4">
                                <p className="font-semibold text-xs uppercase text-blue-500 mb-1">Quellkonto</p>
                                <p className="font-medium truncate">{selectedAccount.name}</p>
                                <p className="text-xs mt-1">Verfügbar: {selectedAccount.balance.toLocaleString('de-DE')} {selectedAccount.currency}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Empfänger (Adresse / Name)</label>
                                <input 
                                    type="text" 
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    placeholder="z.B. IT-Dienstleister GmbH"
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-gov-blue focus:border-gov-blue"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Betrag</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full border border-slate-300 rounded-md pl-3 pr-12 py-2 text-sm focus:ring-gov-blue focus:border-gov-blue font-mono"
                                    />
                                    <span className="absolute right-3 top-2 text-slate-400 text-sm">{selectedAccount.currency}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Smart Contract Regel (Logik)</label>
                                <select 
                                    value={smartRule}
                                    onChange={(e) => setSmartRule(e.target.value)}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-gov-blue focus:border-gov-blue"
                                >
                                    <option value="NONE">Keine Einschränkung (Standard)</option>
                                    <option value="4-EYES">4-Augen-Prinzip (Gegenzeichnung nötig)</option>
                                    <option value="VENDOR-WHITELIST">Nur für zertifizierte Lieferanten</option>
                                    <option value="EXPIRY">Gültig bis Jahresende (Mittelverfall)</option>
                                </select>
                            </div>

                            <button 
                                onClick={handleTransfer}
                                disabled={isProcessing || !amount || !recipient}
                                className="w-full py-3 bg-gov-blue text-white rounded-lg font-medium hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center mt-4"
                            >
                                {isProcessing ? (
                                    <>Verarbeite Block...</>
                                ) : (
                                    <>Zahlung ausführen <ArrowRight className="w-4 h-4 ml-2"/></>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-400">
                            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20"/>
                            <p>Bitte wählen Sie ein Haushaltskonto aus der Liste.</p>
                        </div>
                    )}
                </div>

                <div className="bg-slate-900 text-slate-300 rounded-xl p-5 text-sm shadow-md">
                     <h4 className="font-bold text-white mb-2 flex items-center"><PieChart className="w-4 h-4 mr-2"/> Visualisierung</h4>
                     <p className="mb-4">
                         Programmierbares Geld ermöglicht es, Haushaltsregeln direkt in den Wert-Token einzubetten. 
                         Geld kann nicht "falsch" ausgegeben werden, wenn der Code es verbietet.
                     </p>
                     <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                         <div className="h-full bg-green-500 w-3/4" title="Verfügbar"></div>
                     </div>
                     <div className="flex justify-between text-[10px] mt-1 opacity-60">
                         <span>Verfügbar (75%)</span>
                         <span>Gebunden (25%)</span>
                     </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default SmartBudget;