import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

export async function GET() {
  try {
    console.log("--- INICIANDO SINCRONIZAÇÃO TOTAL (TIER LIST + RANKING BR) ---");
    
    // 1. SINCRONIZAR TIER LIST (CAMPEÕES)
    const tierRes = await fetch('https://www.op.gg/statistics/champions', {
      headers: { 'User-Agent': USER_AGENT },
      next: { revalidate: 0 }
    });

    if (!tierRes.ok) throw new Error('Falha ao buscar Tier List');
    const tierHtml = await tierRes.text();
    
    // Obter papéis (roles) dos campeões do DataDragon (Riot)
    const ddRes = await fetch('https://ddragon.leagueoflegends.com/cdn/14.8.1/data/en_US/champion.json');
    const ddJson = await ddRes.json();
    const roleMapping: Record<string, string> = {};
    const keyToId: Record<string, string> = {};
    for (const key in ddJson.data) {
      const champ = ddJson.data[key];
      const tags = champ.tags || [];
      let mappedRole = 'MID';
      if (tags.includes('Marksman')) mappedRole = 'ADC';
      else if (tags.includes('Support')) mappedRole = 'SUPPORT';
      else if (tags.includes('Mage')) mappedRole = 'MID';
      else if (tags.includes('Assassin')) mappedRole = 'JUNGLE';
      else if (tags.includes('Fighter') || tags.includes('Tank')) mappedRole = 'TOP';
      roleMapping[champ.id] = mappedRole;
      keyToId[champ.id.toLowerCase()] = champ.id;
    }

    const champions: any[] = [];
    const unescapedHtml = tierHtml.replace(/\\"/g, '"');
    const matchIndex = unescapedHtml.indexOf('[{"champion":{"image_url"');
    
    if (matchIndex !== -1) {
      const endBracketIndex = unescapedHtml.indexOf('}]', matchIndex);
      if (endBracketIndex !== -1) {
        let jsonStr = unescapedHtml.substring(matchIndex, endBracketIndex + 2);
        try {
          const raw = JSON.parse(jsonStr);
          raw.forEach((item: any) => {
            let tier = 'A';
            if (item.win_rate >= 52) tier = 'S';
            else if (item.win_rate >= 50.5) tier = 'A';
            else if (item.win_rate >= 49) tier = 'B';
            else if (item.win_rate >= 47.5) tier = 'C';
            else tier = 'D';

            let champId = keyToId[item.champion.key] || item.champion.name;
            let role = roleMapping[champId] || 'MID';

            champions.push({
              champion_name: champId,
              role: role,
              tier_rank: tier,
              win_rate: parseFloat((typeof item.win_rate === 'number' ? item.win_rate : 0).toFixed(2)),
              pick_rate: parseFloat((typeof item.pick_rate === 'number' ? item.pick_rate : 0).toFixed(2)),
              ban_rate: parseFloat((typeof item.ban_rate === 'number' ? item.ban_rate : 0).toFixed(2))
            });
          });
        } catch(e) {
          console.error("Failed to parse JSON:", e);
        }
      }
    }
    
    if (champions.length === 0) throw new Error('Falha ao processar Campeões do OP.GG');

    // 2. SINCRONIZAR LÍDERES (RANKING BR)
    const rankRes = await fetch('https://www.op.gg/leaderboards/tier?region=br', {
      headers: { 'User-Agent': USER_AGENT },
      next: { revalidate: 0 }
    });

    if (!rankRes.ok) throw new Error('Falha ao buscar Ranking BR');
    const rankHtml = await rankRes.text();
    const $rank = cheerio.load(rankHtml);
    const leaders: any[] = [];

    $rank('table tbody tr').each((i, row) => {
      if (i >= 5) return;
      const name = $rank(row).find('td:nth-child(2) strong').text().trim() || $rank(row).find('td:nth-child(2) span.text-gray-900').text().trim();
      const tag = $rank(row).find('td:nth-child(2) span.text-gray-500').text().replace('#', '').trim();
      let winRate = $rank(row).find('td:last-child').text().trim();
      
      // Clean winRate (e.g. "257W182L59%" -> "59")
      const wrMatch = winRate.match(/(\d+)%/);
      if (wrMatch) winRate = wrMatch[1];

      if (name) {
        leaders.push({
          summoner_name: name,
          tag_line: tag || 'BR1',
          win_rate: winRate || '50%',
          rank: (i + 1).toString()
        });
      }
    });

    // 3. ATUALIZAR BANCO DE DADOS (SUPABASE)
    console.log(`Dados processados: ${champions.length} campeões e ${leaders.length} líderes.`);

    // Atualizar Meta Champions
    if (champions.length > 0) {
      const { error: delError } = await supabase.from('route_meta').delete().neq('id', -1);
      if (delError) throw delError;

      const chunkSize = 50;
      for (let i = 0; i < champions.length; i += chunkSize) {
        const { error: insError } = await supabase.from('route_meta').insert(champions.slice(i, i + chunkSize));
        if (insError) throw insError;
      }
    }

    // Atualizar Líderes Diários
    if (leaders.length > 0) {
      const { error: delError } = await supabase.from('daily_leaders').delete().neq('rank', '999');
      if (delError) throw delError;

      const { error: insError } = await supabase.from('daily_leaders').insert(leaders);
      if (insError) throw insError;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Sincronização completa realizada!',
      stats: { champions: champions.length, leaders: leaders.length }
    });

  } catch (error: any) {
    console.error("Erro na Automação Diária:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

