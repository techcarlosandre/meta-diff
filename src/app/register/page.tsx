'use client';
import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Lock, Mail, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Conta criada! Verifique seu email para confirmar.' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-secondary to-primary rounded-3xl blur opacity-20 animate-pulse"></div>
        
        <div className="relative bg-surface p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black tracking-tighter mb-2 italic">
              CRIAR <span className="text-secondary">CONTA</span>
            </h1>
            <p className="text-muted text-[10px] font-black uppercase tracking-[0.3em]">Junte-se à elite do meta</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Email</label>
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-void border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-secondary transition-all text-white"
                  placeholder="seu@email.com"
                  required
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-secondary transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Senha</label>
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-void border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-secondary transition-all text-white"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-secondary transition-colors" />
              </div>
            </div>

            {message && (
              <p className={`text-[10px] font-black text-center p-3 rounded-lg ${message.type === 'error' ? 'bg-red-400/10 text-red-400 border border-red-400/20' : 'bg-secondary/10 text-secondary border border-secondary/20'}`}>
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary text-void py-4 rounded-xl font-black uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-secondary/20"
            >
              {loading ? 'SINCRO...' : (
                <>
                  Começar agora
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-[10px] font-black text-muted uppercase tracking-widest">
            Já tem uma conta? <Link href="/login" className="text-secondary hover:underline">Fazer login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
