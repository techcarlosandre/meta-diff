-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Usuários (Integração com Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  favorite_role TEXT,
  riot_name TEXT,
  riot_tag TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cache de Invocadores para evitar Rate Limit
CREATE TABLE IF NOT EXISTS summoner_cache (
  riot_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT,
  rank TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Estatísticas de Meta por Rota
CREATE TABLE IF NOT EXISTS route_meta (
  id SERIAL PRIMARY KEY,
  champion_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT')),
  win_rate DECIMAL NOT NULL,
  pick_rate DECIMAL,
  ban_rate DECIMAL DEFAULT 0,
  tier_rank TEXT DEFAULT 'A' -- S+, S, A, B, C
);

-- Tabela de Favoritos
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  champion_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, champion_id)
);

-- Habilitar RLS (Segurança)
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios favoritos
CREATE POLICY "Users can view their own favorites" 
ON favorites FOR SELECT 
USING (auth.uid() = user_id);

-- Política: Usuários podem inserir seus próprios favoritos
CREATE POLICY "Users can insert their own favorites" 
ON favorites FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar seus próprios favoritos
CREATE POLICY "Users can delete their own favorites" 
ON favorites FOR DELETE 
USING (auth.uid() = user_id);

-- Tabela de Invocadores Favoritos
CREATE TABLE IF NOT EXISTS favorite_summoners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  summoner_name TEXT NOT NULL,
  tag_line TEXT NOT NULL,
  region TEXT DEFAULT 'br1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, summoner_name, tag_line)
);

ALTER TABLE favorite_summoners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own fav summoners" ON favorite_summoners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own fav summoners" ON favorite_summoners FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own fav summoners" ON favorite_summoners FOR DELETE USING (auth.uid() = user_id);

-- Tabela de Líderes Diários (Atualizada pela automação)
CREATE TABLE IF NOT EXISTS daily_leaders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  summoner_name TEXT NOT NULL,
  tag_line TEXT NOT NULL,
  win_rate TEXT,
  rank TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE daily_leaders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view daily leaders" ON daily_leaders FOR SELECT USING (true);


