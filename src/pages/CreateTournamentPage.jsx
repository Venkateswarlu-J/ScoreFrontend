import React from 'react';
import { Layout } from '../components/layout/Layout.jsx';

export function CreateTournamentPage() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black mb-6">Create Tournament</h1>
        <div className="card text-center py-12">
          <p className="text-lg text-slate-400">Tournament feature coming in Phase 2</p>
          <p className="text-sm text-slate-500 mt-2">Create standalone matches for now</p>
        </div>
      </div>
    </Layout>
  );
}
