import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all'); // 'today', 'week', 'all'

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
  }, [timeframe]);

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

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return '👑';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '⚔️';
    }
  };

  const getRankColor = (index) => {
    switch (index) {
      case 0: return 'from-yellow-500 to-yellow-600';
      case 1: return 'from-gray-400 to-gray-500';
      case 2: return 'from-amber-600 to-amber-700';
      default: return 'from-dark-600 to-dark-700';
    }
  };

  if (loading) {
    return (
      <div className="card p-6 w-full animate-pulse">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-cyber font-bold text-gradient">🏆 Leaderboard</h2>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-dark-800/50 rounded-lg">
                <div className="w-10 h-10 bg-dark-700 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-dark-700 rounded animate-pulse"></div>
                  <div className="h-3 bg-dark-700 rounded w-2/3 animate-pulse"></div>
                </div>
                <div className="w-12 h-6 bg-dark-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 w-full animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4 mb-6">
        <h2 className="text-2xl font-cyber font-bold text-gradient">🏆 Leaderboard</h2>
        <p className="text-sm text-gray-400">Top chaos warriors in the arena</p>
        
        {/* Timeframe Selector */}
        <div className="flex justify-center space-x-2">
          {['all', 'week', 'today'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                timeframe === period
                  ? 'bg-purple-600 text-white'
                  : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
              }`}
            >
              {period === 'all' ? 'All Time' : period === 'week' ? 'This Week' : 'Today'}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {leaderboard.map((player, index) => (
          <div 
            key={player.address} 
            className={`relative flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 hover:transform hover:scale-[1.02] ${
              index < 3 
                ? 'bg-gradient-to-r ' + getRankColor(index) + '/20 border border-current/20' 
                : 'bg-dark-800/50 hover:bg-dark-700/50'
            }`}
          >
            {/* Rank Badge */}
            <div className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br ${getRankColor(index)} shadow-lg`}>
              <span className="text-lg">{getRankIcon(index)}</span>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-dark-900 rounded-full flex items-center justify-center text-xs font-bold text-gray-300">
                {index + 1}
              </div>
            </div>
            
            {/* Player Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-semibold text-white truncate">
                  {player.address.substring(0, 6)}...{player.address.substring(38)}
                </p>
                {index < 3 && (
                  <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getRankColor(index)} text-white`}>
                    {index === 0 ? 'Champion' : index === 1 ? 'Elite' : 'Master'}
                  </span>
                )}
              </div>
              {player.avatar && (
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-xs text-gray-400">Avatar:</span>
                  <span className="text-xs text-blue-400 capitalize">{player.avatar}</span>
                </div>
              )}
            </div>
            
            {/* Score */}
            <div className="text-right">
              <p className={`text-xl font-bold ${index < 3 ? 'text-white' : 'text-gray-300'}`}>
                {player.score.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">points</p>
            </div>

            {/* Glow Effect for Top 3 */}
            {index < 3 && (
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${getRankColor(index)} opacity-20 blur-sm -z-10`}></div>
            )}
          </div>
        ))}
        
        {leaderboard.length === 0 && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-dark-800 rounded-full mx-auto flex items-center justify-center">
              <span className="text-2xl">🏆</span>
            </div>
            <div>
              <p className="text-gray-400 text-sm">No scores yet</p>
              <p className="text-xs text-gray-500 mt-1">Be the first to claim the throne!</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {leaderboard.length > 0 && (
        <div className="mt-6 pt-4 border-t border-dark-700">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-purple-400">{leaderboard.length}</div>
              <div className="text-xs text-gray-400">Active Players</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-400">
                {Math.max(...leaderboard.map(p => p.score)).toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Highest Score</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
