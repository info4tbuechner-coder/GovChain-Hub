import React from 'react';
import { ArrowRight, ShieldCheck, Database, FileKey, BookOpen } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-8 md:p-12 lg:p-16">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-gov-blue mb-6">
            <span className="flex h-2 w-2 rounded-full bg-gov-blue mr-2"></span>
            GovTech Pilot 2025
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
            Vertrauenswürdige Blockchain-Infrastruktur für den Staat
          </h2>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            Der GovChain Hub ermöglicht Behörden das sichere Testen von Self-Sovereign Identity (SSI)
            und manipulationssicherem Dokumentenaustausch. Vollständig Open Source, transparent und DSGVO-konform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gov-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gov-blue transition-colors"
            >
              Dashboard öffnen
              <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
            </button>
            <button
              onClick={() => onNavigate('instruments')}
              className="inline-flex justify-center items-center px-6 py-3 border border-slate-300 text-base font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gov-blue transition-colors"
            >
              Technologie-Stack ansehen
            </button>
          </div>
        </div>
        
        {/* Abstract Deco Element */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
      </section>

      {/* Feature Grid */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
            <ShieldCheck className="h-6 w-6 text-gov-blue" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">Self-Sovereign Identity</h3>
          <p className="text-slate-600">
            Bürger behalten die Kontrolle über ihre Daten. Nur kryptografische Beweise (Zero-Knowledge Proofs) werden geteilt.
          </p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
            <FileKey className="h-6 w-6 text-gov-blue" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">Secure Doc Transfer</h3>
          <p className="text-slate-600">
            Ende-zu-Ende verschlüsselte Übertragung mit Blockchain-basiertem Zeitstempel für rechtssichere Zustellung.
          </p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
            <Database className="h-6 w-6 text-gov-blue" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">Audit Logging</h3>
          <p className="text-slate-600">
            Unveränderliche Protokollierung aller Zugriffe in einer privaten Permissioned Chain für maximale Transparenz.
          </p>
        </div>
      </section>

      {/* Knowledge Base Teaser */}
      <section className="bg-slate-900 rounded-2xl p-8 md:p-12 shadow-lg text-white flex flex-col md:flex-row items-center justify-between">
        <div className="mb-6 md:mb-0 md:mr-8 max-w-2xl">
          <div className="flex items-center mb-4 text-blue-400">
            <BookOpen className="h-6 w-6 mr-2" />
            <span className="font-bold tracking-wider text-sm">ACADEMY</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold mb-4">Wissenstransfer für die Verwaltung</h3>
          <p className="text-slate-300 text-lg">
            Greifen Sie auf unsere kuratierte Wissensdatenbank zu, um tiefere Einblicke in SSI, eIDAS 2.0 und Smart Contracts im öffentlichen Sektor zu erhalten.
          </p>
        </div>
        <button
          onClick={() => onNavigate('knowledge')}
          className="flex-shrink-0 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-slate-900 bg-white hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-white transition-colors"
        >
          Zur Wissensdatenbank
        </button>
      </section>
    </div>
  );
};

export default LandingPage;