import React from 'react';
import { Header } from './Header.jsx';

export function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-gradient-to-r from-slate-950 to-slate-900 border-t border-slate-700/50 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-2">LocalScore</h3>
              <p className="text-sm text-slate-400">Professional cricket match scoring platform</p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">Built by JV</h3>
              <p className="text-sm text-slate-400">Javvaji Venkateswarlu © 2026</p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">Features</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Live Scoreboard</li>
                <li>• Real-time Updates</li>
                <li>• Tournament Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700/50 pt-6 text-center text-sm text-slate-500">
            <p>© 2026 JV (Javvaji Venkateswarlu). All rights reserved. LocalScore™</p>
            <p className="text-xs mt-2">Powered by LocalScore • Professional Cricket Scoring</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
