import React from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout.jsx';
import { LoadingSpinner, ErrorState } from '../components/common/index.jsx';
import { ScorecardTable } from '../components/match/index.jsx';
import { useMatch } from '../hooks/useMatch.js';
import { Share2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export function MatchSummaryPage() {
  const { matchId } = useParams();
  const { match, loading, error } = useMatch(matchId, null);

  const handleCopyLink = () => {
    const url = window.location.href.replace('/summary', '');
    navigator.clipboard.writeText(url);
    toast.success('Link copied!');
  };

  if (loading) {
    return (
      <Layout>
        <div className="score-page">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error || !match) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <ErrorState message={error || 'Match not found'} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-lime-300">Final scorecard</p>
          <h1 className="mb-4 text-3xl font-black sm:text-4xl">Match complete</h1>
          {match.result && (
            <p className="mb-4 text-xl font-bold text-lime-300 sm:text-2xl">{match.result.resultText}</p>
          )}
          <p className="text-slate-400">
            {match.team1?.teamName} vs {match.team2?.teamName}
          </p>
          {match.venue && <p className="text-sm text-slate-500">{match.venue}</p>}
        </div>

        <div className="space-y-6 mb-8">
          {match.innings1 && <ScorecardTable innings={{ ...match.innings1, match }} />}
          {match.innings2 && <ScorecardTable innings={{ ...match.innings2, match }} />}
        </div>

        <div className="card flex flex-col gap-2 sm:flex-row sm:gap-3">
          <button
            onClick={handleCopyLink}
            className="flex-1 btn-secondary py-3 flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy Live Link
          </button>
          <button
            onClick={() => navigator.share({ url: window.location.href, title: 'LocalScore Match Summary' })}
            className="flex-1 btn-secondary py-3 flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>
    </Layout>
  );
}
