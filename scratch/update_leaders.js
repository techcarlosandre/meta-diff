require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const leaders = [
  {
    "summoner_name": "Enga",
    "tag_line": "PUNGA",
    "win_rate": "58.3%",
    "rank": "1"
  },
  {
    "summoner_name": "Kojima",
    "tag_line": "ゲツヨウビ",
    "win_rate": "59.3%",
    "rank": "2"
  },
  {
    "summoner_name": "Aithusa",
    "tag_line": "lol",
    "win_rate": "58.0%",
    "rank": "3"
  },
  {
    "summoner_name": "scuro",
    "tag_line": "blox",
    "win_rate": "58.3%",
    "rank": "4"
  },
  {
    "summoner_name": "bipi",
    "tag_line": "moes",
    "win_rate": "58.9%",
    "rank": "5"
  }
];

async function updateLeaders() {
    console.log('Iniciando atualização dos líderes...');
    
    // Deletar antigos
    const { error: delError } = await supabase
        .from('daily_leaders')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (delError) {
        console.error('Erro ao deletar:', delError.message);
        if (delError.message.includes('not find the table')) {
            console.log('A tabela daily_leaders não existe. Tentando criar via RPC ou sugerindo SQL...');
        }
        return;
    }

    // Inserir novos
    const { data, error: insError } = await supabase
        .from('daily_leaders')
        .insert(leaders);
    
    if (insError) {
        console.error('Erro ao inserir:', insError.message);
        return;
    }

    console.log('Líderes atualizados com sucesso!');
}

updateLeaders();
