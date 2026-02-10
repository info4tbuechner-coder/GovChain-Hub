
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, FileText, BarChart3, ShieldCheck, Database, RefreshCw, X } from 'lucide-react';
import { ChatMessage } from '../types';
import { DbService } from '../services/mockDbService';
import { useUser } from '../contexts/UserContext';

const GovAiAssistant: React.FC = () => {
  // Fixed typo: was userUser, now useUser
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([
      {
          id: 'init',
          role: 'assistant',
          content: 'Willkommen beim GovAI Assistenten. Ich bin eine souveräne KI-Instanz, die in der sicheren Bundes-Cloud läuft. Ich habe lesenden Zugriff auf Register, Haushaltsdaten und Compliance-Logs. Wie kann ich Sie unterstützen?',
          timestamp: new Date()
      }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if(scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [messages]);

  const handleSend = async (text: string = inputValue) => {
      if (!text.trim()) return;
      
      const userMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'user',
          content: text,
          timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMsg]);
      setInputValue('');
      setIsProcessing(true);

      try {
          const response = await DbService.sendAiPrompt(text);
          setMessages(prev => [...prev, response]);
          await DbService.createAuditLog(user?.id || 'anon', 'AI_QUERY', JSON.stringify({ responseSource: response.sources?.[0] || 'general' }));
      } catch (e) {
          console.error(e);
      } finally {
          setIsProcessing(false);
      }
  };

  const prompts = [
      { label: 'Haushalt abfragen', query: 'Wie ist der aktuelle Status im Haushalt?', icon: BarChart3 },
      { label: 'Vergabeverfahren', query: 'Zeige mir alle offenen Vergabeverfahren.', icon: FileText },
      { label: 'Sicherheits-Audit', query: 'Gibt es Sicherheitsrisiken im Audit Log?', icon: ShieldCheck },
      { label: 'Antwort entwerfen', query: 'Erstelle einen Entwurf für eine Eingangsbestätigung.', icon: FileText },
  ];

  return (
    <div className="h-[calc(100vh-140px)] sm:h-[calc(100vh-180px)] flex flex-col md:flex-row gap-4 sm:gap-6 animate-in fade-in pr-safe pl-safe pb-safe">
        
        {/* Mobile Horizontal Prompts / Desktop Sidebar */}
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto scrollbar-hide md:w-64 pb-2 md:pb-0 flex-shrink-0">
            <div className="hidden md:block bg-slate-900 text-white p-6 rounded-xl shadow-lg mb-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold">GovAI</h2>
                        <p className="text-[10px] text-blue-200">Sovereign Cloud</p>
                    </div>
                </div>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                    Souveräne KI-Instanz im IVBB. Antworten basieren auf Blockchain-Echtzeitdaten.
                </p>
            </div>

            <div className="flex md:flex-col gap-2 w-full">
                {prompts.map((p, i) => (
                    <button 
                        key={i}
                        onClick={() => handleSend(p.query)}
                        disabled={isProcessing}
                        className="flex-shrink-0 md:w-full text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-300 transition-all text-xs font-semibold text-slate-700 flex items-center gap-3 active-scale shadow-sm"
                    >
                        <p.icon className="w-4 h-4 text-gov-blue" />
                        <span className="whitespace-nowrap md:whitespace-normal">{p.label}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50" ref={scrollRef}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[90%] sm:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-2 sm:gap-3`}>
                            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm 
                                ${msg.role === 'user' ? 'bg-slate-200' : 'bg-gov-blue text-white'}`}>
                                {msg.role === 'user' ? <User className="w-4 h-4 text-slate-500"/> : <Sparkles className="w-4 h-4"/>}
                            </div>
                            
                            <div className={`p-3 sm:p-4 rounded-2xl shadow-sm text-xs sm:text-sm leading-relaxed whitespace-pre-wrap
                                ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-blue-50'}`}>
                                {msg.content}
                                
                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="mt-3 pt-2 border-t border-slate-100">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Quelle</p>
                                        <div className="flex flex-wrap gap-1">
                                            {msg.sources.map((s, idx) => (
                                                <span key={idx} className="bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded text-[9px] font-mono border border-slate-100">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                
                {isProcessing && (
                    <div className="flex justify-start">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gov-blue text-white flex items-center justify-center shadow-sm">
                                <Bot className="w-5 h-5"/>
                            </div>
                            <div className="bg-white p-3 sm:p-4 rounded-2xl rounded-tl-none border border-blue-50 shadow-sm flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 text-gov-blue animate-spin" />
                                <span className="text-xs text-slate-500 italic">Verarbeite Anfrage...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
                <div className="relative flex items-center">
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Anfrage stellen..." 
                        className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-gov-blue focus:outline-none transition-all text-sm"
                        disabled={isProcessing}
                    />
                    <button 
                        onClick={() => handleSend()}
                        disabled={!inputValue.trim() || isProcessing}
                        className="absolute right-1.5 p-2.5 bg-gov-blue text-white rounded-xl active-scale disabled:opacity-30 transition-all"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default GovAiAssistant;
