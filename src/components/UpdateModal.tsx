'use client';
import { useState, useEffect } from 'react';
import { Sparkles, Zap, Shield, Zap as ZapIcon, X, CheckCircle2, TrendingUp } from 'lucide-react';

const CURRENT_VERSION = '2.1.0'; // Atualize aqui para mostrar o modal novamente após novas mudanças

export default function UpdateModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const lastView = localStorage.getItem('meta_diff_last_view');

    if (lastView !== today) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeMenu = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('meta_diff_last_view', today);
    setIsOpen(false);
  };


  if (!isOpen) return null;

  const updates = [
    {
      title: 'Performance Turbo',
      desc: 'Navegação 3x mais rápida com novo sistema de Edge Caching e Otimização de Imagens.',
      icon: Zap,
      color: 'text-primary'
    },
    {
      title: 'Matchups Reais',
      desc: 'O simulador de confronto agora utiliza dados reais de counters e sinergias do meta.',
      icon: TrendingUp,
      color: 'text-secondary'
    },
    {
      title: 'Automação Global',
      desc: 'Dados do sistema agora são sincronizados automaticamente todo dia à meia-noite.',
      icon: Shield,
      color: 'text-emerald-400'
    },
    {
      title: 'Interface Fluida',
      desc: 'Otimização completa para dispositivos móveis com renderização acelerada por GPU.',
      icon: CheckCircle2,
      color: 'text-sky-400'
    }
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 sm:p-0">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-void/80 backdrop-blur-md animate-in fade-in duration-500" onClick={closeMenu}></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-xl nova-glass nova-border-glow rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-700">
        
        {/* Header Visual */}
        <div className="relative h-48 bg-gradient-to-br from-primary/20 via-void to-void flex items-center justify-center overflow-hidden">
           <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
           </div>
           <div className="relative z-10 text-center">
              <div className="inline-flex p-3 rounded-2xl bg-primary/20 border border-primary/30 mb-4 shadow-glow">
                 <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">
                 Protocolo <span className="text-primary">V2.1</span> Ativo
              </h2>
           </div>
           
           {/* Botão Fechar */}
           <button 
             onClick={closeMenu}
             className="absolute top-8 right-8 p-3 rounded-full bg-white/5 hover:bg-white/10 text-muted hover:text-white transition-all z-20"
           >
             <X className="w-5 h-5" />
           </button>
        </div>

        {/* Content */}
        <div className="p-10 sm:p-12">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-8 text-center">Registro de Atualizações de Sistema</p>
          
          <div className="space-y-6">
            {updates.map((up, i) => (
              <div key={i} className="flex gap-6 group/item">
                <div className={`shrink-0 w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover/item:border-primary/30 transition-all duration-500`}>
                  <up.icon className={`w-5 h-5 ${up.color}`} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">{up.title}</h4>
                  <p className="text-xs text-muted font-medium leading-relaxed opacity-70 group-hover/item:opacity-100 transition-opacity">
                    {up.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={closeMenu}
            className="w-full mt-12 py-5 bg-primary hover:bg-primary/90 text-void font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-glow hover:scale-[1.02] active:scale-95 transition-all"
          >
            Acessar Terminal Atualizado
          </button>
        </div>

        {/* Footer info */}
        <div className="px-10 pb-8 text-center">
           <span className="text-[8px] font-bold text-white/10 uppercase tracking-[0.5em]">Meta Diff Neural Network • Build 2026.04.27</span>
        </div>
      </div>
    </div>
  );
}
