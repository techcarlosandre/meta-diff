'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { User, LogOut, ChevronDown, Settings } from 'lucide-react';
import Link from 'next/link';

export default function UserNav() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    async function getInitialSession() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, riot_name, riot_tag')
          .eq('id', user.id)
          .single();
        if (profile) {
          setUser((prev: any) => ({ 
            ...prev, 
            display_name: profile.username,
            riot_name: profile.riot_name,
            riot_tag: profile.riot_tag
          }));
        }
      }
      setLoading(false);
    }
    
    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, riot_name, riot_tag')
          .eq('id', currentUser.id)
          .single();
        if (profile) {
          setUser((prev: any) => ({ 
            ...prev, 
            display_name: profile.username,
            riot_name: profile.riot_name,
            riot_tag: profile.riot_tag
          }));
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowMenu(false);
    window.location.reload();
  };

  if (loading) return <div className="w-20 h-4 bg-white/5 animate-pulse rounded-full"></div>;

  if (!user) {
    return (
      <Link 
        href="/login" 
        className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-muted hover:text-primary transition-colors"
      >
        Entrar
      </Link>
    );
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-3 group px-4 py-2 rounded-xl hover:bg-white/5 transition-all"
      >
        <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/40 group-hover:border-primary transition-colors">
          <User className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="text-[10px] font-black text-white uppercase tracking-widest hidden sm:block">
          {user.display_name || user.email?.split('@')[0]}
        </span>
        <ChevronDown className={`w-3 h-3 text-muted group-hover:text-white transition-transform ${showMenu ? 'rotate-180' : ''}`} />
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
          <div className="absolute top-full right-0 mt-4 w-48 bg-void/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-3xl z-50 animate-in zoom-in-95 duration-200">
            <div className="px-4 py-3 border-b border-white/5 mb-2">
              <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Invocador Autenticado</p>
              <p className="text-[10px] font-bold text-white truncate">{user.display_name || user.email}</p>
            </div>
            {user.riot_name && user.riot_tag && (
              <Link 
                href={`/summoner/${user.riot_name.trim().replace(/\s+/g, '%20')}-${user.riot_tag.trim()}`}
                onClick={() => setShowMenu(false)}
                className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-muted hover:text-primary hover:bg-white/5 rounded-xl transition-all uppercase tracking-widest mb-1"
              >
                <User className="w-3.5 h-3.5" />
                Ver Perfil
              </Link>
            )}
            <Link 
              href="/settings"
              onClick={() => setShowMenu(false)}
              className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-muted hover:text-primary hover:bg-white/5 rounded-xl transition-all uppercase tracking-widest mb-1"
            >
              <Settings className="w-3.5 h-3.5" />
              Configurações
            </Link>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-red-400 hover:bg-red-400/10 rounded-xl transition-all uppercase tracking-widest"
            >
              <LogOut className="w-3.5 h-3.5" />
              Encerrar Sessão
            </button>
          </div>
        </>
      )}
    </div>
  );
}
