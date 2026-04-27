import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

export async function GET() {
  try {
    console.log("--- INICIANDO SINCRONIZAÇÃO TOTAL (TIER LIST + RANKING BR) ---");
    
    // 1. SINCRONIZAR TIER LIST (CAMPEÕES)
    const tierRes = await fetch('https://www.leagueofgraphs.com/champions/tier-list', {
      headers: { 'User-Agent': USER_AGENT },
      next: { revalidate: 0 }
    });

    if (!tierRes.ok) throw new Error('Falha ao buscar Tier List');
    const tierHtml = await tierRes.text();
    const $tier = cheerio.load(tierHtml);
    const itemsJson = $tier('champions-component').attr(':items');
    
    const champions: any[] = [];
    if (itemsJson) {
      const raw = JSON.parse(itemsJson);
      raw.forEach((item: any) => {
        let role = (item.role.name || 'MID').toUpperCase();
        if (role === 'MIDDLE') role = 'MID';
        if (role === 'BOTTOM') role = 'ADC';

        champions.push({
          champion_name: item.championName,
          role: role,
          tier_rank: item.tier.tier.toUpperCase() || 'A',
          win_rate: parseFloat((item.popularity.winRate * 100).toFixed(2)) || 0,
          pick_rate: parseFloat((item.popularity.playedPercentage * 100).toFixed(2)) || 0,
          ban_rate: parseFloat((item.banRate * 100).toFixed(2)) || 0
        });
      });
    }

    // 2. SINCRONIZAR LÍDERES (RANKING BR)
    const rankRes = await fetch('https://www.leagueofgraphs.com/rankings/summoners/br', {
      headers: { 'User-Agent': USER_AGENT },
      next: { revalidate: 0 }
    });

    if (!rankRes.ok) throw new Error('Falha ao buscar Ranking BR');
    const rankHtml = await rankRes.text();
    const $rank = cheerio.load(rankHtml);
    const leaders: any[] = [];

    $rank('table.data_table tr:not(.header)').each((i, row) => {
      if (i >= 5) return;
      const fullText = $rank(row).find('td:nth-child(2) .name span').text().trim();
      const winRateCell = $rank(row).find('td:nth-child(3)').text().trim();
      const [name, tag] = fullText.split('#');
      const winRateMatch = winRateCell.match(/\((\d+\.?\d*)%\)/);
      
      if (name && tag) {
        leaders.push({
          summoner_name: name.trim(),
          tag_line: tag.trim(),
          win_rate: winRateMatch ? winRateMatch[1] + '%' : '50%',
          rank: (i + 1).toString()
        });
      }
    });

    // 3. ATUALIZAR BANCO DE DADOS (SUPABASE)
    console.log(`Dados processados: ${champions.length} campeões e ${leaders.length} líderes.`);

    // Atualizar Meta Champions
    if (champions.length > 0) {
      await supabase.from('route_meta').delete().neq('id', -1);
      const chunkSize = 50;
      for (let i = 0; i < champions.length; i += chunkSize) {
        await supabase.from('route_meta').insert(champions.slice(i, i + chunkSize));
      }
    }

    // Atualizar Líderes Diários
    if (leaders.length > 0) {
      await supabase.from('daily_leaders').delete().neq('rank', '999');
      await supabase.from('daily_leaders').insert(leaders);
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

