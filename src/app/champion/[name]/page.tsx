'use client';
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { formatChampName, formatDisplayName } from '@/utils/riot';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import {
   Lock, User, Shield, Sword, Zap, Brain, ChevronRight, Star, Target, TrendingUp,
   Lightbulb, Plus, Sparkles, Activity,
   Trophy, Ghost, Flame, AlertTriangle, X
} from 'lucide-react';

let RUNES_CACHE: any[] | null = null;
let ALL_CHAMPS_CACHE: any[] | null = null;

interface ChampionData {
   id: string;
   name: string;
   image: { full: string };
   tags: string[];
   info: { difficulty: number };
   passive: { name: string; description: string; image: { full: string } };
   spells: any[];
}

export default function ChampionPage() {
   const params = useParams();
   const name = params?.name as string;
   const [champion, setChampion] = useState<ChampionData | null>(null);
   const [loading, setLoading] = useState(true);
   const [buildLoading, setBuildLoading] = useState(true);
   const [buildData, setBuildData] = useState<any>(null);
   const [runesData, setRunesData] = useState<any[]>([]);
   const [championLanes, setChampionLanes] = useState<string[]>([]);

   const [userLane, setUserLane] = useState<string>('SUPPORT');
   const [opponent, setOpponent] = useState<any>(null);
   const [allChamps, setAllChamps] = useState<ChampionData[]>([]);
   const [showMatchupList, setShowMatchupList] = useState(false);
   const [searchTerm, setSearchTerm] = useState('');
   const [showLaneList, setShowLaneList] = useState(false);
   const [activeSkill, setActiveSkill] = useState<string>('P');
   const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
   const [matchupResult, setMatchupResult] = useState<{ winRate: string, difficulty: string, advice: string } | null>(null);

   const formatRate = (val: any) => {
      if (val === undefined || val === null) return '00,00';
      const num = typeof val === 'string' ? parseFloat(val.replace(',', '.').replace('%', '')) : val;
      if (isNaN(num)) return '00,00';
      return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
   };

   const champId = formatChampName(name);

   useEffect(() => {
      if (opponent && champion) {
         const isHard = ['Vayne', 'Fiora', 'Darius', 'Yasuo'].includes(opponent.name);
         const isEasy = ['Yuumi', 'Sona', 'Lux', 'Janna'].includes(opponent.name);
         setMatchupResult({
            winRate: isHard ? '46.5%' : isEasy ? '58.2%' : '51.4%',
            difficulty: isHard ? 'CRÍTICO' : isEasy ? 'BAIXA' : 'MODERADA',
            advice: isHard ? 
               `ALERTA: ${opponent.name} possui vantagem mecânica. Considere jogar recuado e aguardar ganks.` :
               `DETECTADO: ${champion.name} possui ferramentas superiores para este embate.`
         });
      } else {
         setMatchupResult(null);
      }
   }, [opponent, champion]);

   useEffect(() => {
      async function fetchData() {
         try {
            const requests: Promise<any>[] = [
               fetch(`https://ddragon.leagueoflegends.com/cdn/16.8.1/data/pt_BR/champion/${champId}.json`),
               Promise.resolve(supabase.from('route_meta').select('role').eq('champion_name', champId))
            ];

            if (!ALL_CHAMPS_CACHE) requests.push(fetch('https://ddragon.leagueoflegends.com/cdn/16.8.1/data/pt_BR/champion.json'));
            if (!RUNES_CACHE) requests.push(fetch('https://ddragon.leagueoflegends.com/cdn/16.8.1/data/pt_BR/runesReforged.json'));

            const results = await Promise.all(requests);
            
            const champData = await results[0].json();
            const metaRes = results[1];
            
            let allData = ALL_CHAMPS_CACHE;
            let rData = RUNES_CACHE;

            let nextIdx = 2;
            if (!ALL_CHAMPS_CACHE) {
               const res = await results[nextIdx++].json();
               ALL_CHAMPS_CACHE = Object.values(res.data);
               allData = ALL_CHAMPS_CACHE;
            }
            if (!RUNES_CACHE) {
               const res = await results[nextIdx++].json();
               RUNES_CACHE = res;
               rData = RUNES_CACHE;
            }

            setChampion(champData.data[champId]);
            setAllChamps(allData || []);
            setRunesData(rData || []);

            if (metaRes.data && metaRes.data.length > 0) {
               const roles = metaRes.data.map((m: any) => m.role);
               setChampionLanes(roles);
               setUserLane(roles[0]); 
            } else {
               setChampionLanes(['MID']);
               setUserLane('MID');
            }
         } catch (err) {
            console.error("Erro ao carregar dados", err);
         } finally {
            setLoading(false);
         }
      }
      fetchData();
   }, [champId]);

   const getTierColor = (tier: string) => {
      switch (tier) {
         case 'S+': return 'bg-primary text-void shadow-[0_0_50px_rgba(0,255,242,0.15)]';
         case 'S': return 'bg-secondary text-void';
         case 'A': return 'bg-emerald-500 text-void';
         case 'B': return 'bg-sky-500 text-void';
         case 'C': return 'bg-yellow-500 text-void';
         case 'D': return 'bg-orange-500 text-white';
         case 'F': return 'bg-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse';
         default: return 'bg-red-600 text-white';
      }
   };

   const translateTag = (tag: string) => {
      const translations: { [key: string]: string } = {
         'Fighter': 'Lutador', 'Tank': 'Tanque', 'Mage': 'Mago', 'Marksman': 'Atirador',
         'Assassin': 'Assassino', 'Support': 'Suporte', 'Precision': 'Precisão',
         'Domination': 'Dominação', 'Sorcery': 'Feitiçaria', 'Resolve': 'Determinação',
         'Inspiration': 'Inspiração'
      };
      return translations[tag] || tag;
   };

   useEffect(() => {
      if (!champion) return;
      
      async function fetchBuild() {
         setBuildLoading(true);
         try {
            const res = await fetch(`/api/build?champion=${champion!.id}&lane=${userLane}&tags=${champion!.tags.join(',')}`);
            if (res.ok) {
               const data = await res.json();
               setBuildData(data);
            }
         } catch (err) {
            console.error("Erro ao buscar build", err);
         } finally {
            setBuildLoading(false);
         }
      }
      fetchBuild();
   }, [champion, userLane]);

   const getSpellName = (id: number) => {
      const spells: any = { 4: 'SummonerFlash', 12: 'SummonerTeleport', 7: 'SummonerHeal', 14: 'SummonerDot', 11: 'SummonerSmite', 3: 'SummonerExhaust', 6: 'SummonerHaste', 21: 'SummonerBarrier' };
      return spells[id] || 'SummonerFlash';
   };

   const renderRuneGrid = (treeKey: string, selections: number[], isSecondary = false) => {
      const tree = runesData.find(t => t.key === treeKey);
      if (!tree) return <div className="h-64 flex items-center justify-center text-white/10 uppercase font-black tracking-widest text-[10px]">Analizando Runas...</div>;
      return (
         <div className="space-y-6 flex flex-col items-center">
            {tree.slots.map((slot: any, slotIdx: number) => {
               if (isSecondary && slotIdx === 0) return null;
               return (
                  <div key={slotIdx} className="flex justify-center gap-4">
                     {slot.runes.map((rune: any, i: number) => {
                        const isSelected = isSecondary 
                           ? selections.some((s: any) => (s.slot === slotIdx && s.index === i) || s === i) 
                           : selections[slotIdx] === i;
                        return (
                           <div key={rune.id} className="relative group">
                              <div className={`w-11 h-11 rounded-full border-2 transition-all duration-300 flex items-center justify-center p-1 ${isSelected ? 'border-primary bg-primary/20 shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-110' : 'border-transparent opacity-30 hover:opacity-100 grayscale hover:grayscale-0'}`}>
                                 <img src={`https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`} alt={rune.name} className="w-full h-full object-contain" />
                              </div>
                           </div>
                        );
                     })}
                  </div>
               );
            })}
         </div>
      );
   };

   if (loading || !champion) return (
      <div className="min-h-screen flex items-center justify-center bg-void">
         <div className="w-20 h-20 border-t-2 border-primary rounded-full animate-spin shadow-glow"></div>
      </div>
   );

   return (
      <div className="min-h-screen relative bg-transparent pb-24 font-sans selection:bg-primary/40 overflow-x-hidden">
         <div className="noise-overlay"></div>
         <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-primary/10 blur-[150px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-secondary/5 blur-[120px] rounded-full"></div>
            {Array.from({ length: 40 }).map((_, i) => (
               <div
                  key={i}
                  className="particle"
                  style={{
                     left: `${Math.random() * 100}%`,
                     animationDelay: `${Math.random() * 25}s`,
                     opacity: Math.random() * 0.3 + 0.1,
                     width: `${Math.random() * 2 + 1}px`,
                     height: `${Math.random() * 2 + 1}px`,
                  }}
               ></div>
            ))}
         </div>

         <div className="relative h-[55vh] sm:h-[75vh] w-full flex items-end overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent z-10"></div>
            <div className="absolute inset-0 bg-primary/5 mix-blend-overlay z-10"></div>
            <img
               src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champId}_0.jpg`}
               alt={champion.name}
               className="absolute inset-0 w-full h-full object-cover opacity-70 blur-[2px] group-hover:blur-0 group-hover:scale-105 transition-all duration-[2000ms] ease-out"
            />

            <div className="max-w-[1500px] mx-auto w-full px-12 pb-32 relative z-20">
               <div className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-20 duration-[1200ms]">
                   <div className="flex items-center gap-3 mb-4 text-[11px] font-bold uppercase tracking-[0.3em] text-white/30">
                      <Link href="/meta" className="hover:text-primary transition-colors">Meta</Link>
                      <ChevronRight className="w-3 h-3" />
                      <span className="text-primary/70">Campeões</span>
                      <ChevronRight className="w-3 h-3 text-primary/40" />
                      <span className="text-white/60">{champion.name}</span>
                   </div>
                   <div className="flex items-center gap-5 mb-8">
                      <div className="h-0.5 w-12 bg-primary"></div>
                      <span className="text-primary font-black uppercase tracking-[0.8em] text-[10px] drop-shadow-glow">Protocolo Meta-Diff Ativo</span>
                   </div>
                  <h1 className="text-[clamp(4rem,12vw,12rem)] font-black text-white tracking-tighter leading-[0.8] italic mb-10 outline-text group-hover:text-white transition-colors duration-700">
                     {formatDisplayName(champion.id)}
                  </h1>
                  <div className="flex gap-4">
                     {champion.tags.map(t => (
                        <span key={t} className="px-8 py-3 bg-white/5 border border-white/10 backdrop-blur-3xl rounded-full text-[10px] font-black text-white/50 hover:text-primary hover:border-primary/50 transition-all uppercase tracking-[0.3em] cursor-default">
                           {translateTag(t)}
                        </span>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         <div className="max-w-[1500px] mx-auto px-8 -mt-24 relative z-30 space-y-12 animate-in fade-in slide-in-from-bottom-24 duration-[1000ms]">
            
            {opponent && (
               <div className="nova-glass-light border border-primary/20 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 animate-nova-in shadow-[0_0_50px_rgba(0,255,204,0.1)] mb-12 relative overflow-hidden group/matchup">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                  <div className="flex items-center gap-6">
                     <div className="flex -space-x-6">
                        <div className="w-16 h-16 rounded-full border-2 border-primary overflow-hidden shadow-glow z-10">
                           <img src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/${champion.image.full}`} className="w-full h-full object-cover" />
                        </div>
                        <div className="w-16 h-16 rounded-full border-2 border-secondary overflow-hidden shadow-glow-amber">
                           <img src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/${opponent.image.full}`} className="w-full h-full object-cover" />
                        </div>
                     </div>
                     <div>
                        <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-1">Análise de Confronto</div>
                        <div className="text-xl font-black text-white italic tracking-tighter">
                           {champion.name} <span className="text-muted/50 mx-2 text-sm not-italic">vs</span> {opponent.name}
                        </div>
                     </div>
                  </div>

                  <div className="flex gap-12 text-center">
                     <div>
                        <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Cálculo de Probabilidade</div>
                        <div className={`text-2xl font-black italic ${matchupResult?.winRate && parseFloat(matchupResult.winRate) > 50 ? 'text-primary' : 'text-red-500'}`}>
                           {formatRate(matchupResult?.winRate)}%
                        </div>
                     </div>
                     <div>
                        <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Complexidade Neural</div>
                        <div className="text-2xl font-black text-secondary italic">
                           {matchupResult?.difficulty || 'ANALIZANDO...'}
                        </div>
                     </div>
                  </div>

                  <div className="flex-1 max-w-md text-[11px] font-medium text-white/60 leading-relaxed italic border-l border-white/10 pl-8">
                     "{matchupResult?.advice || "Iniciando processamento tático de confronto..."}"
                  </div>

                  <button 
                     onClick={() => setOpponent(null)}
                     className="p-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-muted hover:text-red-400 transition-all"
                  >
                     <X className="w-4 h-4" />
                  </button>
               </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative">
               {(
                  [
                     { label: 'Probabilidade de Vitória', val: buildData?.winRate, color: 'text-primary', icon: TrendingUp },
                     { label: 'Frequência de Escolha', val: buildData?.pickRate, color: 'text-white', icon: Activity },
                     { label: 'Contenção de Ameaças', val: buildData?.banRate, color: 'text-red-500', icon: Target },
                     { label: 'Tier Operacional', val: buildData?.tier || 'A', color: 'text-void', special: true }
                  ] as Array<{ label: string, val: any, color: string, icon?: any, special?: boolean }>
               ).map((s, i) => {
                  const Icon = s.icon;
                  return (
                     <div key={i} className={`group relative glass-card scanline-effect p-8 rounded-[2rem] flex flex-col items-center justify-center transition-all hover:-translate-y-3 cursor-default overflow-hidden ${s.special ? getTierColor(s.val) : ''}`}>
                        {s.special ? (
                           <>
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                              <span className="text-[11px] font-black uppercase tracking-[0.5em] mb-3 opacity-60">Status de Meta</span>
                              <span className="text-5xl font-display font-bold italic tracking-tighter uppercase drop-shadow-2xl">
                                 {buildLoading || !s.val ? <div className="w-12 h-12 bg-white/10 animate-pulse rounded-lg"></div> : s.val}
                              </span>
                           </>
                        ) : (
                           <>
                              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-30 transition-all group-hover:scale-110">
                                 {Icon && <Icon className="w-6 h-6" />}
                              </div>
                              <div className={`text-4xl font-display font-bold italic tracking-tighter ${s.color}`}>
                                 {buildLoading || !s.val ? <div className="w-20 h-10 bg-white/10 animate-pulse rounded-lg"></div> : formatRate(s.val) + '%'}
                              </div>
                              <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] mt-6 border-t border-white/5 pt-4 w-full text-center">
                                 {s.label}
                              </div>
                           </>
                        )}
                     </div>
                  );
               })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
               <div className="lg:col-span-8 space-y-8">

                  <section className="glass-card rounded-[2.5rem] p-8 flex flex-col xl:flex-row items-center justify-between gap-8 relative group/arena z-50 overflow-visible">
                     <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-secondary/5 opacity-50 rounded-[2.5rem]"></div>
                     
                     {opponent && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[100px] pointer-events-none z-10 hidden xl:block">
                           <svg className="w-full h-full">
                              <path 
                                 d="M 50 50 Q 150 0, 250 50" 
                                 fill="none" 
                                 stroke="url(#arenaGradient)" 
                                 strokeWidth="2"
                                 strokeDasharray="5 10"
                                 className="animate-neural-flow"
                              />
                              <defs>
                                 <linearGradient id="arenaGradient">
                                    <stop offset="0%" stopColor="var(--primary)" />
                                    <stop offset="100%" stopColor="var(--secondary)" />
                                 </linearGradient>
                              </defs>
                           </svg>
                        </div>
                     )}

                     <div className="flex items-center gap-10 relative z-20">
                        <div className="relative group/portrait cursor-pointer">
                           <div className="absolute -inset-8 bg-primary/20 blur-[60px] rounded-full opacity-0 group-hover/portrait:opacity-100 transition-all duration-1000"></div>
                           <div className="relative w-28 h-28 rounded-[2rem] border-2 border-primary/40 overflow-hidden shadow-2xl group-hover/portrait:scale-110 group-hover/portrait:border-primary transition-all duration-700 transform-gpu">
                              <img src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/${champion.image.full}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
                           </div>
                           <div className="absolute -bottom-4 inset-x-0 flex justify-center">
                              <div className="px-6 py-1.5 bg-primary text-void text-[10px] font-black uppercase tracking-widest rounded-full shadow-glow">Main</div>
                           </div>
                        </div>

                        <div className="flex flex-col items-center">
                           <div className="text-white/5 font-display font-bold text-5xl tracking-tighter italic select-none">VS</div>
                           <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-primary/30 to-transparent my-2"></div>
                        </div>

                        <div className="relative group/rival cursor-pointer">
                           <div className="absolute -inset-8 bg-secondary/20 blur-[60px] rounded-full opacity-0 group-hover/rival:opacity-100 transition-all duration-1000"></div>
                           <button onClick={() => setShowMatchupList(!showMatchupList)} className="relative w-28 h-28 rounded-[2rem] border-2 border-white/10 bg-white/5 flex items-center justify-center overflow-hidden hover:border-secondary shadow-2xl transition-all duration-700 transform-gpu group-hover/rival:scale-110">
                              {opponent ? (
                                 <img src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/${opponent.image.full}`} className="w-full h-full object-cover" />
                              ) : (
                                 <div className="flex flex-col items-center gap-4">
                                    <Target className="text-secondary w-8 h-8 animate-pulse" />
                                    <span className="text-[9px] font-black text-secondary/40 uppercase tracking-[0.3em]">Select Target</span>
                                 </div>
                              )}
                              <div className="absolute inset-0 bg-secondary/5 mix-blend-overlay"></div>
                           </button>
                           {opponent && (
                              <div className="absolute -bottom-4 inset-x-0 flex justify-center">
                                 <div className="px-6 py-1.5 bg-secondary text-void text-[10px] font-black uppercase tracking-widest rounded-full shadow-glow-amber">Rival</div>
                              </div>
                           )}

                           {showMatchupList && (
                              <div className="absolute top-[130%] left-[-50%] w-[350px] glass-card rounded-[2rem] p-6 z-[999] shadow-[0_0_100px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-500 border-t-primary/30 h-max">
                                 <div className="flex items-center gap-3 mb-6 bg-white/5 rounded-xl p-4 border border-white/5 focus-within:border-primary focus-within:bg-white/10 transition-all">
                                    <Target className="w-4 h-4 text-primary animate-pulse" />
                                    <input
                                       type="text"
                                       placeholder="IDENTIFICAR ALGO..."
                                       value={searchTerm}
                                       onChange={e => setSearchTerm(e.target.value)}
                                       className="bg-transparent border-none w-full text-xs text-white outline-none placeholder:text-white/10 font-bold uppercase tracking-widest"
                                    />
                                 </div>
                                 <div className="grid grid-cols-4 gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                    {allChamps.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map(c => (
                                       <div key={c.id} onClick={() => { setOpponent(c); setShowMatchupList(false); }} className="relative group/box cursor-pointer aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-primary transition-all duration-500">
                                          <img src={`https://ddragon.leagueoflegends.com/cdn/15.1.1/img/champion/${c.image.full}`} className="w-full h-full object-cover grayscale group-hover/box:grayscale-0 transition-all scale-110 group-hover/box:scale-100" />
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>

                     <div className="flex flex-col items-center bg-void/80 border border-white/5 rounded-[2.5rem] p-2 gap-1 relative z-10 shadow-inner w-full xl:w-auto min-h-[60px] min-w-[250px]">
                        <div className="flex items-center flex-wrap justify-center gap-1">
                           {championLanes.length > 0 ? (
                              championLanes.map(l => (
                                 <button
                                    key={l}
                                    onClick={() => setUserLane(l)}
                                    className={`px-6 py-4 rounded-[2rem] text-[10px] font-black transition-all duration-500 relative overflow-hidden group/lane ${userLane === l ? 'bg-primary text-void shadow-glow scale-105' : 'text-white/20 hover:text-white hover:bg-white/5'}`}
                                 >
                                    {userLane === l && <div className="absolute inset-x-0 bottom-0 h-1 bg-white/30"></div>}
                                    {l}
                                 </button>
                              ))
                           ) : (
                              <div className="px-6 py-4 text-[10px] font-black text-white/20 animate-pulse uppercase tracking-widest">Sincronizando Rotas...</div>
                           )}
                        </div>
                        {buildData?.isOffRole && (
                           <div className="mt-2 mb-2 px-6 py-4 w-[95%] bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex flex-col sm:flex-row items-center gap-4 animate-in zoom-in slide-in-from-top-4 duration-500 text-center sm:text-left">
                              <div className="w-10 h-10 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center shrink-0 shadow-glow-amber">
                                 <AlertTriangle className="w-5 h-5 text-yellow-500 animate-pulse" />
                              </div>
                              <div>
                                 <div className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.4em] mb-1">Estratégia Adaptada ({buildData.primaryLane})</div>
                                 <div className="text-[12px] font-medium text-white/50 leading-relaxed">
                                    <span className="text-white font-bold">{champion.name}</span> não atua convencionalmente como <span className="text-yellow-400 font-bold">{userLane}</span>. Exibindo o núcleo estratégico padrão da sua função primária.
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>
                  </section>

                  <section className="glass-card rounded-[2.5rem] p-10 relative group/strat overflow-hidden">
                     <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover/strat:opacity-10 transition-all duration-[2000ms]">
                        <Brain className="w-48 h-48 text-primary" />
                     </div>

                     <div className="flex items-center gap-4 mb-8">
                        <div className="w-2.5 h-8 bg-primary/80 blur-[2px]"></div>
                        <h4 className="text-[14px] font-black text-white uppercase tracking-[0.6em] heading-font">Interface de Estratégia Neural</h4>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                         <div className="p-8 bg-white/[0.02] rounded-[2rem] border border-white/5 hover:border-primary/20 hover:bg-white/[0.04] transition-all duration-700 shadow-inner group/card">
                            <div className="flex items-center gap-4 mb-6">
                               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-glow">
                                  <Sword className="w-5 h-5 text-primary group-hover/card:rotate-[360deg] transition-all duration-1000" />
                               </div>
                               <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em]">Combate</span>
                            </div>
                            {buildLoading ? (
                               <div className="space-y-2">
                                  <div className="h-6 w-full bg-white/5 animate-pulse rounded-lg"></div>
                                  <div className="h-6 w-4/5 bg-white/5 animate-pulse rounded-lg"></div>
                               </div>
                            ) : (
                               <p className="text-xl font-black italic text-white/90 leading-[1.2]">
                                  "{buildData?.draftAdvice}"
                               </p>
                            )}
                         </div>

                         <div className="p-8 bg-white/[0.02] rounded-[2rem] border border-white/5 hover:border-secondary/20 hover:bg-white/[0.04] transition-all duration-700 shadow-inner group/card">
                            <div className="flex items-center gap-4 mb-6">
                               <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/20 shadow-glow-amber">
                                  <Activity className="w-5 h-5 text-secondary" />
                               </div>
                               <span className="text-[11px] font-black text-secondary uppercase tracking-[0.4em]">Fase Tática</span>
                            </div>
                            {buildLoading ? (
                               <div className="space-y-2">
                                  <div className="h-4 w-full bg-white/5 animate-pulse rounded-lg"></div>
                                  <div className="h-4 w-3/4 bg-white/5 animate-pulse rounded-lg"></div>
                               </div>
                            ) : (
                               <p className="text-lg font-medium italic text-white/50 leading-relaxed group-hover/card:text-white transition-colors duration-500">
                                  "{buildData?.ingameAdvice}"
                               </p>
                            )}
                         </div>
                     </div>
                  </section>

                  <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="glass-card rounded-[2.5rem] p-10 border-t border-t-red-500/20 shadow-[0_-20px_40px_-20px_rgba(239,68,68,0.1)]">
                        <h4 className="text-[12px] font-black text-red-400 uppercase tracking-[0.5em] mb-6 flex items-center gap-3">
                           <Lock className="w-4 h-4" /> Ameaças Críticas (Counters)
                        </h4>
                         <div className="flex gap-4">
                            {buildLoading ? (
                               [1, 2, 3].map(i => <div key={i} className="w-16 h-16 rounded-xl bg-white/5 animate-pulse border border-white/10"></div>)
                            ) : (
                               buildData?.counters.map((cName: string) => {
                                  const cData = allChamps.find(c => c.name.replace(/[^a-zA-Z]/g, '') === cName.replace(/[^a-zA-Z]/g, '')) || allChamps[0];
                                  if (!cData) return null;
                                  return (
                                     <div key={cName} className="relative w-16 h-16 rounded-xl overflow-hidden border border-red-500/30 group/counter hover:border-red-400 transition-all cursor-crosshair shadow-lg">
                                        <img src={`https://ddragon.leagueoflegends.com/cdn/15.1.1/img/champion/${cData.image.full}`} className="w-full h-full object-cover grayscale opacity-60 group-hover/counter:grayscale-0 group-hover/counter:opacity-100 transition-all group-hover/counter:scale-110" />
                                        <div className="absolute inset-0 bg-red-500/20 mix-blend-overlay group-hover/counter:opacity-0 transition-all"></div>
                                     </div>
                                  );
                               })
                            )}
                         </div>
                     </div>
                     <div className="glass-card rounded-[2.5rem] p-10 border-t border-t-emerald-500/20 shadow-[0_-20px_40px_-20px_rgba(16,185,129,0.1)]">
                        <h4 className="text-[12px] font-black text-emerald-400 uppercase tracking-[0.5em] mb-6 flex items-center gap-3">
                           <Shield className="w-4 h-4" /> Conexão Tática (Sinergias)
                        </h4>
                         <div className="flex gap-4">
                            {buildLoading ? (
                               [1, 2, 3].map(i => <div key={i} className="w-16 h-16 rounded-xl bg-white/5 animate-pulse border border-white/10"></div>)
                            ) : (
                               buildData?.synergies.map((cName: string) => {
                                  const cData = allChamps.find(c => c.name.replace(/[^a-zA-Z]/g, '') === cName.replace(/[^a-zA-Z]/g, '')) || allChamps[0];
                                  if (!cData) return null;
                                  return (
                                     <div key={cName} className="relative w-16 h-16 rounded-xl overflow-hidden border border-emerald-500/30 group/synergy hover:border-emerald-400 transition-all cursor-pointer shadow-lg">
                                        <img src={`https://ddragon.leagueoflegends.com/cdn/15.1.1/img/champion/${cData.image.full}`} className="w-full h-full object-cover grayscale opacity-60 group-hover/synergy:grayscale-0 group-hover/synergy:opacity-100 transition-all group-hover/synergy:scale-110" />
                                        <div className="absolute inset-0 bg-emerald-500/20 mix-blend-overlay group-hover/synergy:opacity-0 transition-all"></div>
                                     </div>
                                  );
                               })
                            )}
                         </div>
                     </div>
                  </section>

                  <section className="relative group/arsenal">
                     <div className="relative glass-card scanline-effect rounded-[2.5rem] border border-white/5 bg-void/20 backdrop-blur-3xl p-8 sm:p-10 overflow-hidden">
                        
                        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-6">
                           <div className="flex items-center gap-4">
                              <div className="w-2 h-2 bg-primary animate-ping rounded-full shadow-glow"></div>
                              <h3 className="text-sm font-black text-white uppercase tracking-[0.6em] heading-font">Arsenal Operacional</h3>
                           </div>
                           <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent hidden sm:block mx-4"></div>
                           <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Loadout v2.0</div>
                        </div>

                        <div className="flex flex-col xl:flex-row items-center gap-10 xl:gap-0 bg-white/[0.02] p-8 rounded-[2rem] border border-white/5">
                           
                           <div className="flex flex-col items-center gap-4">
                              <span className="text-[8px] font-black text-primary/40 uppercase tracking-widest">Início</span>
                              <div className="flex gap-2">
                                 {buildLoading || !buildData ? [1, 2].map(i => <div key={i} className="w-11 h-11 bg-white/5 animate-pulse rounded-xl" />) : 
                                    buildData?.start.map((id: number, i: number) => (
                                       <div key={i} className="w-11 h-11 bg-void rounded-xl border border-white/10 overflow-hidden">
                                          <img src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/item/${id}.png`} className="w-full h-full object-cover" />
                                       </div>
                                    ))
                                 }
                              </div>
                           </div>

                           <div className="hidden xl:block w-8 h-[1px] bg-white/10 mx-6"></div>

                           <div className="flex-1 flex flex-col items-center gap-4">
                              <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.6em]">Essenciais</span>
                              <div className="flex gap-4">
                                 {buildLoading || !buildData ? [1, 2, 3].map(i => <div key={i} className="w-20 h-20 sm:w-24 sm:h-24 bg-white/5 animate-pulse rounded-[1.5rem]" />) : 
                                    buildData?.core.filter((id: number) => ![3006, 3009, 3020, 3047, 3111, 3117, 3158].includes(id)).slice(0, 3).map((id: number, i: number) => (
                                       <div key={i} className="relative group/it">
                                          <div className="absolute -inset-2 bg-white/5 blur-xl rounded-full opacity-0 group-hover/it:opacity-100 transition-opacity"></div>
                                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-void rounded-[1.5rem] border border-white/10 group-hover/it:border-white/40 overflow-hidden transition-all duration-500 shadow-2xl">
                                             <img src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/item/${id}.png`} className="w-full h-full object-cover" />
                                             <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20"></div>
                                          </div>
                                       </div>
                                    ))
                                 }
                              </div>
                           </div>

                           <div className="hidden xl:block w-8 h-[1px] bg-white/10 mx-6"></div>

                           <div className="flex flex-col items-center gap-4">
                              <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Situcionais</span>
                              <div className="flex gap-3">
                                 {buildData?.core.filter((id: number) => ![3006, 3009, 3020, 3047, 3111, 3117, 3158].includes(id)).slice(3, 6).map((id: number, i: number) => (
                                    <div key={i} className="w-14 h-14 sm:w-16 sm:h-16 bg-void/50 rounded-xl border border-white/10 hover:border-primary/40 overflow-hidden transition-all duration-300">
                                       <img src={`https://ddragon.leagueoflegends.com/cdn/15.1.1/img/item/${id}.png`} className="w-full h-full object-cover" />
                                       <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10"></div>
                                    </div>
                                 ))}
                              </div>
                           </div>

                        </div>

                        <div className="mt-8 flex flex-wrap items-center justify-between gap-6 px-4">
                           <div className="flex items-center gap-4">
                              <span className="text-[9px] font-bold text-secondary uppercase tracking-[0.4em]">Mobilidade</span>
                              <div className="flex gap-2">
                                 {buildData?.core.filter((id: number) => [3006, 3009, 3020, 3047, 3111, 3117, 3158].includes(id)).map((id: number, i: number) => (
                                    <div key={i} className="w-12 h-12 bg-secondary/5 rounded-xl border border-secondary/20 flex items-center justify-center p-1.5 shadow-glow-amber">
                                       <img src={`https://ddragon.leagueoflegends.com/cdn/15.1.1/img/item/${id}.png`} className="w-full h-full object-contain rounded-lg" />
                                    </div>
                                 ))}
                              </div>
                           </div>

                           <div className="flex items-center gap-4">
                              <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.4em]">Feitiços</span>
                              <div className="flex gap-2">
                                 {buildData?.summoners.map((id: number, i: number) => (
                                    <div key={i} className="w-10 h-10 bg-void rounded-lg border border-white/5 overflow-hidden hover:border-primary/40 transition-all">
                                       <img src={`https://ddragon.leagueoflegends.com/cdn/15.1.1/img/spell/${getSpellName(id)}.png`} className="w-full h-full object-cover" />
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>

                     </div>
                  </section>

                  <section className="glass-card rounded-[2.5rem] p-10 relative group/skills overflow-hidden">
                     
                      <div className="absolute inset-0 pointer-events-none z-0">
                         <svg className="w-full h-full opacity-20 group-hover/skills:opacity-50 transition-opacity duration-1000">
                            <path 
                               d="M 50 400 Q 200 400, 400 300" 
                               fill="none" 
                               stroke="url(#neuralGradient)" 
                               strokeWidth="1.5"
                               className="animate-neural-flow"
                            />
                            <path 
                               d="M 800 200 Q 900 200, 950 400" 
                               fill="none" 
                               stroke="url(#neuralGradient)" 
                               strokeWidth="1.5"
                               className="animate-neural-flow-reverse"
                            />
                            <circle cx="400" cy="300" r="150" fill="none" stroke="url(#neuralGradient)" strokeWidth="0.5" strokeDasharray="5 10" className="animate-spin-slow" />
                            <circle cx="400" cy="300" r="100" fill="none" stroke="url(#neuralGradient)" strokeWidth="1" strokeDasharray="10 20" className="animate-spin-reverse" />
                            
                            <defs>
                               <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
                                  <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.5" />
                                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                               </linearGradient>
                            </defs>
                         </svg>
                      </div>

                     <div className="flex flex-col gap-12 relative z-10">
                        
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                           <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-3 h-10 bg-primary/40 blur-[1px]"></div>
                                 <h4 className="text-[14px] font-black text-white uppercase tracking-[0.7em] heading-font">Inteligência de Combate ({activeSkill})</h4>
                              </div>
                              <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border-2 border-white/5 shadow-inner bg-void ring-1 ring-white/10 group/vid shrink-0">
                                 <video
                                    key={activeSkill}
                                    className="w-full h-full object-cover opacity-80 group-hover/vid:opacity-100 transition-opacity duration-1000"
                                    autoPlay loop muted playsInline
                                 >
                                    <source src={`https://d28xe8vt774jo5.cloudfront.net/champion-abilities/${(champion as any).key.padStart(4, '0')}/ability_${(champion as any).key.padStart(4, '0')}_${activeSkill}1.mp4`} type="video/mp4" />
                                 </video>
                                 <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-void via-void/90 to-transparent">
                                    <span className="text-[11px] font-black text-primary uppercase tracking-[0.6em] mb-2 block">{activeSkill === 'P' ? 'Intrinsic System' : `Ability Node ${activeSkill}`}</span>
                                    <div className="text-white font-black text-3xl tracking-tighter heading-font group-hover:scale-105 transition-transform duration-700 origin-left">
                                       {activeSkill === 'P' ? champion.passive.name : (champion as any).spells[activeSkill === 'Q' ? 0 : activeSkill === 'W' ? 1 : activeSkill === 'E' ? 2 : 3]?.name}
                                    </div>
                                 </div>
                                 <div className="absolute inset-0 scanline-effect opacity-20 pointer-events-none"></div>
                              </div>
                              <div className="flex-1 flex flex-col justify-center">
                                 <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                                    <Activity className="w-3 h-3" /> Live Feed Active
                                 </div>
                                 <div className="w-full h-1 bg-gradient-to-r from-primary/20 to-transparent mb-8"></div>
                              </div>
                           </div>

                           <div className="lg:col-span-12 xl:col-span-7 flex flex-col gap-6">
                              <h3 className="text-[12px] font-black text-white/30 uppercase tracking-[0.61em] mb-6 flex items-center gap-4 heading-font">Neural Intelligence Base</h3>
                              
                              {(() => {
                                 const ability = activeSkill === 'P' ? { ...champion.passive, isPassive: true } : champion.spells[activeSkill === 'Q' ? 0 : activeSkill === 'W' ? 1 : activeSkill === 'E' ? 2 : 3];
                                 return (
                                    <div className={`bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 shadow-inner relative group/analysis hover:border-primary/30 transition-all duration-700 flex flex-col h-full ${buildLoading ? 'animate-pulse' : ''}`}>
                                       <div className="flex items-center justify-between mb-8 shrink-0">
                                          <div className="flex items-center gap-4">
                                             <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-glow">
                                                <Brain className="w-6 h-6 text-primary" />
                                             </div>
                                             <div>
                                                <span className="text-[14px] font-black text-white uppercase tracking-[0.4em] block">{activeSkill === 'P' ? 'Intrinsic System' : `Ability Node ${activeSkill}`}</span>
                                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{ability.name}</span>
                                             </div>
                                          </div>
                                          <div className="flex gap-8">
                                             <div className="text-right">
                                                <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Custo</div>
                                                <div className="text-white font-bold text-sm tracking-tight">{ability.isPassive ? 'Passiva' : ability.costBurn || 'Sem Custo'}</div>
                                             </div>
                                             <div className="text-right">
                                                <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Recarga</div>
                                                <div className="text-white font-bold text-sm tracking-tight">{ability.isPassive ? 'N/A' : `${ability.cooldownBurn || 0}s`}</div>
                                             </div>
                                          </div>
                                       </div>
                                       <div className="overflow-y-auto pr-4 custom-scrollbar flex-1 min-h-[150px]">
                                          <p className="text-[15px] font-medium leading-relaxed text-white/60 text-justify" dangerouslySetInnerHTML={{ __html: (ability.description || '').replace(/'/g, '&apos;').replace(/(<([^>]+)>)/gi, "") }}></p>
                                       </div>
                                       <div className="absolute bottom-6 right-8 opacity-10">
                                          <Sparkles className="w-12 h-12 text-primary" />
                                       </div>
                                    </div>
                                 );
                              })()}
                           </div>
                        </div>

                        <div className="w-full pt-12 border-t border-white/5 space-y-8">
                           <div className="flex gap-2 ml-[84px]">
                              {Array.from({ length: 18 }).map((_, i) => (
                                 <div key={i} className="w-9 text-center text-[10px] font-black text-white/20 uppercase tracking-widest">{i + 1}</div>
                              ))}
                           </div>
                           <div className="flex flex-col gap-4">
                              {['P', 'Q', 'W', 'E', 'R'].map((key) => {
                                 const isPassive = key === 'P';
                                 const spell = isPassive ? champion.passive : champion.spells[key === 'Q' ? 0 : key === 'W' ? 1 : key === 'E' ? 2 : 3];

                                 return (
                                    <div 
                                       key={key} 
                                       className={`flex items-center gap-12 group/prog-row transition-all duration-500 px-4 py-2 rounded-2xl ${hoveredSkill === key ? 'bg-primary/5 translate-x-4 border-l-2 border-primary' : 'hover:bg-white/[0.02]'}`} 
                                       onClick={() => setActiveSkill(key)}
                                       onMouseEnter={() => setHoveredSkill(key)}
                                       onMouseLeave={() => setHoveredSkill(null)}
                                    >
                                       <div className="relative group/tooltip">
                                          <div className="w-12 h-12 shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-2xl hover:border-primary cursor-pointer transition-all duration-500 relative transform-gpu hover:scale-110">
                                             <img src={`https://ddragon.leagueoflegends.com/cdn/15.1.1/img/${isPassive ? 'passive' : 'spell'}/${spell.image.full}`} className="w-full h-full object-cover" />
                                             <div className="absolute top-0 right-0 bg-void/90 px-2 py-0.5 text-[9px] font-black text-primary border-b border-l border-white/10 rounded-bl-lg">{key}</div>
                                          </div>
                                          <div className="absolute bottom-full left-0 mb-4 w-80 glass-card p-6 rounded-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-300 z-[999] shadow-[0_0_50px_rgba(0,0,0,0.8)] pointer-events-none border border-white/10">
                                             <div className="text-primary font-display font-bold uppercase text-xs tracking-[0.4em] mb-3">{spell.name}</div>
                                             <div className="text-[12px] text-white/60 leading-relaxed" dangerouslySetInnerHTML={{ __html: (spell.description || '').replace(/'/g, '&apos;').replace(/(<([^>]+)>)/gi, "") }}></div>
                                          </div>
                                       </div>
                                       {isPassive ? (
                                          <div className="flex-1 flex items-center">
                                             <div className="h-[1px] w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent relative">
                                                <div className="absolute -top-3 left-0 text-[9px] text-white/20 uppercase tracking-[0.5em] font-black">Habilidade Inata (Sistema Base)</div>
                                             </div>
                                          </div>
                                       ) : (
                                          <div className="flex gap-2">
                                             {buildData?.skills.map((s: string, lvIdx: number) => {
                                                const isActive = s === key;
                                                return (
                                                   <div key={lvIdx} className={`w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black transition-all duration-500 transform-gpu ${isActive ? (key === 'R' ? 'bg-secondary text-void shadow-glow-amber scale-110' : 'bg-primary text-void shadow-glow scale-105') : 'bg-white/[0.04] text-white/5 hover:bg-white/[0.1] hover:text-white/20'}`}>
                                                      {isActive ? key : ''}
                                                   </div>
                                                );
                                             })}
                                          </div>
                                       )}
                                    </div>
                                 );
                              })}
                           </div>
                        </div>

                     </div>
                  </section>
               </div>

               <div className="lg:col-span-4 space-y-10">
                  <section className="glass-card scanline-effect rounded-[2.5rem] p-10 text-center relative overflow-hidden group/runes">
                     <div className="absolute -inset-20 bg-primary/5 blur-[150px] rounded-full opacity-0 group-hover/runes:opacity-100 transition-all duration-[2000ms]"></div>
                     <h3 className="text-[14px] font-black text-primary uppercase tracking-[0.8em] mb-12 border-b border-white/5 pb-8 heading-font">Caminho Neural</h3>

                     <div className="space-y-16 flex flex-col items-center">
                        <div className="w-full space-y-10">
                           <div className="flex flex-col items-center gap-6">
                              <div className="relative group/rune-main cursor-pointer">
                                 <div className="absolute -inset-10 bg-primary/20 blur-[60px] rounded-full animate-pulse transition-all"></div>
                                 <div className="relative w-24 h-24 rounded-full bg-void/90 flex items-center justify-center border-2 border-primary/40 shadow-glow transform-gpu group-hover/rune-main:scale-110 transition-all duration-700">
                                    {buildData?.runes && runesData.find(t => t.key === buildData?.runes.primaryTree) && (
                                       <img src={`https://ddragon.leagueoflegends.com/cdn/img/${runesData.find(t => t.key === buildData?.runes.primaryTree).icon}`} className="w-16 h-16 object-contain z-10 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                                    )}
                                    <div className="absolute inset-0 scanline-effect rounded-full opacity-20"></div>
                                 </div>
                              </div>
                              <span className="text-[13px] font-display font-bold text-primary uppercase tracking-[0.6em]">{translateTag(buildData?.runes?.primaryTree || '')}</span>
                           </div>
                           {buildLoading || !buildData?.runes ? (
                              <div className="h-64 w-full flex flex-col items-center justify-center gap-4">
                                 <div className="w-12 h-12 bg-white/5 animate-pulse rounded-full"></div>
                                 <div className="text-white/10 uppercase font-black tracking-widest text-[10px]">Mapeando Caminho Neural...</div>
                              </div>
                           ) : renderRuneGrid(buildData.runes.primaryTree, buildData.runes.primarySelections)}
                        </div>

                        <div className="w-full space-y-10 pt-16 border-t border-white/10 relative">
                           <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-void border border-white/10 rounded-full flex items-center justify-center z-20">
                              <Plus className="w-4 h-4 text-white/20" />
                           </div>
                           <div className="flex flex-col items-center gap-6">
                              <div className="relative group/rune-sec cursor-pointer">
                                 <div className="absolute -inset-8 bg-secondary/20 blur-[50px] rounded-full opacity-50"></div>
                                 <div className="relative w-20 h-20 rounded-full bg-void/90 flex items-center justify-center border-2 border-secondary/30 shadow-glow-amber transform-gpu group-hover/rune-sec:scale-110 transition-all duration-700">
                                    {buildData?.runes && runesData.find(t => t.key === buildData?.runes.secondaryTree) && (
                                       <img src={`https://ddragon.leagueoflegends.com/cdn/img/${runesData.find(t => t.key === buildData?.runes.secondaryTree).icon}`} className="w-12 h-12 object-contain z-10" />
                                    )}
                                 </div>
                              </div>
                              <span className="text-[13px] font-display font-bold text-secondary uppercase tracking-[0.6em]">{translateTag(buildData?.runes?.secondaryTree || '')}</span>
                           </div>
                           {buildData?.runes ? renderRuneGrid(buildData.runes.secondaryTree, buildData.runes.secondarySelections, true) : <div className="h-48 flex items-center justify-center text-white/10 uppercase font-black tracking-widest text-[10px] animate-pulse">Accessing Core...</div>}
                        </div>

                        <div className="w-full space-y-6 pt-12 mt-6 border-t border-white/5 relative">
                           <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-void border border-white/5 rounded-full flex items-center justify-center z-20">
                              <Plus className="w-3 h-3 text-white/10" />
                           </div>
                           <div className="text-center">
                              <span className="text-[11px] font-display font-bold text-white/40 uppercase tracking-[0.4em]">Atributos Bônus</span>
                           </div>
                           <div className="space-y-4 flex flex-col items-center">
                              {[
                                 ['StatModsAdaptiveForceIcon.png', 'StatModsAttackSpeedIcon.png', 'StatModsCDRScalingIcon.png'],
                                 ['StatModsAdaptiveForceIcon.png', 'StatModsMovementSpeedIcon.png', 'StatModsHealthScalingIcon.png'],
                                 ['StatModsHealthPlusIcon.png', 'StatModsTenacityIcon.png', 'StatModsHealthScalingIcon.png']
                              ].map((row, rowIdx) => (
                                 <div key={rowIdx} className="flex justify-center gap-4">
                                    {row.map((icon, optIdx) => {
                                       const isSelected = buildData?.runes?.shards && buildData?.runes?.shards[rowIdx] === optIdx;
                                       return (
                                          <div key={optIdx} className="relative group">
                                             <div className={`w-8 h-8 rounded-full border-2 transition-all duration-300 flex items-center justify-center p-1 ${isSelected ? 'border-primary bg-primary/20 shadow-[0_0_10px_rgba(34,211,238,0.3)] scale-110' : 'border-transparent opacity-20 hover:opacity-100 grayscale hover:grayscale-0'}`}>
                                                <img src={`https://ddragon.leagueoflegends.com/cdn/img/perk-images/StatMods/${icon}`} className="w-full h-full object-contain" />
                                             </div>
                                          </div>
                                       );
                                    })}
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>

                     <div className={`mt-16 p-10 rounded-[2rem] border shadow-inner group/wr relative overflow-hidden transition-all duration-1000 ${buildData?.isOffRole ? 'bg-red-950/20 border-red-500/20' : 'bg-void/95 border-white/5'}`}>
                        <div className={`absolute inset-0 opacity-0 group-hover/wr:opacity-100 transition-opacity duration-1000 ${buildData?.isOffRole ? 'bg-red-500/5' : 'bg-primary/5'}`}></div>
                        <div className={`text-[11px] font-black uppercase mb-8 tracking-[0.7em] heading-font ${buildData?.isOffRole ? 'text-red-500/60' : 'text-primary/40'}`}>Quociente de Sucesso</div>
                        <div className={`text-7xl font-display font-bold italic tracking-tighter scale-in-center transition-all duration-[1200ms] group-hover:scale-110 ${buildData?.isOffRole ? 'text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse' : 'text-white drop-shadow-glow'}`}>
                           {formatRate(buildData?.winRate)}
                           <span className="text-3xl opacity-40">%</span>
                        </div>
                        <div className="mt-8 flex items-center justify-center gap-4">
                           <div className={`w-8 h-[2px] ${buildData?.isOffRole ? 'bg-red-500/50' : 'bg-primary'}`}></div>
                           <span className={`text-[10px] font-black uppercase tracking-[0.5em] animate-pulse ${buildData?.isOffRole ? 'text-red-500' : 'text-primary'}`}>
                              {buildData?.isOffRole ? 'Estratégia Adaptada e Instável' : 'Dominando o Meta Local'}
                           </span>
                           <div className={`w-8 h-[2px] ${buildData?.isOffRole ? 'bg-red-500/50' : 'bg-primary'}`}></div>
                        </div>
                     </div>
                  </section>
               </div>
            </div>
         </div>
      </div>
   );
}
