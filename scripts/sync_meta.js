require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');
const path = require('path');

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
    console.log('\x1b[36m%s\x1b[0m', '--- INICIANDO PROTOCOLO DE SINCRONIZAÇÃO NEURAL ---');
    
    try {
        let html;
        const localFile = 'tierlist.html';
        
        if (fs.existsSync(localFile)) {
            console.log(`\x1b[33m%s\x1b[0m`, `USANDO ARQUIVO LOCAL: ${localFile}`);
            html = fs.readFileSync(localFile, 'utf8');
        } else {
            console.log(`\x1b[33m%s\x1b[0m`, `TENTANDO BUSCA REMOTA...`);
            html = await fetchPage('https://www.leagueofgraphs.com/champions/tier-list');
        }

        const $ = cheerio.load(html);
        const champions = [];
        
        // Tentar extrair do componente champions-component
        const itemsJson = $('champions-component').attr(':items');
        
        if (itemsJson) {
            console.log(`\x1b[32m%s\x1b[0m`, `DADOS ENCONTRADOS NO COMPONENTE VUE. PROCESSANDO...`);
            const items = JSON.parse(itemsJson);
            
            items.forEach(item => {
                let role = (item.role.name || 'MID').toUpperCase();
                if (role === 'MIDDLE') role = 'MID';
                if (role === 'SUPPORT') role = 'SUPPORT'; // Já está correto
                
                champions.push({
                    champion_name: item.championName,
                    role: role,
                    tier_rank: item.tier.tier.toUpperCase() || 'A',
                    win_rate: (item.popularity.winRate * 100) || 0,
                    pick_rate: (item.popularity.playedPercentage * 100) || 0,
                    ban_rate: (item.banRate * 100) || 0
                });
            });
        } else {
            console.log(`\x1b[33m%s\x1b[0m`, `COMPONENTE NÃO ENCONTRADO. TENTANDO FALLBACK PARA TABELA...`);
            $('.data_table tbody tr').each((i, row) => {
                const name = $(row).find('.championName').text().trim();
                let role = $(row).find('.role').text().trim().toUpperCase();
                if (role === 'MIDDLE') role = 'MID';
                
                const tierEl = $(row).find('.tier-S, .tier-A, .tier-B, .tier-C, .tier-D, .tier-S-plus');
                const tier = tierEl.text().trim() || 'A';
                
                const winRateStr = $(row).find('.progressBarContainer.win_rate .progressBarValue').text().trim().replace('%', '');
                const pickRateStr = $(row).find('.progressBarContainer.popularity .progressBarValue').text().trim().replace('%', '');
                const banRateStr = $(row).find('.progressBarContainer.ban_rate .progressBarValue').text().trim().replace('%', '');
                
                if (name) {
                    champions.push({
                        champion_name: name,
                        role: role || 'MID',
                        tier_rank: tier,
                        win_rate: parseFloat(winRateStr) || 0,
                        pick_rate: parseFloat(pickRateStr) || 0,
                        ban_rate: parseFloat(banRateStr) || 0
                    });
                }
            });
        }


        
        if (champions.length === 0) {
            console.log(`\x1b[31m%s\x1b[0m`, `AVISO: NENHUM CAMPEÃO ENCONTRADO. VERIFIQUE OS SELETORES HTML.`);
            return;
        }

        console.log(`\x1b[32m%s\x1b[0m`, `ENCONTRADOS ${champions.length} REGISTROS. LIMPANDO TABELA...`);
        
        // Limpar tabela (estratégia clear and sync devido à falta de constraints)
        const { error: deleteError } = await supabase
            .from('route_meta')
            .delete()
            .neq('id', -1); // Deletar tudo
            
        if (deleteError) {
            console.error(`\x1b[31m%s\x1b[0m`, `ERRO AO LIMPAR TABELA:`, deleteError.message);
            return;
        }

        console.log(`\x1b[32m%s\x1b[0m`, `TABELA LIMPA. INICIANDO INSERÇÃO...`);
        
        // Split into chunks of 50 for safety
        const chunkSize = 50;
        for (let i = 0; i < champions.length; i += chunkSize) {
            const chunk = champions.slice(i, i + chunkSize);
            const { error } = await supabase
                .from('route_meta')
                .insert(chunk);
            
            if (error) {
                console.error(`\x1b[31m%s\x1b[0m`, `ERRO NO CHUNK:`, error.message);
            } else {
                console.log(`\x1b[34m%s\x1b[0m`, `INSERIDO ${Math.min(i + chunkSize, champions.length)}/${champions.length}...`);
            }
        }
        
        console.log('\x1b[35m%s\x1b[0m', '--- SINCRONIZAÇÃO CONCLUÍDA: SISTEMA OPERACIONAL ---');
        
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', 'FALHA CRÍTICA NO PROCESSO DE SINCRONIZAÇÃO:', err.message);
    }
}



syncTierList();

