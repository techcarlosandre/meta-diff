'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Settings, 
  Star, 
  Shield, 
  LogOut, 
  ChevronRight, 
  Sword, 
  Activity,
  Search,
  Trash2,
  Lock,
  Zap,
  Mail,
  Key,
  Save,
  X,
  UserCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [trackedSummoners, setTrackedSummoners] = useState<any[]>([]);
  
  // States para edição
  const [showSettings, setShowSettings] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [updateMsg, setUpdateMsg] = useState({ type: '', text: '' });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function getProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);
      setNewName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '');
      setNewEmail(session.user.email || '');
      
      const { data: favs } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', session.user.id);
      
      setFavorites(favs || []);

      const { data: summons } = await supabase
        .from('favorite_summoners')
        .select('*')
        .eq('user_id', session.user.id);
      
      setTrackedSummoners(summons || []);
      setLoading(false);
    }

    getProfile();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setUpdateMsg({ type: 'error', text: 'Você deve inserir a senha atual para confirmar.' });
      return;
    }

    setUpdating(true);
    setUpdateMsg({ type: '', text: '' });

    try {
      // 1. Validar senha atual re-autenticando
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (authError) {
        throw new Error('Senha atual incorreta. Acesso negado.');
      }

      // 2. Processar atualizações
      const updates: any = {
        data: { full_name: newName }
      };

      if (newPassword) updates.password = newPassword;
      if (newEmail !== user.email) updates.email = newEmail;

      const { error: updateError } = await supabase.auth.updateUser(updates);

      if (updateError) throw updateError;

      setUpdateMsg({ type: 'success', text: 'Protocolo atualizado com sucesso!' });
      setNewPassword('');
      setCurrentPassword('');
      
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      setUser(updatedUser);
      
    } catch (err: any) {
      setUpdateMsg({ type: 'error', text: err.message });
    } finally {
      setUpdating(false);
    }
  };

  const removeFavorite = async (id: string, table: string) => {
    await supabase.from(table).delete().eq('id', id);
    if (table === 'favorites') {
      setFavorites(prev => prev.filter(f => f.id !== id));
    } else {
      setTrackedSummoners(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] animate-pulse">Sincronizando Perfil de Elite...</span>
        </div>
      </div>
    );
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0];

  return (
    <main className="min-h-screen bg-void pt-32 pb-20 px-6 sm:px-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-secondary/5 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-[1200px] mx-auto relative z-10">
        
        {/* HEADER PERFIL */}
        <div className="glass-card rounded-[3rem] p-8 sm:p-12 border border-white/5 mb-12 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-50 pointer-events-none"></div>
          
          <div className="relative shrink-0 z-10">
             <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-primary/20 p-2 relative group-hover:border-primary transition-all duration-700">
                <div className="w-full h-full rounded-full bg-void overflow-hidden flex items-center justify-center border border-white/10 shadow-2xl">
                   <User className="w-16 h-16 sm:w-20 sm:h-20 text-white/20 group-hover:text-primary transition-colors" />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-void text-[10px] font-black uppercase tracking-widest rounded-full shadow-glow">ELITE</div>
             </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4 relative z-10">
             <div>
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                   <Shield className="w-4 h-4 text-primary" />
                   <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Membro Verificado</span>
                </div>
                <h1 className="text-[clamp(2rem,6vw,4.5rem)] font-black italic text-white tracking-tighter uppercase leading-[0.9] break-words">
                   {displayName}
                </h1>
                <p className="text-sm font-medium text-white/30 tracking-widest mt-2">{user?.email}</p>
             </div>
             
             <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                   <Star className="w-4 h-4 text-secondary" />
                   <span className="text-[11px] font-black text-white uppercase tracking-widest">{favorites.length} Favoritos</span>
                </div>
                <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                   <Activity className="w-4 h-4 text-primary" />
                   <span className="text-[11px] font-black text-white uppercase tracking-widest">{trackedSummoners.length} Rastreados</span>
                </div>
             </div>
          </div>

          <div className="flex flex-col gap-3 shrink-0 relative z-20">
             <button 
               onClick={() => setShowSettings(true)}
               className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] hover:bg-primary hover:text-void transition-all flex items-center justify-center gap-3 cursor-pointer"
             >
                <UserCircle className="w-4 h-4" /> Editar Perfil
             </button>
             <button 
                onClick={handleLogout} 
                className="px-8 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black text-red-500 uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3 cursor-pointer"
             >
                <LogOut className="w-4 h-4" /> Finalizar Sessão
             </button>
          </div>
        </div>

        {/* MODAL EDITAR PERFIL */}
        {showSettings && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-void/95 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
            <div className="w-full max-w-lg glass-card rounded-[3rem] border border-white/10 p-8 sm:p-10 shadow-[0_0_150px_rgba(0,0,0,1)] relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>
               
               <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Sincronizar Dados</h2>
                  <button onClick={() => { setShowSettings(false); setUpdateMsg({type:'', text:''}); }} className="p-3 bg-white/5 rounded-xl hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-all cursor-pointer">
                     <X className="w-5 h-5" />
                  </button>
               </div>

               <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center gap-4 mb-8">
                  <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                  <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest leading-relaxed">
                     Por segurança, insira sua <span className="text-yellow-500">Senha Atual</span> para confirmar qualquer alteração.
                  </p>
               </div>

               <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-2">Nome de Exibição</label>
                        <div className="relative group">
                           <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                           <input 
                              type="text"
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              className="w-full bg-void/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-xs font-bold text-white outline-none focus:border-primary/50 transition-all"
                              placeholder="SEU NOME"
                           />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-2">E-mail de Acesso</label>
                        <div className="relative group">
                           <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                           <input 
                              type="email"
                              value={newEmail}
                              onChange={(e) => setNewEmail(e.target.value)}
                              className="w-full bg-void/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-xs font-bold text-white outline-none focus:border-primary/50 transition-all"
                              placeholder="SEU EMAIL"
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-2">Senha Atual *</label>
                           <div className="relative group">
                              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-yellow-500 transition-colors" />
                              <input 
                                 type="password"
                                 value={currentPassword}
                                 onChange={(e) => setCurrentPassword(e.target.value)}
                                 className="w-full bg-void/50 border border-yellow-500/20 rounded-2xl py-4 pl-14 pr-6 text-xs font-bold text-white outline-none focus:border-yellow-500/50 transition-all shadow-[0_0_15px_rgba(234,179,8,0.05)]"
                                 placeholder="••••••••"
                                 required
                              />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-2">Nova Senha</label>
                           <div className="relative group">
                              <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                              <input 
                                 type="password"
                                 value={newPassword}
                                 onChange={(e) => setNewPassword(e.target.value)}
                                 className="w-full bg-void/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-xs font-bold text-white outline-none focus:border-primary/50 transition-all"
                                 placeholder="NOVA SENHA"
                              />
                           </div>
                        </div>
                     </div>
                  </div>

                  {updateMsg.text && (
                     <div className={`p-4 rounded-xl text-center border animate-in slide-in-from-top-2 ${updateMsg.type === 'success' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        <span className="text-[10px] font-bold uppercase tracking-widest">{updateMsg.text}</span>
                     </div>
                  )}

                  <button 
                     type="submit"
                     disabled={updating}
                     className="w-full py-5 bg-primary text-void font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-glow hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
                  >
                     {updating ? 'AUTENTICANDO...' : (
                        <>
                           CONFIRMAR E SALVAR <Save className="w-4 h-4" />
                        </>
                     )}
                  </button>
               </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           
           {/* FAVORITOS */}
           <section className="glass-card rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group/favs">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <div className="w-2 h-8 bg-secondary blur-[1px]"></div>
                    <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">Campeões Elite</h2>
                 </div>
                 <Zap className="w-5 h-5 text-secondary animate-pulse" />
              </div>

              <div className="space-y-4">
                 {favorites.length > 0 ? (
                    favorites.map((fav) => (
                       <div key={fav.id} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl group/item hover:bg-white/[0.05] hover:border-secondary/30 transition-all duration-500">
                          <Link href={`/champion/${(fav.champion_name || fav.champion_id || '').toLowerCase()}`} className="flex items-center gap-4 flex-1">
                             <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
                                <img src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/${fav.champion_name || fav.champion_id}.png`} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform" alt="" />
                             </div>
                             <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">{fav.champion_name || fav.champion_id}</h3>
                                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">Sincronizado via Supabase</p>
                             </div>
                          </Link>
                          <button 
                            onClick={() => removeFavorite(fav.id, 'favorites')}
                            className="p-3 text-white/10 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    ))
                 ) : (
                    <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                       <Lock className="w-8 h-8 text-white/5 mx-auto mb-4" />
                       <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Nenhum campeão selecionado para a Elite.</p>
                    </div>
                 )}
              </div>
           </section>

           {/* RASTREADOS */}
           <section className="glass-card rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group/track">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <div className="w-2 h-8 bg-primary blur-[1px]"></div>
                    <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">Invocadores Rastreados</h2>
                 </div>
                 <Search className="w-5 h-5 text-primary" />
              </div>

              <div className="space-y-4">
                 {trackedSummoners.length > 0 ? (
                    trackedSummoners.map((sum) => (
                       <div key={sum.id} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl group/item hover:bg-white/[0.05] hover:border-primary/30 transition-all duration-500">
                          <div className="flex items-center gap-4 flex-1">
                             <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                                <User className="w-6 h-6 text-primary" />
                             </div>
                             <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">{sum.summoner_name} <span className="text-primary/50 text-[10px]">#{sum.tag_line}</span></h3>
                                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">Região: {sum.region || 'BR1'}</p>
                             </div>
                          </div>
                          <button 
                            onClick={() => removeFavorite(sum.id, 'favorite_summoners')}
                            className="p-3 text-white/10 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    ))
                 ) : (
                    <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                       <Search className="w-8 h-8 text-white/5 mx-auto mb-4" />
                       <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Nenhum invocador sob monitoramento tático.</p>
                    </div>
                 )}
              </div>
           </section>

        </div>
      </div>
    </main>
  );
}
