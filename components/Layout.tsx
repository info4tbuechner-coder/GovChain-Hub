import React, { useState } from 'react';
import { Menu, Shield, FileText, Activity, Home, Lock, Database, BookOpen, User as UserIcon, LogOut, ChevronDown, Smartphone, Vote } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useToast } from './ui/ToastSystem';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useUser();
  const { addToast } = useToast();

  const handleLogout = () => {
      addToast("Sitzung sicher beendet", "info");
      logout();
  };

  const navItems = [
    { id: 'landing', label: 'Startseite', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'instruments', label: 'Instrumente', icon: Database },
    { id: 'ssi', label: 'SSI Wallet', icon: Smartphone },
    { id: 'voting', label: 'Abstimmung', icon: Vote },
    { id: 'transfer', label: 'Secure Transfer', icon: Lock },
    { id: 'knowledge', label: 'Wissen', icon: BookOpen },
    { id: 'security', label: 'Sicherheit', icon: Shield },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      {/* Government Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="bg-gov-blue text-white text-xs py-1 px-4 text-center font-medium tracking-wide">
          OFFIZIELLER DEMONSTRATOR
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => onNavigate('landing')}>
              <div className="bg-slate-900 p-2 rounded mr-3">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-none">GovChain Hub</h1>
                <p className="text-xs text-slate-500 font-medium tracking-wider mt-0.5">SECURE INFRASTRUCTURE</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-4 lg:space-x-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center px-2 py-2 text-sm font-medium transition-colors duration-150 whitespace-nowrap ${
                    activeView === item.id
                      ? 'text-gov-blue border-b-2 border-gov-blue'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  aria-current={activeView === item.id ? 'page' : undefined}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-4">
                {/* Profile Dropdown */}
                <div className="relative hidden md:block">
                    <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                    >
                        <div className="text-right hidden lg:block">
                            <p className="text-sm font-semibold text-slate-900 leading-tight">{user?.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wide">{user?.role}</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-gov-blue text-white flex items-center justify-center font-bold text-sm">
                            {user?.name.charAt(0)}
                        </div>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-4 py-3 border-b border-slate-100">
                                <p className="text-sm text-slate-900 font-medium">Angemeldet als</p>
                                <p className="text-xs text-slate-500 truncate">{user?.department}</p>
                            </div>
                            <div className="py-1">
                                <button className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                    <UserIcon className="mr-3 h-4 w-4 text-slate-400" /> Profil
                                </button>
                                <button className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                    <Activity className="mr-3 h-4 w-4 text-slate-400" /> Meine Aktivitäten
                                </button>
                            </div>
                            <div className="border-t border-slate-100 py-1">
                                <button 
                                    onClick={handleLogout}
                                    className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                >
                                    <LogOut className="mr-3 h-4 w-4" /> Abmelden
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gov-blue"
                >
                    <Menu className="h-6 w-6" />
                </button>
                </div>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                    activeView === item.id
                      ? 'bg-gov-blue text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </div>
                </button>
              ))}
              <div className="border-t border-slate-200 mt-2 pt-2">
                 <button 
                    onClick={handleLogout}
                    className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                 >
                     <LogOut className="h-5 w-5 mr-3" />
                     Abmelden ({user?.name})
                 </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4">GovChain Hub</h3>
            <p className="text-sm leading-relaxed text-slate-400">
              Technischer Demonstrator für den Einsatz von Distributed Ledger Technologie (DLT)
              in der öffentlichen Verwaltung. Fokus auf Datensparsamkeit und Sicherheit.
            </p>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Compliance</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center"><Shield className="w-3 h-3 mr-2" /> DSGVO-Konformität</li>
              <li className="flex items-center"><Shield className="w-3 h-3 mr-2" /> OWASP Top 10 geprüft</li>
              <li className="flex items-center"><Shield className="w-3 h-3 mr-2" /> Barrierefrei (WCAG 2.1)</li>
              <li className="flex items-center"><Shield className="w-3 h-3 mr-2" /> ISO 27001 Standards</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Kontakt</h3>
            <p className="text-sm text-slate-400">
              Referat für digitale Innovation<br />
              Willy-Brandt-Straße 1<br />
              10557 Berlin<br />
              <br />
              <a href="#" className="text-gov-accent hover:text-white transition-colors">kontakt@govchain.bund.de</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;