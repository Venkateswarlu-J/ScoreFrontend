import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Layout } from '../components/layout/Layout.jsx';
import { LoadingSpinner, ErrorState, ConnectionStatus, ConfirmDialog, CelebrationAnimation } from '../components/common/index.jsx';
import { ScoreHeader, RecentBalls, BatterCard, BowlerCard } from '../components/match/index.jsx';
import { ScorerControls } from '../components/scorer/index.jsx';
import { InningsBreakDialog } from '../components/scorer/InningsBreakDialog.jsx';
import { TiedMatchDialog } from '../components/scorer/TiedMatchDialog.jsx';
import { SocketContext } from '../context/SocketContext.jsx';
import { matchApi } from '../api/matchApi.js';
import { useMatch } from '../hooks/useMatch.js';

export function ScorerPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const socketContext = useContext(SocketContext);
  const { socket, isConnected } = socketContext;
  const { match, loading, error } = useMatch(matchId, socketContext);
  const [processingDelivery, setProcessingDelivery] = useState(false);
  const [showInningsBreakDialog, setShowInningsBreakDialog] = useState(false);
  const [showMatchCompleteDialog, setShowMatchCompleteDialog] = useState(false);
  const [showTiedDialog, setShowTiedDialog] = useState(false);

  // Animation state
  const [animationType, setAnimationType] = useState(null);
  const prevMatchRef = useRef(null);

  // Prefer sessionStorage; fall back to URL token (first visit from setup link)
  const scorerToken = searchParams.get('token') || sessionStorage.getItem('scorerToken');

  useEffect(() => {
    if (scorerToken) {
      sessionStorage.setItem('scorerToken', scorerToken);
    } else if (!sessionStorage.getItem('scorerToken')) {
      toast.error('Scorer token required');
      navigate('/');
    }
  }, [scorerToken, navigate]);

  // Handle innings break, tied match, and match completion states
  useEffect(() => {
    if (!match) return;

    // Innings 1 completed - show innings break dialog
    if (match.status === 'INNINGS_BREAK' && match.currentInnings === 1) {
      setShowInningsBreakDialog(true);
    }

    // Match tied - show tied dialog
    if (match.status === 'TIED') {
      setShowTiedDialog(true);
    }

    // Match completed - show completion dialog
    if (match.status === 'COMPLETED') {
      setShowMatchCompleteDialog(true);
    }
  }, [match?.status, match?.currentInnings]);

  // Detect special moments for animations
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
    // Check for milestones (fifty, century)
    else if (currInnings.batters) {
      for (const batter of currInnings.batters) {
        const prevBatter = prevInnings.batters?.find(b => b.playerId === batter.playerId);
        if (prevBatter) {
          // Century
          if (batter.runs >= 100 && prevBatter.runs < 100) {
            setAnimationType('century');
            break;
          }
          // Fifty
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

  // ── delivery handler ──────────────────────────────────────────────────────
  const handleDelivery = async (deliveryData) => {
    if (!match || processingDelivery) return;

    const innings =
      match.currentInnings === 1 ? match.innings1 : match.innings2;

    const strikerId = innings?.activeStrikerId;
    const nonStrikerId = innings?.activeNonStrikerId;
    const bowlerId = innings?.activeBowlerId;

    if (!strikerId || !nonStrikerId || !bowlerId) {
      toast.error('Select the opening batters and bowler before scoring.');
      return;
    }

    setProcessingDelivery(true);

    try {
      const idempotencyKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const payload = {
        strikerId,
        nonStrikerId,
        bowlerId,
        idempotencyKey,
        runsOffBat: deliveryData.runsOffBat ?? deliveryData.runs ?? 0,
        extraType: deliveryData.extraType || null,
        extraRuns: deliveryData.extraRuns || 0,
        isWicket: deliveryData.isWicket || false,
        wicket: deliveryData.wicket || null,
      };

      await matchApi.recordDelivery(matchId, payload);
      toast.success('Delivery recorded');
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to record delivery'
      );
    } finally {
      setProcessingDelivery(false);
    }
  };

  // ── undo handler ──────────────────────────────────────────────────────────
  const handleUndo = async () => {
    if (!match || processingDelivery) return;

    setProcessingDelivery(true);
    try {
      await matchApi.undoDelivery(matchId);
      toast.success('Last delivery undone');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to undo delivery');
    } finally {
      setProcessingDelivery(false);
    }
  };

  // ── start second innings handler ─────────────────────────────────────────────
  const handleStartSecondInnings = async ({ openingBatters, bowler }) => {
    if (!match || processingDelivery) return;

    setProcessingDelivery(true);
    try {
      await matchApi.startSecondInnings(matchId, { openingBatters, bowler });
      setShowInningsBreakDialog(false);
      toast.success('Second innings started!');
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to start second innings');
    } finally {
      setProcessingDelivery(false);
    }
  };

  // ── start super over handler ───────────────────────────────────────────────
  const handleStartSuperOver = async ({ openingBatters, bowler, battingTeam, bowlingTeam }) => {
    if (!match || processingDelivery) return;

    setProcessingDelivery(true);
    try {
      await matchApi.startSuperOver(matchId, { openingBatters, bowler, battingTeam, bowlingTeam });
      setShowTiedDialog(false);
      toast.success('Super Over started!');
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to start super over');
    } finally {
      setProcessingDelivery(false);
    }
  };

  // ── end match as tie handler ───────────────────────────────────────────────
  const handleEndMatchAsTie = async () => {
    if (!match || processingDelivery) return;

    setProcessingDelivery(true);
    try {
      await matchApi.completeMatch(matchId);
      setShowTiedDialog(false);
      setShowMatchCompleteDialog(true);
      toast.success('Match ended as a tie!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to end match');
    } finally {
      setProcessingDelivery(false);
    }
  };

  // ── loading / error guards ────────────────────────────────────────────────
  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
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

  // ── resolve batter / bowler display data from innings.batters/bowlers ─────
  const innings = match.currentInnings === 1 ? match.innings1 : match.innings2;

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
      <div className="max-w-2xl mx-auto px-4 py-4 pb-20">
        <ScoreHeader match={match} />

        <div className="grid grid-cols-2 gap-4 mb-4">
          <BatterCard batter={strikerData} isStriker={true} />
          <BatterCard batter={nonStrikerData} isStriker={false} />
        </div>

        <div className="mb-4">
          <BowlerCard bowler={bowlerData} />
        </div>

        <div className="mb-4">
          <RecentBalls balls={innings?.lastBallSummary || []} />
        </div>

        <div className="mb-4">
          <ScorerControls
            match={match}
            matchId={matchId}
            scorerToken={scorerToken}
            onDelivery={handleDelivery}
            onUndo={handleUndo}
            disabled={processingDelivery || !isConnected}
          />
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

      {/* Innings Break Dialog */}
      <InningsBreakDialog
        isOpen={showInningsBreakDialog}
        match={match}
        onStartInnings={handleStartSecondInnings}
        onCancel={() => setShowInningsBreakDialog(false)}
      />

      {/* Tied Match Dialog */}
      <TiedMatchDialog
        isOpen={showTiedDialog}
        match={match}
        onStartSuperOver={handleStartSuperOver}
        onEndMatch={handleEndMatchAsTie}
        onCancel={() => setShowTiedDialog(false)}
      />

      {/* Match Complete Dialog */}
      <ConfirmDialog
        isOpen={showMatchCompleteDialog && match.status === 'COMPLETED'}
        title="Match Complete!"
        message={match.result?.resultText || 'The match has ended.'}
        confirmText="View Summary"
        onConfirm={() => {
          setShowMatchCompleteDialog(false);
          navigate(`/match/${matchId}/summary`);
        }}
        onCancel={() => setShowMatchCompleteDialog(false)}
      />
    </Layout>
  );
}
