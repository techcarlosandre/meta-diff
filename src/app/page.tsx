'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, TrendingUp, Trophy, Star, Activity, 
  ChevronRight, User, Target, Zap, Shield 
} from 'lucide-react';
import { supabase } from '@/utils/supabase';

export default function HomePage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [allChamps, setAllChamps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [favChamps, setFavChamps] = useState<string[]>([]);
  const [favSummoners, setFavSummoners] = useState<any[]>([]);
  const [dailyLeaders, setDailyLeaders] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [champsRes, sessionRes, leadersRes] = await Promise.all([
          fetch('https://ddragon.leagueoflegends.com/cdn/16.8.1/data/pt_BR/champion.json'),
          supabase.auth.getSession(),
          supabase.from('daily_leaders').select('*').order('rank', { ascending: true }).limit(5)
        ]);

        const champsData = await champsRes.json();
        setAllChamps(Object.values(champsData.data));
        
        if (leadersRes.data) setDailyLeaders(leadersRes.data);

        const session = sessionRes.data.session;
        if (session?.user) {
          setUser(session.user);
          const [favChRes, favSumRes] = await Promise.all([
            supabase.from('favorites').select('champion_id').eq('user_id', session.user.id),
            supabase.from('favorite_summoners').select('*').eq('user_id', session.user.id)
          ]);
          if (favChRes.data) setFavChamps(favChRes.data.map(f => f.champion_id));
          if (favSumRes.data) setFavSummoners(favSumRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredChamps = useMemo(() => {
    if (searchValue.length < 2) return [];
    return allChamps.filter(c => 
      c.name.toLowerCase().includes(searchValue.toLowerCase())
    ).slice(0, 5);
  }, [searchValue, allChamps]);

  const handleSearch = (e?: React.FormEvent, manualName?: string) => {
    if (e) e.preventDefault();
    const name = manualName || searchValue;
    if (!name.trim()) return;
    
    const isChamp = allChamps.find(c => c.name.toLowerCase() === name.toLowerCase() || c.id.toLowerCase() === name.toLowerCase());
    if (isChamp) {
      router.push(`/champion/${isChamp.id}`);
    } else {
      router.push(`/summoner/${name.trim().replace('#', '-')}`);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center pt-40 md:pt-48">
       <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
       <div className="text-[10px] font-black text-primary uppercase tracking-[0.5em] animate-pulse">Sincronizando Core...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent selection:bg-primary/30">
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-float opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 blur-[150px] rounded-full animate-float-delayed opacity-30"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 pt-32 md:pt-40 pb-20">
         <div className="flex flex-col items-center text-center space-y-12">
            
            <div className="flex flex-col items-center text-center space-y-8 mb-4 animate-in fade-in slide-in-from-top-12 duration-1000">
               <div className="px-6 py-2 rounded-full bg-void/50 border border-primary/20 shadow-[0_0_20px_rgba(0,255,204,0.1)] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em] relative z-10">Análise em Tempo Real</div>
               </div>

               <div className="relative">
                  <h1 className="text-6xl sm:text-[100px] font-black italic tracking-tighter leading-[0.85] select-none flex flex-col uppercase">
                     <span className="text-primary filter drop-shadow-[0_0_20px_rgba(0,255,204,0.4)]">Ascenda ao</span>
                     <span className="text-secondary filter drop-shadow-[0_0_20px_rgba(255,184,0,0.4)]">Desafiante</span>
                  </h1>
               </div>

               <div className="max-w-xl">
                  <p className="text-[10px] sm:text-[11px] font-bold text-white/40 uppercase tracking-[0.4em] leading-relaxed">
                     O dashboard irá transformar os seus dados em vitórias.<br />
                     Domine o meta e conquiste sua elite.
                  </p>
               </div>
            </div>

            <div className="w-full max-w-2xl relative group animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
               <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
               <div className="relative flex items-center">
                  <Search className="absolute left-6 w-5 h-5 text-muted group-hover:text-primary transition-colors z-20" />
                  <form onSubmit={handleSearch} className="w-full relative">
                     <input 
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="Rastrear Invocador (Nome#TAG)..."
                        className="nova-glass border border-white/10 rounded-3xl py-5 px-16 w-full text-xs font-black uppercase tracking-[0.2em] focus:border-primary/50 transition-all outline-none text-white shadow-2xl" 
                     />
                     
                     {(filteredChamps.length > 0 || searchValue.length > 2) && (
                        <div className="absolute top-[110%] left-0 right-0 nova-glass-dark border border-white/10 rounded-2xl overflow-hidden z-[100] shadow-2xl animate-in fade-in slide-in-from-top-4 p-2 backdrop-blur-3xl">
                           {searchValue.length > 2 && (
                              <button type="button" onClick={() => handleSearch(undefined, searchValue)} className="w-full flex items-center gap-4 p-4 hover:bg-white/5 rounded-xl transition-all group/sum">
                                 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20"><User className="w-5 h-5 text-primary" /></div>
                                 <div className="flex-1 text-left">
                                    <div className="text-[9px] font-black text-primary uppercase tracking-widest">Busca Global</div>
                                    <div className="text-sm font-black text-white">{searchValue}</div>
                                 </div>
                                 <ChevronRight className="w-4 h-4 text-primary opacity-0 group-hover/sum:opacity-100 transition-all" />
                              </button>
                           )}
                           {filteredChamps.map(champ => (
                              <Link key={champ.id} href={`/champion/${champ.id}`} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-all group/item">
                                 <img src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/${champ.image.full}`} alt={champ.name} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                                 <div className="flex-1 text-left">
                                    <div className="text-sm font-black text-white group-hover/item:text-primary transition-colors">{champ.name}</div>
                                    <div className="text-[8px] font-black text-muted uppercase tracking-widest">Ver Perfil</div>
                                 </div>
                                 <Target className="w-4 h-4 text-muted group-hover/item:text-secondary opacity-50" />
                              </Link>
                           ))}
                        </div>
                     )}
                  </form>
               </div>
            </div>

            {user && (favChamps.length > 0 || favSummoners.length > 0) && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                  {/* CARD: CAMPEÕES ELITE */}
                  <div className="relative group/card">
                     <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/30 to-transparent rounded-3xl blur-sm opacity-50 group-hover/card:opacity-100 transition-opacity"></div>
                     <div className="relative nova-glass border border-white/5 p-8 rounded-3xl h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-8">
                           <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                              <Star className="w-4 h-4 text-primary animate-pulse" />
                           </div>
                           <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Campeões Elite</h3>
                        </div>

                        {favChamps.length > 0 ? (
                           <div className="flex flex-wrap gap-4">
                              {favChamps.map((champId) => {
                                 const champ = allChamps.find(c => c.id === champId);
                                 return (
                                    <Link 
                                       key={champId} 
                                       href={`/champion/${champId}`}
                                       className="relative group/champ"
                                    >
                                       <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/5 group-hover/champ:border-primary/50 transition-all duration-500 shadow-xl">
                                          <img 
                                             src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/${champ?.image?.full || champId + '.png'}`} 
                                             className="w-full h-full object-cover grayscale group-hover/champ:grayscale-0 transition-all duration-700 scale-110 group-hover/champ:scale-125" 
                                             alt="" 
                                          />
                                       </div>
                                       <div className="absolute -bottom-2 -right-2 w-5 h-5 bg-primary text-void rounded-lg flex items-center justify-center opacity-0 group-hover/champ:opacity-100 transition-all scale-50 group-hover/champ:scale-100">
                                          <Zap className="w-3 h-3" />
                                       </div>
                                    </Link>
                                 );
                              })}
                           </div>
                        ) : (
                           <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-20">
                              <Shield className="w-10 h-10 mb-4" />
                              <span className="text-[8px] font-black uppercase tracking-widest text-center">Nenhum campeão<br/>marcado como elite</span>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* CARD: INVOCADORES FAVORITOS */}
                  <div className="relative group/card">
                     <div className="absolute -inset-0.5 bg-gradient-to-br from-secondary/30 to-transparent rounded-3xl blur-sm opacity-50 group-hover/card:opacity-100 transition-opacity"></div>
                     <div className="relative nova-glass border border-white/5 p-8 rounded-3xl h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-8">
                           <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center border border-secondary/20">
                              <User className="w-4 h-4 text-secondary" />
                           </div>
                           <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Rastreados</h3>
                        </div>

                        <div className="space-y-3">
                           {favSummoners.length > 0 ? (
                              favSummoners.map((s, idx) => (
                                 <Link 
                                    key={idx}
                                    href={`/summoner/${s.summoner_name}-${s.tag_line}`}
                                    className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-secondary/30 transition-all group/sum"
                                 >
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded-xl bg-void border border-white/10 flex items-center justify-center group-hover/sum:border-secondary/50 transition-colors">
                                          <User className="w-5 h-5 text-muted group-hover/sum:text-secondary transition-colors" />
                                       </div>
                                       <div className="text-left">
                                          <div className="text-sm font-black text-white group-hover/sum:text-glow-white transition-all">{s.summoner_name}</div>
                                          <div className="text-[9px] font-bold text-muted uppercase tracking-widest">#{s.tag_line}</div>
                                       </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted opacity-0 group-hover/sum:opacity-100 transition-all" />
                                 </Link>
                              ))
                           ) : (
                              <div className="py-10 opacity-20 text-center">
                                 <span className="text-[8px] font-black uppercase tracking-widest">Nenhum invocador favoritado</span>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            )}

            <div className="w-full mt-32 space-y-12">
               <div className="flex flex-col items-center">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Trophy className="w-5 h-5 text-primary" />
                     </div>
                     <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Líderes de Ontem</h2>
                  </div>
                  <p className="text-[9px] font-bold text-muted uppercase tracking-[0.4em] mb-12">Performance de Elite no Patch Atual</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full">
                     {dailyLeaders.map((leader, idx) => (
                        <Link 
                           key={idx} 
                           href={`/summoner/${leader.summoner_name}-${leader.tag_line}`}
                           className="nova-glass-light border border-white/5 p-6 rounded-3xl hover:border-primary/30 hover:-translate-y-2 transition-all duration-500 text-center group"
                        >
                           <div className="w-12 h-12 rounded-2xl bg-void border border-white/10 flex items-center justify-center mx-auto mb-4 group-hover:border-primary/50 transition-colors">
                              <span className="text-lg font-black text-primary italic">#{idx + 1}</span>
                           </div>
                           <div className="text-sm font-black text-white mb-1 group-hover:text-primary transition-colors">{leader.summoner_name}</div>
                           <div className="text-[9px] font-bold text-muted uppercase tracking-widest mb-4">#{leader.tag_line}</div>
                           <div className="text-xs font-black text-primary italic">{leader.win_rate}% WR</div>
                        </Link>
                     ))}
                  </div>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
}
