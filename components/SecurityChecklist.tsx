import React from 'react';
import { SecurityChecklistItem } from '../types';
import { Shield, Server, Database, Globe } from 'lucide-react';

const checklist: SecurityChecklistItem[] = [
  {
    id: '1',
    category: 'APP',
    label: 'Rate Limiting',
    description: 'Implementiere Token Bucket Algorithmus auf API Routes (max 100 req/min pro IP).',
    critical: true
  },
  {
    id: '2',
    category: 'DATA',
    label: 'Input Sanitization',
    description: 'Alle Eingaben müssen durch Zod/Yup Schemas validiert werden, um NoSQL/SQL Injections zu verhindern.',
    critical: true
  },
  {
    id: '3',
    category: 'INFRA',
    label: 'Content Security Policy (CSP)',
    description: "Strict CSP Header setzen: script-src 'self' (keine inline scripts), frame-ancestors 'none'.",
    critical: true
  },
  {
    id: '4',
    category: 'DATA',
    label: 'Zero-Knowledge Architecture',
    description: 'Keine Speicherung von privaten Keys auf dem Server. Alles Signing passiert Client-Side.',
    critical: true
  }
];

const SecurityChecklist: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Deployment Security Blueprint</h2>
        <p className="text-slate-600 mt-2">
          Folgende Maßnahmen sind für die Live-Inbetriebnahme gemäß BSI Grundschutz erforderlich.
        </p>
      </div>

      <div className="grid gap-6">
        {checklist.map((item) => (
          <div key={item.id} className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-l-gov-error border-y border-r border-slate-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {item.category === 'INFRA' ? <Server className="h-6 w-6 text-slate-400" /> :
                 item.category === 'DATA' ? <Database className="h-6 w-6 text-slate-400" /> :
                 <Globe className="h-6 w-6 text-slate-400" />}
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-slate-900">{item.label}</h3>
                  {item.critical && (
                    <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      CRITICAL
                    </span>
                  )}
                </div>
                <p className="mt-1 text-slate-600">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-slate-100 rounded text-xs font-mono text-slate-600 border border-slate-200">
        // Next.js Security Headers Example (next.config.js)<br/>
        {`{
  key: 'X-Content-Type-Options',
  value: 'nosniff'
},
{
  key: 'X-Frame-Options',
  value: 'DENY'
},
{
  key: 'Strict-Transport-Security',
  value: 'max-age=63072000; includeSubDomains; preload'
}`}
      </div>
    </div>
  );
};

export default SecurityChecklist;