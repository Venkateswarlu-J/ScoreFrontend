import React from 'react';
import { Header } from './Header.jsx';

export function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="w-full flex-1">{children}</main>
      <footer className="mt-10 border-t border-white/10 bg-black/10 py-6 sm:mt-14 sm:py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-center sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left">
          <div><p className="font-bold text-white">LocalScore <span className="text-lime-300">🏏</span></p><p className="mt-1 text-xs text-slate-400">Live cricket scoring for local matches.</p></div>
          <p className="text-xs text-slate-500">Built for the love of the game · © 2026</p>
        </div>
      </footer>
    </div>
  );
}
