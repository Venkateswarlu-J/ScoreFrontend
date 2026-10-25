import React from 'react';

const OVERS_OPTIONS = [
  { label: 'Super Over', value: 1, icon: '⚡' },
  { label: '2 Overs', value: 2 },
  { label: '3 Overs', value: 3 },
  { label: '4 Overs', value: 4 },
  { label: '5 Overs', value: 5 },
  { label: '6 Overs', value: 6 },
  { label: '8 Overs', value: 8 },
  { label: '10 Overs', value: 10 },
  { label: '15 Overs', value: 15 },
  { label: '20 Overs', value: 20 },
  { label: '30 Overs', value: 30 },
  { label: '50 Overs', value: 50 },
];

export function OversSelector({ value, onChange, showLabel = true }) {
  return (
    <div className="space-y-4">
      {showLabel && (
        <label className="block text-sm font-semibold text-slate-200">
          Select Match Format
        </label>
      )}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {OVERS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`
              relative py-4 px-3 rounded-lg font-semibold transition-all duration-200
              text-sm md:text-base border-2
              ${
                value === opt.value
                  ? 'bg-teal-500 text-white border-teal-400 shadow-lg shadow-teal-500/30 scale-105'
                  : 'bg-slate-700 text-slate-300 border-slate-600 hover:border-slate-500 hover:bg-slate-600'
              }
            `}
          >
            <div className="flex flex-col items-center gap-1">
              {opt.icon && <span className="text-xl">{opt.icon}</span>}
              <span>{opt.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export { OVERS_OPTIONS };
