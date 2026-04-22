require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSelect() {
    console.log('Testando SELECT em daily_leaders...');
    const { data, error } = await supabase.from('daily_leaders').select('*');
    if (error) {
        console.error('Erro no SELECT:', error.message);
    } else {
        console.log('SELECT OK! Itens encontrados:', data.length);
    }
}

testSelect();
