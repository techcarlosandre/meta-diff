require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSelectMeta() {
    console.log('Testando SELECT em route_meta...');
    const { data, error } = await supabase.from('route_meta').select('*').limit(1);
    if (error) {
        console.error('Erro no SELECT:', error.message);
    } else {
        console.log('SELECT OK! Item:', data[0]?.champion_name);
    }
}

testSelectMeta();
