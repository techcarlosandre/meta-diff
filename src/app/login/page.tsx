'use client';
import { useState } from 'react';
import { Lock, User, Code, Zap, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      window.location.href = '/';
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Erro ao logar com Google:', error);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -ml-64 -mt-64"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] -mr-64 -mb-64"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-surface/40 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 shadow-3xl">
          <div className="text-center mb-8">
            <div className="mb-6 flex flex-col items-center">
              <div className="text-5xl font-black tracking-tighter italic flex items-center gap-1">
                <span className="text-primary drop-shadow-[0_0_15px_rgba(0,255,242,0.4)]">META</span>
                <span className="text-secondary drop-shadow-[0_0_15px_rgba(255,174,0,0.4)]">DIFF</span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-[2px] w-8 bg-gradient-to-r from-transparent to-primary"></div>
                <p className="text-[11px] font-black text-white/80 uppercase tracking-[0.4em] italic">
                  Surrender não é opção
                </p>
                <div className="h-[2px] w-8 bg-gradient-to-l from-transparent to-secondary"></div>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">Email do Invocador</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:border-primary transition-all underline-none"
                  placeholder="Seu email..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">Chave de Segurança</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:border-primary transition-all underline-none"
                  placeholder="Sua senha..."
                />
              </div>
            </div>

            {message && (
              <p className={`text-[10px] font-black text-center p-3 rounded-xl ${message.type === 'error' ? 'bg-red-400/10 text-red-400 border border-red-400/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                {message.text}
              </p>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-void font-black py-4 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'SINCRO...' : 'ENTRAR'} <ChevronRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-8">
            <div className="relative h-[1px] bg-white/5 mb-8">
              <div className="absolute inset-0 flex items-center justify-center -top-[10px]">
                <span className="bg-[#0f0f0f] px-4 text-[9px] font-black text-muted uppercase tracking-[0.3em]">Ou entre com</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all font-black text-[10px] uppercase">
                <Code className="w-4 h-4" /> Github
              </button>
              <button
                onClick={handleGoogleLogin}
                className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all font-black text-[10px] uppercase"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
            </div>
          </div>

          <p className="text-center mt-8 text-[10px] font-bold text-muted uppercase tracking-widest">
            Não tem conta? <Link href="/register" className="text-primary hover:underline">CRIAR CONTA</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
