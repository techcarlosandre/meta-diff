import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const apiKey = process.env.RIOT_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Riot API Key not configured' }, { status: 500 });
  }

  // Next.js 15+ handles params as a Promise. UNWRAP it first.
  const resolvedParams = await params;
  const nameParam = resolvedParams.name;

  // Parse Name and Tag (Handling Name#Tag or Name%23Tag)
  let [gameName, tagLine] = decodeURIComponent(nameParam).split('#');
  if (!tagLine) tagLine = 'BR1'; 

  // Dynamic Region Detection Logic
  const tagSuffix = tagLine.toUpperCase();
  let selectedRegion = 'br1.api.riotgames.com';
  let selectedRouting = 'americas.api.riotgames.com';
  let selectedRegionName = 'Brazil';

  if (tagSuffix.startsWith('KR')) {
    selectedRegion = 'kr.api.riotgames.com';
    selectedRouting = 'asia.api.riotgames.com';
    selectedRegionName = 'South Korea';
  } else if (tagSuffix.startsWith('EUW')) {
    selectedRegion = 'euw1.api.riotgames.com';
    selectedRouting = 'europe.api.riotgames.com';
    selectedRegionName = 'Europe West';
  } else if (tagSuffix.startsWith('NA')) {
    selectedRegion = 'na1.api.riotgames.com';
    selectedRouting = 'americas.api.riotgames.com';
    selectedRegionName = 'North America';
  } else if (tagSuffix.startsWith('EUNE')) {
    selectedRegion = 'eun1.api.riotgames.com';
    selectedRouting = 'europe.api.riotgames.com';
    selectedRegionName = 'Europe Nordic & East';
  }

  try {
    // 1. Get PUUID via Account-V1
    const accountRes = await fetch(
      `https://${selectedRouting}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}?api_key=${apiKey}`
    );

    if (!accountRes.ok) {
      return NextResponse.json({ error: 'Account not found. Use Name#Tag format.' }, { status: 404 });
    }
    
    const account = await accountRes.json();
    const puuid = account.puuid;

    // 2. Get Summoner Data via Summoner-V4
    const summRes = await fetch(
      `https://${selectedRegion}/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${apiKey}`
    );
    
    if (!summRes.ok) {
      return NextResponse.json({ error: 'Summoner info not found' }, { status: 404 });
    }
    
    const summoner = await summRes.json();

    // 3. Get League Data via League-V4
    const leagueRes = await fetch(
      `https://${selectedRegion}/lol/league/v4/entries/by-puuid/${puuid}?api_key=${apiKey}`
    );
    
    if (!leagueRes.ok) {
        return NextResponse.json({ error: 'League info not found' }, { status: 404 });
    }

    const leagueData = await leagueRes.json();
    
    // Consolidando vitórias e derrotas de todas as filas para o Winrate Global
    const totalWins = leagueData.reduce((acc: number, curr: any) => acc + (curr.wins || 0), 0);
    const totalLosses = leagueData.reduce((acc: number, curr: any) => acc + (curr.losses || 0), 0);

    // 4. Get Period from Query Params
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'season';
    
    let startTime = '';
    const now = Math.floor(Date.now() / 1000);

    if (period === '24h') {
        startTime = `&startTime=${now - (24 * 60 * 60)}`;
    } else if (period === '7d') {
        startTime = `&startTime=${now - (7 * 24 * 60 * 60)}`;
    }

    // 5. Get Match History (Match-V5) - Aumentando para 10 partidas para melhor histórico
    const matchIdsRes = await fetch(
      `https://${selectedRouting}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=10${startTime}&api_key=${apiKey}`
    );
    const matchIds = await matchIdsRes.json();

    const matches = await Promise.all(
      (matchIds || []).map(async (id: string) => {
        const matchDetailRes = await fetch(
          `https://${selectedRouting}/lol/match/v5/matches/${id}?api_key=${apiKey}`
        );
        const detail = await matchDetailRes.json();
        const participant = detail.info.participants.find((p: any) => p.puuid === puuid);
        const durationMin = detail.info.gameDuration / 60;
        const totalCS = participant.totalMinionsKilled + participant.neutralMinionsKilled;
        
        return {
          id,
          champion: participant.championName,
          win: participant.win,
          kills: participant.kills,
          deaths: participant.deaths,
          assists: participant.assists,
          kda: participant.challenges?.kda?.toFixed(2) || ((participant.kills + participant.assists) / Math.max(1, participant.deaths)).toFixed(2),
          role: participant.lane,
          gameMode: detail.info.gameMode,
          items: [participant.item0, participant.item1, participant.item2, participant.item3, participant.item4, participant.item5, participant.item6],
          totalDamage: participant.totalDamageDealtToChampions,
          gold: participant.goldEarned,
          cs: totalCS,
          csPerMin: (totalCS / durationMin).toFixed(1),
        };
      })
    );

    return NextResponse.json({
      name: `${account.gameName}#${account.tagLine}`,
      level: summoner.summonerLevel,
      profileIconId: summoner.profileIconId,
      regionName: selectedRegionName,
      league: leagueData, // Retornar array completo para a página
      wins: totalWins,
      losses: totalLosses,
      matches: matches,
    });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
