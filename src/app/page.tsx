'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, User, X, ChevronRight, Target, Star } from 'lucide-react';
import { supabase } from '@/utils/supabase';

// Cache estático para evitar re-download na navegação
let ALL_CHAMPS_CACHE: any[] | null = null;

interface Champion {
  id: string;
  name: string;
  image: {
    full: string;
  };
}

interface LeaderData {
  rank: number;
  summoner_name: string;
  tag: string;
  profile_icon_url: string;
  lp: string;
  level: string;
  wins: string;
  losses: string;
  winrate: string;
  top_3_champions: { name: string, icon_url: string }[];
}

const DEFAULT_HIGHLIGHTS: LeaderData[] = [
  {
    "rank": 1,
    "summoner_name": "Enga",
    "tag": "#PUNGA",
    "profile_icon_url": "https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon6809.jpg",
    "lp": "3,184",
    "level": "841",
    "wins": "242",
    "losses": "173",
    "winrate": "58%",
    "top_3_champions": [
      { "name": "Zoe", "icon_url": "https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/Zoe.png" },
      { "name": "Ryze", "icon_url": "https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/Ryze.png" },
      { "name": "Aurora", "icon_url": "https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/Aurora.png" }
    ]
  },
  {
    "rank": 2,
    "summoner_name": "Kojima",
    "tag": "#ゲツヨウビ",
    "profile_icon_url": "https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon6631.jpg",
    "lp": "3,056",
    "level": "1,561",
    "wins": "322",
    "losses": "221",
    "winrate": "59%",
    "top_3_champions": [
      { "name": "Ezreal", "icon_url": "https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/Ezreal.png" },
      { "name": "Aurora", "icon_url": "https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/Aurora.png" },
      { "name": "Varus", "icon_url": "https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/Varus.png" }
    ]
  },
  {
    "rank": 3,
    "summoner_name": "Aithusa",
    "tag": "#lol",
    "profile_icon_url": "https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon6544.jpg",
    "lp": "3,045",
    "level": "1,097",
    "wins": "307",
    "losses": "222",
    "winrate": "58%",
    "top_3_champions": [
      { "name": "Ryze", "icon_url": "https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/Ryze.png" },
      { "name": "Shen", "icon_url": "https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/Shen.png" },
      { "name": "Akali", "icon_url": "https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/Akali.png" }
    ]
  },
  {
    "rank": 4,
    "summoner_name": "scuro",
    "tag": "#blox",
    "profile_icon_url": "https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon6615.jpg",
    "lp": "3,013",
    "level": "1,743",
    "wins": "313",
    "losses": "224",
    "winrate": "58%",
    "top_3_champions": [
      { "name": "Ezreal", "icon_url": "https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/Ezreal.png" },
      { "name": "Lucian", "icon_url": "https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/Lucian.png" },
      { "name": "Aurora", "icon_url": "https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/Aurora.png" }
    ]
  },
  {
    "rank": 5,
    "summoner_name": "bipi",
    "tag": "#moes",
    "profile_icon_url": "https://opgg-static.akamaized.net/meta/images/profile_icons/profileIcon6335.jpg",
    "lp": "3,002",
    "level": "1,260",
    "wins": "368",
    "losses": "257",
    "winrate": "59%",
    "top_3_champions": [
      { "name": "Ezreal", "icon_url": "https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/Ezreal.png" },
      { "name": "Aurora", "icon_url": "https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/Aurora.png" },
      { "name": "Corki", "icon_url": "https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/Corki.png" }
    ]
  }
];

export default function Home() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [favChamps, setFavChamps] = useState<any[]>([]);
  const [favSummoners, setFavSummoners] = useState<any[]>([]);
  const [dailyLeaders, setDailyLeaders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loadingFavs, setLoadingFavs] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          console.log("Buscando favoritos para:", user.email);
          
          // Buscar Campeões Favoritos
          const { data: champs, error: cErr } = await supabase
            .from('favorites')
            .select('champion_id')
            .eq('user_id', user.id);
          
          if (cErr) console.warn("Tabela de favoritos não encontrada. Ignore se não for usar favoritos.");
          setFavChamps(champs || []);

          // Buscar Invocadores Favoritos
          const { data: summoners, error: sErr } = await supabase
            .from('favorite_summoners')
            .select('*')
            .eq('user_id', user.id);
          
          if (sErr) console.warn("Tabela de invocadores favoritos não encontrada.");
          setFavSummoners(summoners || []);

          // Buscar Líderes Diários
          const { data: leaders } = await supabase
            .from('daily_leaders')
            .select('*')
            .order('rank', { ascending: true })
            .limit(5);
          
          if (leaders) setDailyLeaders(leaders);
        } else {
           // Mesmo deslogado, busca os líderes para mostrar na home
           const { data: leaders } = await supabase
            .from('daily_leaders')
            .select('*')
            .order('rank', { ascending: true })
            .limit(5);
          
          if (leaders) setDailyLeaders(leaders);
        }
      } catch (err) {
        console.error("Erro na carga de favoritos:", err);
      } finally {
        setLoadingFavs(false);
      }
    };

    fetchFavorites();
  }, []);

  const toggleSummonerFavorite = async (e: React.MouseEvent, summoner: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    let [name, tag] = summoner.split('#');
    if (!name || !tag) return;
    name = name.trim();
    tag = tag.trim();

    const isFav = favSummoners.some(s => s.summoner_name === name && s.tag_line === tag);

    try {
      if (isFav) {
        await supabase
          .from('favorite_summoners')
          .delete()
          .eq('user_id', user.id)
          .eq('summoner_name', name)
          .eq('tag_line', tag);
        
        setFavSummoners(prev => prev.filter(s => !(s.summoner_name === name && s.tag_line === tag)));
      } else {
        const { data, error } = await supabase
          .from('favorite_summoners')
          .insert([{ user_id: user.id, summoner_name: name, tag_line: tag }])
          .select();
        
        if (error) throw error;
        if (data) setFavSummoners(prev => [...prev, data[0]]);
      }
    } catch (err) {
      console.error("Erro ao favoritar invocador:", err);
    }
  };
  const [allChamps, setAllChamps] = useState<Champion[]>([]);
  const [filteredChamps, setFilteredChamps] = useState<Champion[]>([]);
  const [metaInfo, setMetaInfo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        let champsData;
        if (ALL_CHAMPS_CACHE) {
          champsData = ALL_CHAMPS_CACHE;
        } else {
          const res = await fetch('https://ddragon.leagueoflegends.com/cdn/16.8.1/data/pt_BR/champion.json');
          const data = await res.json();
          ALL_CHAMPS_CACHE = Object.values(data.data);
          champsData = ALL_CHAMPS_CACHE;
        }

        setAllChamps(champsData);
        
        const { data: mData } = await supabase.from('route_meta').select('champion_name, role');
        if (mData) setMetaInfo(mData);
      } catch (err) {
        console.error("Erro ao carregar dados", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (searchValue.length > 0) {
      const filtered = allChamps
        .filter(c => (c.name || '').toLowerCase().includes(searchValue.toLowerCase()))
        .slice(0, 5);
      setFilteredChamps(filtered);
    } else {
      setFilteredChamps([]);
    }
  }, [searchValue, allChamps]);

  const saveHighlights = (newHighlights: Highlight[]) => {
    setHighlights(newHighlights);
    localStorage.setItem('meta_highlights', JSON.stringify(newHighlights));
  };

  const handleSearch = async (e?: React.FormEvent, manualName?: string) => {
    if (e) e.preventDefault();
    const searchName = manualName || searchValue;
    if (!searchName || !searchName.trim()) return;

    // Verificar se é um campeão primeiro
    const isChamp = allChamps.find(c => 
      c.name.toLowerCase() === searchName.toLowerCase() || 
      c.id.toLowerCase() === searchName.toLowerCase()
    );

    if (isChamp) {
      router.push(`/champion/${isChamp.id}`);
      return;
    }

    const formattedName = searchName.trim().replace('#', '-');
    router.push(`/summoner/${formattedName}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pb-32 animate-nova-in mt-10">
      <section className="text-center py-20">
        <div className="inline-block px-4 py-1.5 rounded-full nova-glass-light border border-primary/20 text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-8">
          Análise em Tempo Real
        </div>
        <h1 className="text-6xl sm:text-8xl font-black mb-6 leading-[0.9] tracking-tighter uppercase">
          <span className="text-primary text-glow-primary">ASCENDA AO</span> <br />
          <span className="text-secondary text-glow-secondary mt-2 inline-block">DESAFIANTE</span>
        </h1>
        <p className="max-w-lg mx-auto text-muted text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] mb-16 opacity-80 leading-relaxed">
          O DASHBOARD IRÁ TRANSFORMAR OS SEUS DADOS EM VITÓRIAS. DOMINE O META E CONQUISTE SUA ELITE.
        </p>
        
        {/* SEARCH AREA */}
         <div className="relative z-20">
           <form onSubmit={(e) => handleSearch(e)} className="group relative">
             {/* AURA EXTERNA (O GLOW QUE SAI DA CAIXA) */}
             <div className="absolute -inset-6 bg-gradient-to-r from-primary/20 via-primary/5 to-secondary/20 rounded-[3.5rem] blur-3xl opacity-0 group-focus-within:opacity-100 transition-all duration-1000 pointer-events-none"></div>
             
             {/* BORDA LUMINOSA (O CONTORNO DEFINIDO) */}
             <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/40 to-secondary/40 rounded-[2.5rem] opacity-0 group-focus-within:opacity-100 transition-all duration-700 blur-[2px] pointer-events-none"></div>

             <div className="relative nova-glass nova-border-glow p-2 rounded-[2.5rem] flex items-center shadow-3xl transition-all group-focus-within:border-primary/30 z-10">
               <div className="flex-1 relative flex items-center">
                <Search className="absolute left-6 text-muted w-5 h-5 group-focus-within:text-primary transition-colors" />
                <input
                  className="w-full bg-transparent p-6 pl-16 rounded-full text-white focus:outline-none text-lg font-bold placeholder:text-muted/30"
                  placeholder="Invocador#TAG ou Campeão..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-void px-10 py-5 rounded-[1.8rem] font-black hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-[0.2em] shadow-xl"
              >
                Buscar
              </button>
            </div>

            {/* SUGGESTIONS */}
            {(filteredChamps.length > 0 || searchValue.length > 2) && (
              <div className="absolute top-[110%] left-4 right-4 nova-glass nova-border-glow rounded-[2rem] overflow-hidden z-50 shadow-2xl animate-nova-in p-2">
                {searchValue.length > 2 && (
                  <button
                    onClick={() => handleSearch(undefined, searchValue)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl transition-all group/sum"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-[10px] font-black text-primary uppercase tracking-widest">Busca Global</div>
                      <div className="text-base font-black text-white">{searchValue}</div>
                    </div>
                    {user && searchValue.includes('#') && (
                      <button 
                        onClick={(e) => toggleSummonerFavorite(e, searchValue)}
                        className={`p-3 rounded-xl border transition-all ${favSummoners.some(s => s.summoner_name === searchValue.split('#')[0] && s.tag_line === searchValue.split('#')[1]) ? 'bg-secondary/20 border-secondary text-secondary' : 'bg-white/5 border-white/10 text-muted hover:border-secondary hover:text-secondary'}`}
                      >
                        <Star className={`w-4 h-4 ${favSummoners.some(s => s.summoner_name === searchValue.split('#')[0] && s.tag_line === searchValue.split('#')[1]) ? 'fill-secondary' : ''}`} />
                      </button>
                    )}
                    <ChevronRight className="w-5 h-5 text-primary opacity-0 group-hover/sum:opacity-100 transition-all" />
                  </button>
                )}

                {filteredChamps.map(champ => {
                  const meta = metaInfo.find(m => m.champion_name === champ.id);
                  return (
                    <a
                      key={champ.id}
                      href={`/champion/${champ.id}`}
                      className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-2xl transition-all group/item"
                    >
                      <img src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/${champ.image.full}`} alt={champ.name} className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                      <div className="flex-1 text-left">
                        <div className="text-sm font-black text-white group-hover/item:text-primary transition-colors">{champ.name}</div>
                        <div className="text-[9px] font-black text-muted uppercase tracking-widest">{meta ? meta.role : 'Meta Ativa'}</div>
                      </div>
                      <Target className="w-4 h-4 text-muted group-hover/item:text-secondary opacity-50" />
                    </a>
                  );
                })}
              </div>
            )}
          </form>
        </div>

        {/* SEÇÃO: SUA ELITE (Favoritos) */}
        {user && (favChamps.length > 0 || favSummoners.length > 0) && (
          <div className="mt-20 w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="flex items-center gap-4 mb-10 justify-center">
              <Star className="w-5 h-5 text-secondary fill-secondary animate-pulse" />
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.5em] opacity-60">Sua Elite Pessoal</h3>
              <div className="h-[1px] w-24 bg-gradient-to-r from-white/10 to-transparent hidden sm:block"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Campeões Favoritos */}
              <div className="nova-glass-light border border-white/5 rounded-[2rem] p-8 flex flex-col gap-6 group/favc hover:border-primary/20 transition-all">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Campeões Prioritários</p>
                  <div className="w-2 h-2 bg-primary animate-ping rounded-full shadow-glow"></div>
                </div>
                <div className="flex flex-wrap gap-4">
                  {favChamps.length > 0 ? favChamps.map((fav) => (
                    <Link 
                      key={fav.champion_id}
                      href={`/champion/${fav.champion_id}`}
                      className="group relative w-16 h-16 rounded-2xl overflow-hidden border border-white/10 hover:border-primary transition-all duration-500 hover:scale-110 shadow-xl"
                    >
                      <img 
                        src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/${fav.champion_id}.png`}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                        alt={fav.champion_id}
                      />
                      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </Link>
                  )) : (
                    <div className="flex flex-col gap-2 opacity-20">
                      <div className="flex gap-2">
                        {[1,2,3].map(i => <div key={i} className="w-12 h-12 bg-white/5 rounded-xl border border-dashed border-white/20" />)}
                      </div>
                      <p className="text-[8px] font-bold uppercase tracking-widest">Nenhum campeão no radar</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Invocadores Favoritos */}
              <div className="nova-glass-light border border-white/5 rounded-[2rem] p-8 flex flex-col gap-6 group/favs hover:border-secondary/20 transition-all">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-secondary uppercase tracking-[0.4em]">Invocadores Favoritos</p>
                  <Star className="w-3 h-3 text-secondary/40" />
                </div>
                <div className="flex flex-wrap gap-3">
                  {favSummoners.length > 0 ? favSummoners.map((s) => (
                    <Link 
                      key={s.id}
                      href={`/summoner/${s.summoner_name}-${s.tag_line}`}
                      className="flex items-center gap-4 px-5 py-4 bg-white/5 border border-white/10 rounded-2xl hover:border-secondary hover:bg-white/10 transition-all group/s shadow-lg"
                    >
                      <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/20 group-hover/s:border-secondary/50 transition-colors">
                        <User className="w-5 h-5 text-secondary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-white group-hover/s:text-secondary transition-colors uppercase tracking-widest">
                          {s.summoner_name}
                        </span>
                        <span className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">#{s.tag_line}</span>
                      </div>
                    </Link>
                  )) : (
                    <div className="flex flex-col gap-2 opacity-20">
                      <div className="flex gap-2">
                         <div className="w-full h-12 bg-white/5 rounded-xl border border-dashed border-white/20 flex items-center px-4">
                            <span className="text-[8px] font-bold uppercase tracking-widest">Lista de vigilância vazia</span>
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LEADERBOARD: LÍDERES DE ONTEM */}
        <div className="mt-32 w-full max-w-5xl mx-auto">
          <div className="flex flex-col items-center mb-16">
            <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-[0.4em] mb-4">
              Meta Rank BR
            </div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
              Líderes de <span className="text-primary italic">Ontem</span>
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary mt-4 rounded-full"></div>
          </div>

          <div className="nova-glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl relative">
            {/* Table Header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-10 py-6 border-b border-white/5 bg-white/2 opacity-40 text-[9px] font-black uppercase tracking-[0.2em] text-white">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-4 text-left">Invocador</div>
              <div className="col-span-1 text-center">Tier</div>
              <div className="col-span-1 text-center">LP</div>
              <div className="col-span-2 text-center">Top Campeões</div>
              <div className="col-span-1 text-center">Nível</div>
              <div className="col-span-2 text-right">Taxa de Vitória</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-white/5">
              {(dailyLeaders.length > 0 ? dailyLeaders : DEFAULT_HIGHLIGHTS).map((p: any, idx: number) => {
                const rank = p.rank || (idx + 1);
                const name = p.summoner_name;
                const tag = p.tag || `#${p.tag_line}`;
                const wr = p.winrate || p.win_rate;
                const wins = parseInt(p.wins || "200");
                const losses = parseInt(p.losses || "150");
                const total = wins + losses;
                const winPerc = (wins / total) * 100;

                return (
                  <div 
                    key={name}
                    onClick={() => handleSearch(undefined, `${name}${tag}`)}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 lg:px-10 py-6 hover:bg-white/[0.03] transition-all cursor-pointer group/row items-center relative"
                  >
                    {/* Rank */}
                    <div className="col-span-1 flex justify-center">
                      <span className={`text-2xl font-black italic tracking-tighter ${rank === 1 ? 'text-primary text-glow-primary scale-110' : 'text-white/20'}`}>
                        {rank}
                      </span>
                    </div>

                    {/* Invocador */}
                    <div className="col-span-4 flex items-center gap-4">
                      <div className="relative">
                        <img 
                          src={p.profile_icon_url || `https://ddragon.leagueoflegends.com/cdn/15.1.1/img/profileicon/${Math.floor(Math.random() * 50)}.png`}
                          alt={name}
                          className="w-14 h-14 rounded-2xl object-cover border border-white/10 group-hover/row:border-primary/50 transition-all"
                        />
                        {rank === 1 && (
                          <div className="absolute -top-2 -right-2 bg-primary text-void text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-glow animate-bounce">
                            TOP
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-2">
                           <span className="text-lg font-black text-white group-hover/row:text-primary transition-colors">{name}</span>
                           <span className="text-[10px] font-bold text-white/20">{tag}</span>
                           {user && (
                             <button 
                               onClick={(e) => toggleSummonerFavorite(e, `${name}${tag}`)}
                               className={`ml-1 p-1 rounded-md transition-all hover:scale-110 ${favSummoners.some(s => s.summoner_name === name && s.tag_line === tag.replace('#', '')) ? 'text-secondary' : 'text-white/10 hover:text-secondary'}`}
                             >
                               <Star className={`w-3 h-3 ${favSummoners.some(s => s.summoner_name === name && s.tag_line === tag.replace('#', '')) ? 'fill-secondary' : ''}`} />
                             </button>
                           )}
                        </div>
                        <div className="lg:hidden text-[10px] font-bold text-primary/60 uppercase tracking-widest mt-1">Challenger • {p.lp || '3.000'} LP</div>
                      </div>
                    </div>

                    {/* Tier (Desktop) */}
                    <div className="hidden lg:flex col-span-1 justify-center">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter">Challenger</span>
                    </div>

                    {/* LP (Desktop) */}
                    <div className="hidden lg:flex col-span-1 justify-center">
                      <span className="text-sm font-black text-secondary text-glow-secondary tracking-tight">{p.lp || '3.000'}</span>
                    </div>

                    {/* Top Champions */}
                    <div className="col-span-2 flex justify-center gap-2">
                      {(p.top_3_champions || []).map((champ: any, i: number) => (
                        <div key={i} className="w-10 h-10 rounded-xl overflow-hidden border border-white/5 hover:border-primary transition-all">
                          <img src={champ.icon_url} alt={champ.name} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {!p.top_3_champions && (
                        <div className="flex gap-2 opacity-20">
                          {[1,2,3].map(i => <div key={i} className="w-10 h-10 bg-white/10 rounded-xl" />)}
                        </div>
                      )}
                    </div>

                    {/* Level (Desktop) */}
                    <div className="hidden lg:flex col-span-1 justify-center">
                      <span className="text-[11px] font-bold text-white/30">{p.level || '---'}</span>
                    </div>

                    {/* Winrate Bar */}
                    <div className="col-span-2 flex flex-col items-end gap-1.5">
                      <div className="flex justify-between w-full text-[9px] font-black uppercase tracking-tighter">
                        <span className="text-primary">{wins}V</span>
                        <span className="text-red-500">{losses}D</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden flex border border-white/5">
                        <div style={{ width: `${winPerc}%` }} className="h-full bg-primary shadow-[0_0_10px_rgba(0,255,204,0.3)]"></div>
                        <div className="flex-1 h-full bg-red-500/40"></div>
                      </div>
                      <span className="text-xs font-black text-white">{wr} <span className="text-[9px] text-white/20 ml-1">Winrate</span></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
