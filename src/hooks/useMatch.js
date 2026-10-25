import { useState, useEffect } from 'react';
import { matchApi } from '../api/matchApi.js';

export function useMatch(matchId, socketContext) {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract socket and setLastMatchId from context
  const socket = socketContext?.socket || null;
  const setLastMatchId = socketContext?.setLastMatchId || null;

  // Initial fetch
  useEffect(() => {
    const fetchMatch = async () => {
      try {
        setLoading(true);
        const data = await matchApi.getMatch(matchId);
        setMatch(data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load match');
        setMatch(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId]);

  // Socket.IO real-time updates
  useEffect(() => {
    if (!socket || !matchId) return;

    // Join the match room — send publicId (matchId from URL = publicId)
    socket.emit('joinMatch', { publicId: matchId });

    // Track this match ID so reconnection can re-join
    if (setLastMatchId) {
      setLastMatchId(matchId);
    }

    const handleScoreUpdate = (data) => {
      setMatch(data);
    };

    const handleMatchState = (data) => {
      setMatch(data);
    };

    socket.on('scoreUpdate', handleScoreUpdate);
    socket.on('matchState', handleMatchState);

    return () => {
      socket.off('scoreUpdate', handleScoreUpdate);
      socket.off('matchState', handleMatchState);
    };
  }, [socket, matchId, setLastMatchId]);

  return { match, loading, error };
}
