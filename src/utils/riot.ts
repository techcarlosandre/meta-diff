export function formatChampName(name: string): string {
  if (!name) return '';
  
  // Casos especiais conhecidos onde a API da Riot difere do DataDragon
  const specialCases: Record<string, string> = {
    'BelVeth': 'Belveth',
    'LeBlanc': 'Leblanc',
    'KhaZix': 'Khazix',
    'KaiSa': 'Kaisa',
    'VelKoz': 'Velkoz',
    'ChoGath': 'Chogath',
    'Nidalee': 'Nidalee',
    'Wukong': 'MonkeyKing', // A API as vezes retorna Wukong mas o ID é MonkeyKing
  };

  return specialCases[name] || name;
}

export function formatDisplayName(name: string): string {
  if (!name) return '';

  const displayNames: Record<string, string> = {
    'BelVeth': "Bel'Veth",
    'KaiSa': "Kai'Sa",
    'KogMaw': "Kog'Maw",
    'KhaZix': "Kha'Zix",
    'VelKoz': "Vel'Koz",
    'ChoGath': "Cho'Gath",
    'LeBlanc': "LeBlanc",
    'DrMundo': "Dr. Mundo",
    'JarvanIV': "Jarvan IV",
    'LeeSin': "Lee Sin",
    'MasterYi': "Master Yi",
    'MissFortune': "Miss Fortune",
    'XinZhao': "Xin Zhao",
    'AurelionSol': "Aurelion Sol",
    'TahmKench': "Tahm Kench",
    'TwistedFate': "Twisted Fate",
    'RekSai': "Rek'Sai",
  };

  return displayNames[name] || name;
}
