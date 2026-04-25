import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ButterChoice — Encuentra la mejor mantequilla",
  description: "Compara y elige la mejor mantequilla en los supermercados de España. Scoring multi-criterio, filtros por supermercado, ingredientes y más.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-stone-50">
        <header className="sticky top-0 z-50 bg-white border-b border-stone-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-amber-800 hover:text-amber-900 transition-colors">
              <span className="text-2xl">🧈</span>
              <span>ButterChoice</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-stone-600">
              <Link href="/butters" className="hover:text-amber-700 transition-colors">Mantequillas</Link>
              <Link href="/supermarkets" className="hover:text-amber-700 transition-colors">Supermercados</Link>
              <Link href="/ranking" className="hover:text-amber-700 transition-colors">Ranking</Link>
              <Link href="/compare" className="hover:text-amber-700 transition-colors">Comparar</Link>
            </nav>
            <button className="sm:hidden p-2 text-stone-600" id="mobile-menu-btn">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
          <div className="sm:hidden hidden border-t border-stone-100" id="mobile-menu">
            <div className="px-4 py-3 flex flex-col gap-3 text-sm font-medium text-stone-600">
              <Link href="/butters" className="hover:text-amber-700">Mantequillas</Link>
              <Link href="/supermarkets" className="hover:text-amber-700">Supermercados</Link>
              <Link href="/ranking" className="hover:text-amber-700">Ranking</Link>
              <Link href="/compare" className="hover:text-amber-700">Comparar</Link>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-stone-200 bg-white mt-12">
          <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-stone-400">
            ButterChoice — Encuentra la mejor mantequilla en España 🧈
          </div>
        </footer>
        <script dangerouslySetInnerHTML={{ __html: `
          document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
            document.getElementById('mobile-menu')?.classList.toggle('hidden');
          });
        `}} />
      </body>
    </html>
  );
}