import React, { useEffect, useState, useMemo } from 'react';
import { Article } from '../types';
import { DbService } from '../services/mockDbService';
import { BookOpen, Tag, Calendar, User, ArrowRight, Search, ChevronLeft, SlidersHorizontal } from 'lucide-react';

const KnowledgeBase: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const data = await DbService.getArticles();
      setArticles(data);
      setLoading(false);
    };
    fetch();
  }, []);

  // Real-time filtering logic
  const filteredArticles = useMemo(() => {
    if (!searchTerm) return articles;
    const lowerTerm = searchTerm.toLowerCase();
    return articles.filter(article => 
      article.title.toLowerCase().includes(lowerTerm) ||
      article.summary.toLowerCase().includes(lowerTerm) ||
      article.tags.some(tag => tag.toLowerCase().includes(lowerTerm))
    );
  }, [searchTerm, articles]);

  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => setSelectedArticle(null)}
          className="group mb-6 flex items-center text-sm font-medium text-slate-500 hover:text-gov-blue transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Zurück zur Übersicht
        </button>
        
        <article className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 px-8 py-8">
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedArticle.tags.map(tag => (
                <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">{selectedArticle.title}</h1>
            <div className="flex items-center text-sm text-slate-500 space-x-6">
              <span className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-slate-400"/> {selectedArticle.updatedAt.toLocaleDateString('de-DE')}</span>
              <span className="flex items-center"><User className="w-4 h-4 mr-2 text-slate-400"/> Redaktion Bund</span>
            </div>
          </div>
          
          <div className="p-8 md:p-10 prose prose-slate max-w-none">
            <p className="lead text-xl text-slate-600 mb-8 font-light leading-relaxed border-l-4 border-gov-blue pl-4">
              {selectedArticle.summary}
            </p>
            <div className="text-slate-800 leading-relaxed whitespace-pre-wrap font-serif text-lg">
              {selectedArticle.content}
            </div>
            
            <div className="mt-12 pt-8 border-t border-slate-100">
               <h4 className="text-sm font-bold text-slate-900 mb-2">Quellen & Referenzen</h4>
               <ul className="text-sm text-slate-500 list-disc list-inside space-y-1">
                 <li>BSI TR-03109 (Technische Richtlinie)</li>
                 <li>eIDAS Verordnung (EU) Nr. 910/2014</li>
                 <li>W3C Decentralized Identifiers (DIDs) v1.0</li>
               </ul>
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900">GovTech Wissensdatenbank</h2>
        <p className="mt-4 text-lg text-slate-600">
          Zentrale Informationsquelle für Blockchain-Technologien, Self-Sovereign Identity (SSI) und kryptografische Standards in der öffentlichen Verwaltung.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="relative shadow-sm rounded-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-12 py-4 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-2 focus:ring-gov-blue focus:border-gov-blue text-base shadow-sm transition-shadow"
            placeholder="Suchen nach Themen, Standards (z.B. SSI, Notarisierung)..."
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
             <SlidersHorizontal className="h-5 w-5 text-slate-400 cursor-pointer hover:text-slate-600" />
          </div>
        </div>
        {searchTerm && (
           <div className="mt-2 text-sm text-slate-500 text-center">
             {filteredArticles.length} Ergebnisse für "{searchTerm}" gefunden
           </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {loading ? (
            [1, 2].map(i => <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse"/>)
        ) : filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <div 
              key={article.id} 
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer group flex flex-col h-full"
              onClick={() => setSelectedArticle(article)}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-blue-50 rounded-lg text-gov-blue group-hover:bg-gov-blue group-hover:text-white transition-colors">
                  <BookOpen className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-slate-400 flex items-center bg-slate-50 px-2 py-1 rounded">
                  <Calendar className="h-3 w-3 mr-1.5" />
                  {article.updatedAt.toLocaleDateString('de-DE')}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-gov-blue transition-colors">
                {article.title}
              </h3>
              <p className="text-slate-600 mb-6 line-clamp-3 flex-grow">
                {article.summary}
              </p>
              
              <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                <div className="flex gap-2">
                  {article.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                      {tag}
                    </span>
                  ))}
                  {article.tags.length > 2 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-slate-400">
                      +{article.tags.length - 2}
                    </span>
                  )}
                </div>
                <span className="text-gov-blue font-semibold text-sm flex items-center group-hover:translate-x-1 transition-transform">
                  Artikel lesen <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
               <Search className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">Keine Artikel gefunden</h3>
            <p className="text-slate-500">Versuchen Sie es mit anderen Suchbegriffen.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;