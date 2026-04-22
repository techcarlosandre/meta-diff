import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

const realTimeBuilds: any = {
  'DrMundo': {
    'TOP': {
      winRate: "50.5%", pickRate: "4.5%", banRate: "2.0%", tier: "B",
      runes: { primaryTree: 'Resolve', primarySelections: [0, 2, 1, 2], secondaryTree: 'Inspiration', secondarySelections: [{ slot: 1, index: 1 }, { slot: 3, index: 0 }], shards: [1, 2, 2], runeAdvice: "Como Mundo Top, sua prioridade é escalar." },
      start: [1054, 2003], core: [3083, 6667, 3068, 3111, 3065, 3075, 3742],
      draft: "Mundo é um pick seguro contra tanks.",
      ingame: "Use seu Q para farmar de longe.",
      counters: ["Fiora", "Vayne", "Aatrox"], synergies: ["Sejuani", "Orianna", "Lulu"]
    },
    'JUNGLE': {
      winRate: "48.2%", pickRate: "1.2%", banRate: "2.0%", tier: "C",
      runes: { primaryTree: 'Precision', primarySelections: [1, 0, 2, 2], secondaryTree: 'Inspiration', secondarySelections: [{ slot: 1, index: 1 }, { slot: 3, index: 0 }], shards: [1, 0, 2], runeAdvice: "Mundo na selva precisa de velocidade de limpeza." },
      start: [1103, 2003], core: [3083, 3068, 3075, 3111, 3065, 3001, 3742],
      draft: "Bom contra CC.",
      ingame: "Power farm até o nível 6.",
      counters: ["MasterYi", "Trundle", "Olaf"], synergies: ["Malphite", "Yasuo", "Galio"]
    }
  },
  'LeeSin': {
    'JUNGLE': {
      winRate: "49.8%", pickRate: "18.5%", banRate: "12.0%", tier: "S",
      runes: { primaryTree: 'Precision', primarySelections: [1, 0, 2, 0], secondaryTree: 'Inspiration', secondarySelections: [{ slot: 1, index: 1 }, { slot: 3, index: 0 }], shards: [0, 0, 2], runeAdvice: "Conquistador é essencial para duelos na selva." },
      start: [1103, 2003], core: [6630, 3071, 3053, 3111, 6333, 3075],
      draft: "Pick agressivo de early game.",
      counters: ["Warwick", "Rek'Sai", "Poppy"], synergies: ["Yasuo", "LeBlanc", "Orianna"]
    },
    'TOP': {
      winRate: "46.2%", pickRate: "0.8%", banRate: "12.0%", tier: "D",
      runes: { primaryTree: 'Precision', primarySelections: [1, 0, 2, 2], secondaryTree: 'Resolve', secondarySelections: [{ slot: 2, index: 1 }, { slot: 3, index: 1 }], shards: [1, 0, 2], runeAdvice: "Foque em sustento no topo." },
      start: [1055, 2003], core: [6630, 3074, 3111, 3053, 6333],
      draft: "Off-meta pick situacional.",
      counters: ["Jax", "Darius", "Fiora"], synergies: ["Elise", "Nidalee"]
    }
  },
  'Caitlyn': {
    'ADC': {
      winRate: "51.2%", pickRate: "22.0%", banRate: "15.0%", tier: "S",
      runes: { primaryTree: 'Precision', primarySelections: [2, 0, 2, 2], secondaryTree: 'Inspiration', secondarySelections: [{ slot: 1, index: 1 }, { slot: 3, index: 0 }], shards: [0, 0, 2], runeAdvice: "Agilidade nos pés para poke infinito." },
      start: [1055, 2003, 3340], core: [3031, 3046, 3006, 3036, 3072, 6672],
      draft: "Melhor alcance do jogo.",
      counters: ["Ashe", "Jhin", "Varus"], synergies: ["Lux", "Morgana", "Braum"]
    }
  },
  'Aatrox': {
    'TOP': {
       winRate: "51.8%", pickRate: "15.5%", banRate: "20.0%", tier: "S+",
       runes: { primaryTree: 'Precision', primarySelections: [1, 0, 2, 2], secondaryTree: 'Resolve', secondarySelections: [{ slot: 2, index: 1 }, { slot: 3, index: 1 }], shards: [1, 0, 2], runeAdvice: "Dobre o sustento com Revitalizar." },
       start: [1055, 2003], core: [6630, 3071, 3053, 3047, 6333, 3075, 4401],
       draft: "O rei do topo atual.",
       counters: ["Fiora", "Irelia", "Jax"], synergies: ["Sejuani", "Gragas"]
    }
  },
  'Jhin': {
    'ADC': {
      winRate: "49.6%", pickRate: "15.9%", banRate: "2.3%", tier: "S",
      runes: { primaryTree: 'Precision', primarySelections: [2, 0, 2, 0], secondaryTree: 'Sorcery', secondarySelections: [{ slot: 2, index: 0 }, { slot: 3, index: 2 }], shards: [0, 0, 2], runeAdvice: "Agilidade nos Pés é crucial para o kiting do Jhin." },
      start: [1055, 2003], core: [3031, 3046, 3006, 3036, 3072],
      draft: "Excelente contra composições sem muitos tanks.",
      counters: ["Lucian", "Tristana"], synergies: ["Morgana", "Leona"]
    }
  },
  'Ezreal': {
    'ADC': {
      winRate: "47.7%", pickRate: "18.5%", banRate: "7.7%", tier: "S",
      runes: { primaryTree: 'Precision', primarySelections: [1, 0, 2, 0], secondaryTree: 'Inspiration', secondarySelections: [{ slot: 1, index: 1 }, { slot: 3, index: 0 }], shards: [0, 0, 2], runeAdvice: "Conquistador para lutas estendidas." },
      start: [1055, 2003], core: [3078, 3004, 3006, 3153, 3036],
      draft: "Safe pick com excelente poke.",
      counters: ["Draven", "Vayne"], synergies: ["Karma", "Nami"]
    }
  },
  'Jinx': {
    'ADC': {
      winRate: "51.7%", pickRate: "14.1%", banRate: "5.3%", tier: "S+",
      runes: { primaryTree: 'Precision', primarySelections: [2, 0, 2, 2], secondaryTree: 'Sorcery', secondarySelections: [{ slot: 2, index: 0 }, { slot: 3, index: 2 }], shards: [0, 0, 2], runeAdvice: "Ritmo Fatal para DPS em team fights." },
      start: [1055, 2003], core: [3031, 3046, 3006, 3036, 3072, 3026],
      draft: "Hypercarry de late game, precisa de proteção.",
      counters: ["Draven", "Lucian", "Samira"], synergies: ["Thresh", "Lulu", "Janna"]
    }
  },
  'Ashe': {
    'ADC': {
      winRate: "51.6%", pickRate: "14.3%", banRate: "5.9%", tier: "S",
      runes: { primaryTree: 'Precision', primarySelections: [2, 0, 2, 2], secondaryTree: 'Inspiration', secondarySelections: [{ slot: 1, index: 1 }, { slot: 3, index: 0 }], shards: [0, 0, 2], runeAdvice: "Ritmo Fatal e Aproximação Veloz." },
      start: [1055, 2003], core: [3031, 3085, 3006, 3036, 3026],
      draft: "Utilidade e CC constante.",
      counters: ["Ezreal", "Sivir"], synergies: ["Braum", "Nautilus"]
    }
  },
  'KaiSa': {
    'ADC': {
      winRate: "49.0%", pickRate: "13.9%", banRate: "2.2%", tier: "S",
      runes: { primaryTree: 'Precision', primarySelections: [2, 0, 2, 2], secondaryTree: 'Inspiration', secondarySelections: [{ slot: 1, index: 1 }, { slot: 3, index: 0 }], shards: [0, 0, 2], runeAdvice: "Chuva de Lâminas ou Ritmo Fatal." },
      start: [1055, 2003], core: [3124, 3006, 3115, 3089, 3135],
      draft: "Híbrida de alto burst e invisibilidade.",
      counters: ["Caitlyn", "Draven"], synergies: ["Nautilus", "Leona"]
    }
  },
  'Pyke': {
    'SUPPORT': {
      winRate: "50.8%", pickRate: "12.1%", banRate: "25.5%", tier: "S",
      runes: { primaryTree: 'Domination', primarySelections: [0, 2, 1, 2], secondaryTree: 'Resolve', secondarySelections: [{ slot: 2, index: 1 }, { slot: 3, index: 1 }], shards: [0, 0, 2], runeAdvice: "Chuva de Lâminas para execute rápido." },
      start: [3854, 2003], core: [3117, 3147, 3142, 3156, 3179],
      draft: "Roaming e snowball agressivo.",
      counters: ["Janna", "Lulu"], synergies: ["Draven", "Lucian"]
    }
  },
  'Garen': {
    'TOP': {
      winRate: "51.6%", pickRate: "11.5%", banRate: "13.8%", tier: "S",
      runes: { primaryTree: 'Precision', primarySelections: [1, 0, 2, 0], secondaryTree: 'Sorcery', secondarySelections: [{ slot: 2, index: 0 }, { slot: 3, index: 2 }], shards: [0, 0, 2], runeAdvice: "Conquistador e Ímpeto Gradual." },
      start: [1054, 2003], core: [3078, 3006, 3053, 3075, 4401],
      draft: "O rei do low elo, forte solidez no topo.",
      counters: ["Darius", "Kayle"], synergies: ["Ivern", "Lux"]
    }
  },
  'Cassiopeia': {
    'TOP': {
      winRate: "50.3%", pickRate: "0.4%", banRate: "1.1%", tier: "F",
      runes: { primaryTree: 'Sorcery', primarySelections: [1, 1, 0, 2], secondaryTree: 'Precision', secondarySelections: [{ slot: 2, index: 1 }, { slot: 3, index: 1 }], shards: [1, 0, 2], runeAdvice: "Ímpeto Gradual é mandatório." },
      start: [1056, 2003], core: [3040, 3001, 3157, 3116, 3135],
      draft: "Risco alto no topo devido à falta de mobilidade.",
      counters: ["Irelia", "Jax"], synergies: ["Singed", "Twitch"]
    }
  },
  'Ahri': {
    'MID': {
      winRate: "51.0%", pickRate: "11.0%", banRate: "5.8%", tier: "S",
      runes: { primaryTree: 'Domination', primarySelections: [0, 2, 1, 2], secondaryTree: 'Inspiration', secondarySelections: [{ slot: 1, index: 1 }, { slot: 3, index: 0 }], shards: [1, 0, 2], runeAdvice: "Eletrocutar para burst seguro." },
      start: [1056, 2003], core: [6655, 3020, 3157, 3089, 3135],
      draft: "Mobilidade extrema e pickoff com o Charm.",
      counters: ["Yasuo", "Zed"], synergies: ["Vi", "Lee Sin"]
    }
  },
  'Graves': {
    'JUNGLE': {
      winRate: "49.9%", pickRate: "11.7%", banRate: "15.3%", tier: "S",
      runes: { primaryTree: 'Precision', primarySelections: [1, 0, 2, 0], secondaryTree: 'Inspiration', secondarySelections: [{ slot: 1, index: 1 }, { slot: 3, index: 0 }], shards: [0, 0, 2], runeAdvice: "Agilidade nos Pés ou Conquistador." },
      start: [1102, 2003], core: [3078, 3006, 3053, 3075, 4401],
      draft: "Duelo 1v1 imbatível na selva.",
      counters: ["Kindred", "Nidalee"], synergies: ["Renekton", "Leona"]
    }
  },
  'Senna': {
    'SUPPORT': {
      winRate: "52.4%", pickRate: "7.1%", banRate: "1.0%", tier: "S",
      runes: { primaryTree: 'Precision', primarySelections: [2, 0, 2, 0], secondaryTree: 'Inspiration', secondarySelections: [{ slot: 1, index: 1 }, { slot: 3, index: 0 }], shards: [0, 0, 2], runeAdvice: "Agilidade nos Pés para stackar almas." },
      start: [3854, 2003], core: [3142, 3006, 3036, 3072, 3094],
      draft: "Scaling infinito de alcance e crítico.",
      counters: ["Pyke", "Blitzcrank"], synergies: ["Sion", "Tahm Kench"]
    }
  },
  'Lux': {
    'SUPPORT': {
      winRate: "49.0%", pickRate: "7.5%", banRate: "6.0%", tier: "A",
      runes: { primaryTree: 'Sorcery', primarySelections: [0, 2, 1, 1], secondaryTree: 'Inspiration', secondarySelections: [{ slot: 1, index: 1 }, { slot: 3, index: 0 }], shards: [1, 0, 2], runeAdvice: "Cometa Arcano para poke opressor." },
      start: [3850, 2003], core: [6655, 3020, 3157, 3089, 3135],
      draft: "Combo de burst seguro à distância.",
      counters: ["Nautilus", "Leona"], synergies: ["Caitlyn", "Jhin"]
    }
  },
  'Zyra': {
    'SUPPORT': {
      winRate: "53.4%", pickRate: "12.0%", banRate: "8.0%", tier: "S+",
      runes: { primaryTree: 'Sorcery', primarySelections: [0, 0, 1, 3], secondaryTree: 'Inspiration', secondarySelections: [{ slot: 1, index: 1 }, { slot: 3, index: 0 }], shards: [0, 0, 2], runeAdvice: "Maximize o dano das plantas." },
      start: [3858, 2003, 3340], core: [6653, 3165, 3135, 3158, 3089, 4628],
      draft: "Excelente contra suportes de engage.",
      ingame: "Mantenha o controle do mato.",
      counters: ["Xerath", "Vel'Koz", "Lux"], synergies: ["Ashe", "Jhin", "Varus"]
    }
  },
  'Briar': {
    'JUNGLE': {
      winRate: "52.5%", pickRate: "8.5%", banRate: "15.0%", tier: "S",
      runes: { primaryTree: 'Precision', primarySelections: [1, 0, 2, 2], secondaryTree: 'Domination', secondarySelections: [{ slot: 2, index: 1 }, { slot: 3, index: 2 }], shards: [0, 0, 2], runeAdvice: "Conquistador é the melhor opção para a frenesi." },
      start: [1103, 2003], core: [3071, 3053, 3153, 3047, 6333, 3075],
      draft: "Forte contra composições frágeis.",
      counters: ["Jax", "Rammus", "MasterYi"], synergies: ["Galio", "Shen", "Orianna"]
    },
    'TOP': {
      winRate: "49.1%", pickRate: "1.2%", banRate: "15.0%", tier: "B",
      runes: { primaryTree: 'Precision', primarySelections: [1, 0, 2, 2], secondaryTree: 'Resolve', secondarySelections: [{ slot: 2, index: 1 }, { slot: 3, index: 1 }], shards: [0, 0, 2], runeAdvice: "Pressione a lane com seu sustain inato." },
      start: [1055, 2003], core: [3071, 3053, 3111, 3075, 6333],
      counters: ["Fiora", "Jax", "Camille"], synergies: ["Sejuani", "Gragas"]
    }
  },
  'Janna': {
    'SUPPORT': {
      winRate: "52.5%", pickRate: "8.2%", banRate: "2.1%", tier: "S+",
      runes: { primaryTree: 'Sorcery', primarySelections: [0, 1, 1, 3], secondaryTree: 'Resolve', secondarySelections: [{ slot: 2, index: 1 }, { slot: 3, index: 1 }], shards: [0, 0, 2], runeAdvice: "Aery e Ventos Revigorantes para blindar seu atirador." },
      start: [3858, 2003, 3340], core: [3158, 4005, 3165, 3107, 3504, 4628],
      draft: "O melhor disengage do jogo. Excelente contra hard-engage.",
      ingame: "Guarde o Q para interromper avanços (dashs) inimigos.",
      counters: ["Sona", "Senna", "Nami"], synergies: ["Vayne", "Jinx", "Aphelios"]
    }
  },
  'Nami': {
    'SUPPORT': {
      winRate: "51.9%", pickRate: "12.3%", banRate: "2.5%", tier: "S",
      runes: { primaryTree: 'Sorcery', primarySelections: [0, 0, 1, 3], secondaryTree: 'Inspiration', secondarySelections: [{ slot: 1, index: 1 }, { slot: 3, index: 0 }], shards: [0, 0, 2], runeAdvice: "Aery para buffs consistentes no seu ADC." },
      start: [3858, 2003], core: [4005, 3158, 6620, 3504, 3011],
      draft: "Forte lane phase e ótimo CC em lutas.",
      counters: ["Leona", "Nautilus"], synergies: ["Lucian", "Ezreal"]
    }
  },
  'Thresh': {
    'SUPPORT': {
      winRate: "50.9%", pickRate: "13.7%", banRate: "10.2%", tier: "S",
      runes: { primaryTree: 'Resolve', primarySelections: [1, 2, 1, 2], secondaryTree: 'Inspiration', secondarySelections: [{ slot: 1, index: 1 }, { slot: 3, index: 0 }], shards: [0, 2, 2], runeAdvice: "Pós-choque garante sua durabilidade no engage." },
      start: [3854, 2003, 3340], core: [3117, 3190, 3050, 3109, 3143],
      draft: "O suporte mais versátil, excelente para criar jogadas.",
      ingame: "Dê a lanterna para aliados fora de posição ou para ganks surpresas.",
      counters: ["Morgana", "Zyra", "Brand"], synergies: ["Aphelios", "Jinx", "Lucian"]
    }
  }
};

const archetypes: any = {
  'Tank': { 
    tier: 'B', 
    runes: { primaryTree: 'Resolve', primarySelections: [0, 2, 1, 2], secondaryTree: 'Inspiration', secondarySelections: [{ slot: 1, index: 1 }, { slot: 3, index: 0 }], shards: [1, 2, 2], runeAdvice: "Tank padrão: Foque em defesas híbridas e sustento." }, 
    start: [1054, 2003], 
    core: [3068, 3075, 3111, 3083, 3065, 3742], 
    counters: ["Vayne", "Fiora", "Trundle"], 
    synergies: ["Sejuani", "Orianna", "Lulu"] 
  },
  'Mage': { 
    tier: 'A', 
    runes: { primaryTree: 'Sorcery', primarySelections: [0, 0, 1, 0], secondaryTree: 'Domination', secondarySelections: [{ slot: 2, index: 1 }, { slot: 3, index: 2 }], shards: [1, 0, 2], runeAdvice: "Mago padrão: Priorize poder de habilidade e mana." }, 
    start: [1056, 2003, 3340], 
    core: [6655, 3020, 3157, 3089, 3135], 
    counters: ["Kassadin", "Zed"], 
    synergies: ["JarvanIV", "Amumu"] 
  },
  'Fighter': { 
    tier: 'A', 
    runes: { primaryTree: 'Precision', primarySelections: [1, 0, 2, 2], secondaryTree: 'Resolve', secondarySelections: [{ slot: 2, index: 1 }, { slot: 3, index: 1 }], shards: [1, 0, 2], runeAdvice: "Lutador padrão: Equilibre dano e durabilidade." }, 
    start: [1055, 2003], 
    core: [6630, 3071, 3053, 3047, 6333, 3075], 
    counters: ["Jax", "Fiora"], 
    synergies: ["Sejuani", "Lulu"] 
  },
  'Support': { 
    tier: 'A', 
    runes: { primaryTree: 'Sorcery', primarySelections: [0, 0, 1, 3], secondaryTree: 'Inspiration', secondarySelections: [{ slot: 1, index: 1 }, { slot: 3, index: 0 }], shards: [0, 0, 2], runeAdvice: "Suporte Utilitário: Priorize buffs e proteção." }, 
    start: [3858, 2003, 3340], 
    core: [4005, 3158, 6620, 3504, 3011], 
    counters: ["Blitzcrank", "Pyke"], 
    synergies: ["Lucian", "Ezreal"] 
  },
  'Marksman': { 
    tier: 'S', 
    runes: { primaryTree: 'Precision', primarySelections: [2, 0, 2, 2], secondaryTree: 'Inspiration', secondarySelections: [{ slot: 1, index: 1 }, { slot: 3, index: 0 }], shards: [0, 0, 2], runeAdvice: "Atirador padrão: Dano sustentado e crítico." }, 
    start: [1055, 2003], 
    core: [3031, 3046, 3006, 3036, 3072], 
    counters: ["Draven", "Lucian"], 
    synergies: ["Thresh", "Lulu"] 
  },
  'Assassin': { 
    tier: 'A', 
    runes: { primaryTree: 'Domination', primarySelections: [0, 2, 1, 2], secondaryTree: 'Sorcery', secondarySelections: [{ slot: 2, index: 0 }, { slot: 3, index: 2 }], shards: [1, 0, 2], runeAdvice: "Assassino padrão: Letalidade e Burst explosivo." }, 
    start: [1055, 2003], 
    core: [3142, 3158, 6692, 3814, 3179], 
    counters: ["Lulu", "Janna"], 
    synergies: ["Sejuani", "Vi"] 
  }
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
  const champId = searchParams.get('champion');
  let rawLane = searchParams.get('lane')?.toUpperCase() || 'TOP';
  
  const laneMap: Record<string, string> = {
    'JNG': 'JUNGLE',
    'ADC': 'ADC',
    'SUP': 'SUPPORT',
    'SUPPORT': 'SUPPORT',
    'MID': 'MID',
    'TOP': 'TOP'
  };
  const lane = laneMap[rawLane] || rawLane;
  
  const tags = searchParams.get('tags')?.split(',') || ['Fighter'];

  if (!champId) {
    return NextResponse.json({ error: 'Champion ID is required' }, { 
      status: 400,
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      }
    });
  }

  const champClean = champId.replace(/[^a-zA-Z]/g, '');
  
  const { data: dbMeta } = await supabase
    .from('route_meta')
    .select('role, win_rate, tier_rank, pick_rate, ban_rate')
    .eq('champion_name', champClean);

  const dbRoles = (dbMeta || []).map(m => m.role);
  const isOffRole = dbRoles.length > 0 ? !dbRoles.includes(lane) : false; 
  
  const primaryLane = dbRoles.length > 0 ? dbRoles[0] : (tags.includes('Support') ? 'SUPPORT' : (tags.includes('Jungle') ? 'JUNGLE' : 'MID'));

  const targetLane = isOffRole ? primaryLane : lane;
  const dbEntry = dbMeta?.find(m => m.role === targetLane);
  const specificBuild = realTimeBuilds[champClean]?.[targetLane];
  
  let archetype = archetypes['Fighter'];
  for (const tag of tags) {
    if (archetypes[tag]) {
      archetype = archetypes[tag];
      break;
    }
  }

  const bestFit = JSON.parse(JSON.stringify(specificBuild || archetype));

  const defaultAdvice = {
    draft: "Analise a composição inimiga. Procure por picks que complementem o time.",
    ingame: "Mantenha o farm alto e jogue em torno dos objetivos principais.",
    counters: ["Vayne", "Fiora", "Trundle"],
    synergies: ["Sejuani", "Orianna", "Lulu"]
  };

    const responseBody = {
      ...bestFit,
      primaryLane: primaryLane,
      isOffRole: isOffRole,
      winRate: isOffRole ? "45.0%" : (dbEntry?.win_rate ? `${dbEntry.win_rate}%` : (specificBuild?.winRate || "50.5%")),
      pickRate: isOffRole ? "< 0.2%" : (dbEntry?.pick_rate ? `${dbEntry.pick_rate}%` : (specificBuild?.pickRate || "4.5%")),
      banRate: isOffRole ? "0%" : (dbEntry?.ban_rate ? `${dbEntry.ban_rate}%` : (specificBuild?.banRate || "0%")),
      tier: isOffRole ? "F" : (dbEntry?.tier_rank || bestFit.tier || "B"),
      
      runes: specificBuild?.runes || bestFit.runes,
      
      start: specificBuild?.start || (lane === 'SUPPORT' && tags.includes('Tank') ? [3858, 2031, 3340] : bestFit.start),
      
      core: specificBuild?.core || (
        lane === 'SUPPORT' && tags.includes('Tank') ? [3858, 3190, 3050, 3111, 3143] : bestFit.core
      ),
      
      summoners: specificBuild?.summoners || (lane === 'JUNGLE' ? [4, 11] : (lane === 'SUPPORT' ? [4, 14] : [4, 12])),
      
      skills: specificBuild?.skills || (
        lane === 'SUPPORT' ? ['E', 'Q', 'W', 'E', 'E', 'R', 'E', 'Q', 'E', 'Q', 'R', 'Q', 'Q', 'W', 'W', 'R', 'W', 'W'] :
        (lane === 'MID' || tags.includes('Assassin')) ? ['Q', 'W', 'E', 'Q', 'Q', 'R', 'Q', 'W', 'Q', 'W', 'R', 'W', 'W', 'E', 'E', 'R', 'E', 'E'] :
        ['Q', 'E', 'W', 'Q', 'Q', 'R', 'Q', 'E', 'Q', 'E', 'R', 'E', 'E', 'W', 'W', 'R', 'W', 'W']
      ),
      
      skillOrder: specificBuild?.skillOrder || (
        lane === 'SUPPORT' ? ['E', 'Q', 'W'] :
        (lane === 'MID' || tags.includes('Assassin')) ? ['Q', 'W', 'E'] :
        ['Q', 'E', 'W']
      ),
      
      draftAdvice: specificBuild?.draft || bestFit.draft || (lane === 'SUPPORT' ? "Prepare o controle de visão e proteja seu ADC." : defaultAdvice.draft),
      ingameAdvice: specificBuild?.ingame || bestFit.ingame || (lane === 'SUPPORT' ? "Mantenha o rio sinalizado e use seu controle de grupo para peeling." : defaultAdvice.ingame),
      counters: specificBuild?.counters || bestFit.counters || (lane === 'SUPPORT' ? ["Morgana", "Thresh", "Lux"] : (lane === 'JUNGLE' ? ["LeeSin", "KhaZix", "RekSai"] : defaultAdvice.counters)),
      synergies: specificBuild?.synergies || bestFit.synergies || (lane === 'SUPPORT' ? ["Lucian", "Samira", "Jhin"] : (lane === 'JUNGLE' ? ["Orianna", "Galio", "Shen"] : defaultAdvice.synergies))
    };

   return NextResponse.json(responseBody, {
     headers: {
       'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
     }
   });
  } catch (error) {
    console.error("Build API Error:", error);
    return NextResponse.json({ error: 'Falha ao gerar build neural.' }, { status: 500 });
  }
}
