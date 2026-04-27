import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import BackgroundParticles from "@/components/BackgroundParticles";
import UpdateModal from "@/components/UpdateModal";
import Navbar from "@/components/Navbar";

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
        <UpdateModal />
        <div className="bg-nova pointer-events-none">
          <div className="nova-blob blob-1" />
          <div className="nova-blob blob-2" />
        </div>
        <BackgroundParticles />

        <Navbar />

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
