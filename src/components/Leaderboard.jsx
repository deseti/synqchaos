import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('leaderboard')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'players' }, 
        () => {
          loadLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('address, avatar, score')
        .order('score', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Group by address and get highest score for each player
      const playerScores = {};
      data?.forEach(player => {
        if (!playerScores[player.address] || playerScores[player.address].score < player.score) {
          playerScores[player.address] = player;
        }
      });

      const sortedPlayers = Object.values(playerScores).sort((a, b) => b.score - a.score);
      setLeaderboard(sortedPlayers);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-md bg-gray-800/50 rounded-lg p-6 shadow-2xl backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-center text-yellow-400 mb-6">🏆 Leaderboard</h2>
        <p className="text-center text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-gray-800/50 rounded-lg p-6 shadow-2xl backdrop-blur-sm">
      <h2 className="text-2xl font-bold text-center text-yellow-400 mb-6">🏆 Leaderboard</h2>
      
      <div className="space-y-3">
        {leaderboard.map((player, index) => (
          <div key={player.address} className="flex items-center bg-gray-700/50 p-3 rounded-md">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
              index === 0 ? 'bg-yellow-500' : 
              index === 1 ? 'bg-gray-400' : 
              index === 2 ? 'bg-amber-600' : 'bg-gray-600'
            }`}>
              {index + 1}
            </div>
            
            <div className="ml-3 flex-1">
              <p className="text-sm text-gray-300">
                {player.address.substring(0, 6)}...{player.address.substring(38)}
              </p>
              {player.avatar && (
                <p className="text-xs text-blue-400">Avatar: {player.avatar}</p>
              )}
            </div>
            
            <div className="text-right">
              <p className="text-lg font-bold text-white">{player.score}</p>
              <p className="text-xs text-gray-400">points</p>
            </div>
          </div>
        ))}
        
        {leaderboard.length === 0 && (
          <p className="text-gray-400 text-sm text-center">No scores yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}
