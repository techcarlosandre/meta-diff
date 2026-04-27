'use client';
import { useState, useEffect } from 'react';
import { Sparkles, Zap, Shield, X, CheckCircle2, TrendingUp } from 'lucide-react';

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-void/90 backdrop-blur-md animate-in fade-in duration-500" onClick={closeMenu}></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-lg nova-glass nova-border-glow rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-700 flex flex-col max-h-[90vh]">
        
        {/* Header Visual */}
        <div className="relative h-32 sm:h-44 bg-gradient-to-br from-primary/20 via-void to-void flex items-center justify-center overflow-hidden shrink-0">
           <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
           </div>
           <div className="relative z-10 text-center px-4">
              <div className="inline-flex p-2 rounded-xl bg-primary/20 border border-primary/30 mb-2 sm:mb-4 shadow-glow">
                 <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white italic tracking-tighter uppercase">
                 Protocolo <span className="text-primary text-glow-primary">V2.1</span>
              </h2>
           </div>
           
           {/* Botão Fechar - Touch area otimizada */}
           <button 
             onClick={closeMenu}
             className="absolute top-4 right-4 sm:top-8 sm:right-8 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all z-20 border border-white/10"
           >
             <X className="w-6 h-6" />
           </button>
        </div>

        {/* Conteúdo com Scroll para telas pequenas */}
        <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar">
          <p className="text-[9px] font-black text-primary uppercase tracking-[0.4em] mb-6 text-center opacity-80">Atualizações de Sistema</p>
          
          <div className="space-y-5">
            {updates.map((up, i) => (
              <div key={i} className="flex gap-4 sm:gap-6 group/item bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                <div className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center border border-white/5`}>
                  <up.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${up.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="text-[11px] sm:text-sm font-black text-white uppercase tracking-widest mb-1">{up.title}</h4>
                  <p className="text-[10px] sm:text-xs text-muted font-medium leading-relaxed opacity-70">
                    {up.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={closeMenu}
            className="w-full mt-8 py-4 sm:py-5 bg-primary hover:bg-primary/90 text-void font-black text-xs uppercase tracking-[0.3em] rounded-xl sm:rounded-2xl shadow-glow transition-all active:scale-95"
          >
            Confirmar e Acessar
          </button>
        </div>

        {/* Footer info */}
        <div className="px-6 pb-6 text-center shrink-0">
           <span className="text-[7px] sm:text-[8px] font-bold text-white/5 uppercase tracking-[0.5em]">Neural Network • Build 2026.04.27</span>
        </div>
      </div>
    </div>
  );
}
