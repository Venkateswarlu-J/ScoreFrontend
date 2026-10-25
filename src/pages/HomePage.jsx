import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Layout } from '../components/layout/Layout.jsx';
import { LoadingSpinner, EmptyState } from '../components/common/index.jsx';
import { MatchCard } from '../components/match/index.jsx';
import { Plus } from 'lucide-react';
import { matchApi } from '../api/matchApi.js';

export function HomePage() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('live');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await matchApi.getMatches();
        setMatches(data);
      } catch (err) {
        toast.error('Failed to load matches');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
    const interval = setInterval(fetchMatches, 5000);
    return () => clearInterval(interval);
  }, []);

  const liveMatches = matches.filter(m => m.status === 'LIVE');
  const upcomingMatches = matches.filter(m => m.status === 'UPCOMING' || m.status === 'CREATED' || m.status === 'SETUP');
  const completedMatches = matches.filter(m => m.status === 'COMPLETED');

  const getTabMatches = () => {
    switch (activeTab) {
      case 'live': return liveMatches;
      case 'upcoming': return upcomingMatches;
      case 'completed': return completedMatches;
      default: return [];
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">JV11</h1>
          <p className="text-xl text-slate-400 mb-8">Score your local cricket matches live</p>
          <button
            onClick={() => navigate('/create')}
            className="btn-primary py-4 px-8 font-bold text-lg flex items-center justify-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Create Match
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-3 font-semibold transition ${
              activeTab === 'live'
                ? 'text-teal-400 border-b-2 border-teal-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Live ({liveMatches.length})
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-3 font-semibold transition ${
              activeTab === 'upcoming'
                ? 'text-teal-400 border-b-2 border-teal-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Upcoming ({upcomingMatches.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-3 font-semibold transition ${
              activeTab === 'completed'
                ? 'text-teal-400 border-b-2 border-teal-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed ({completedMatches.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner />
        ) : getTabMatches().length === 0 ? (
          <EmptyState
            title={`No ${activeTab} matches`}
            description={`Create a match to get started!`}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getTabMatches().map(match => (
              <MatchCard key={match._id} match={match} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
