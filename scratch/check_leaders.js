require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLeaders() {
    const { data: leaders, error } = await supabase
        .from('daily_leaders')
        .select('*')
        .order('rank', { ascending: true });
    
    if (error) {
        console.error('Erro:', error);
        return;
    }
    
    if (!leaders || leaders.length === 0) {
        console.log('Tabela daily_leaders está vazia (usando placeholders no frontend).');
    } else {
        console.log('Líderes atuais no banco de dados:');
        leaders.forEach(l => {
            console.log(`${l.rank}. ${l.summoner_name}#${l.tag_line} - Winrate: ${l.win_rate}`);
        });
    }
}

checkLeaders();
