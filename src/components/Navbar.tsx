'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Sword, BarChart3, User, Zap, Menu, X, Activity } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'INÍCIO', href: '/', icon: Sword },
    { name: 'META GLOBAL', href: '/tier-list', icon: BarChart3 },
    { name: 'ATUALIZAÇÕES', href: '/patch-notes', icon: Activity },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] px-4 py-8 pointer-events-none flex justify-center">
      <div 
        className={`
          flex items-center bg-surface/60 backdrop-blur-3xl border border-white/10 
          rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto 
          transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
          ${isOpen ? 'px-8 py-4 max-w-[1000px]' : 'px-5 py-3 max-w-[200px]'}
          relative group/nav
        `}
        onMouseEnter={() => window.innerWidth > 768 && setIsOpen(true)}
        onMouseLeave={() => window.innerWidth > 768 && setIsOpen(false)}
      >
        {/* LOGO */}
        <Link href="/" className="flex items-center shrink-0 relative z-10 transition-transform duration-500 group/logo">
           <div className="text-lg font-black italic tracking-tighter flex items-center gap-1 whitespace-nowrap">
             <span className="text-primary drop-shadow-[0_0_10px_rgba(0,255,204,0.3)]">META</span>
             <span className="text-secondary drop-shadow-[0_0_10px_rgba(255,184,0,0.3)]">DIFF</span>
           </div>
        </Link>

        {/* LINKS (Desktop - com overflow-hidden apenas aqui) */}
        <div className={`
          hidden md:flex items-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden
          ${isOpen ? 'opacity-100 ml-10 max-w-xl' : 'opacity-0 ml-0 max-w-0'}
        `}>
          <div className="flex items-center gap-8 whitespace-nowrap">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? 'text-primary' : 'text-muted hover:text-white hover:scale-105'}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary' : 'text-muted'}`} />
                  {link.name}
                </Link>
              );
            })}
            
            <div className="w-[1px] h-4 bg-white/10 mx-2"></div>

            <Link 
              href="/login" 
              className="px-5 py-2 bg-primary/10 border border-primary/30 rounded-xl text-[9px] font-black text-primary uppercase tracking-widest hover:bg-primary hover:text-void transition-all"
            >
              ENTRAR
            </Link>
          </div>
        </div>

        {/* MOBILE MENU TRIGGER */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="md:hidden ml-4 p-1 text-white z-10"
        >
          {isOpen ? <X className="w-5 h-5 text-primary" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* MOBILE DROPDOWN (Fora do overflow-hidden) */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-[350px] mt-4 bg-surface/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 flex flex-col gap-5 animate-in fade-in slide-in-from-top-2 shadow-3xl z-50">
             {navLinks.map((link) => (
               <Link 
                key={link.name} 
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 text-[11px] font-black text-white uppercase tracking-widest p-2 hover:bg-white/5 rounded-xl transition-all"
               >
                 <link.icon className="w-4 h-4 text-primary" /> 
                 {link.name}
               </Link>
             ))}
             <div className="h-[1px] w-full bg-white/5"></div>
             <Link 
              href="/login" 
              onClick={() => setIsOpen(false)}
              className="w-full py-4 bg-primary text-void text-center rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
             >
               ENTRAR NA CONTA
             </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
