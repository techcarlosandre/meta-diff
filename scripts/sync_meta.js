require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

async function fetchPage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function syncTierList() {
    console.log('\x1b[36m%s\x1b[0m', '--- [1/2] SINCRONIZANDO TIER LIST DE CAMPEÕES ---');
    try {
        const html = await fetchPage('https://www.leagueofgraphs.com/champions/tier-list');
        const $ = cheerio.load(html);
        const champions = [];
        
        const itemsJson = $('champions-component').attr(':items');
        if (itemsJson) {
            const items = JSON.parse(itemsJson);
            items.forEach(item => {
                let role = (item.role.name || 'MID').toUpperCase();
                if (role === 'MIDDLE') role = 'MID';
                champions.push({
                    champion_name: item.championName,
                    role: role,
                    tier_rank: item.tier.tier.toUpperCase() || 'A',
                    win_rate: (item.popularity.winRate * 100) || 0,
                    pick_rate: (item.popularity.playedPercentage * 100) || 0,
                    ban_rate: (item.banRate * 100) || 0
                });
            });
        }

        if (champions.length > 0) {
            await supabase.from('route_meta').delete().neq('id', -1);
            const chunkSize = 50;
            for (let i = 0; i < champions.length; i += chunkSize) {
                await supabase.from('route_meta').insert(champions.slice(i, i + chunkSize));
            }
            console.log(`\x1b[32m%s\x1b[0m`, `CAMPEÕES ATUALIZADOS: ${champions.length}`);
        }
    } catch (err) {
        console.error('ERRO TIER LIST:', err.message);
    }
}

async function syncDailyLeaders() {
    console.log('\x1b[36m%s\x1b[0m', '--- [2/2] BUSCANDO LÍDERES DE WINRATE (TOP 5) ---');
    try {
        const html = await fetchPage('https://www.leagueofgraphs.com/rankings/summoners/br');
        const $ = cheerio.load(html);
        const leaders = [];

        $('table.data_table tr:not(.header)').each((i, row) => {
            if (i >= 5) return;
            const fullText = $(row).find('td:nth-child(2) .name span').text().trim();
            const winRateCell = $(row).find('td:nth-child(3)').text().trim();
            const [name, tag] = fullText.split('#');
            const winRateMatch = winRateCell.match(/\((\d+\.?\d*)%\)/);
            if (name && tag) {
                leaders.push({
                    summoner_name: name,
                    tag_line: tag,
                    win_rate: winRateMatch ? winRateMatch[1] + '%' : '??%',
                    rank: (i + 1).toString()
                });
            }
        });

        if (leaders.length > 0) {
            await supabase.from('daily_leaders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('daily_leaders').insert(leaders);
            console.log(`\x1b[32m%s\x1b[0m`, `LÍDERES ATUALIZADOS: ${leaders.length}`);
        }
    } catch (err) {
        console.error('ERRO LÍDERES:', err.message);
    }
}

async function runFullSync() {
    console.log('\x1b[35m%s\x1b[0m', '=== INICIANDO ATUALIZAÇÃO DIÁRIA DO SISTEMA ===');
    await syncTierList();
    await syncDailyLeaders();
    console.log('\x1b[35m%s\x1b[0m', '=== SISTEMA ATUALIZADO E OPERACIONAL ===');
}

runFullSync();
