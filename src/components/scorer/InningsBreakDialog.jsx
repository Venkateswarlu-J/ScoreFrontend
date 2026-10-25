import React, { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * Innings Break Dialog - allows scorer to select opening batters and bowler for second innings
 */
export function InningsBreakDialog({ isOpen, match, onStartInnings, onCancel }) {
  const [strikerId, setStrikerId] = useState('');
  const [nonStrikerId, setNonStrikerId] = useState('');
  const [bowlerId, setBowlerId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !match) return null;

  // Determine batting and bowling teams for second innings
  const firstInningsBattingTeam = match.innings1?.battingTeamName;
  const isTeam1BattingFirst = firstInningsBattingTeam === match.team1?.teamName;

  const battingTeam = isTeam1BattingFirst ? match.team2 : match.team1;
  const bowlingTeam = isTeam1BattingFirst ? match.team1 : match.team2;

  const battingTeamPlayers = battingTeam?.players || [];
  const bowlingTeamPlayers = bowlingTeam?.players || [];

  // Filter available batters for each position
  const availableStrikers = battingTeamPlayers.filter(p => p.playerId !== nonStrikerId);
  const availableNonStrikers = battingTeamPlayers.filter(p => p.playerId !== strikerId);

  const handleStart = async () => {
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

      await onStartInnings({
        openingBatters: [
          { playerId: strikerId, displayName: strikerPlayer?.displayName || strikerId },
          { playerId: nonStrikerId, displayName: nonStrikerPlayer?.displayName || nonStrikerId },
        ],
        bowler: { playerId: bowlerId, displayName: bowlerPlayer?.displayName || bowlerId },
      });

      // Reset form
      setStrikerId('');
      setNonStrikerId('');
      setBowlerId('');
    } catch (err) {
      toast.error(err.message || 'Failed to start innings');
    } finally {
      setSubmitting(false);
    }
  };

  const target = match.innings2?.target || (match.innings1?.total || 0) + 1;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-slate-800 rounded-xl border border-slate-700 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-teal-400 mb-2">First Innings Complete!</h2>
          <p className="text-slate-300">
            {match.innings1?.battingTeamName || 'Team 1'} scored{' '}
            <span className="font-bold text-white">{match.innings1?.total || 0}/{match.innings1?.wickets || 0}</span>
            {' '}in <span className="font-bold">{match.innings1?.overs || '0.0'}</span> overs
          </p>
          <div className="mt-3 p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg">
            <p className="text-amber-300 font-bold text-lg">Target: {target} runs</p>
          </div>
        </div>

        {/* Player Selection */}
        <div className="space-y-4">
          {/* Batting Team Info */}
          <div className="p-3 bg-slate-700/50 rounded-lg">
            <p className="text-sm text-slate-400">Batting Team</p>
            <p className="font-bold text-teal-400">{battingTeam?.teamName}</p>
          </div>

          {/* Striker Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Opening Batter (Striker) — {battingTeam?.teamName}
            </label>
            <select
              value={strikerId}
              onChange={(e) => setStrikerId(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Opening Batter (Non-Striker) — {battingTeam?.teamName}
            </label>
            <select
              value={nonStrikerId}
              onChange={(e) => setNonStrikerId(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
          <div className="p-3 bg-slate-700/50 rounded-lg">
            <p className="text-sm text-slate-400">Bowling Team</p>
            <p className="font-bold text-amber-400">{bowlingTeam?.teamName}</p>
          </div>

          {/* Bowler Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Opening Bowler — {bowlingTeam?.teamName}
            </label>
            <select
              value={bowlerId}
              onChange={(e) => setBowlerId(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            disabled={submitting || !strikerId || !nonStrikerId || !bowlerId}
            className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Starting...' : 'Start 2nd Innings'}
          </button>
        </div>
      </div>
    </div>
  );
}
