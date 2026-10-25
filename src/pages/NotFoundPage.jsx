import React from 'react';
import { Layout } from '../components/layout/Layout.jsx';

export function NotFoundPage() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-6xl font-black mb-4">404</h1>
        <p className="text-xl text-slate-400 mb-6">Page not found</p>
        <a href="/" className="btn-primary py-3 px-6 inline-block">
          Go Home
        </a>
      </div>
    </Layout>
  );
}
