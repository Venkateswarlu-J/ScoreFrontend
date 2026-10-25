import React, { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * Tied Match Dialog - Shows when match is tied and offers super over option
 */
export function TiedMatchDialog({ isOpen, match, onStartSuperOver, onEndMatch, onCancel }) {
  const [strikerId, setStrikerId] = useState('');
  const [nonStrikerId, setNonStrikerId] = useState('');
  const [bowlerId, setBowlerId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !match) return null;

  // Determine batting and bowling teams for super over
  // Team that batted second in main match bats first in super over
  const battingTeam = match.innings2?.battingTeamName === match.team1?.teamName
    ? match.team1
    : match.team2;
  const bowlingTeam = match.innings2?.battingTeamName === match.team1?.teamName
    ? match.team2
    : match.team1;

  const battingTeamPlayers = battingTeam?.players || [];
  const bowlingTeamPlayers = bowlingTeam?.players || [];

  // Filter available batters for each position
  const availableStrikers = battingTeamPlayers.filter(p => p.playerId !== nonStrikerId);
  const availableNonStrikers = battingTeamPlayers.filter(p => p.playerId !== strikerId);

  const handleStartSuperOver = async () => {
    if (!strikerId || !nonStrikerId || !bowlerId) {
      toast.error('Please select all players');
      return;
    }

    if (strikerId === nonStrikerId) {
      toast.error('Striker and non-striker must be different players');
      return;
    }

    setSubmitting(true);
    try {
      const strikerPlayer = battingTeamPlayers.find(p => p.playerId === strikerId);
      const nonStrikerPlayer = battingTeamPlayers.find(p => p.playerId === nonStrikerId);
      const bowlerPlayer = bowlingTeamPlayers.find(p => p.playerId === bowlerId);

      await onStartSuperOver({
        openingBatters: [
          { playerId: strikerId, displayName: strikerPlayer?.displayName || strikerId },
          { playerId: nonStrikerId, displayName: nonStrikerPlayer?.displayName || nonStrikerId },
        ],
        bowler: { playerId: bowlerId, displayName: bowlerPlayer?.displayName || bowlerId },
        battingTeam: battingTeam?.teamName,
        bowlingTeam: bowlingTeam?.teamName,
      });

      // Reset form
      setStrikerId('');
      setNonStrikerId('');
      setBowlerId('');
    } catch (err) {
      toast.error(err.message || 'Failed to start super over');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-slate-800 rounded-xl border border-purple-500/50 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🤝</div>
          <h2 className="text-2xl font-bold text-purple-400 mb-2">Match Tied!</h2>
          <p className="text-slate-300">
            {match.innings1?.battingTeamName} {match.innings1?.total}/{match.innings1?.wickets}
            {' '}vs{' '}
            {match.innings2?.battingTeamName} {match.innings2?.total}/{match.innings2?.wickets}
          </p>
        </div>

        {/* Super Over Option */}
        <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-bold text-teal-400 mb-3">Play Super Over?</h3>
          <p className="text-sm text-slate-400 mb-4">
            Each team gets 1 over (6 balls) and 2 wickets. Highest score wins!
          </p>

          {/* Batting Team Info */}
          <div className="p-3 bg-slate-700/50 rounded-lg mb-3">
            <p className="text-sm text-slate-400">Batting First in Super Over</p>
            <p className="font-bold text-teal-400">{battingTeam?.teamName}</p>
          </div>

          {/* Striker Selection */}
          <div className="mb-3">
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Striker — {battingTeam?.teamName}
            </label>
            <select
              value={strikerId}
              onChange={(e) => setStrikerId(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="">Select striker...</option>
              {availableStrikers.map(player => (
                <option key={player.playerId} value={player.playerId}>
                  {player.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Non-Striker Selection */}
          <div className="mb-3">
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Non-Striker — {battingTeam?.teamName}
            </label>
            <select
              value={nonStrikerId}
              onChange={(e) => setNonStrikerId(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="">Select non-striker...</option>
              {availableNonStrikers.map(player => (
                <option key={player.playerId} value={player.playerId}>
                  {player.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Bowling Team Info */}
          <div className="p-3 bg-slate-700/50 rounded-lg mb-3">
            <p className="text-sm text-slate-400">Bowling First in Super Over</p>
            <p className="font-bold text-amber-400">{bowlingTeam?.teamName}</p>
          </div>

          {/* Bowler Selection */}
          <div className="mb-3">
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Bowler — {bowlingTeam?.teamName}
            </label>
            <select
              value={bowlerId}
              onChange={(e) => setBowlerId(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
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

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleStartSuperOver}
            disabled={submitting || !strikerId || !nonStrikerId || !bowlerId}
            className="w-full py-3 px-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Starting...' : '⚡ Start Super Over'}
          </button>
          <button
            onClick={onEndMatch}
            className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-semibold transition"
          >
            End Match as Tie
          </button>
        </div>
      </div>
    </div>
  );
}
