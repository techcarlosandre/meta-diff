'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Trophy, TrendingUp, X, Star, Activity, Shield, Hash } from 'lucide-react';
import { formatChampName, formatDisplayName } from '@/utils/riot';
import { supabase } from '@/utils/supabase';

export default function SummonerPage() {
  const params = useParams();
  const rawName = params.name as string;
  // Identifica o último traço como o separador da Tag (Name#Tag -> Name-Tag na URL)
  const summonerName = rawName ? decodeURIComponent(rawName).trim().replace(/-([^-]*)$/, '#$1') : '';
  const [summoner, setSummoner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [period, setPeriod] = useState('Season');
  const [matchLoading, setMatchLoading] = useState(false);

  async function fetchSummoner(selectedPeriod?: string) {
    if (!rawName) return;
    
    if (selectedPeriod) setMatchLoading(true);
    else setLoading(true);
    
    setError(null);
    try {
      const activePeriod = selectedPeriod || period;
      // Usamos o rawName direto (que já vem com hífem do Home) para a API
      // O backend agora suporta tanto '-' quanto '#'
      const res = await fetch(`/api/summoner/${encodeURIComponent(rawName)}?period=${activePeriod.toLowerCase()}`);
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Ocorreu um erro ao buscar os dados.');
      } else {
        setSummoner(data);
        
        // Check if favorited in Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user && data.name) {
          const [name, tag] = data.name.split('#');
          const { data: fav } = await supabase
            .from('favorite_summoners')
            .select('*')
            .eq('user_id', user.id)
            .eq('summoner_name', name.trim())
            .eq('tag_line', tag.trim())
            .single();
          
          setIsFavorited(!!fav);
        }
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError('Não foi possível conectar ao servidor. Verifique sua conexão.');
    } finally {
      setLoading(false);
      setMatchLoading(false);
    }
  }

  useEffect(() => {
    if (!rawName) return;
    fetchSummoner();
  }, [rawName]);


  const handlePeriodChange = (newPeriod: string) => {
    if (newPeriod === period) return;
    setPeriod(newPeriod);
    fetchSummoner(newPeriod);
  };

  const toggleFavorite = async () => {
    if (!summoner) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [name, tag] = summoner.name.split('#');
      const sName = name.trim();
      const sTag = tag.trim();

      if (isFavorited) {
        await supabase
          .from('favorite_summoners')
          .delete()
          .eq('user_id', user.id)
          .eq('summoner_name', sName)
          .eq('tag_line', sTag);
      } else {
        await supabase
          .from('favorite_summoners')
          .insert([{ user_id: user.id, summoner_name: sName, tag_line: sTag }]);
      }
      
      setIsFavorited(!isFavorited);
    } catch (err) {
      console.error("Erro ao alternar favorito:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="text-[10px] font-black text-muted uppercase tracking-[0.5em] animate-pulse italic">Sincronizando Dados...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 animate-nova-in">
        <div className="nova-glass nova-border-glow p-12 rounded-[3.5rem] text-center max-w-md w-full shadow-3xl">
          <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 italic tracking-tighter">Erro de Identificação</h2>
          <p className="text-muted font-bold text-sm mb-12 uppercase tracking-wide opacity-60 leading-relaxed">{error}</p>
          <a href="/" className="inline-block bg-primary text-void px-10 py-4 rounded-2xl font-black uppercase tracking-[0.3em] hover:scale-105 transition-all text-xs">Menu Inicial</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 pb-40 animate-nova-in">
      {summoner && (
        <>
          {/* HEADER: DYNAMIC CINEMATIC */}
          <section className="relative nova-glass nova-border-glow p-8 sm:p-12 rounded-[3.5rem] mb-12 overflow-hidden group">
            <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity duration-1000">
               {summoner.matches?.[0] && (
                 <img 
                   src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${formatChampName(summoner.matches[0].champion)}_0.jpg`}
                   className="w-full h-full object-cover scale-110 blur-xl mask-radial"
                   alt=""
                 />
               )}
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="relative shrink-0">
                <div className="w-40 h-40 rounded-[3rem] overflow-hidden border-2 border-white/10 shadow-2xl group-hover:border-primary/50 transition-all duration-500">
                  <img src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/profileicon/${summoner.profileIconId}.png`} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-4 -right-4 nova-glass-light border border-white/20 px-6 py-2 rounded-2xl text-[10px] font-black text-primary shadow-xl">
                  NÍVEL {summoner.summonerLevel || summoner.level || 0}
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col sm:flex-row items-baseline justify-center md:justify-start gap-4 mb-4">
                  <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tighter italic">
                    {summoner.name.split('#')[0]}
                  </h1>
                  <span className="text-3xl font-bold text-muted opacity-40">#{summoner.name.split('#')[1]}</span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <div className="px-5 py-2 nova-glass-light rounded-2xl flex items-center gap-3 border border-white/5">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black text-muted uppercase tracking-widest">{summoner.regionName || 'Global'} Mode</span>
                  </div>
                  <button 
                    onClick={toggleFavorite}
                    className={`px-5 py-2 rounded-2xl flex items-center gap-3 border transition-all duration-500 group/star relative overflow-hidden ${
                      isFavorited 
                      ? 'bg-secondary/10 border-secondary/50 text-secondary shadow-[0_0_20px_rgba(255,184,0,0.2)]' 
                      : 'nova-glass-light border-white/5 text-white hover:border-primary/50 hover:text-primary'
                    }`}
                  >
                    {/* ANIMAÇÃO DE FUNDO SÓ NO HOVER */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>
                    
                    <Star className={`w-4 h-4 transition-all duration-500 ${
                      isFavorited ? 'fill-secondary text-secondary scale-110' : 'text-muted group-hover:text-primary group-hover:scale-125 group-hover:rotate-12'
                    }`} />
                    <span className="text-[10px] font-black uppercase tracking-widest relative z-10">
                      {isFavorited ? 'Favoritado' : 'Favoritar'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT: RANK & PERFORMANCE */}
            <div className="lg:col-span-4 space-y-8">
              <div className="nova-glass-light nova-border-glow p-10 rounded-[3rem] text-center">
                <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.4em] mb-10">Tier Atual</h3>
                {summoner.league && summoner.league.length > 0 ? (
                  <div className="flex flex-col items-center gap-8">
                     {summoner.league.map((rank: any) => (
                       <div key={rank.queueType} className="flex flex-col items-center w-full pb-6 border-b border-white/5 last:border-0 last:pb-0">
                         <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-4 opacity-50">
                            {rank.queueType === 'RANKED_SOLO_5x5' ? 'Solo/Duo' : 'Flex'}
                         </div>
                         <div className="relative mb-6">
                            <img src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${rank.tier.toLowerCase()}.png`} className="w-48 h-48 sm:w-64 sm:h-64 object-contain scale-[2.2] sm:scale-[2.8] relative z-10 drop-shadow-2xl" alt="" />
                         </div>
                         <div className="text-3xl font-black text-white italic tracking-tighter mb-1 uppercase">{rank.tier} {rank.rank}</div>
                         <div className="text-xs font-black text-primary tracking-[0.2em]">{rank.leaguePoints} LP / {rank.wins}V {rank.losses}D</div>
                       </div>
                     ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-10 opacity-30">
                    <Shield className="w-20 h-20 mb-4" />
                    <div className="text-[10px] font-black uppercase tracking-widest">Sem Rank Atual</div>
                  </div>
                )}
              </div>

              <div className="nova-glass-light nova-border-glow p-8 rounded-[3rem]">
                <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.4em] mb-8">Taxa de Vitória Global</h3>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl font-black text-white italic tracking-tighter">
                    {summoner.wins ? ((summoner.wins / (summoner.wins + summoner.losses)) * 100).toFixed(1) : '50.0'}%
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary opacity-50" />
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                   <div 
                      className="h-full bg-primary shadow-[0_0_15px_rgba(0,255,204,0.5)] transition-all duration-1000 ease-out" 
                      style={{ width: `${summoner.wins ? (summoner.wins / (summoner.wins + summoner.losses)) * 100 : 50}%` }}
                   ></div>
                </div>
              </div>
            </div>

            {/* RIGHT: MATCH TILES */}
            <div className="lg:col-span-8 space-y-6 relative min-h-[400px] optimize-render">

              <div className="flex items-center justify-between px-4 mb-2">
                 <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.4em]">Histórico de Batalha</h3>
                 <div className="flex gap-4">
                    {['24H', '7D', 'Season'].map(p => (
                      <button 
                        key={p} 
                        onClick={() => handlePeriodChange(p)}
                        className={`text-[9px] font-black transition-all tracking-widest px-2 py-1 rounded-lg ${
                          period === p 
                          ? 'text-primary bg-primary/10 shadow-[0_0_10px_rgba(0,255,204,0.2)]' 
                          : 'text-muted hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                 </div>
              </div>

              {matchLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-void/40 backdrop-blur-sm rounded-[3rem] animate-fade-in">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <div className="text-[8px] font-black text-primary uppercase tracking-[0.3em] italic">Analisando Partidas...</div>
                  </div>
                </div>
              )}
              {summoner.matches?.map((match: any) => (
                <div key={match.id} className="nova-glass-light nova-border-glow p-4 sm:pl-6 sm:pr-10 sm:py-6 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-4 md:gap-6 group hover:translate-x-1 transition-all overflow-hidden">
                  
                  {/* CHAMPION INFO */}
                  <div className="flex items-center gap-4 w-full md:w-auto shrink-0 border-b md:border-b-0 md:border-r border-white/5 pb-4 md:pb-0 md:pr-6">
                    <div className="relative">
                       <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.8rem] overflow-hidden border-2 border-white/5 group-hover:border-primary/30 transition-all">
                          <img 
                            src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/${formatChampName(match.champion)}.png`} 
                            className="w-full h-full object-cover" 
                            alt="" 
                          />
                       </div>
                       <div className={`absolute -top-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black text-[9px] sm:text-[10px] ${match.win ? 'bg-primary text-void shadow-[0_0_15px_rgba(0,255,204,0.4)]' : 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'}`}>
                          {match.win ? 'V' : 'D'}
                       </div>
                    </div>
                    <div>
                      <div className="text-lg sm:text-2xl font-black text-white italic tracking-tighter truncate max-w-[120px] sm:max-w-none">{formatDisplayName(match.champion)}</div>
                      <div className="text-[8px] sm:text-[9px] font-black text-muted uppercase tracking-widest opacity-50">{match.gameMode}</div>
                    </div>
                  </div>

                  {/* STATS: KDA & CS */}
                  <div className="flex-1 flex items-center justify-between md:justify-around w-full gap-4 px-2 md:px-0">
                    <div className="text-left">
                       <div className="text-xl sm:text-2xl font-black text-white tracking-tighter whitespace-nowrap">
                          {match.kills} / <span className="text-red-400">{match.deaths}</span> / {match.assists}
                       </div>
                       <div className="text-[9px] font-bold text-muted uppercase tracking-widest opacity-40">KDA {match.kda}</div>
                    </div>
                    <div className="text-right">
                       <div className="text-base sm:text-lg font-black text-white">{match.cs} <span className="text-[9px] font-bold text-muted">CS</span></div>
                       <div className="text-[8px] font-bold text-primary italic uppercase tracking-tighter">{match.csPerMin}/min</div>
                    </div>
                  </div>

                  {/* ITEMS SECTION */}
                  <div className="flex flex-col gap-2 w-full md:w-auto items-center md:items-start border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 shrink-0">
                    {/* LINHA SUPERIOR: BOTA E WARD */}
                    <div className="flex items-center gap-1.5 h-8">
                      <div className="w-1 h-1 rounded-full bg-primary/40 mr-1 shrink-0"></div>
                      {/* Bota */}
                      {(() => {
                        const boot = match.items.slice(0, 7).find((id: number) => [1001, 3006, 3009, 3047, 3111, 3117, 3158, 3020].includes(id));
                        return boot ? (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-void/40 border border-secondary/30 shadow-inner overflow-hidden p-0.5 group/item">
                            <img 
                              src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/item/${boot}.png`} 
                              className="w-full h-full rounded-md object-cover" 
                              alt="" 
                            />
                          </div>
                        ) : (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.01] border border-white/5"></div>
                        );
                      })()}
                      {/* Ward/Trinket */}
                      {(() => {
                        const trinket = match.items.slice(0, 7).find((id: number) => [3340, 3363, 3364].includes(id));
                        return trinket ? (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-void/40 border border-primary/30 shadow-inner overflow-hidden p-0.5 group/item">
                            <img 
                              src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/item/${trinket}.png`} 
                              className="w-full h-full rounded-md object-cover" 
                              alt="" 
                            />
                          </div>
                        ) : (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.01] border border-white/5"></div>
                        );
                      })()}
                    </div>

                    {/* LINHA INFERIOR: ITENS PRINCIPAIS */}
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      {match.items.slice(0, 7).filter((id: number) => id > 0 && ![3340, 3363, 3364, 1001, 3006, 3009, 3047, 3111, 3117, 3158, 3020].includes(id)).slice(0, 6).map((item: number, idx: number) => (
                        <div key={`main-${idx}`} className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-void/40 border border-white/5 shadow-inner overflow-hidden p-0.5 group/item hover:border-primary/30 transition-colors">
                          <img 
                            src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/item/${item}.png`} 
                            className="w-full h-full rounded-md sm:rounded-lg object-cover transition-transform group-hover/item:scale-110" 
                            alt="" 
                            onError={(e) => { (e.target as any).style.display = 'none'; }}
                          />
                        </div>
                      ))}
                      {/* Placeholders */}
                      {Array.from({ length: Math.max(0, 6 - match.items.slice(0, 7).filter((id: number) => id > 0 && ![3340, 3363, 3364, 1001, 3006, 3009, 3047, 3111, 3117, 3158, 3020].includes(id)).length) }).map((_, i) => (
                        <div key={`empty-main-${i}`} className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white/[0.01] border border-white/5"></div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {summoner.matches?.length === 0 && !matchLoading && (
                <div className="nova-glass-light p-20 rounded-[3rem] text-center opacity-40 animate-nova-in">
                  <Activity className="w-12 h-12 mx-auto mb-4" />
                  <div className="text-[10px] font-black uppercase tracking-[0.4em]">Nenhuma atividade detectada no período</div>
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );
}
