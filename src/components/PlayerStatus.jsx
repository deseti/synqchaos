import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '../utils/supabaseClient';

export function PlayerStatus() {
  const { address, isConnected } = useAccount();
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkPlayerStatus = async () => {
    if (!isConnected || !address) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('address', address)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking player status:', error);
        setPlayerData(null);
      } else {
        setPlayerData(data);
      }
    } catch (error) {
      console.error('Error in checkPlayerStatus:', error);
      setPlayerData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPlayerStatus();
  }, [isConnected, address]);

  if (!isConnected) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">🔍 Player Status</h3>
        <p className="text-xs text-gray-400">Connect wallet to check status</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-300">🔍 Player Status</h3>
        <button
          onClick={checkPlayerStatus}
          disabled={loading}
          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Refresh'}
        </button>
      </div>
      
      <div className="space-y-1 text-xs">
        <p className="text-gray-400">
          Wallet: <span className="text-white">{address?.substring(0, 6)}...{address?.substring(38)}</span>
        </p>
        
        {playerData ? (
          <div className="text-green-400">
            <p>✅ Registered in database</p>
            <p>Avatar: <span className="text-white">{playerData.avatar}</span></p>
            <p>Registered: <span className="text-white">{new Date(playerData.created_at).toLocaleDateString()}</span></p>
            <p>Total Games: <span className="text-white">{playerData.total_games}</span></p>
            <p>Total Score: <span className="text-white">{playerData.total_score}</span></p>
          </div>
        ) : (
          <div className="text-red-400">
            <p>❌ Not registered in database</p>
            <p className="text-xs text-gray-500">Should auto-register on wallet connect</p>
          </div>
        )}
      </div>
    </div>
  );
}
