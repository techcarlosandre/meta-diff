'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Trophy, TrendingUp, Search, 
  Activity, Star, Zap, Shield, Flame, X
} from 'lucide-react';
import { supabase } from '@/utils/supabase';

export default function MetaPage() {
  const [allChamps, setAllChamps] = useState<any[]>([]);
  const [metaStats, setMetaStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLane, setFilterLane] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadedUi, setLoadedUi] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [champsRes, metaRes] = await Promise.all([
          fetch('https://ddragon.leagueoflegends.com/cdn/16.8.1/data/pt_BR/champion.json'),
          supabase.from('route_meta').select('*')
        ]);
        
        const champsData = await champsRes.json();
        setAllChamps(Object.values(champsData.data));
        
        if (metaRes.data) {
          setMetaStats(metaRes.data);
        }
      } catch (err) {
        console.error("Erro ao carregar meta", err);
      } finally {
        setLoading(false);
        setTimeout(() => setLoadedUi(true), 100);
      }
    }
    fetchData();

    const timeout = setTimeout(() => {
      setLoading(false);
      setLoadedUi(true);
    }, 8000);

    return () => clearTimeout(timeout);
  }, []);

  const getTierSettings = (tier: string) => {
    switch(tier) {
      case 'S+': return { color: 'text-primary', border: 'border-primary', bg: 'bg-primary/20', glow: 'group-hover:shadow-[0_0_30px_rgba(0,255,204,0.3)]', bar: 'bg-primary' };
      case 'S': return { color: 'text-secondary', border: 'border-secondary', bg: 'bg-secondary/20', glow: 'group-hover:shadow-[0_0_30px_rgba(255,184,0,0.3)]', bar: 'bg-secondary' };
      case 'A': return { color: 'text-emerald-400', border: 'border-emerald-500', bg: 'bg-emerald-500/20', glow: 'group-hover:shadow-[0_0_20px_rgba(52,211,153,0.3)]', bar: 'bg-emerald-400' };
      case 'B': return { color: 'text-sky-400', border: 'border-sky-500', bg: 'bg-sky-500/20', glow: 'group-hover:shadow-[0_0_20px_rgba(56,189,248,0.3)]', bar: 'bg-sky-400' };
      case 'C': return { color: 'text-yellow-400', border: 'border-yellow-500', bg: 'bg-yellow-500/20', glow: 'group-hover:shadow-[0_0_20px_rgba(250,204,21,0.3)]', bar: 'bg-yellow-400' };
      case 'D': return { color: 'text-orange-500', border: 'border-orange-600', bg: 'bg-orange-600/20', glow: 'group-hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]', bar: 'bg-orange-500' };
      default: return { color: 'text-zinc-500', border: 'border-zinc-600', bg: 'bg-zinc-600/20', glow: 'group-hover:shadow-md', bar: 'bg-zinc-500' };
    }
  };

  const translateLane = (lane: string) => {
    const translations: { [key: string]: string } = {
      'ALL': 'TOTAL', 'TOP': 'TOPO', 'JUNGLE': 'SELVA', 'MID': 'MEIO', 'ADC': 'ATIRADOR', 'SUPPORT': 'SUPORTE'
    };
    return translations[lane] || lane;
  };

  const getRoleFromTag = (tag: string) => {
    const map: Record<string, string> = {
      'Fighter': 'TOP', 'Tank': 'TOP', 'Mage': 'MID', 'Assassin': 'MID', 'Marksman': 'ADC', 'Support': 'SUPPORT'
    };
    return map[tag] || 'MID';
  };

  const completeMeta = useMemo(() => {
    const championsWithStats = new Set(metaStats.map(m => m.champion_name));
    return [
      ...metaStats,
      ...allChamps
        .filter(champ => !championsWithStats.has(champ.id))
        .map(champ => ({
          champion_name: champ.id,
          role: getRoleFromTag(champ.tags?.[0] || 'Mage'),
          win_rate: 0,
          pick_rate: 0,
          ban_rate: 0,
          tier_rank: '-'
        }))
    ];
  }, [metaStats, allChamps]);

  const filteredMeta = useMemo(() => {
    return completeMeta.filter(m => {
      const matchesLane = filterLane === 'ALL' || m.role === filterLane;
      const matchesSearch = !searchQuery || m.champion_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesLane && matchesSearch;
    });
  }, [completeMeta, filterLane, searchQuery]);

  const groupedByTier = useMemo(() => {
    return filteredMeta.reduce((acc: Record<string, any[]>, curr) => {
      const tier = curr.tier_rank || '-';
      if (!acc[tier]) acc[tier] = [];
      acc[tier].push(curr);
      return acc;
    }, {});
  }, [filteredMeta]);

  const tierOrder = ['S+', 'S', 'A', 'B', 'C', 'D', 'F', '-'];

  const formatRate = (val: any) => {
    if (val === undefined || val === null) return '00,00';
    const num = typeof val === 'string' ? parseFloat(val.replace(',', '.').replace('%', '')) : val;
    if (isNaN(num)) return '00,00';
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (loading) return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center">
       <div className="relative w-24 h-24 mb-6">
         <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
         <div className="absolute inset-4 border-4 border-secondary/20 border-b-secondary rounded-full animate-spin-reverse delay-150"></div>
       </div>
       <div className="text-[10px] font-black text-primary uppercase tracking-[0.5em] animate-pulse">Sincronizando Core...</div>
    </div>
  );

  return (
    <div className="min-h-screen pb-32 bg-transparent overflow-y-auto selection:bg-primary/30">
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-float opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 blur-[150px] rounded-full animate-float-delayed opacity-30"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 pt-32 md:pt-40 pb-20">
        
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 border-b border-white/5 pb-16 mb-20 relative">
          <div className="space-y-8 text-center md:text-left w-full md:w-auto">
             <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <div className="px-4 py-1.5 rounded-full bg-void border border-primary/20 shadow-[0_0_20px_rgba(0,255,204,0.1)]">
                   <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">Sincronia Global: Patch 15.1</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
             </div>
             
             <h1 className="text-6xl sm:text-8xl font-black tracking-tighter uppercase leading-[0.8] italic flex flex-col gap-2">
                <span className="text-white drop-shadow-glow">TIER</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-shimmer">LIST</span>
             </h1>
             
             <p className="text-[10px] sm:text-xs font-bold text-white/40 max-w-sm leading-relaxed tracking-widest uppercase mx-auto md:mx-0">
               O dashboard definitivo de precisão cirúrgica. Dados extraídos em tempo real do meta global para garantir sua elite.
             </p>
          </div>
          
          <div className="flex flex-col gap-8 w-full md:w-auto">
             <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"></div>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-[2px] pointer-events-none"></div>

                <div className="relative flex items-center">
                  <Search className="absolute left-6 w-5 h-5 text-muted group-hover:text-primary transition-colors z-20" />
                  <input 
                    className="glass-card border border-white/10 rounded-3xl py-4 px-12 w-full md:w-[400px] text-[10px] font-black uppercase tracking-widest focus:border-primary/50 transition-all outline-none text-white shadow-2xl relative z-10" 
                    placeholder="Rastrear Campeão..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-6 p-1 hover:text-red-400 transition-all text-muted z-20">
                       <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
             </div>
             
             <div className="grid grid-cols-3 sm:flex flex-wrap gap-2 justify-end">
                {['ALL', 'TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'].map(l => (
                   <button 
                    key={l} 
                    onClick={() => setFilterLane(l)}
                    className={`px-5 py-3 rounded-xl text-[9px] font-black transition-all duration-500 transform border ${filterLane === l ? 'bg-primary text-void shadow-[0_0_30px_rgba(0,255,204,0.4)] scale-110 border-transparent' : 'bg-white/5 border-white/5 text-muted hover:text-white hover:border-white/20 hover:bg-white/10'}`}
                   >
                     {translateLane(l)}
                   </button>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-32">
          {tierOrder.map(tier => {
            const champs = groupedByTier[tier];
            if (!champs || champs.length === 0) return null;
            const settings = getTierSettings(tier);
            
            return (
              <div key={tier} className="relative group/tier animate-fade-in-up">
                <div className="flex items-center gap-6 mb-10">
                   <div className="relative shrink-0">
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center text-3xl sm:text-4xl font-black italic border-[3px] shadow-2xl transform group-hover/tier:rotate-3 transition-all duration-700 ${settings.bg} ${settings.border} ${settings.color} drop-shadow-[0_0_20px_rgba(var(--primary-glow),0.3)] shrink-0 aspect-square`}>
                        {tier === '-' ? '?' : tier}
                      </div>
                   </div>
                   <div className="space-y-2">
                      <h2 className={`text-2xl sm:text-4xl font-black italic tracking-tighter uppercase ${settings.color}`}>
                        RANK {tier === 'S+' ? 'GOD TIER' : tier === 'S' ? 'ELITE' : tier === 'A' ? 'ESTÁVEL' : 'CONTRA-META'}
                      </h2>
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`h-1 flex-1 rounded-full ${settings.bg} opacity-30 hidden sm:block`}></div>
                        <span className="text-[8px] sm:text-[9px] font-black text-muted uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                          {champs.length} CAMPEÕES IDENTIFICADOS
                        </span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                   {champs.map((m, i) => {
                    const champ = allChamps.find(c => c.id === m.champion_name);
                    if (!champ) return null;
                    
                    return (
                      <Link 
                        key={`${m.champion_name}-${m.role}-${i}`} 
                        href={`/champion/${champ.id}`}
                        className="group/card perspective-1000"
                      >
                        <div className={`relative glass-card p-5 rounded-3xl border border-white/5 transition-all duration-700 hover:scale-[1.05] hover:-translate-y-3 hover:border-primary/30 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] overflow-hidden group-hover/card:bg-white/5`}>
                          <div className={`absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-0 group-hover/card:opacity-20 transition-opacity duration-700 ${settings.bg}`}></div>
                          
                          <div className="flex items-center gap-4 relative z-10">
                             <div className={`w-16 h-16 rounded-2xl border-2 border-white/10 overflow-hidden shadow-lg transform transition-all duration-700 group-hover/card:scale-110 group-hover/card:${settings.border} group-hover/card:rotate-2`}>
                                <img 
                                 src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/${champ.image.full}`} 
                                 className="w-full h-full object-cover transform group-hover/card:scale-125 transition-transform duration-1000" 
                                 alt={champ.name} 
                                />
                             </div>

                            <div className="flex flex-col justify-center">
                               <h3 className="text-xl font-black text-white italic tracking-tighter group-hover/card:text-glow-white transition-all duration-300">
                                 {champ.name}
                               </h3>
                               <div className="flex items-center gap-2 mt-1">
                                  <div className={`w-2 h-2 rounded-full ${settings.bg} animate-pulse`}></div>
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${settings.color}`}>
                                    {translateLane(m.role)}
                                  </span>
                                </div>
                            </div>
                          </div>

                          <div className="mt-6 grid grid-cols-2 gap-2 relative z-10">
                             <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/5 group-hover/card:bg-white/[0.08] transition-all group-hover/card:border-primary/20">
                                <div className="text-[7px] font-black text-muted uppercase tracking-widest mb-1 flex items-center gap-1">
                                   <TrendingUp className="w-2 h-2 text-primary" /> VITÓRIA
                                </div>
                                <div className="text-lg font-black text-primary italic tracking-widest italic">{formatRate(m.win_rate)}%</div>
                             </div>
                             <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/5 group-hover/card:bg-white/[0.08] transition-all group-hover/card:border-secondary/20">
                                <div className="text-[7px] font-black text-muted uppercase tracking-widest mb-1 flex items-center gap-1">
                                   <Zap className="w-2 h-2 text-secondary" /> PICK
                                </div>
                                <div className="text-lg font-black text-white italic tracking-widest">{formatRate(m.pick_rate)}%</div>
                             </div>
                          </div>

                          <div className="mt-6 pt-6 border-t border-white/5 opacity-0 group-hover/card:opacity-100 translate-y-4 group-hover/card:translate-y-0 transition-all duration-500 flex items-center justify-between">
                             <span className="text-[9px] font-black text-muted uppercase tracking-widest">Ver Perfil Analítico</span>
                             <div className="w-8 h-8 rounded-full bg-primary text-void flex items-center justify-center">
                                <Activity className="w-4 h-4" />
                             </div>
                          </div>
                        </div>
                      </Link>
                    )
                   })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-40 border-t border-white/5 pt-20 flex flex-col items-center text-center space-y-6">
           <div className="w-16 h-16 rounded-3xl bg-secondary/10 flex items-center justify-center border border-secondary/20 shadow-2xl">
              <Star className="w-8 h-8 text-secondary animate-spin-slow" />
           </div>
           <h4 className="text-2xl font-black italic text-white uppercase tracking-tighter">O Meta está Sempre Mudando</h4>
           <p className="text-muted text-xs max-w-lg leading-relaxed uppercase font-bold tracking-widest opacity-60">
             Nossos algoritmos processam milhões de partidas a cada 6 horas para garantir que você esteja sempre um passo à frente. Domine as sombras, conquiste sua elite.
           </p>
        </div>
      </div>
    </div>
  );
}
