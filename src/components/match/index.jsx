import React from 'react';
import { Share2, Copy, Clock, Users } from 'lucide-react';
import { StatusBadge } from '../common/index.jsx';

export function MatchCard({ match }) {
  return (
    <div className="card card-interactive">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="break-words text-base font-bold sm:text-lg">{match.team1?.teamName} vs {match.team2?.teamName}</h3>
          <p className="text-sm text-slate-400">{match.venue || 'No venue'}</p>
        </div>
        <StatusBadge status={match.status} />
      </div>

      {['LIVE','INNINGS_BREAK','TIED','SUPER_OVER'].includes(match.status) && (
        <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl border border-white/5 bg-black/15 p-3 sm:gap-4 sm:p-4">
          <div>
            <p className="text-xs text-slate-400">Score</p>
            <p className="text-2xl font-black tabular-nums text-white">{(match.currentInnings === 2 ? match.innings2?.total : match.innings1?.total) || 0}/{(match.currentInnings === 2 ? match.innings2?.wickets : match.innings1?.wickets) || 0}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Overs</p>
            <p className="text-2xl font-bold">{match.innings1?.overs || '0.0'}</p>
          </div>
        </div>
      )}

      {match.status === 'COMPLETED' && match.result && (
        <div className="mb-4 p-3 bg-slate-700/50 rounded text-sm">
          <p className="font-semibold text-teal-400">{match.result.resultText}</p>
        </div>
      )}

      <div className="flex gap-2 border-t border-white/10 pt-4">
        <a href={`/match/${match.publicId}`} className="flex-1 btn-secondary py-2 text-center text-sm">
          View
        </a>
        {match.status !== 'COMPLETED' && (
          <a href={`/match/${match.publicId}/score`} className="flex-1 btn-primary py-2 text-center text-sm">
            Score
          </a>
        )}
      </div>
    </div>
  );
}

export function ScoreHeader({ match }) {
  const innings = match.currentInnings === 1 ? match.innings1 : match.innings2;

  return (
    <div className="card mb-4 overflow-hidden border-lime-300/15" style={{background:"radial-gradient(ellipse at top,rgba(163,230,53,.09),transparent 62%),linear-gradient(145deg,rgba(25,40,30,.98),rgba(10,20,13,.99))"}}>
      <div className="text-center">
        <p className="text-sm text-slate-400 mb-2">
          {match.currentInnings === 1 ? '1st Innings' : '2nd Innings'} • {innings?.battingTeamName || match.team1?.teamName}
        </p>
        <p className="mb-2 text-6xl font-black tracking-tight tabular-nums sm:text-7xl md:text-8xl">
          {innings?.total || 0}<span className="text-2xl">/{innings?.wickets || 0}</span>
        </p>
        <p className="text-base font-semibold text-slate-300 sm:text-xl">{innings?.overs || '0.0'} <span className="text-slate-500">/ {match.oversPerInnings} overs</span></p>

        {match.currentInnings === 2 && match.innings2?.target && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-sm text-slate-400 mb-2">Target: {match.innings2.target}</p>
            <p className="text-lg text-amber-400 font-semibold">Need {Math.max(0, match.innings2.target - (innings?.total || 0))} from {match.oversPerInnings * 6 - (innings?.legalBalls || 0)} balls</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function OversBadge({ overs }) {
  return (
    <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-700 rounded-lg text-sm font-bold border border-slate-600">
      {overs}
    </div>
  );
}

export function RecentBalls({ balls = [] }) {
  const getBallColor = (ball) => {
    if (ball.type === 'dot') return 'bg-slate-600';
    if (ball.type === 'wicket') return 'bg-red-500';
    if (ball.type === 'wide') return 'bg-yellow-500';
    if (ball.type === 'noBall') return 'bg-orange-500';
    if (ball.type === 'bye') return 'bg-purple-500';
    if (ball.type === 'legBye') return 'bg-purple-600';
    if (ball.type === 'boundary') return 'bg-emerald-500';
    return 'bg-primary';
  };

  const getBallLabel = (ball) => {
    if (ball.type === 'wicket') return 'W';
    if (ball.type === 'wide') return 'Wd';
    if (ball.type === 'noBall') return 'Nb';
    if (ball.runs === 4) return '4';
    if (ball.runs === 6) return '6';
    if (ball.runs === 0) return '•';
    return ball.runs;
  };

  return (
    <div className="card">
      <p className="text-sm text-slate-400 mb-3">Recent Balls</p>
      <div className="flex flex-wrap gap-2">
        {balls.slice(-12).map((ball, idx) => (
          <div
            key={idx}
            className={`w-10 h-10 flex items-center justify-center rounded-full ${getBallColor(ball)} text-white font-bold text-sm`}
          >
            {getBallLabel(ball)}
          </div>
        ))}
      </div>
    </div>
  );
}

export function BatterCard({ batter, isStriker = false }) {
  // Calculate strike rate
  const strikeRate = batter?.ballsFaced > 0
    ? ((batter.runs / batter.ballsFaced) * 100).toFixed(1)
    : '0.0';

  return (
    <div className={`card ${isStriker ? 'border-2 border-emerald-500 shadow-lg shadow-emerald-500/20' : ''}`}>
      <div className="flex items-center gap-2 mb-1">
        {isStriker && (
          <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-emerald-400 animate-pulse" aria-label="Currently batting">
            ●
          </span>
        )}
        <p className="text-xs font-semibold text-slate-400">{isStriker ? 'STRIKER' : 'NON-STRIKER'}</p>
      </div>
      <p className="text-lg font-bold mb-2">{batter?.displayName || 'TBD'}</p>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-slate-400">Runs</p>
          <p className="font-bold">{batter?.runs || 0}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Balls</p>
          <p className="font-bold">{batter?.ballsFaced || 0}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">4s</p>
          <p className="font-bold">{batter?.fours || 0}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">6s</p>
          <p className="font-bold">{batter?.sixes || 0}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-slate-400">Strike Rate</p>
          <p className="font-bold text-teal-400">{strikeRate}</p>
        </div>
      </div>
    </div>
  );
}

export function BowlerCard({ bowler }) {
  // legalBallsBowled is the authoritative field set by the scoring engine
  const economy = bowler && bowler.legalBallsBowled > 0
    ? (bowler.runsConceded / (bowler.legalBallsBowled / 6)).toFixed(2)
    : '0.00';

  return (
    <div className="card">
      <p className="text-xs text-slate-400 mb-1">BOWLER</p>
      <p className="text-lg font-bold mb-2">{bowler?.displayName || 'TBD'}</p>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-slate-400">Overs</p>
          <p className="font-bold">{bowler?.oversBowled || '0.0'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Runs</p>
          <p className="font-bold">{bowler?.runsConceded || 0}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Wickets</p>
          <p className="font-bold">{bowler?.wickets || 0}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Economy</p>
          <p className="font-bold">{economy}</p>
        </div>
      </div>
    </div>
  );
}

export function ScorecardTable({ innings }) {
  if (!innings) return null;

  // Format dismissal text with bowler name
  const formatDismissal = (batter) => {
    if (!batter.isOut || !batter.dismissalType) return 'not out';

    const dismissalType = batter.dismissalType;
    const bowlerName = batter.dismissalBowler || '';

    // Format based on dismissal type
    switch (dismissalType.toLowerCase()) {
      case 'bowled':
        return `b ${bowlerName}`;
      case 'caught':
        return `c ${bowlerName}`;
      case 'lbw':
        return `lbw b ${bowlerName}`;
      case 'stumped':
        return `st ${bowlerName}`;
      case 'runout':
      case 'run out':
        return 'run out';
      case 'hitwicket':
      case 'hit wicket':
        return `hit wicket b ${bowlerName}`;
      case 'caughtandbowled':
      case 'c&b':
        return `c & b ${bowlerName}`;
      case 'retired':
        return 'retired out';
      default:
        return bowlerName ? `${dismissalType} b ${bowlerName}` : dismissalType;
    }
  };

  // Calculate strike rate for each batter
  const getStrikeRate = (batter) => {
    if (!batter.ballsFaced || batter.ballsFaced === 0) return '0.00';
    return ((batter.runs / batter.ballsFaced) * 100).toFixed(2);
  };

  // Calculate economy for each bowler
  const getEconomy = (bowler) => {
    if (!bowler.legalBallsBowled || bowler.legalBallsBowled === 0) return '0.00';
    return (bowler.runsConceded / (bowler.legalBallsBowled / 6)).toFixed(2);
  };

  return (
    <div className="card score-table-wrap mb-6">
      {/* Batting Innings */}
      <div className="mb-4">
        <h3 className="text-lg font-bold">{innings.battingTeamName || 'Batting Team'} Innings</h3>
        <p className="text-sm text-slate-400">vs {innings.bowlingTeamName || 'Bowling Team'}</p>
      </div>
      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-2 px-2">Batter</th>
            <th className="text-right py-2 px-2">R</th>
            <th className="text-right py-2 px-2">B</th>
            <th className="text-right py-2 px-2">4s</th>
            <th className="text-right py-2 px-2">6s</th>
            <th className="text-right py-2 px-2">SR</th>
            <th className="text-left py-2 px-2">Dismissal</th>
          </tr>
        </thead>
        <tbody>
          {innings.batters?.map((batter, idx) => (
            <tr key={idx} className="border-b border-slate-700/50">
              <td className="py-2 px-2 font-semibold">{batter.displayName}</td>
              <td className="text-right py-2 px-2 font-bold">{batter.runs}</td>
              <td className="text-right py-2 px-2">{batter.ballsFaced}</td>
              <td className="text-right py-2 px-2">{batter.fours}</td>
              <td className="text-right py-2 px-2">{batter.sixes}</td>
              <td className="text-right py-2 px-2 text-teal-400">{getStrikeRate(batter)}</td>
              <td className="py-2 px-2 text-slate-400 text-xs">{formatDismissal(batter)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pt-4 border-t border-slate-700">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-bold text-lg">{innings.total}/{innings.wickets} ({innings.overs} overs)</p>
            <p className="text-sm text-slate-400">
              Extras: {(innings.extras?.wides || 0) + (innings.extras?.noBalls || 0) + (innings.extras?.byes || 0) + (innings.extras?.legByes || 0)}
              {innings.extras?.wides > 0 && <span className="ml-1">(wd {innings.extras.wides})</span>}
              {innings.extras?.noBalls > 0 && <span className="ml-1">(nb {innings.extras.noBalls})</span>}
              {innings.extras?.byes > 0 && <span className="ml-1">(b {innings.extras.byes})</span>}
              {innings.extras?.legByes > 0 && <span className="ml-1">(lb {innings.extras.legByes})</span>}
            </p>
          </div>
          {innings.status === 'COMPLETED' && (
            <span className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded-full">Completed</span>
          )}
        </div>
      </div>

      {/* Bowling Innings */}
      {innings.bowlers && innings.bowlers.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-700">
          <h4 className="text-md font-bold mb-3 text-slate-300">{innings.bowlingTeamName || 'Bowling Team'} Bowling</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 px-2">Bowler</th>
                <th className="text-right py-2 px-2">O</th>
                <th className="text-right py-2 px-2">M</th>
                <th className="text-right py-2 px-2">R</th>
                <th className="text-right py-2 px-2">W</th>
                <th className="text-right py-2 px-2">Econ</th>
              </tr>
            </thead>
            <tbody>
              {innings.bowlers.map((bowler, idx) => (
                <tr key={idx} className="border-b border-slate-700/50">
                  <td className="py-2 px-2 font-semibold">{bowler.displayName}</td>
                  <td className="text-right py-2 px-2">{bowler.oversBowled || '0.0'}</td>
                  <td className="text-right py-2 px-2">{bowler.maidens || 0}</td>
                  <td className="text-right py-2 px-2">{bowler.runsConceded || 0}</td>
                  <td className="text-right py-2 px-2 font-bold text-teal-400">{bowler.wickets || 0}</td>
                  <td className="text-right py-2 px-2 text-slate-400">{getEconomy(bowler)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
