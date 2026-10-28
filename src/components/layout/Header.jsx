import React from 'react';
import { Plus, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl" style={{ background: 'rgba(11,20,16,.92)' }}>
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-3 rounded-xl" aria-label="LocalScore home">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xl shadow-glow" style={{ background: 'linear-gradient(135deg,#166534,#4d7c0f)' }}>🏏</div>
          <div className="min-w-0">
            <div className="truncate text-lg font-black tracking-tight text-white sm:text-xl">LocalScore</div>
            <div className="text-[10px] font-bold uppercase tracking-[.18em] text-lime-300">Cricket, live</div>
          </div>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Main navigation">
          <Link to="/" className={`btn ${isHome ? 'btn-secondary' : 'text-slate-300 hover:text-white'} min-h-10 px-3 py-2 text-sm`} aria-current={isHome ? 'page' : undefined}><Home size={16}/><span className="hidden sm:inline">Home</span></Link>
          <Link to="/create" className="btn btn-primary min-h-10 px-3 py-2 text-sm sm:px-4"><Plus size={16}/><span>Create match</span></Link>
        </nav>
      </div>
    </header>
  );
}
