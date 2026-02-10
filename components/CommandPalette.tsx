
import React, { useEffect, useState } from 'react';
import { Search, Command, FileText, User, CreditCard, Shield, ArrowRight, X, Hash, Database, Box } from 'lucide-react';
import { DbService } from '../services/mockDbService';
import { useUser } from '../contexts/UserContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

// Data Search Result Interface
interface SearchResult {
    id: string;
    type: 'NAV' | 'ASSET' | 'TENDER' | 'USER' | 'BLOCK';
    label: string;
    subLabel?: string;
    icon: any;
    action: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);
  const { user } = useUser();

  // Pre-defined Nav Actions
  const navActions: SearchResult[] = [
    { id: 'dashboard', type: 'NAV', label: 'Dashboard', subLabel: 'Gehe zu Dashboard', icon: Command, action: () => onNavigate('dashboard') },
    { id: 'signatures', type: 'NAV', label: 'E-Akte', subLabel: 'Offene Signaturen prüfen', icon: FileText, action: () => onNavigate('signatures') },
    { id: 'ssi', type: 'NAV', label: 'Identity Wallet', subLabel: 'Neue Identität ausstellen', icon: User, action: () => onNavigate('ssi') },
    { id: 'budget', type: 'NAV', label: 'Finanzen', subLabel: 'Haushaltstransfer initiieren', icon: CreditCard, action: () => onNavigate('budget') },
    { id: 'crisis', type: 'NAV', label: 'Lagezentrum', subLabel: 'Notfall-Protokolle', icon: Shield, action: () => onNavigate('crisis') },
    { id: 'compliance', type: 'NAV', label: 'Compliance', subLabel: 'Audit Logs exportieren', icon: FileText, action: () => onNavigate('compliance') },
    { id: 'network', type: 'NAV', label: 'Infrastruktur', subLabel: 'Netzwerkstatus', icon: Box, action: () => onNavigate('network') },
  ];

  // Deep Search Logic
  useEffect(() => {
      const performSearch = async () => {
          if (!query) {
              setResults(navActions);
              return;
          }

          const q = query.toLowerCase();
          
          // 1. Filter Navigation
          const filteredNav = navActions.filter(a => a.label.toLowerCase().includes(q) || a.subLabel?.toLowerCase().includes(q));

          // 2. Search Mock Data (Simulated Async)
          const foundItems: SearchResult[] = [];
          
          // Tenders
          const tenders = await DbService.getTenders();
          tenders.forEach(t => {
              if (t.title.toLowerCase().includes(q) || t.refNumber.toLowerCase().includes(q)) {
                  foundItems.push({
                      id: t.id,
                      type: 'TENDER',
                      label: t.title,
                      subLabel: `Vergabe: ${t.refNumber}`,
                      icon: FileText,
                      action: () => onNavigate('procurement') // Ideally deep link
                  });
              }
          });

          // Assets
          const assets = await DbService.getRegistryAssets();
          assets.forEach(a => {
              if (a.title.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.currentOwner.toLowerCase().includes(q)) {
                  foundItems.push({
                      id: a.id,
                      type: 'ASSET',
                      label: a.title,
                      subLabel: `Register: ${a.id}`,
                      icon: Database,
                      action: () => onNavigate('registry')
                  });
              }
          });

          // Combine
          setResults([...filteredNav, ...foundItems]);
          setActiveIndex(0);
      };

      const debounce = setTimeout(performSearch, 150);
      return () => clearTimeout(debounce);
  }, [query]);

  // Key Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[activeIndex]) {
          results[activeIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, activeIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-[10vh] animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden ring-1 ring-slate-900/5 transform animate-in slide-in-from-top-4 duration-300 flex flex-col max-h-[70vh]">
        <div className="relative border-b border-slate-100 p-4 flex items-center">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <input
            type="text"
            className="flex-1 text-lg text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
            placeholder="Deep Search (Akten, Assets, Befehle...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2">
              <span className="hidden sm:inline-block text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">ESC</span>
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1 p-2">
          {results.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p>Keine Ergebnisse gefunden.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item, index) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => { item.action(); onClose(); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors group
                    ${index === activeIndex ? 'bg-gov-blue text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'}
                  `}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-md ${index === activeIndex ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                        <span className="font-semibold block">{item.label}</span>
                        {item.subLabel && <span className={`text-xs ${index === activeIndex ? 'text-blue-100' : 'text-slate-400'}`}>{item.subLabel}</span>}
                    </div>
                  </div>
                  {item.type !== 'NAV' && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-bold
                        ${index === activeIndex ? 'border-white/30 text-white' : 'border-slate-200 text-slate-400 bg-slate-50'}
                      `}>
                          {item.type}
                      </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-slate-50 px-4 py-2 text-xs text-slate-400 flex justify-between border-t border-slate-100">
          <div className="flex gap-4">
              <span><strong>Datenbank:</strong> Connected (Read-Only)</span>
              <span><strong>Index:</strong> 124 Items</span>
          </div>
          <span>GovChain Search v2.1</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
