import React from 'react';
export { CelebrationAnimation, ScoreUpdateAnimation } from './MatchAnimations.jsx';

export function StatusBadge({ status }) {
  const statusConfig = {
    LIVE: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'LIVE' },
    UPCOMING: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'UPCOMING' },
    COMPLETED: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30', label: 'COMPLETED' },
    INNINGS_BREAK: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', label: 'INNINGS BREAK' },
    TIED: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', label: 'TIED' },
    SUPER_OVER: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30', label: 'SUPER OVER' }
  };

  const config = statusConfig[status] || statusConfig.UPCOMING;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${config.bg} ${config.text} ${config.border} text-sm font-semibold`}>
      {status === 'LIVE' && <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse-custom" />}
      {config.label}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-slate-700 border-t-teal-500 rounded-full animate-spin" />
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-xl font-semibold text-slate-300 mb-2">{title}</p>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}

export function ErrorState({ message }) {
  return (
    <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
      <p className="font-semibold">Error</p>
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function ConnectionStatus({ isConnected }) {
  return (
    <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
      isConnected
        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
    }`}>
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-yellow-400'} ${!isConnected ? 'animate-pulse' : ''}`} />
      {isConnected ? 'Connected' : 'Reconnecting...'}
    </div>
  );
}

export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, isDangerous }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 max-w-sm">
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <p className="text-slate-300 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 btn-secondary py-2"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 ${isDangerous ? 'btn-danger' : 'btn-primary'} py-2`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
