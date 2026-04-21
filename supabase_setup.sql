-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Usuários (Integração com Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  favorite_role TEXT
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
