
import React, { useState, useRef, useEffect } from 'react';
import { Menu, Shield, FileText, Activity, Home, Lock, Database, BookOpen, User as UserIcon, LogOut, ChevronDown, Smartphone, Vote, PenTool, Server, Bell, Check, Info, AlertTriangle, AlertCircle, ExternalLink, Archive, Briefcase, Euro, Scale, Bot, AlertOctagon, Share2, Search, Command, ChevronRight, X, Sparkles } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useToast } from './ui/ToastSystem';
import { useNotifications } from '../contexts/NotificationContext';
import CommandPalette from './CommandPalette';
import InstallPrompt from './InstallPrompt';
import OfflineIndicator from './OfflineIndicator';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  
  const { user, logout } = useUser();
  const { notifications, unreadCount } = useNotifications();
  
  const navItems = [
    { id: 'landing', label: 'Startseite', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'crisis', label: 'Lagezentrum', icon: AlertOctagon, highlight: true },
    { id: 'data-exchange', label: 'Amtshilfe', icon: Share2 },
    { id: 'ai-assistant', label: 'GovAI', icon: Bot },
    { id: 'registry', label: 'Register', icon: Archive },
    { id: 'procurement', label: 'Vergabe', icon: Briefcase },
    { id: 'budget', label: 'Haushalt', icon: Euro },
    { id: 'compliance', label: 'Compliance', icon: Scale },
    { id: 'signatures', label: 'E-Akte', icon: PenTool },
    { id: 'ssi', label: 'Identity', icon: Smartphone },
    { id: 'voting', label: 'Abstimmung', icon: Vote },
    { id: 'transfer', label: 'Transfer', icon: Lock },
    { id: 'network', label: 'Netzwerk', icon: Server },
    { id: 'instruments', label: 'Tools', icon: Database },
    { id: 'knowledge', label: 'Wissen', icon: BookOpen },
    { id: 'security', label: 'Sicherheit', icon: Shield },
  ];

  // Optimized Bottom Nav for Mobile Ergonomics
  const mobileKernNav = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Status', icon: Activity },
    { id: 'ai-assistant', label: 'GovAI', icon: Bot, primary: true },
    { id: 'ssi', label: 'Identität', icon: Smartphone },
    { id: 'signatures', label: 'Signatur', icon: PenTool },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-transparent selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden pb-20 lg:pb-0">
      
      <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} onNavigate={onNavigate} />

      <header className="sticky top-0 z-40 w-full">
        <OfflineIndicator />
        <div className="hidden sm:flex bg-slate-950 text-slate-300 text-[10px] py-1 px-4 justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-4">
              <span className="flex items-center opacity-80 font-medium tracking-wide"><Shield className="w-3 h-3 mr-1.5"/> BUNDESREPUBLIK DEUTSCHLAND</span>
          </div>
          <div className="flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="opacity-70 tracking-wider">SECURE NODE ACTIVE</span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md border-b-4 border-b-[#FFCE00] shadow-sm pt-safe relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-black via-[#DD0000] to-[#FFCE00]"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 md:h-20">
                <div className="flex items-center cursor-pointer active-scale" onClick={() => onNavigate('landing')}>
                    <div className="mr-3 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-slate-900 rounded-full shadow-md border-2 border-[#FFCE00]">
                        <Shield className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight leading-tight">GovChain<span className="text-blue-600">Hub</span></h1>
                      <span className="text-[10px] md:text-xs text-slate-500 font-medium uppercase tracking-wider">Bundes-Demonstrator</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <button onClick={() => onNavigate('about')} className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-gov-blue transition-colors">
                      <Info className="w-4 h-4" />
                      Über das Projekt
                    </button>
                    <button onClick={() => setIsCmdOpen(true)} className="p-2 text-slate-400 hover:text-slate-600 lg:bg-slate-50 lg:rounded-md border border-transparent lg:border-slate-200 active-scale">
                        <Search className="w-5 h-5 sm:w-4 sm:h-4" />
                    </button>
                    <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-slate-500 active-scale">
                        <Menu className="h-6 w-6" />
                    </button>
                    
                    {/* Desktop profile menu could go here */}
                </div>
            </div>
            </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="animate-in fade-in duration-300">
            {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation (Native PWA Pattern) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-slate-200 flex justify-around items-center h-20 px-2 z-50 pb-safe">
          {mobileKernNav.map((item) => (
              <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative
                    ${item.primary ? 'mb-8' : ''}
                    ${activeView === item.id ? 'text-gov-blue' : 'text-slate-400'}
                  `}
              >
                  {item.primary ? (
                      <div className={`p-4 rounded-full shadow-2xl transition-transform active:scale-90 border-4 border-white
                        ${activeView === item.id ? 'bg-gov-blue text-white' : 'bg-slate-900 text-white'}
                      `}>
                          <item.icon className="h-6 w-6" />
                      </div>
                  ) : (
                      <>
                        <item.icon className={`h-6 w-6 mb-1 transition-transform active:scale-90 ${activeView === item.id ? 'fill-gov-blue/10' : ''}`} />
                        <span className="text-[9px] font-black uppercase tracking-tight">{item.label}</span>
                        {activeView === item.id && <div className="absolute bottom-4 w-1 h-1 bg-gov-blue rounded-full"></div>}
                      </>
                  )}
              </button>
          ))}
      </nav>

      <InstallPrompt />

      {/* Sidebar Overlay (Mobile Full Menu) */}
      {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="w-5/6 max-w-sm bg-white h-full shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center pt-safe">
                      <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
                              {user?.name.charAt(0)}
                          </div>
                          <div>
                              <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Online</p>
                          </div>
                      </div>
                      <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 active-scale"><X className="w-6 h-6"/></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Kernmodule</p>
                      {navItems.map(item => (
                          <button 
                            key={item.id} 
                            onClick={() => { onNavigate(item.id); setIsMobileMenuOpen(false); }} 
                            className={`flex items-center p-4 rounded-2xl font-bold text-sm transition-colors active-scale w-full
                                ${activeView === item.id ? 'bg-blue-50 text-gov-blue' : 'text-slate-700 hover:bg-slate-50'}
                            `}
                          >
                              <item.icon className={`w-5 h-5 mr-4 ${activeView === item.id ? 'text-gov-blue' : 'text-slate-400'}`} /> 
                              {item.label}
                          </button>
                      ))}
                  </div>

                  <div className="p-6 bg-slate-50 border-t border-slate-200 pb-safe">
                      <button onClick={() => logout()} className="flex items-center p-3 w-full text-red-600 font-bold text-sm active-scale">
                          <LogOut className="w-5 h-5 mr-4" /> Abmelden
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Layout;
