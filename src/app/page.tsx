'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, X, ChevronRight, Target } from 'lucide-react';
import { supabase } from '@/utils/supabase';

// Cache estático para evitar re-download na navegação
let ALL_CHAMPS_CACHE: any[] | null = null;

interface Highlight {
  name: string;
  label: string;
}

interface Champion {
  id: string;
  name: string;
  image: {
    full: string;
  };
}

const DEFAULT_HIGHLIGHTS: Highlight[] = [
  { name: 'Hide on bush#KR1', label: 'Faker' },
  { name: 'Baiano#LIVE', label: 'Baiano' },
  { name: 'Revolta#BR1', label: 'Revolta' },
  { name: 'Robo#001', label: 'Robo' },
];

export default function Home() {
  const router = useRouter();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [allChamps, setAllChamps] = useState<Champion[]>([]);
  const [filteredChamps, setFilteredChamps] = useState<Champion[]>([]);
  const [metaInfo, setMetaInfo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('meta_highlights');
    setHighlights(saved ? JSON.parse(saved) : DEFAULT_HIGHLIGHTS);

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
    if (!manualName) {
      saveHighlights([...highlights.filter(h => h.name !== searchName), { name: searchName.trim(), label: searchName.split('#')[0] }].slice(-5));
    }
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

        {/* HIGHLIGHTS / RECENTS */}
        <div className="mt-20">
          <div className="text-[10px] font-black text-muted uppercase tracking-[0.4em] mb-8">Jogadores em Destaque</div>
          <div className="flex flex-wrap justify-center gap-4">
            {highlights.map((p) => (
              <div key={p.name} className="relative group/tag">
                <button
                  onClick={() => handleSearch(undefined, p.name)}
                  className="nova-glass-light border border-white/5 py-3 px-6 rounded-full text-xs font-black text-muted hover:border-primary/50 hover:text-white transition-all pr-10 hover:shadow-[0_0_15px_rgba(0,255,204,0.1)]"
                >
                  {p.label}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); saveHighlights(highlights.filter(h => h.name !== p.name)); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/tag:opacity-100 p-1 hover:text-red-400 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
