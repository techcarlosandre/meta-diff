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
    { name: 'NOTAS DO PATCH', href: '/patch-notes', icon: Activity },
    { name: 'SIMULADOR', href: '/champion/Aatrox', icon: Zap }, // Example link
  ];



  return (
    <nav className="fixed top-0 left-0 w-full z-[100] px-6 py-6 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between bg-surface/40 backdrop-blur-2xl border border-white/10 px-8 py-5 rounded-[2.5rem] shadow-2xl pointer-events-auto relative group">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 group/logo">
           <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/40 group-hover/logo:scale-110 transition-all shadow-lg shadow-primary/5">
              <Shield className="w-6 h-6 text-primary" />
           </div>
           <div className="text-xl font-black text-white italic tracking-tighter group-hover/logo:text-primary transition-colors">
             META <span className="text-primary group-hover/logo:text-white">DIFF</span>
           </div>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-8">
           {navLinks.map((link) => {
             const Icon = link.icon;
             const isActive = pathname === link.href;
             return (
               <Link 
                key={link.name} 
                href={link.href} 
                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? 'text-primary' : 'text-muted hover:text-white'}`}
               >
                 <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted'}`} />
                 {link.name}
               </Link>
             );
           })}
        </div>

        {/* LOGIN / PROFILE */}
        <div className="hidden md:flex items-center gap-4 border-l border-white/5 pl-8">
           <Link 
            href="/login" 
            className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-primary hover:text-void hover:border-primary transition-all shadow-md active:scale-95"
           >
             CONECTAR
           </Link>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-white">
           {isOpen ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* MOBILE DROPDOWN */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full mt-4 bg-surface/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 flex flex-col gap-6 animate-in fade-in slide-in-from-top-4">
             {navLinks.map((link) => (
               <Link 
                key={link.name} 
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 text-xs font-black text-white uppercase tracking-widest"
               >
                 <link.icon className="w-5 h-5 text-primary" /> 
                 {link.name}
               </Link>
             ))}
             <Link 
              href="/login" 
              onClick={() => setIsOpen(false)}
              className="w-full py-4 bg-primary text-void text-center rounded-2xl font-black text-xs uppercase tracking-widest"
             >
               CONECTAR NO DASHBOARD
             </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
