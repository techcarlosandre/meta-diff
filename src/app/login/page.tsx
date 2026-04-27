'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { Lock, Mail, GitBranch, Globe, ArrowRight, ShieldCheck, Sword } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Credenciais inválidas. Verifique seu email e senha.');
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    if (error) setError(`Erro ao conectar com ${provider}`);
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-float"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 blur-[150px] rounded-full animate-float-delayed"></div>

      <div className="w-full max-w-[450px] relative animate-nova-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
            <Sword className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Protocolo de Acesso</span>
          </div>
          <h1 className="text-5xl font-black italic text-white tracking-tighter uppercase mb-4">Acessar <span className="text-primary">Elite</span></h1>
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest leading-relaxed">Conecte sua conta para sincronizar seus campeões e dados de performance.</p>
        </div>

        <div className="nova-glass border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group/field">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within/field:text-primary transition-colors" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL DE ACESSO"
                  className="w-full bg-void/50 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-[11px] font-black uppercase tracking-widest text-white focus:border-primary/50 focus:bg-void transition-all outline-none"
                  required
                />
              </div>

              <div className="relative group/field">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within/field:text-primary transition-colors" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="SENHA SECRETA"
                  className="w-full bg-void/50 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-[11px] font-black uppercase tracking-widest text-white focus:border-primary/50 focus:bg-void transition-all outline-none"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">{error}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-primary text-void font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-[0_10px_30px_rgba(0,255,204,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? 'AUTENTICANDO...' : (
                <>
                  INICIAR SESSÃO <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.5em]">
              <span className="bg-[#05070a] px-4 text-white/20">Ou conectar com</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleSocialLogin('github')}
              className="flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all group/social"
            >
              <GitBranch className="w-4 h-4 text-white group-hover/social:scale-110 transition-transform" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">Github</span>
            </button>
            <button 
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all group/social"
            >
              <Globe className="w-4 h-4 text-white group-hover/social:scale-110 transition-transform" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">Google</span>
            </button>
          </div>
        </div>

        <div className="mt-10 text-center space-y-4">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
            Ainda não tem acesso? 
            <Link href="/register" className="ml-2 text-primary hover:text-white transition-colors underline decoration-primary/30 underline-offset-4">Criar Conta de Elite</Link>
          </p>
          <div className="flex items-center justify-center gap-2 text-white/10">
            <ShieldCheck className="w-3 h-3" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em]">Criptografia de Ponta-a-Ponta Ativa</span>
          </div>
        </div>
      </div>
    </div>
  );
}
