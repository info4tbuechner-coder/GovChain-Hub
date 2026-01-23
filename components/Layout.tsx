import React, { useState } from 'react';
import { Menu, Shield, FileText, Activity, Home, Lock, Database, BookOpen } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Startseite', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'instruments', label: 'Instrumente', icon: Database },
    { id: 'knowledge', label: 'Wissen', icon: BookOpen },
    { id: 'transfer', label: 'Secure Transfer', icon: Lock },
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
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center px-3 py-2 text-sm font-medium transition-colors duration-150 ${
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