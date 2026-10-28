import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Layout } from '../components/layout/Layout.jsx';
import { LoadingSpinner, ErrorState } from '../components/common/index.jsx';
import { matchApi } from '../api/matchApi.js';

export function MatchSetupPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tossWinner, setTossWinner] = useState(null);
  const [electedTo, setElectedTo] = useState(null);
  const [strikerId, setStrikerId] = useState('');
  const [nonStrikerId, setNonStrikerId] = useState('');
  const [bowlerId, setBowlerId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Extract token from URL params and store it
    const token = searchParams.get('token');
    if (token) {
      sessionStorage.setItem('scorerToken', token);
    }

    const fetchMatch = async () => {
      try {
        const data = await matchApi.getMatch(matchId);
        setMatch(data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load match');
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId, searchParams]);

  // Determine batting and bowling teams based on toss
  const getBattingTeam = () => {
    if (!tossWinner || !electedTo) return null;

    if (tossWinner === 'team1') {
      return electedTo === 'bat' ? match?.team1 : match?.team2;
    } else {
      return electedTo === 'bat' ? match?.team2 : match?.team1;
    }
  };

  const getBowlingTeam = () => {
    if (!tossWinner || !electedTo) return null;

    if (tossWinner === 'team1') {
      return electedTo === 'bat' ? match?.team2 : match?.team1;
    } else {
      return electedTo === 'bat' ? match?.team1 : match?.team2;
    }
  };

  const battingTeam = getBattingTeam();
  const bowlingTeam = getBowlingTeam();

  //console.log(battingTeam.teamName+" "+bowlingTeam.teamName+" "+tossWinner+" "+electedTo);

  // Get available batters (batting team players) and bowlers (bowling team players)
  const battingTeamPlayers = battingTeam?.players || [];
  const bowlingTeamPlayers = bowlingTeam?.players || [];

  // Filter available batters for each position
  const availableStrikers = battingTeamPlayers.filter(p => p.playerId !== nonStrikerId);
  const availableNonStrikers = battingTeamPlayers.filter(p => p.playerId !== strikerId);

  const handleSetup = async () => {
    if (!tossWinner || !electedTo || !strikerId || !nonStrikerId || !bowlerId) {
      toast.error('Please fill all fields');
      return;
    }

    if (strikerId === nonStrikerId) {
      toast.error('Striker and non-striker must be different players');
      return;
    }

    setSubmitting(true);
    try {
      // Determine batting and bowling teams
      const battingFirst = (tossWinner === 'team1' && electedTo === 'bat')
        ? match.team1.teamName
        : (tossWinner === 'team2' && electedTo === 'bat')
        ? match.team2.teamName
        : (tossWinner === 'team1' && electedTo === 'bowl')
        ? match.team2.teamName
        : match.team1.teamName;

      const bowlingFirst = (tossWinner === 'team1' && electedTo === 'bat')
        ? match.team2.teamName
        : (tossWinner === 'team2' && electedTo === 'bat')
        ? match.team1.teamName
        : (tossWinner === 'team1' && electedTo === 'bowl')
        ? match.team1.teamName
        : match.team2.teamName;

      const strikerPlayer = battingTeamPlayers.find(p => p.playerId === strikerId);
      const nonStrikerPlayer = battingTeamPlayers.find(p => p.playerId === nonStrikerId);
      const bowlerPlayer = bowlingTeamPlayers.find(p => p.playerId === bowlerId);

      await matchApi.setupMatch(matchId, {
        tossDetails: {
          tossWonBy: tossWinner,
          electedTo,
          battingFirst,
          bowlingFirst
        },
        openingBatters: [
          { playerId: strikerId, displayName: strikerPlayer?.displayName || strikerId },
          { playerId: nonStrikerId, displayName: nonStrikerPlayer?.displayName || nonStrikerId }
        ],
        bowler: { playerId: bowlerId, displayName: bowlerPlayer?.displayName || bowlerId }
      });

      toast.success('Setup complete! Starting match...');
      await matchApi.startMatch(matchId);
      navigate(`/match/${matchId}/score?token=${sessionStorage.getItem('scorerToken')}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to setup match');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="mx-auto w-full max-w-2xl px-4 py-5 sm:py-8">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error || !match) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <ErrorState message={error || 'Match not found'} />
        </div>
      </Layout>
    );
  }

  // Check if teams have registered players
  const team1HasPlayers = match.team1?.players?.length >= 2;
  const team2HasPlayers = match.team2?.players?.length >= 2;

  if (!team1HasPlayers || !team2HasPlayers) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="card text-center">
            <h2 className="text-xl font-bold mb-4 text-amber-400">⚠️ No Players Registered</h2>
            <p className="text-slate-300 mb-4">
              This match was created without player lists. Please recreate the match and add players for both teams.
            </p>
            <p className="text-sm text-slate-400 mb-6">
              Team A: {match.team1?.players?.length || 0} players<br />
              Team B: {match.team2?.players?.length || 0} players
            </p>
            <a href="/create" className="btn-primary py-3 px-6 rounded-lg">
              Create New Match
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-lime-300">Before the first ball</p>
        <h1 className="mb-6 text-2xl font-black sm:text-3xl">Match setup</h1>

        <div className="card mb-6">
          <h2 className="text-lg font-bold mb-4">Match Info</h2>
          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
            <div>
              <p className="text-sm text-slate-400">Team 1</p>
              <p className="font-bold">{match.team1.teamName}</p>
              <p className="text-xs text-slate-500">{match.team1.players?.length || 0} players</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Team 2</p>
              <p className="font-bold">{match.team2.teamName}</p>
              <p className="text-xs text-slate-500">{match.team2.players?.length || 0} players</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Overs</p>
              <p className="font-bold">{match.oversPerInnings}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Venue</p>
              <p className="font-bold">{match.venue || 'Not specified'}</p>
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-lg font-bold mb-4">Toss</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Toss Won By</label>
              <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
                <button
                  onClick={() => { setTossWinner('team1'); setStrikerId(''); setNonStrikerId(''); setBowlerId(''); }}
                  className={`p-3 rounded-lg font-semibold transition ${
                    tossWinner === 'team1'
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }`}
                >
                  {match.team1.teamName}
                </button>
                <button
                  onClick={() => { setTossWinner('team2'); setStrikerId(''); setNonStrikerId(''); setBowlerId(''); }}
                  className={`p-3 rounded-lg font-semibold transition ${
                    tossWinner === 'team2'
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }`}
                >
                  {match.team2.teamName}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Elected to</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setElectedTo('bat'); setStrikerId(''); setNonStrikerId(''); setBowlerId(''); }}
                  className={`p-3 rounded-lg font-semibold transition ${
                    electedTo === 'bat'
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }`}
                >
                  Bat
                </button>
                <button
                  onClick={() => { setElectedTo('bowl'); setStrikerId(''); setNonStrikerId(''); setBowlerId(''); }}
                  className={`p-3 rounded-lg font-semibold transition ${
                    electedTo === 'bowl'
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }`}
                >
                  Bowl
                </button>
              </div>
            </div>
            {battingTeam && bowlingTeam && (
              <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                <p className="text-sm text-slate-300">
                  <span className="font-semibold text-teal-400">{battingTeam.teamName}</span> will bat first
                </p>
                <p className="text-sm text-slate-300">
                  <span className="font-semibold text-amber-400">{bowlingTeam.teamName}</span> will bowl first
                </p>
              </div>
            )}
          </div>
        </div>

        {battingTeam && bowlingTeam && (
          <div className="card mb-6">
            <h2 className="text-lg font-bold mb-4">Opening Players</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Opening Batter (Striker) — {battingTeam.teamName}
                </label>
                <select
                  value={strikerId}
                  onChange={(e) => setStrikerId(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select striker...</option>
                  {availableStrikers.map(player => (
                    <option key={player.playerId} value={player.playerId}>
                      {player.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Opening Batter (Non-Striker) — {battingTeam.teamName}
                </label>
                <select
                  value={nonStrikerId}
                  onChange={(e) => setNonStrikerId(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select non-striker...</option>
                  {availableNonStrikers.map(player => (
                    <option key={player.playerId} value={player.playerId}>
                      {player.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Opening Bowler — {bowlingTeam.teamName}
                </label>
                <select
                  value={bowlerId}
                  onChange={(e) => setBowlerId(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select bowler...</option>
                  {bowlingTeamPlayers.map(player => (
                    <option key={player.playerId} value={player.playerId}>
                      {player.displayName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleSetup}
          disabled={submitting || !tossWinner || !electedTo || !strikerId || !nonStrikerId || !bowlerId}
          className="w-full btn-primary py-4 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Starting...' : 'Start Match'}
        </button>
      </div>
    </Layout>
  );
}
