'use client';
import { TrendingUp, TrendingDown, RefreshCw, ChevronRight, Zap, Info, Calendar, Layout, Brain } from 'lucide-react';
import Link from 'next/link';

const CURRENT_PATCH = "15.1";

export default function PatchNotesPage() {
  const patchData = {
    buffs: [
      { name: 'Sylas', id: 'Sylas', changes: 'Aumento no scaling de AP da passiva e do Q. Mais dano explosivo no mid/late game.', type: 'Buff' },
      { name: 'Galio', id: 'Galio', changes: 'Redução no cooldown do W e aumento na resistência mágica base. Melhor performance contra magos.', type: 'Buff' },
      { name: 'Mordekaiser', id: 'Mordekaiser', changes: 'Dano do Q aumentado em alvos isolados. O isolamento agora é mais punitivo.', type: 'Buff' },
      { name: 'Hecarim', id: 'Hecarim', changes: 'Armadura base aumentada. Sobrevivência na selva melhorada no early game.', type: 'Buff' }
    ],
    nerfs: [
      { name: 'Azir', id: 'Azir', changes: 'Redução na regeneração de vida base e dano do W reduzido nos níveis iniciais. Menos pressão de rota.', type: 'Nerf' },
      { name: 'Briar', id: 'Briar', changes: 'Cura da passiva reduzida. Escalonamento de velocidade de ataque do Q diminuído.', type: 'Nerf' },
      { name: 'Zac', id: 'Zac', changes: 'Dano base do W reduzido. Menor velocidade de limpeza da selva e dano em trocas longas.', type: 'Nerf' }
    ],
    adjustments: [
      { name: 'Skarner', id: 'Skarner', changes: 'Ajustes na trajetória do E e escalonamento de vida no escudo do W. Focado em estabilidade.', type: 'Ajuste' }
    ]
  };

  return (
    <div className="max-w-5xl mx-auto px-6 pb-40 animate-nova-in">
      {/* Header Compacto Premium */}
      <section className="relative glass-card border border-white/5 p-8 sm:p-12 rounded-3xl mb-12 overflow-hidden text-center mt-12 group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-50"></div>
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-all duration-1000"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-void/40 border border-white/10 text-[9px] font-black text-primary uppercase tracking-[0.4em] mb-8">
            <Zap className="w-3 h-3 animate-pulse" /> Sincronia de Dados Riot Ativa
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black text-white italic tracking-tighter uppercase mb-4 leading-none">
            Patch <span className="text-primary drop-shadow-glow">{CURRENT_PATCH}</span>
          </h1>
          
          <p className="text-muted font-bold text-[10px] uppercase tracking-[0.5em] opacity-40 max-w-lg mx-auto">
            Inteligência tática sobre as alterações de equilíbrio global
          </p>
          
          <div className="flex items-center justify-center gap-10 mt-12">
            <div className="flex flex-col items-center group/stat">
               <div className="text-2xl font-black text-emerald-400 italic group-hover:scale-110 transition-transform">+{patchData.buffs.length}</div>
               <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mt-1">Fortalecidos</div>
            </div>
            <div className="w-[1px] h-8 bg-white/5"></div>
            <div className="flex flex-col items-center group/stat">
               <div className="text-2xl font-black text-red-500 italic group-hover:scale-110 transition-transform">-{patchData.nerfs.length}</div>
               <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mt-1">Enfraquecidos</div>
            </div>
            <div className="w-[1px] h-8 bg-white/5"></div>
            <div className="flex flex-col items-center group/stat">
               <div className="text-2xl font-black text-sky-400 italic group-hover:scale-110 transition-transform">{patchData.adjustments.length}</div>
               <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mt-1">Ajustados</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
        {/* BUFFS SECTION */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-glow-emerald">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="text-sm font-black text-white uppercase tracking-[0.3em] italic">Ascensão <span className="text-emerald-400/50">(Buffs)</span></h2>
          </div>
          
          <div className="space-y-3">
            {patchData.buffs.map((champ) => (
              <Link key={champ.id} href={`/champion/${champ.id}`} className="block group">
                <div className="glass-card border border-white/5 p-4 rounded-3xl group-hover:border-emerald-500/30 transition-all duration-500 hover:translate-x-2 bg-white/[0.01]">
                  <div className="flex items-center gap-5">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-white/10 group-hover:border-emerald-500/40 transition-colors">
                      <img 
                        src={`https://ddragon.leagueoflegends.com/cdn/15.1.1/img/champion/${champ.id}.png`}
                        alt={champ.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-emerald-500/5 mix-blend-overlay"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors uppercase italic tracking-tighter">{champ.name}</h3>
                      <p className="text-[10px] text-muted font-medium leading-relaxed mt-1 opacity-60 group-hover:opacity-100 transition-opacity">{champ.changes}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* NERFS SECTION */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-glow-red">
              <TrendingDown className="w-4 h-4 text-red-500" />
            </div>
            <h2 className="text-sm font-black text-white uppercase tracking-[0.3em] italic">Declínio <span className="text-red-500/50">(Nerfs)</span></h2>
          </div>

          <div className="space-y-3">
            {patchData.nerfs.map((champ) => (
              <Link key={champ.id} href={`/champion/${champ.id}`} className="block group">
                <div className="glass-card border border-white/5 p-4 rounded-3xl group-hover:border-red-500/30 transition-all duration-500 hover:translate-x-2 bg-white/[0.01]">
                  <div className="flex items-center gap-5">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-white/10 group-hover:border-red-500/40 transition-colors">
                      <img 
                        src={`https://ddragon.leagueoflegends.com/cdn/15.1.1/img/champion/${champ.id}.png`}
                        alt={champ.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-red-500/5 mix-blend-overlay"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-black text-white group-hover:text-red-500 transition-colors uppercase italic tracking-tighter">{champ.name}</h3>
                      <p className="text-[10px] text-muted font-medium leading-relaxed mt-1 opacity-60 group-hover:opacity-100 transition-opacity">{champ.changes}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ADJUSTMENTS SECTION */}
        <section className="lg:col-span-2 space-y-6 mt-4">
          <div className="flex items-center gap-4 px-2">
             <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 shadow-glow-sky">
              <RefreshCw className="w-4 h-4 text-sky-400" />
            </div>
            <h2 className="text-sm font-black text-white uppercase tracking-[0.3em] italic">Ajustes de <span className="text-sky-400/50">Estabilidade</span></h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {patchData.adjustments.map((champ) => (
              <Link key={champ.id} href={`/champion/${champ.id}`} className="block group">
                <div className="glass-card border border-white/5 p-4 rounded-3xl group-hover:border-sky-500/30 transition-all duration-500 bg-white/[0.01]">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 group-hover:border-sky-500/40 transition-colors">
                      <img 
                        src={`https://ddragon.leagueoflegends.com/cdn/15.1.1/img/champion/${champ.id}.png`}
                        alt={champ.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xs font-black text-white uppercase italic tracking-tighter">{champ.name}</h3>
                      <p className="text-[9px] text-muted font-medium opacity-50 leading-relaxed mt-1">{champ.changes}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Footer Info Compacto */}
      <div className="mt-16 p-6 glass-card border border-white/5 rounded-3xl flex items-center gap-6 group">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 shadow-glow">
          <Brain className="w-5 h-5 text-primary group-hover:rotate-12 transition-transform" />
        </div>
        <p className="text-[9px] font-bold text-muted uppercase tracking-[0.3em] leading-relaxed">
          Protocolo Meta-Diff: Dados sincronizados com a API oficial da Riot Games. Analisando variações de performance pós-patch em tempo real para todos os elos.
        </p>
      </div>
    </div>
  );
}
