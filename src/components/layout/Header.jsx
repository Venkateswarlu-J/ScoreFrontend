import React from 'react';
import { Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 backdrop-blur-lg shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition">
            <div className="text-3xl">🏏</div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">LocalScore</h1>
              <p className="text-xs text-teal-400 font-semibold leading-none">Built by JV</p>
            </div>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-slate-300 hover:text-teal-400 font-semibold transition">
              Home
            </Link>
            <Link to="/create" className="btn btn-primary py-2 px-6 text-sm">
              Create Match
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

