import React, { useEffect, useState } from 'react';

/**
 * Celebration Animation Component
 * Shows exciting animations for boundaries, wickets, and special moments
 */
export function CelebrationAnimation({ type, onComplete }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  const getAnimationContent = () => {
    switch (type) {
      case 'four':
        return {
          emoji: '4️⃣',
          text: 'FOUR!',
          subtext: 'Boundary!',
          bgClass: 'bg-emerald-500/90',
          textClass: 'text-white',
        };
      case 'six':
        return {
          emoji: '6️⃣',
          text: 'SIX!',
          subtext: 'Maximum!',
          bgClass: 'bg-amber-500/90',
          textClass: 'text-white',
        };
      case 'wicket':
        return {
          emoji: '🎯',
          text: 'WICKET!',
          subtext: 'Out!',
          bgClass: 'bg-red-500/90',
          textClass: 'text-white',
        };
      case 'fifty':
        return {
          emoji: '🏆',
          text: 'FIFTY!',
          subtext: 'Well played!',
          bgClass: 'bg-blue-500/90',
          textClass: 'text-white',
        };
      case 'century':
        return {
          emoji: '👑',
          text: 'CENTURY!',
          subtext: '100 Runs!',
          bgClass: 'bg-purple-500/90',
          textClass: 'text-yellow-300',
        };
      case 'maiden':
        return {
          emoji: '🎯',
          text: 'MAIDEN OVER!',
          subtext: '0 runs conceded',
          bgClass: 'bg-teal-500/90',
          textClass: 'text-white',
        };
      case 'fiveWickets':
        return {
          emoji: '⭐',
          text: '5 WICKETS!',
          subtext: 'Brilliant bowling!',
          bgClass: 'bg-red-600/90',
          textClass: 'text-yellow-300',
        };
      default:
        return null;
    }
  };

  const content = getAnimationContent();
  if (!content) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 animate-fade-in" />

      {/* Main Animation */}
      <div className={`relative ${content.bgClass} rounded-3xl px-12 py-8 shadow-2xl animate-bounce-in`}>
        {/* Particles */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-white/40 rounded-full animate-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative text-center">
          <div className="text-6xl mb-2 animate-pulse">{content.emoji}</div>
          <h2 className={`text-4xl md:text-5xl font-black ${content.textClass} animate-scale-up`}>
            {content.text}
          </h2>
          <p className={`text-lg ${content.textClass} opacity-90 mt-1 animate-fade-in-delayed`}>
            {content.subtext}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Score Update Animation - Shows the last ball result
 */
export function ScoreUpdateAnimation({ result, show }) {
  if (!show || !result) return null;

  const getColor = () => {
    if (result.type === 'wicket') return 'bg-red-500';
    if (result.runs === 4) return 'bg-emerald-500';
    if (result.runs === 6) return 'bg-amber-500';
    if (result.extraType === 'wide') return 'bg-yellow-500';
    if (result.extraType === 'noBall') return 'bg-orange-500';
    return 'bg-teal-500';
  };

  const getLabel = () => {
    if (result.type === 'wicket') return 'W';
    if (result.runs === 0 && !result.extraType) return '•';
    if (result.extraType === 'wide') return `Wd+${result.extraRuns || 0}`;
    if (result.extraType === 'noBall') return `Nb+${result.extraRuns || 0}`;
    return result.runs;
  };

  return (
    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 animate-float-up">
      <div className={`${getColor()} text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2`}>
        <span className="text-2xl font-bold">{getLabel()}</span>
        {result.runs > 0 && !result.extraType && (
          <span className="text-sm opacity-80">run{result.runs > 1 ? 's' : ''}</span>
        )}
      </div>
    </div>
  );
}

/**
 * CSS Animations to add to index.css
 */
export const animationStyles = `
@keyframes bounce-in {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes scale-up {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes fade-in-delayed {
  0%, 30% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes float-up {
  0% { transform: translate(-50%, 0); opacity: 1; }
  100% { transform: translate(-50%, -100px); opacity: 0; }
}

@keyframes particle {
  0% { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--tx, 50px), var(--ty, -50px)) scale(0); opacity: 0; }
}

.animate-bounce-in {
  animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.animate-scale-up {
  animation: scale-up 0.4s ease-out;
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.animate-fade-in-delayed {
  animation: fade-in-delayed 0.5s ease-out;
}

.animate-float-up {
  animation: float-up 1.5s ease-out forwards;
}

.animate-particle {
  animation: particle 1s ease-out forwards;
}
`;
