import React from 'react';
import { ArrowLeft, Shield, Server, Lock, Globe, CheckCircle } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (view: string) => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => onNavigate('dashboard')}
          className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors active-scale"
          aria-label="Zurück zum Dashboard"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Über GovChain Hub</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gov-blue p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
              <Shield className="w-8 h-8 text-blue-300" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Unsere Mission</h2>
              <p className="text-blue-100 mt-1 max-w-2xl">
                Schaffung einer souveränen, transparenten und hochsicheren digitalen Infrastruktur für die öffentliche Verwaltung in Deutschland.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <section>
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-gov-blue" />
              Vision
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Der GovChain Hub ist ein Demonstrator für den Einsatz von Blockchain- und Distributed-Ledger-Technologien (DLT) im öffentlichen Sektor. Unser Ziel ist es, Vertrauen durch kryptografische Nachvollziehbarkeit zu schaffen, Verwaltungsprozesse zu beschleunigen und gleichzeitig höchste Datenschutzstandards (DSGVO) zu gewährleisten.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-gov-blue" />
              Technologie-Stack
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-2">Permissioned Blockchain</h4>
                <p className="text-sm text-slate-600">Ein privates Netzwerk, das nur von autorisierten staatlichen Knotenpunkten betrieben wird (Proof of Authority).</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-2">Self-Sovereign Identity (SSI)</h4>
                <p className="text-sm text-slate-600">Dezentrale Identitäten ermöglichen Bürgern die volle Kontrolle über ihre Daten mittels Zero-Knowledge Proofs.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-2">Smart Contracts</h4>
                <p className="text-sm text-slate-600">Automatisierte, manipulationssichere Ausführung von Verwaltungsprozessen wie Vergaben und Budgetfreigaben.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-2">End-to-End Verschlüsselung</h4>
                <p className="text-sm text-slate-600">Dokumente werden lokal verschlüsselt und nur Hashes auf der Blockchain verankert.</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-gov-blue" />
              Sicherheit & Compliance
            </h3>
            <ul className="space-y-3">
              {[
                'Vollständige DSGVO-Konformität (Recht auf Vergessenwerden durch Off-Chain-Speicherung)',
                'BSI-konforme kryptografische Verfahren (BSI TR-02102)',
                'eIDAS 2.0 Kompatibilität für digitale Identitäten',
                'Regelmäßige externe Sicherheitsaudits und Penetrationstests'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
