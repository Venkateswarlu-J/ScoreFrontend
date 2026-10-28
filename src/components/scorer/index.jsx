import React, { useState } from 'react';
import { Undo2 } from 'lucide-react';
import { ConfirmDialog } from '../common/index.jsx';

// ── Run Buttons ───────────────────────────────────────────────────────────────

export function RunButtons({ onRun, disabled }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {[0, 1, 2, 3].map((n) => (
          <button
            key={n}
            onClick={() => onRun(n)}
            disabled={disabled}
            className="btn-secondary touch-target py-4 text-2xl font-black rounded-xl sm:text-3xl"
          >
            {n}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onRun(4)}
          disabled={disabled}
          className="touch-target rounded-xl bg-emerald-700 py-4 text-2xl font-black text-white transition hover:bg-emerald-600 active:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 sm:text-3xl"
        >
          4
        </button>
        <button
          onClick={() => onRun(6)}
          disabled={disabled}
          className="touch-target rounded-xl bg-lime-700 py-4 text-2xl font-black text-white transition hover:bg-lime-600 active:bg-lime-500 disabled:cursor-not-allowed disabled:opacity-50 sm:text-3xl"
        >
          6
        </button>
      </div>
    </div>
  );
}

// ── Extras Panel ──────────────────────────────────────────────────────────────

/**
 * Extras panel — shows a run-picker after choosing the extra type so
 * the scorer can specify how many runs were scored off the extra delivery.
 */
export function ExtrasPanel({ onExtra, disabled }) {
  const [pendingType, setPendingType] = useState(null);

  const handleExtraType = (type) => {
    if (disabled) return;
    setPendingType(type);
  };

  const handleExtraRuns = (runs) => {
    onExtra(pendingType, runs);
    setPendingType(null);
  };

  if (pendingType) {
    const typeLabel = {
      wide: 'Wide', noBall: 'No Ball', bye: 'Bye', legBye: 'Leg Bye',
    }[pendingType];

    return (
      <div className="card">
        <p className="text-sm font-semibold text-slate-300 mb-3">
          {typeLabel} — how many runs?
        </p>
        <div className="grid grid-cols-4 gap-2 mb-2">
          {[0, 1, 2, 3].map((r) => (
            <button
              key={r}
              onClick={() => handleExtraRuns(r)}
              className="btn-secondary py-3 text-xl font-bold rounded-lg"
            >
              {r}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {[4, 6].map((r) => (
            <button
              key={r}
              onClick={() => handleExtraRuns(r)}
              className="btn-secondary py-3 text-xl font-bold rounded-lg"
            >
              {r}
            </button>
          ))}
        </div>
        <button
          onClick={() => setPendingType(null)}
          className="w-full btn-secondary py-2 text-sm text-slate-400"
        >
          ← Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="card grid grid-cols-2 gap-2 sm:gap-3">
      <button
        onClick={() => handleExtraType('wide')}
        disabled={disabled}
        className="bg-yellow-700 hover:bg-yellow-600 active:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 font-semibold rounded-lg transition"
      >
        Wide
      </button>
      <button
        onClick={() => handleExtraType('noBall')}
        disabled={disabled}
        className="bg-orange-700 hover:bg-orange-600 active:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 font-semibold rounded-lg transition"
      >
        No Ball
      </button>
      <button
        onClick={() => handleExtraType('bye')}
        disabled={disabled}
        className="bg-purple-700 hover:bg-purple-600 active:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 font-semibold rounded-lg transition"
      >
        Bye
      </button>
      <button
        onClick={() => handleExtraType('legBye')}
        disabled={disabled}
        className="bg-pink-700 hover:bg-pink-600 active:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 font-semibold rounded-lg transition"
      >
        Leg Bye
      </button>
    </div>
  );
}

// ── Dismissal label → backend enum mapping ────────────────────────────────────

const DISMISSAL_LABEL_TO_ENUM = {
  'Bowled':      'bowled',
  'Caught':      'caught',
  'Run Out':     'runOut',
  'Stumped':     'stumped',
  'LBW':         'lbw',
  'Hit Wicket':  'hitWicket',
  'C&B':         'caughtAndBowled',
  'Retired':     'retired',
};

// Dismissal types that always affect the striker (no need to ask who)
const STRIKER_ONLY_DISMISSALS = ['bowled', 'hitWicket', 'caughtAndBowled', 'lbw'];

// ── WicketFlow bottom sheet ───────────────────────────────────────────────────

export function WicketFlow({ isOpen, dismissalTypes, batters, strikerId, onSelect, onCancel }) {
  const [dismissalType, setDismissalType] = useState(null);
  // batterId = the playerId of the dismissed batter
  const [selectedBatterId, setSelectedBatterId] = useState(null);

  // Auto-select striker for striker-only dismissals
  const handleDismissalTypeSelect = (type) => {
    const normalizedType = DISMISSAL_LABEL_TO_ENUM[type] || type.toLowerCase();
    setDismissalType(type);

    // For bowled, hit wicket, C&B, LBW - automatically select the striker
    if (STRIKER_ONLY_DISMISSALS.includes(normalizedType) && strikerId) {
      setSelectedBatterId(strikerId);
    }
  };

  const handleConfirm = () => {
    if (dismissalType && selectedBatterId) {
      // Normalize display label to backend enum value
      const normalizedType = DISMISSAL_LABEL_TO_ENUM[dismissalType] || dismissalType.toLowerCase();
      onSelect({ dismissalType: normalizedType, batterId: selectedBatterId });
    }
  };

  // Check if we need to show batter selection
  const normalizedType = dismissalType ? DISMISSAL_LABEL_TO_ENUM[dismissalType] || dismissalType.toLowerCase() : null;
  const showBatterSelection = normalizedType && !STRIKER_ONLY_DISMISSALS.includes(normalizedType);

  // Reset selected batter when dismissal type changes to non-striker-only
  const handleDismissalTypeChange = (type) => {
    const norm = DISMISSAL_LABEL_TO_ENUM[type] || type.toLowerCase();
    setDismissalType(type);
    if (!STRIKER_ONLY_DISMISSALS.includes(norm)) {
      setSelectedBatterId(null); // Reset for user to choose
    } else {
      setSelectedBatterId(strikerId); // Auto-select striker
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4">
      <div className="max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-white/10 bg-slate-900 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:rounded-2xl sm:p-6">
        <h2 className="text-lg font-bold mb-4">Record Wicket</h2>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-300 mb-2">Dismissal Type</label>
          <div className="grid grid-cols-2 gap-2">
            {dismissalTypes.map(type => {
              const norm = DISMISSAL_LABEL_TO_ENUM[type] || type.toLowerCase();
              const isStrikerOnly = STRIKER_ONLY_DISMISSALS.includes(norm);
              return (
                <button
                  key={type}
                  onClick={() => handleDismissalTypeChange(type)}
                  className={`p-3 rounded-lg font-semibold transition relative ${
                    dismissalType === type ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {type}
                  {isStrikerOnly && (
                    <span className="absolute -top-1 -right-1 text-[10px] bg-teal-500 text-white px-1.5 py-0.5 rounded-full">
                      Striker
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {normalizedType && STRIKER_ONLY_DISMISSALS.includes(normalizedType) && (
            <p className="text-xs text-teal-400 mt-2">
              ✓ Striker automatically selected for this dismissal type
            </p>
          )}
        </div>

        {/* Only show batter selection for non-striker-only dismissals */}
        {showBatterSelection && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-300 mb-2">Who got out?</label>
            <div className="space-y-2">
              {batters.map(batter => (
                <button
                  key={batter.playerId}
                  onClick={() => setSelectedBatterId(batter.playerId)}
                  className={`w-full p-3 rounded-lg font-semibold transition text-left ${
                    selectedBatterId === batter.playerId ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {batter.playerId === strikerId && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">Striker</span>
                    )}
                    <span>{batter.displayName}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 btn-secondary py-3">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!dismissalType || !selectedBatterId}
            className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Wicket
          </button>
        </div>
      </div>
    </div>
  );
}

// ── BatterSelector bottom sheet ───────────────────────────────────────────────

/**
 * Bottom sheet to pick the next batter after a wicket.
 * `batters` is the full player list for the batting team (registered players).
 * `alreadyIn` is a set of playerIds already in the innings (so we filter them out).
 * `dismissedIds` is a set of playerIds who are out (already included in alreadyIn but explicit for clarity).
 */
export function BatterSelector({ isOpen, batters, alreadyIn, dismissedIds, onSelect, onCancel }) {
  const [selectedBatterId, setSelectedBatterId] = useState(null);

  if (!isOpen) return null;

  // Filter eligible batters: exclude players already in innings (whether out or not)
  const available = batters.filter(p => !alreadyIn.has(p.playerId));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4">
      <div className="max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-white/10 bg-slate-900 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:rounded-2xl sm:p-6">
        <h2 className="text-lg font-bold mb-4">Select Next Batter</h2>

        {available.length === 0 ? (
          <div className="mb-6">
            <p className="text-slate-400 mb-2">No more batters available.</p>
            <p className="text-sm text-slate-500">All registered batters have already batted.</p>
          </div>
        ) : (
          <div className="space-y-2 mb-6">
            {available.map(batter => (
              <button
                key={batter.playerId}
                onClick={() => setSelectedBatterId(batter.playerId)}
                className={`w-full p-3 rounded-lg font-semibold transition text-left ${
                  selectedBatterId === batter.playerId ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {batter.displayName}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 btn-secondary py-3">
            Cancel
          </button>
          <button
            onClick={() => onSelect(selectedBatterId)}
            disabled={!selectedBatterId}
            className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Batter
          </button>
        </div>
      </div>
    </div>
  );
}

// ── BowlerSelector bottom sheet ───────────────────────────────────────────────

export function BowlerSelector({ isOpen, bowlers, previousBowlerId, currentInnings, match, onSelect, onCancel }) {
  const [selectedBowlerId, setSelectedBowlerId] = useState(null);

  if (!isOpen) return null;

  // Get bowling stats for each bowler from current innings
  const bowlerStats = currentInnings?.bowlers || [];

  // Compute eligibility based on bowling restrictions:
  // 1. No consecutive overs by same bowler (except only option)
  // 2. Max overs per bowler = match.oversPerInnings
  const eligibleBowlers = bowlers.filter(bowler => {
    // Check if this is the previous bowler
    const isPreviousBowler = bowler.playerId === previousBowlerId;

    // Find bowler's stats if any
    const stats = bowlerStats.find(b => b.playerId === bowler.playerId);
    const legalBallsBowled = stats?.legalBallsBowled || 0;
    const oversBowled = Math.floor(legalBallsBowled / 6);

    // Check max overs restriction
    const maxOversPerBowler = match?.oversPerInnings || 20;
    const hasReachedQuota = oversBowled >= maxOversPerBowler;

    // Exclude bowlers who have reached quota
    if (hasReachedQuota) return false;

    // Exclude previous bowler unless it's the only eligible option
    if (isPreviousBowler) {
      // Check if there are other eligible bowlers
      const otherEligible = bowlers.filter(b =>
        b.playerId !== previousBowlerId &&
        (bowlerStats.find(bs => bs.playerId === b.playerId)?.legalBallsBowled || 0) / 6 < maxOversPerBowler
      );
      return otherEligible.length === 0; // Only allow if it's the only option
    }

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4">
      <div className="max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-white/10 bg-slate-900 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:rounded-2xl sm:p-6">
        <h2 className="text-lg font-bold mb-4">Select Next Bowler</h2>

        {eligibleBowlers.length === 0 ? (
          <div className="mb-6 text-center">
            <p className="text-slate-400 mb-2">No eligible bowlers available.</p>
            <p className="text-sm text-slate-500">Try selecting a different player or check bowling limits.</p>
          </div>
        ) : (
          <div className="space-y-2 mb-6">
            {eligibleBowlers.map(bowler => {
              const stats = bowlerStats.find(b => b.playerId === bowler.playerId);
              const legalBallsBowled = stats?.legalBallsBowled || 0;
              const oversBowled = Math.floor(legalBallsBowled / 6);
              const maxOvers = match?.oversPerInnings || 20;
              const isPreviousBowler = bowler.playerId === previousBowlerId;

              return (
                <button
                  key={bowler.playerId}
                  onClick={() => setSelectedBowlerId(bowler.playerId)}
                  className={`w-full p-3 rounded-lg font-semibold transition text-left ${
                    selectedBowlerId === bowler.playerId ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{bowler.displayName}</div>
                      <div className="text-xs text-slate-400">
                        {oversBowled}.{legalBallsBowled % 6} / {maxOvers} overs
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isPreviousBowler && (
                        <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-300 rounded-full">
                          Previous
                        </span>
                      )}
                      {stats && (
                        <span className="text-xs px-2 py-1 bg-slate-600 text-slate-300 rounded-full">
                          {stats.wickets || 0} wkts
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 btn-secondary py-3">
            Cancel
          </button>
          <button
            onClick={() => onSelect(selectedBowlerId)}
            disabled={!selectedBowlerId}
            className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select Bowler
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Undo Button ───────────────────────────────────────────────────────────────

export function UndoButton({ onUndo, disabled }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        disabled={disabled}
        className="w-full bg-slate-800 border border-slate-600 hover:bg-slate-700 text-slate-300 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Undo2 className="w-4 h-4" />
        Undo Last Ball
      </button>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Undo Last Delivery?"
        message="This will remove the last ball from the scorecard and recalculate all stats."
        isDangerous={true}
        onConfirm={() => {
          setConfirmOpen(false);
          onUndo();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

// ── ScorerControls (main) ─────────────────────────────────────────────────────

export function ScorerControls({ match, matchId, scorerToken, onDelivery, onUndo, disabled }) {
  const [wicketModalOpen, setWicketModalOpen] = useState(false);
  const [bowlerModalOpen, setBowlerModalOpen] = useState(false);
  const [batterModalOpen, setBatterModalOpen] = useState(false);

  const innings = match.currentInnings === 1 ? match.innings1 : match.innings2;

  // Players in the batting team (already-active batters from innings)
  const activeBatters = innings?.batters?.filter(b => !b.isOut) || [];

  // Set of playerIds that have already batted / are already in the innings table
  const alreadyInInnings = new Set((innings?.batters || []).map(b => b.playerId));

  // Set of dismissed playerIds
  const dismissedIds = new Set((innings?.batters || []).filter(b => b.isOut).map(b => b.playerId));

  // FIX: Use innings battingTeamName to determine correct teams
  // The innings object has battingTeamName and bowlingTeamName which are authoritative
  const isTeam1Batting = innings?.battingTeamName === match.team1?.teamName;

  // Bowling team's registered players for bowler selection (opposite of batting team)
  const registeredBowlers = isTeam1Batting
    ? match.team2?.players || []
    : match.team1?.players || [];

  // Batting team's full player list for batter selection
  const registeredBatters = isTeam1Batting
    ? match.team1?.players || []
    : match.team2?.players || [];

  // Check if teams have registered players
  const hasRegisteredBatters = registeredBatters.length > 0;
  const hasRegisteredBowlers = registeredBowlers.length > 0;

  // If no registered players, fall back to showing current innings players for selection
  // This handles matches created before the player-registration feature was added
  const availableBatters = hasRegisteredBatters ? registeredBatters : [];
  const availableBowlers = hasRegisteredBowlers ? registeredBowlers : [];

  return (
    <>
      <div className="space-y-4">
        {/* Need new batter? */}
        {innings?.needNewBatter && (
          <button
            onClick={() => setBatterModalOpen(true)}
            className="w-full card border-amber-500/50 bg-amber-500/10 text-amber-300 text-sm font-semibold text-center py-3 hover:bg-amber-500/20 transition"
          >
            ⚠ Wicket! Tap to select the next batter.
          </button>
        )}

        {/* Need new bowler? */}
        {innings?.needNewBowler && (
          <button
            onClick={() => setBowlerModalOpen(true)}
            className="w-full card border-blue-500/50 bg-blue-500/10 text-blue-300 text-sm font-semibold text-center py-3 hover:bg-blue-500/20 transition"
          >
            🏏 Over complete! Tap to select the next bowler.
          </button>
        )}

        <RunButtons
          onRun={(runs) => onDelivery({ runsOffBat: runs, strikerId: innings.activeStrikerId, nonStrikerId: innings.activeNonStrikerId, bowlerId: innings.activeBowlerId })}
          disabled={disabled || innings?.needNewBatter || innings?.needNewBowler}
        />

        <ExtrasPanel
          onExtra={(extraType, extraRuns) =>
            onDelivery({ extraType, extraRuns: extraRuns || 0 })
          }
          disabled={disabled || innings?.needNewBatter || innings?.needNewBowler}
        />

        <button
          onClick={() => setWicketModalOpen(true)}
          disabled={disabled || innings?.needNewBatter || innings?.needNewBowler}
          className="w-full btn-danger py-4 font-bold text-lg"
        >
          WICKET
        </button>

        <UndoButton onUndo={onUndo} disabled={disabled} />
      </div>

      {/* Wicket bottom sheet */}
      <WicketFlow
        isOpen={wicketModalOpen}
        dismissalTypes={['Bowled', 'Caught', 'Run Out', 'Stumped', 'LBW', 'Hit Wicket', 'C&B', 'Retired']}
        batters={activeBatters}
        strikerId={innings?.activeStrikerId}
        onSelect={(data) => {
          setWicketModalOpen(false);
          // Build the correct backend payload shape
          onDelivery({
            runsOffBat: 0,
            isWicket: true,
            wicket: {
              type: data.dismissalType,
              dismissedBatterId: data.batterId,
            },
          });
        }}
        onCancel={() => setWicketModalOpen(false)}
      />

      {/* Batter selector bottom sheet */}
      <BatterSelector
        isOpen={batterModalOpen}
        batters={availableBatters}
        alreadyIn={alreadyInInnings}
        dismissedIds={dismissedIds}
        onSelect={(batterId) => {
          if (!batterId) return;
          setBatterModalOpen(false);
          const batterRef = availableBatters.find(b => b.playerId === batterId);
          const displayName = batterRef?.displayName || batterId;
          import('../../api/matchApi.js').then(({ matchApi }) => {
            matchApi.selectBatter(matchId, { playerId: batterId, displayName });
          });
        }}
        onCancel={() => setBatterModalOpen(false)}
      />

      {/* Bowler selector bottom sheet */}
      <BowlerSelector
        isOpen={bowlerModalOpen}
        bowlers={availableBowlers}
        previousBowlerId={innings?.activeBowlerId}
        currentInnings={innings}
        match={match}
        onSelect={(bowlerId) => {
          if (!bowlerId) return;
          setBowlerModalOpen(false);
          const bowlerRef = availableBowlers.find(b => b.playerId === bowlerId);
          const displayName = bowlerRef?.displayName || bowlerId;
          import('../../api/matchApi.js').then(({ matchApi }) => {
            matchApi.changeBowler(matchId, { playerId: bowlerId, displayName });
          });
        }}
        onCancel={() => setBowlerModalOpen(false)}
      />
    </>
  );
}
