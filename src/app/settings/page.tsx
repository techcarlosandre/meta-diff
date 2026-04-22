'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { User, Shield, Key, Mail, Save, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    username: '',
    riot_name: '',
    riot_tag: '',
  });
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setEmail(user.email || '');
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setProfile({
            username: data.username || '',
            riot_name: data.riot_name || '',
            riot_tag: data.riot_tag || '',
          });
        } else if (error && error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          await supabase.from('profiles').insert([{ id: user.id }]);
        }
      }
      setLoading(false);
    }
    getProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: profile.username,
          riot_name: profile.riot_name,
          riot_tag: profile.riot_tag,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso! Reiniciando para aplicar...' });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao atualizar perfil.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      setMessage({ type: 'success', text: 'E-mail atualizado! Verifique sua caixa de entrada para confirmar.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao atualizar e-mail.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' });
      return;
    }
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Senha atualizada com sucesso!' });
      setNewPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao atualizar senha.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="nova-glass p-12 rounded-[3rem] text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-white mb-4 uppercase italic">Acesso Restrito</h2>
          <p className="text-muted text-sm mb-8 font-bold uppercase tracking-widest">Você precisa estar autenticado para acessar esta área.</p>
          <Link href="/login" className="bg-primary text-void px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs">Fazer Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pb-40 animate-nova-in">
      <div className="mb-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-muted hover:text-primary transition-all group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Voltar ao Dashboard</span>
        </Link>
      </div>

      <header className="mb-20 text-center sm:text-left">
        <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tighter italic uppercase mb-4">
          Central de <span className="text-primary">Comando</span>
        </h1>
        <p className="text-muted text-xs font-black uppercase tracking-[0.4em] opacity-60">Gerencie sua identidade e segurança na Elite</p>
      </header>

      {message && (
        <div className={`mb-10 p-6 rounded-3xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500 ${
          message.type === 'success' ? 'bg-primary/10 border border-primary/20 text-primary' : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          <span className="text-xs font-black uppercase tracking-widest">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* SEÇÃO: PERFIL */}
        <section className="nova-glass-light nova-border-glow p-10 rounded-[3rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <User className="w-32 h-32 text-primary" />
          </div>
          
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-black text-white italic uppercase tracking-tighter text-glow-primary">Perfil do Invocador</h2>
            </div>
            </div>

          <form onSubmit={handleUpdateProfile} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-muted uppercase tracking-[0.3em] ml-2">Nome de Exibição</label>
              <input 
                type="text"
                value={profile.username}
                onChange={(e) => setProfile({...profile, username: e.target.value})}
                placeholder="Seu nome no dashboard"
                className="w-full bg-void/50 border border-white/5 rounded-2xl p-5 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted/20"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-3">
                <label className="text-[10px] font-black text-muted uppercase tracking-[0.3em] ml-2">Nome Riot</label>
                <input 
                  type="text"
                  value={profile.riot_name}
                  onChange={(e) => setProfile({...profile, riot_name: e.target.value})}
                  placeholder="Ex: Carlos André"
                  className="w-full bg-void/50 border border-white/5 rounded-2xl p-5 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted/20"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted uppercase tracking-[0.3em] ml-2">Tag</label>
                <input 
                  type="text"
                  value={profile.riot_tag}
                  onChange={(e) => setProfile({...profile, riot_tag: e.target.value})}
                  placeholder="MALVA"
                  className="w-full bg-void/50 border border-white/5 rounded-2xl p-5 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted/20"
                />
              </div>
            </div>

            <button 
              disabled={saving}
              className="w-full bg-primary hover:bg-primary/90 text-void py-5 rounded-[1.8rem] font-black uppercase tracking-[0.3em] text-[10px] transition-all flex items-center justify-center gap-3 shadow-glow-primary hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {saving ? <div className="w-4 h-4 border-2 border-void/20 border-t-void rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
              Salvar Alterações
            </button>
          </form>
        </section>

        {/* SEÇÃO: SEGURANÇA */}
        <div className="space-y-12">
          {/* E-MAIL */}
          <section className="nova-glass-light border border-white/5 p-10 rounded-[3rem] relative group">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center border border-secondary/30">
                <Mail className="w-5 h-5 text-secondary" />
              </div>
              <h2 className="text-xl font-black text-white italic uppercase tracking-tighter text-glow-secondary">E-mail</h2>
            </div>

            <form onSubmit={handleUpdateEmail} className="space-y-8">
              <div className="space-y-3">
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-void/50 border border-white/5 rounded-2xl p-5 text-sm font-bold text-white focus:outline-none focus:border-secondary/50 transition-all"
                />
              </div>
              <button 
                disabled={saving}
                className="w-full bg-secondary hover:bg-secondary/90 text-void py-5 rounded-[1.8rem] font-black uppercase tracking-[0.3em] text-[10px] transition-all shadow-glow-secondary disabled:opacity-50"
              >
                {saving ? 'Atualizando...' : 'Atualizar E-mail'}
              </button>
            </form>
          </section>

          {/* SENHA */}
          <section className="nova-glass-light border border-white/5 p-10 rounded-[3rem] relative group">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 rounded-xl bg-muted/10 flex items-center justify-center border border-white/10">
                <Key className="w-5 h-5 text-muted" />
              </div>
              <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Alterar Senha</h2>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-8">
              <div className="space-y-3">
                <input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nova senha (min. 6 caracteres)"
                  className="w-full bg-void/50 border border-white/5 rounded-2xl p-5 text-sm font-bold text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-muted/20"
                />
              </div>
              <button 
                disabled={saving}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-5 rounded-[1.8rem] font-black uppercase tracking-[0.3em] text-[10px] transition-all disabled:opacity-50"
              >
                {saving ? 'Atualizando...' : 'Atualizar Senha'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
