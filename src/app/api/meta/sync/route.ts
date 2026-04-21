import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

export async function GET() {
  try {
    console.log("--- INICIANDO SINCRONIZAÇÃO AUTOMÁTICA (LEAGUE OF GRAPHS) ---");
    
    // 1. Fetch live data
    const response = await fetch('https://www.leagueofgraphs.com/champions/tier-list', {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 0 } // Disable cache
    });

    if (!response.ok) {
      throw new Error(`Falha ao buscar dados: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    
    if (html.includes('<title>Error</title>') || html.length < 5000) {
      throw new Error('Bloqueio de bot detectado pelo League of Graphs.');
    }

    const $ = cheerio.load(html);
    const championsComponent = $('champions-component');
    const itemsJson = championsComponent.attr(':items');
    
    if (!itemsJson) {
      throw new Error('<champions-component> não encontrado ou atributo :items ausente.');
    }

    const rawChampions = JSON.parse(itemsJson);
    const champions: any[] = [];

    rawChampions.forEach((item: any) => {
      const name = item.championName;
      const role = item.role.name;
      const tier = item.tier.tier.toUpperCase();
      
      const winRate = (item.popularity.winRate * 100).toFixed(2);
      const pickRate = (item.popularity.playedPercentage * 100).toFixed(2);
      const banRate = (item.banRate * 100).toFixed(2);
      
      if (name) {
        champions.push({
          champion_name: name,
          role: role === 'MIDDLE' ? 'MID' : (role === 'BOTTOM' ? 'ADC' : role),
          tier_rank: tier,
          win_rate: parseFloat(winRate) || 0,
          pick_rate: parseFloat(pickRate) || 0,
          ban_rate: parseFloat(banRate) || 0
        });
      }
    });

    console.log(`Sucesso: ${champions.length} campeões extraídos.`);

    // 2. Atualizar Supabase (Transacional)
    // Limpar dados antigos primeiro
    await supabase.from('route_meta').delete().neq('id', 0);
    
    // Inserir novos dados em chunks
    const chunkSize = 50;
    for (let i = 0; i < champions.length; i += chunkSize) {
      const chunk = champions.slice(i, i + chunkSize);
      const { error } = await supabase.from('route_meta').insert(chunk);
      if (error) throw error;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Sincronização Meta concluída com sucesso!',
      champions_synced: champions.length
    });

  } catch (error: any) {
    console.error("Erro no Sync Automático:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      tip: "Se o bloqueio persistir, considere usar um serviço de proxy ou rodar via GitHub Actions."
    }, { status: 500 });
  }
}
