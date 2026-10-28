import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout.jsx';
import { LoadingSpinner, ErrorState, ConnectionStatus, StatusBadge, CelebrationAnimation } from '../components/common/index.jsx';
import { ScoreHeader, RecentBalls, BatterCard, BowlerCard, ScorecardTable } from '../components/match/index.jsx';
import { SocketContext } from '../context/SocketContext.jsx';
import { useMatch } from '../hooks/useMatch.js';
import { Share2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export function LiveScorePage() {
  const { matchId } = useParams();
  const socketContext = useContext(SocketContext);
  const { socket, isConnected } = socketContext;
  const { match, loading, error } = useMatch(matchId, socketContext);
  const [activeTab, setActiveTab] = useState('live');

  // Animation state
  const [animationType, setAnimationType] = useState(null);
  const prevMatchRef = useRef(null);

  useEffect(() => {
    if (socket && matchId) {
      socket.emit('join-match', { matchId });
    }
  }, [socket, matchId]);

  // Detect special moments for animations (viewer side)
  useEffect(() => {
    if (!match || !prevMatchRef.current) {
      prevMatchRef.current = match;
      return;
    }

    const prevMatch = prevMatchRef.current;
    const prevInnings = prevMatch.currentInnings === 1 ? prevMatch.innings1 : prevMatch.innings2;
    const currInnings = match.currentInnings === 1 ? match.innings1 : match.innings2;

    if (!prevInnings || !currInnings) {
      prevMatchRef.current = match;
      return;
    }

    // Check for new wicket
    if (currInnings.wickets > (prevInnings.wickets || 0)) {
      setAnimationType('wicket');
    }
    // Check for milestones
    else if (currInnings.batters) {
      for (const batter of currInnings.batters) {
        const prevBatter = prevInnings.batters?.find(b => b.playerId === batter.playerId);
        if (prevBatter) {
          if (batter.runs >= 100 && prevBatter.runs < 100) {
            setAnimationType('century');
            break;
          }
          if (batter.runs >= 50 && prevBatter.runs < 50) {
            setAnimationType('fifty');
            break;
          }
        }
      }
    }

    prevMatchRef.current = match;
  }, [match]);

  // Detect boundaries from last ball
  useEffect(() => {
    if (!match) return;

    const innings = match.currentInnings === 1 ? match.innings1 : match.innings2;
    const lastBall = innings?.lastBallSummary?.[innings.lastBallSummary.length - 1];

    if (lastBall && !lastBall.isWicket) {
      if (lastBall.runs === 4) {
        setAnimationType('four');
      } else if (lastBall.runs === 6) {
        setAnimationType('six');
      }
    }
  }, [match?.innings1?.lastBallSummary?.length, match?.innings2?.lastBallSummary?.length]);

  const handleCopyLink = () => {
    const url = window.location.href;
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
        <div className="score-page">
          <ErrorState message={error || 'Match not found'} />
        </div>
      </Layout>
    );
  }

  const innings = match.currentInnings === 1 ? match.innings1 : match.innings2;

  // Find player data from innings arrays (which contain live stats)
  const strikerData = innings?.activeStrikerId
    ? innings.batters?.find(b => b.playerId === innings.activeStrikerId) ?? null
    : null;

  const nonStrikerData = innings?.activeNonStrikerId
    ? innings.batters?.find(b => b.playerId === innings.activeNonStrikerId) ?? null
    : null;

  const bowlerData = innings?.activeBowlerId
    ? innings.bowlers?.find(b => b.playerId === innings.activeBowlerId) ?? null
    : null;

  return (
    <Layout>
      <div className="score-page">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 sm:mb-6">
          <div>
            <h1 className="mb-1 break-words text-xl font-black sm:text-3xl">
              {match.team1?.teamName} vs {match.team2?.teamName}
            </h1>
            <p className="text-slate-400">{match.venue || 'No venue'}</p>
          </div>
          <StatusBadge status={match.status} />
        </div>

        <ScoreHeader match={match} />

        {match.status === 'COMPLETED' && match.result && (
          <div className="card mb-6 text-center bg-teal-500/20 border-teal-500/30">
            <p className="text-2xl font-bold text-teal-400 mb-2">Match Complete</p>
            <p className="text-lg">{match.result.resultText}</p>
          </div>
        )}

        {match.status === 'TIED' && (
          <div className="card mb-6 text-center bg-purple-500/20 border-purple-500/30">
            <p className="text-2xl font-bold text-purple-400 mb-2">Match Tied!</p>
            <p className="text-lg">Waiting for Super Over decision...</p>
          </div>
        )}

        <div className="mb-4 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-2 sm:gap-4">
          <BatterCard batter={strikerData} isStriker={true} />
          <BatterCard batter={nonStrikerData} isStriker={false} />
        </div>

        <div className="mb-6">
          <BowlerCard bowler={bowlerData} />
        </div>

        <div className="mb-6">
          <RecentBalls balls={innings?.lastBallSummary || []} />
        </div>

        <div className="card mb-5 sm:mb-6">
          <div className="mb-4 flex gap-2 border-b border-white/10 pb-2">
            <button
              onClick={() => setActiveTab('live')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === 'live'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Live
            </button>
            <button
              onClick={() => setActiveTab('scorecard')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === 'scorecard'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Scorecard
            </button>
          </div>

          {activeTab === 'live' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-2">Current Run Rate</p>
                <p className="text-3xl font-bold">
                  {innings?.legalBalls > 0
                    ? (innings.total / (innings.legalBalls / 6)).toFixed(2)
                    : '0.00'}
                </p>
              </div>
              {match.currentInnings === 2 && match.innings2?.target && (
                <div className="pt-4 border-t border-slate-700">
                  <p className="text-sm text-slate-400 mb-2">Required Run Rate</p>
                  <p className="text-2xl font-bold text-amber-400">
                    {match.innings2.target > (innings?.total || 0)
                      ? ((match.innings2.target - (innings?.total || 0)) / ((match.oversPerInnings * 6 - (innings?.legalBalls || 0)) / 6)).toFixed(2)
                      : '0.00'}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'scorecard' && (
            <div className="space-y-6">
              {match.innings1 && <ScorecardTable innings={{ ...match.innings1, match }} />}
              {match.innings2 && <ScorecardTable innings={{ ...match.innings2, match }} />}
              {/* Super Over Scorecard */}
              {match.hasSuperOver && match.superOver1 && (
                <div className="mt-6 pt-6 border-t border-slate-600">
                  <h3 className="text-lg font-bold text-pink-400 mb-4">Super Over 1</h3>
                  <ScorecardTable innings={match.superOver1} />
                </div>
              )}
              {match.hasSuperOver && match.superOver2 && (
                <div className="mt-6 pt-6 border-t border-slate-600">
                  <h3 className="text-lg font-bold text-pink-400 mb-4">Super Over 2</h3>
                  <ScorecardTable innings={match.superOver2} />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card flex flex-col gap-2 sm:flex-row sm:gap-3">
          <button
            onClick={handleCopyLink}
            className="flex-1 btn-secondary py-3 flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy Link
          </button>
          <button
            onClick={() => navigator.share({ url: window.location.href, title: 'LocalScore Match' })}
            className="flex-1 btn-secondary py-3 flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        <ConnectionStatus isConnected={isConnected} />
      </div>

      {/* Celebration Animation */}
      {animationType && (
        <CelebrationAnimation
          type={animationType}
          onComplete={() => setAnimationType(null)}
        />
      )}
    </Layout>
  );
}
