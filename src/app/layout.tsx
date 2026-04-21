import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import BackgroundParticles from "@/components/BackgroundParticles";

import UserNav from "@/components/UserNav";

const montserrat = Montserrat({ subsets: ["latin"], weight: ['400', '700', '900'] });

export const metadata: Metadata = {
  title: "META DIFF | Elite LoL Analytics",
  description: "Dominando o Summoner's Rift com a estética Nova.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" className="dark scroll-smooth">
      <body className={`${montserrat.className} selection:bg-primary/30 text-digital min-h-screen relative overflow-x-hidden bg-void`}>
        <div className="bg-nova pointer-events-none">
          <div className="nova-blob blob-1" />
          <div className="nova-blob blob-2" />
        </div>
        <BackgroundParticles />

        <header className="fixed top-6 left-0 w-full z-50 flex justify-center px-4">
          <nav className="nova-glass-light nova-border-glow px-6 py-3 rounded-full flex items-center gap-8 shadow-2xl">
            <Link href="/" className="flex items-center gap-1 group">
              <span className="text-xl font-black tracking-tighter text-primary group-hover:text-glow-primary transition-all">META</span>
              <span className="text-xl font-black tracking-tighter text-secondary group-hover:text-glow-secondary transition-all">DIFF</span>
            </Link>

            <div className="h-4 w-[1px] bg-white/10 hidden sm:block"></div>

            <div className="flex items-center gap-6 sm:gap-8">
              {[
                { name: 'Tier List', href: '/tier-list' },
                { name: 'Início', href: '/' },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-muted hover:text-white transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              <UserNav />
            </div>
          </nav>
        </header>

        <main className="pt-32 min-h-screen">
          {children}
        </main>

        <footer className="py-12 text-center border-t border-white/5 mt-20">
          <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em] opacity-50">
            © 2026 META DIFF — Elite Analytics
          </p>
        </footer>
      </body>
    </html>
  );
}
