'use client';
import { TrendingUp, TrendingDown, RefreshCw, ChevronRight, Zap, Info, Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const CURRENT_PATCH = "14.8";

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
    <div className="max-w-6xl mx-auto px-6 pb-40 animate-nova-in">
      {/* Header Cinematográfico */}
      <section className="relative nova-glass nova-border-glow p-12 rounded-[3.5rem] mb-16 overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent opacity-50"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-6">
            <Zap className="w-3 h-3" /> Transmissão de Dados Riot
          </div>
          <h1 className="text-6xl sm:text-8xl font-black text-white italic tracking-tighter uppercase mb-4">
            Patch <span className="text-primary text-glow-primary">{CURRENT_PATCH}</span>
          </h1>
          <p className="text-muted font-bold text-xs uppercase tracking-[0.3em] opacity-60">Análise Tática de Buffs, Nerfs e Ajustes Globais</p>
          
          <div className="flex items-center justify-center gap-8 mt-10">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-emerald-400 italic">+{patchData.buffs.length}</span>
              <span className="text-[9px] font-black text-muted uppercase tracking-widest">Buffs</span>
            </div>
            <div className="w-[1px] h-8 bg-white/10"></div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-red-500 italic">-{patchData.nerfs.length}</span>
              <span className="text-[9px] font-black text-muted uppercase tracking-widest">Nerfs</span>
            </div>
            <div className="w-[1px] h-8 bg-white/10"></div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-sky-400 italic">{patchData.adjustments.length}</span>
              <span className="text-[9px] font-black text-muted uppercase tracking-widest">Ajustes</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* BUFFS SECTION */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 px-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-widest italic">Ascensão <span className="text-emerald-400">(Buffs)</span></h2>
          </div>
          
          <div className="space-y-4">
            {patchData.buffs.map((champ) => (
              <Link key={champ.id} href={`/champion/${champ.id}`} className="block group">
                <div className="nova-glass-light border border-white/5 p-6 rounded-[2rem] group-hover:border-emerald-500/30 transition-all duration-500 hover:translate-x-2">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                      <Image 
                        src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/${champ.id}.png`}
                        alt={champ.name}
                        width={64} height={64}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors uppercase italic tracking-tighter">{champ.name}</h3>
                      <p className="text-xs text-muted font-medium leading-relaxed mt-1 opacity-70">{champ.changes}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* NERFS SECTION */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 px-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-widest italic">Declínio <span className="text-red-500">(Nerfs)</span></h2>
          </div>

          <div className="space-y-4">
            {patchData.nerfs.map((champ) => (
              <Link key={champ.id} href={`/champion/${champ.id}`} className="block group">
                <div className="nova-glass-light border border-white/5 p-6 rounded-[2rem] group-hover:border-red-500/30 transition-all duration-500 hover:translate-x-2">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                      <Image 
                        src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/${champ.id}.png`}
                        alt={champ.name}
                        width={64} height={64}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-white group-hover:text-red-500 transition-colors uppercase italic tracking-tighter">{champ.name}</h3>
                      <p className="text-xs text-muted font-medium leading-relaxed mt-1 opacity-70">{champ.changes}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ADJUSTMENTS SECTION */}
        <section className="lg:col-span-2 space-y-8 mt-8">
          <div className="flex items-center gap-4 px-4">
             <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.2)]">
              <RefreshCw className="w-5 h-5 text-sky-400" />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-widest italic">Ajustes de <span className="text-sky-400">Equilíbrio</span></h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patchData.adjustments.map((champ) => (
              <Link key={champ.id} href={`/champion/${champ.id}`} className="block group">
                <div className="nova-glass-light border border-white/5 p-6 rounded-[2rem] group-hover:border-sky-500/30 transition-all duration-500">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                      <Image 
                        src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/${champ.id}.png`}
                        alt={champ.name}
                        width={56} height={56}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-md font-black text-white uppercase italic tracking-tighter">{champ.name}</h3>
                      <p className="text-[11px] text-muted font-medium opacity-60 leading-relaxed">{champ.changes}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>

      {/* Footer Disclaimer */}
      <div className="mt-20 p-8 nova-glass-light border border-white/5 rounded-[2rem] flex items-center gap-6">
        <Info className="w-6 h-6 text-primary shrink-0" />
        <p className="text-[10px] font-bold text-muted uppercase tracking-widest leading-relaxed">
          Os dados apresentados são baseados nas notas oficiais da Riot Games e em análises de winrate pós-patch. O Meta Diff atualiza essas informações em tempo real após cada ciclo de atualização.
        </p>
      </div>
    </div>
  );
}
