import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const apiKey = process.env.RIOT_API_KEY;

  if (!apiKey) {
    console.error('ERROR: RIOT_API_KEY is missing from environment variables.');
    return NextResponse.json({ error: 'Riot API Key not configured' }, { status: 500 });
  }

  // Next.js 15+ handles params as a Promise. UNWRAP it first.
  const resolvedParams = await params;
  const nameParam = resolvedParams.name;

  if (!nameParam) {
    return NextResponse.json({ error: 'Name parameter is required' }, { status: 400 });
  }

  // Parse Name and Tag (Handling Name#Tag or Name-Tag)
  const decoded = decodeURIComponent(nameParam);
  let gameName = '';
  let tagLine = '';

  if (decoded.includes('#')) {
    [gameName, tagLine] = decoded.split('#');
  } else if (decoded.includes('-')) {
    // Identifica o último traço como o separador da Tag (ex: Lee-Sin-BR1 -> Lee-Sin e BR1)
    const lastDashIndex = decoded.lastIndexOf('-');
    gameName = decoded.substring(0, lastDashIndex);
    tagLine = decoded.substring(lastDashIndex + 1);
  } else {
    gameName = decoded;
    tagLine = 'BR1';
  }

  if (!gameName || !tagLine) {
    return NextResponse.json({ error: 'Formato inválido. Use Nome#Tag' }, { status: 400 });
  }

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
    console.log(`Fetching account: ${gameName}#${tagLine} on ${selectedRouting}`);
    const accountRes = await fetch(
      `https://${selectedRouting}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}?api_key=${apiKey}`,
      { cache: 'no-store' }
    );

    if (!accountRes.ok) {
      const errData = await accountRes.json().catch(() => ({}));
      console.error('Account-V1 Error:', accountRes.status, errData);
      return NextResponse.json({ 
        error: accountRes.status === 403 ? 'Chave de API inválida ou expirada.' : 'Conta não encontrada. Use o formato Nome#Tag.' 
      }, { status: accountRes.status });
    }
    
    const account = await accountRes.json();
    const puuid = account.puuid;

    // 2. Get Summoner Data via Summoner-V4
    const summRes = await fetch(
      `https://${selectedRegion}/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${apiKey}`,
      { cache: 'no-store' }
    );
    
    if (!summRes.ok) {
      console.error('Summoner-V4 Error:', summRes.status);
      return NextResponse.json({ error: 'Dados do invocador não encontrados.' }, { status: 404 });
    }
    
    const summoner = await summRes.json();

    // 3. Get League Data via League-V4
    const leagueRes = await fetch(
      `https://${selectedRegion}/lol/league/v4/entries/by-puuid/${puuid}?api_key=${apiKey}`,
      { cache: 'no-store' }
    );
    
    if (!leagueRes.ok) {
        console.error('League-V4 Error:', leagueRes.status);
        return NextResponse.json({ error: 'Dados de ranking não encontrados.' }, { status: 404 });
    }

    const leagueData = await leagueRes.json();
    
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

    // 5. Get Match History (Match-V5)
    const matchIdsRes = await fetch(
      `https://${selectedRouting}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=10${startTime}&api_key=${apiKey}`,
      { cache: 'no-store' }
    );

    if (!matchIdsRes.ok) {
      console.error('Match-V5 IDs Error:', matchIdsRes.status);
      // Return partial data if matches fail
      return NextResponse.json({
        name: `${account.gameName}#${account.tagLine}`,
        level: summoner.summonerLevel,
        profileIconId: summoner.profileIconId,
        regionName: selectedRegionName,
        league: leagueData,
        wins: totalWins,
        losses: totalLosses,
        matches: [],
      });
    }

    const matchIds = await matchIdsRes.json();

    const matches = await Promise.all(
      (Array.isArray(matchIds) ? matchIds : []).map(async (id: string) => {
        try {
          const matchDetailRes = await fetch(
            `https://${selectedRouting}/lol/match/v5/matches/${id}?api_key=${apiKey}`,
            { cache: 'no-store' }
          );
          if (!matchDetailRes.ok) return null;

          const detail = await matchDetailRes.json();
          const participant = detail.info.participants.find((p: any) => p.puuid === puuid);
          if (!participant) return null;

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
        } catch (e) {
          console.error(`Error fetching match ${id}:`, e);
          return null;
        }
      })
    );

    return NextResponse.json({
      name: `${account.gameName}#${account.tagLine}`,
      level: summoner.summonerLevel,
      profileIconId: summoner.profileIconId,
      regionName: selectedRegionName,
      league: leagueData,
      wins: totalWins,
      losses: totalLosses,
      matches: matches.filter(m => m !== null),
    }, {
      headers: {
        'Cache-Control': 's-maxage=120, stale-while-revalidate=60'
      }
    });
  } catch (error) {
    console.error("CRITICAL API Route Error:", error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}


