import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Layout } from '../components/layout/Layout.jsx';
import { Plus, Copy, Check, Zap, Trash2 } from 'lucide-react';
import { OversSelector } from '../components/common/OversSelector.jsx';
import { matchApi } from '../api/matchApi.js';

function generatePlayerId() {
  return `player_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function CreateMatchPage() {
  const navigate = useNavigate();
  const [matchType, setMatchType] = useState('standalone');
  const [team1Name, setTeam1Name] = useState('');
  const [team2Name, setTeam2Name] = useState('');
  const [overs, setOvers] = useState(10);
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [createdMatch, setCreatedMatch] = useState(null);
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedScorer, setCopiedScorer] = useState(false);

  // Player lists for each team
  const [team1Players, setTeam1Players] = useState([
    { playerId: generatePlayerId(), displayName: '' },
  ]);
  const [team2Players, setTeam2Players] = useState([
    { playerId: generatePlayerId(), displayName: '' },
  ]);

  const addPlayer = (team) => {
    const maxPlayers = 11;
    if (team === 'team1') {
      if (team1Players.length >= maxPlayers) {
        toast.error('Maximum 11 players allowed per team');
        return;
      }
      setTeam1Players([...team1Players, { playerId: generatePlayerId(), displayName: '' }]);
    } else {
      if (team2Players.length >= maxPlayers) {
        toast.error('Maximum 11 players allowed per team');
        return;
      }
      setTeam2Players([...team2Players, { playerId: generatePlayerId(), displayName: '' }]);
    }
  };

  const removePlayer = (team, index) => {
    if (team === 'team1') {
      if (team1Players.length <= 1) return;
      setTeam1Players(team1Players.filter((_, i) => i !== index));
    } else {
      if (team2Players.length <= 1) return;
      setTeam2Players(team2Players.filter((_, i) => i !== index));
    }
  };

  const updatePlayerName = (team, index, name) => {
    if (team === 'team1') {
      const updated = [...team1Players];
      updated[index].displayName = name;
      setTeam1Players(updated);
    } else {
      const updated = [...team2Players];
      updated[index].displayName = name;
      setTeam2Players(updated);
    }
  };

  const handleCreate = async () => {
    if (!team1Name.trim() || !team2Name.trim()) {
      toast.error('Team names required');
      return;
    }

    // Check if overs is a valid value (1 is valid for Super Over)
    if (![1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 50].includes(overs)) {
      toast.error('Please select a valid overs format');
      return;
    }

    // Validate players - at least 2 named players per team, max 11
    const validTeam1 = team1Players.filter(p => p.displayName.trim());
    const validTeam2 = team2Players.filter(p => p.displayName.trim());

    if (validTeam1.length < 2) {
      toast.error(`Please enter at least 2 players for ${team1Name || 'Team A'} (currently ${validTeam1.length})`);
      return;
    }
    if (validTeam2.length < 2) {
      toast.error(`Please enter at least 2 players for ${team2Name || 'Team B'} (currently ${validTeam2.length})`);
      return;
    }
    if (validTeam1.length > 11) {
      toast.error(`Maximum 11 players allowed per team. ${team1Name} has ${validTeam1.length} players.`);
      return;
    }
    if (validTeam2.length > 11) {
      toast.error(`Maximum 11 players allowed per team. ${team2Name} has ${validTeam2.length} players.`);
      return;
    }

    setSubmitting(true);
    try {
      const data = await matchApi.createMatch({
        team1: {
          name: team1Name.trim(),
          players: validTeam1.map(p => ({
            playerId: p.playerId,
            displayName: p.displayName.trim()
          }))
        },
        team2: {
          name: team2Name.trim(),
          players: validTeam2.map(p => ({
            playerId: p.playerId,
            displayName: p.displayName.trim()
          }))
        },
        oversPerInnings: parseInt(overs),
        venue: venue.trim() || null,
        date: date || null,
        tournamentId: null
      });

      sessionStorage.setItem('scorerToken', data.scorerToken);
      setCreatedMatch(data);
      toast.success('Match created successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to create match';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text, isScorer = false) => {
    navigator.clipboard.writeText(text);
    if (isScorer) {
      setCopiedScorer(true);
      setTimeout(() => setCopiedScorer(false), 2000);
    } else {
      setCopiedPublic(true);
      setTimeout(() => setCopiedPublic(false), 2000);
    }
    toast.success('Copied to clipboard!');
  };

  if (createdMatch) {
    const publicUrl = `${window.location.origin}/match/${createdMatch.match.publicId}`;
    const setupUrl = `${window.location.origin}/match/${createdMatch.match.publicId}/setup?token=${createdMatch.scorerToken}`;

    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">✅</div>
              <h2 className="text-3xl font-black text-emerald-400">Match Created!</h2>
            </div>
            <p className="text-slate-300 mb-6">Your match is ready. Share the public link with spectators and use the scorer link to start scoring.</p>

            {/* Public URL */}
            <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700">
              <p className="text-sm text-slate-400 mb-2 font-semibold">📢 PUBLIC LINK (Share with everyone)</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={publicUrl}
                  readOnly
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm font-mono"
                />
                <button
                  onClick={() => copyToClipboard(publicUrl)}
                  className="px-4 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-semibold transition flex items-center gap-2"
                >
                  {copiedPublic ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
            </div>

            {/* Scorer URL */}
            <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700">
              <p className="text-sm text-slate-400 mb-2 font-semibold">🔒 SCORER LINK (Keep private)</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={setupUrl}
                  readOnly
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm font-mono"
                />
                <button
                  onClick={() => copyToClipboard(setupUrl, true)}
                  className="px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold transition flex items-center gap-2"
                >
                  {copiedScorer ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
              <p className="text-xs text-amber-400 mt-2">⚠️ This link has scoring permission. Do not share publicly.</p>
            </div>

            {/* Match Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400 mb-1">vs</p>
                <p className="text-sm font-bold text-white">{createdMatch.match.team1.teamName} vs {createdMatch.match.team2.teamName}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400 mb-1">Format</p>
                <p className="text-sm font-bold text-teal-400">{overs === 0 ? 'Super Over' : `${overs} Overs`}</p>
              </div>
              {venue && (
                <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-400 mb-1">Venue</p>
                  <p className="text-sm font-bold text-white">{venue}</p>
                </div>
              )}
              <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400 mb-1">Date</p>
                <p className="text-sm font-bold text-white">{new Date(date).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <a
                href={setupUrl}
                className="flex-1 btn btn-primary py-4 text-center font-bold text-lg rounded-xl"
              >
                Go to Scorer Console →
              </a>
              <a
                href={publicUrl}
                className="flex-1 btn btn-secondary py-4 text-center font-bold text-lg rounded-xl"
              >
                Preview Scoreboard →
              </a>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">Create a Match</h1>
          <p className="text-slate-300">Set up a quick face-to-face match or a tournament game</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl">
          {/* Match Type */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-200 mb-4">Match Type</label>
            <div className="flex gap-4">
              {[
                { value: 'standalone', label: '⚡ Quick Match' },
                { value: 'tournament', label: '🏆 Tournament Match' }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setMatchType(opt.value)}
                  className={`flex-1 py-4 px-4 rounded-xl font-semibold transition border-2 ${
                    matchType === opt.value
                      ? 'bg-teal-500 border-teal-400 text-white shadow-lg'
                      : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Teams and Players */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Team 1 */}
            <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
              <label className="block text-sm font-semibold text-slate-200 mb-2">Team A</label>
              <input
                type="text"
                placeholder="e.g., Lions"
                value={team1Name}
                onChange={(e) => setTeam1Name(e.target.value)}
                className="input-field mb-4"
                maxLength={30}
              />

              <label className="block text-xs font-semibold text-slate-400 mb-2">
                Players (min 2)
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {team1Players.map((player, idx) => (
                  <div key={player.playerId} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Player ${idx + 1}`}
                      value={player.displayName}
                      onChange={(e) => updatePlayerName('team1', idx, e.target.value)}
                      className="flex-1 input-field text-sm py-2"
                      maxLength={40}
                    />
                    {team1Players.length > 1 && (
                      <button
                        onClick={() => removePlayer('team1', idx)}
                        className="px-2 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => addPlayer('team1')}
                className="mt-3 w-full py-2 text-sm text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 rounded-lg transition flex items-center justify-center gap-1"
              >
                <Plus size={16} /> Add Player
              </button>
            </div>

            {/* Team 2 */}
            <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
              <label className="block text-sm font-semibold text-slate-200 mb-2">Team B</label>
              <input
                type="text"
                placeholder="e.g., Tigers"
                value={team2Name}
                onChange={(e) => setTeam2Name(e.target.value)}
                className="input-field mb-4"
                maxLength={30}
              />

              <label className="block text-xs font-semibold text-slate-400 mb-2">
                Players (min 2)
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {team2Players.map((player, idx) => (
                  <div key={player.playerId} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Player ${idx + 1}`}
                      value={player.displayName}
                      onChange={(e) => updatePlayerName('team2', idx, e.target.value)}
                      className="flex-1 input-field text-sm py-2"
                      maxLength={40}
                    />
                    {team2Players.length > 1 && (
                      <button
                        onClick={() => removePlayer('team2', idx)}
                        className="px-2 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => addPlayer('team2')}
                className="mt-3 w-full py-2 text-sm text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 rounded-lg transition flex items-center justify-center gap-1"
              >
                <Plus size={16} /> Add Player
              </button>
            </div>
          </div>

          {/* Overs Selection */}
          <div className="mb-8">
            <OversSelector value={overs} onChange={setOvers} />
          </div>

          {/* Venue & Date */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">Venue (Optional)</label>
              <input
                type="text"
                placeholder="e.g., Central Park"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="input-field"
                maxLength={50}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">Date (Optional)</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreate}
            disabled={submitting || !team1Name.trim() || !team2Name.trim()}
            className="w-full py-4 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition shadow-lg"
          >
            {submitting ? 'Creating match...' : '🚀 Create Match'}
          </button>

          <p className="text-xs text-slate-400 text-center mt-4">By JV • Professional Cricket Scoring Platform</p>
        </div>
      </div>
    </Layout>
  );
}
