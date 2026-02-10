
import React, { useState, useRef, useEffect } from 'react';
import { Menu, Shield, FileText, Activity, Home, Lock, Database, BookOpen, User as UserIcon, LogOut, ChevronDown, Smartphone, Vote, PenTool, Server, Bell, Check, Info, AlertTriangle, AlertCircle, ExternalLink, Archive, Briefcase, Euro, Scale, Bot, AlertOctagon, Share2, Search, Command, ChevronRight, X } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useToast } from './ui/ToastSystem';
import { useNotifications } from '../contexts/NotificationContext';
import CommandPalette from './CommandPalette';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  
  const { user, logout } = useUser();
  const { addToast } = useToast();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
            setIsNotifOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Kern-Navigation für Mobile Bottom Bar
  const mobileKernNav = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'ai-assistant', label: 'GovAI', icon: Bot },
    { id: 'ssi', label: 'ID', icon: Smartphone },
    { id: 'profile', label: 'Profil', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-transparent selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden pb-16 lg:pb-0">
      
      <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} onNavigate={onNavigate} />

      <header className="sticky top-0 z-40 w-full transition-all duration-300">
        <div className="hidden sm:flex bg-slate-950 text-slate-300 text-[10px] py-1 px-4 justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-4">
              <span className="flex items-center opacity-80 font-medium tracking-wide"><Shield className="w-3 h-3 mr-1.5"/> OFFIZIELLER DEMONSTRATOR</span>
          </div>
          <div className="flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="opacity-70 tracking-wider">SYSTEM ONLINE</span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14 md:h-16">
                <div className="flex items-center cursor-pointer" onClick={() => onNavigate('landing')}>
                    <div className="bg-slate-900 p-1.5 rounded-lg mr-2 shadow-lg">
                        <Shield className="h-4 w-4 text-white" />
                    </div>
                    <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">GovChain<span className="text-blue-600">Hub</span></h1>
                </div>

                <nav className="hidden lg:flex items-center gap-1 mx-4">
                    {navItems.slice(0, 8).map((item) => (
                        <button key={item.id} onClick={() => onNavigate(item.id)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${activeView === item.id ? 'text-slate-900 bg-slate-100' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <button onClick={() => setIsCmdOpen(true)} className="p-2 text-slate-400 hover:text-slate-600 lg:bg-slate-50 lg:rounded-md border border-transparent lg:border-slate-200">
                        <Search className="w-4 h-4" />
                    </button>
                    <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-slate-500">
                        <Menu className="h-5 w-5" />
                    </button>
                </div>
            </div>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="animate-in fade-in duration-500">
            {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (PWA Pattern) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 flex justify-around items-center h-16 px-2 z-50 pb-safe">
          {mobileKernNav.map((item) => (
              <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex flex-col items-center justify-center flex-1 h-full transition-all active:scale-90 ${activeView === item.id ? 'text-gov-blue' : 'text-slate-400'}`}
              >
                  <item.icon className={`h-5 w-5 mb-1 ${activeView === item.id ? 'fill-gov-blue/10' : ''}`} />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
              </button>
          ))}
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl overflow-y-auto p-6 animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="font-bold uppercase tracking-widest text-slate-400 text-xs">Module</h3>
                      <button onClick={() => setIsMobileMenuOpen(false)}><X className="w-5 h-5 text-slate-400"/></button>
                  </div>
                  <div className="grid gap-2">
                      {navItems.map(item => (
                          <button key={item.id} onClick={() => { onNavigate(item.id); setIsMobileMenuOpen(false); }} className={`flex items-center p-3 rounded-xl font-bold text-sm ${activeView === item.id ? 'bg-blue-50 text-gov-blue' : 'text-slate-600 hover:bg-slate-50'}`}>
                              <item.icon className="w-4 h-4 mr-3 opacity-60" /> {item.label}
                          </button>
                      ))}
                  </div>
                  <div className="mt-10 pt-6 border-t border-slate-100">
                      <button onClick={() => logout()} className="flex items-center p-3 w-full text-red-600 font-bold text-sm">
                          <LogOut className="w-4 h-4 mr-3" /> Abmelden
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Layout;
