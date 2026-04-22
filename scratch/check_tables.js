require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    const tables = ['route_meta', 'daily_leaders', 'favorites', 'favorite_summoners'];
    for (const table of tables) {
        const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        if (error) {
            console.log(`Tabela [${table}]: ERRO - ${error.message}`);
        } else {
            console.log(`Tabela [${table}]: OK`);
        }
    }
}

checkTables();
