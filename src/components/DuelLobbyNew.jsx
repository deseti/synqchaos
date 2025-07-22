import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '../utils/supabaseClient';

export function DuelLobby({ onStartDuel, playerAvatar, selectedNFT }) {
  const { address, isConnected } = useAccount();
  const [availableDuels, setAvailableDuels] = useState([]);
  const [myDuel, setMyDuel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inviteAddress, setInviteAddress] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);

  useEffect(() => {
    if (!isConnected) return;
    loadAvailableDuels();
    // Subscribe to real-time updates
    const duelsSubscription = supabase
      .channel('duels')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'duels' }, 
        () => {
          loadAvailableDuels();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(duelsSubscription);
    };
  }, [isConnected]);

  const loadAvailableDuels = async () => {
    try {
      const { data, error } = await supabase
        .from('duels')
        .select('*')
        .in('status', ['waiting', 'active', 'invited'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      
      // Check if current player has an active duel
      const currentPlayerDuel = data?.find(duel => 
        duel.player1 === address || duel.player2 === address
      );
      setMyDuel(currentPlayerDuel);
    } catch (error) {
      console.error('Error loading duels:', error);
    }
  };

  const createDuel = async () => {
    if (!isConnected || loading) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('duels')
        .insert([
          {
            player1: address,
            status: 'waiting'
          }
        ])
        .select()
        .single();
      if (error) throw error;

      // Add player to duel_participants table
      await supabase
        .from('duel_participants')
        .insert([
          {
            address: address,
            avatar: playerAvatar,
            duel_id: data.id
          }
        ]);

      setMyDuel(data);
    } catch (error) {
      console.error('Error creating duel:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDuelWithInvite = async (targetAddress) => {
    if (!isConnected || loading || !targetAddress) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('duels')
        .insert([
          {
            player1: address,
            player2: targetAddress,
            status: 'invited'
          }
        ])
        .select()

      if (error) throw error;

      // Add player1 to duel_participants table
      await supabase
        .from('duel_participants')
        .insert([
          {
            address: address,
            avatar: playerAvatar,
            duel_id: data.id
          }
        ]);

      setMyDuel(data);
      setShowInviteForm(false);
      setInviteAddress('');
    } catch (error) {
      console.error('Error creating invite duel:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinDuel = async (duelId) => {
    
    setLoading(true);
    try {
      // Update duel with player2
      const { error: duelError } = await supabase
        .from('duels')
        .update({ 
          player2: address,
          status: 'active'
        })

      if (duelError) throw duelError;

      // Add player to duel_participants table
      await supabase
        .from('duel_participants')
        .insert([
          {
            address: address,
            avatar: playerAvatar,
          }
        ]);

      // Start the duel
      const duel = availableDuels.find(d => d.id === duelId);
      if (duel) {
        onStartDuel(duel);
      }
    } catch (error) {
      console.error('Error joining duel:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptInvite = async (duelId) => {
    
    setLoading(true);
    try {
      // Update duel status to active
      const { error: duelError } = await supabase
        .from('duels')
        .update({ status: 'active' })
        .eq('id', duelId)

      if (duelError) throw duelError;

      // Add player2 to duel_participants table
      await supabase
        .from('duel_participants')
        .insert([
          {
            address: address,
            avatar: playerAvatar,
          }
        ]);

      // Start the duel
      const duel = availableDuels.find(d => d.id === duelId);
      if (duel) {
        onStartDuel({ ...duel, status: 'active' });
      }
    } catch (error) {
      console.error('Error accepting invite:', error);
    } finally {
      setLoading(false);
    }
  };

  const declineInvite = async (duelId) => {
    if (!isConnected || loading) return;
    
    setLoading(true);
    try {
      await supabase
        .from('duels')
        .delete()
        .eq('id', duelId)
        .eq('player2', address);

      await supabase
        .from('duel_participants')
        .delete()
        .eq('duel_id', duelId);

    } catch (error) {
      console.error('Error declining invite:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelDuel = async () => {
    if (!myDuel || loading) return;
    
    setLoading(true);
    try {
      await supabase
        .from('duels')
        .delete()
        .eq('id', myDuel.id);

      await supabase
        .from('duel_participants')
        .delete()
        .eq('duel_id', myDuel.id);

      setMyDuel(null);
    } catch (error) {
      console.error('Error canceling duel:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center text-gray-400">
        Connect your wallet to join duels
      </div>
    );
  }

  const myInvites = availableDuels.filter(duel => 
    duel.status === 'invited' && duel.player2 === address
  );

  return (
    <div className="w-full max-w-2xl bg-gray-800/50 rounded-lg p-6 shadow-2xl backdrop-blur-sm">
      <h2 className="text-2xl font-bold text-center text-red-400 mb-6">⚔️ Duel Arena</h2>
      
      {/* NFT Influence Section */}
      {selectedNFT && (
        <div className="mb-6 p-4 bg-red-900/30 rounded-lg border border-red-500">
          <h3 className="text-lg font-semibold text-red-300 mb-2">Battle NFT Active</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">{selectedNFT.name}</p>
              <p className="text-xs text-red-400">Power: {selectedNFT.power}</p>
            </div>
            <div className="text-2xl">⚡</div>
          </div>
        </div>
      )}

      {/* Invite by Address Section */}
      {!myDuel && (
        <div className="mb-6 p-4 bg-purple-900/30 rounded-lg border border-purple-500">
          <h3 className="text-lg font-semibold text-purple-300 mb-3">Invite Friend to Duel</h3>
          {!showInviteForm ? (
            <button
              onClick={() => setShowInviteForm(true)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              📩 Invite by Address
            </button>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={inviteAddress}
                onChange={(e) => setInviteAddress(e.target.value)}
                placeholder="Enter wallet address (0x...)"
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => createDuelWithInvite(inviteAddress)}
                  disabled={loading || !inviteAddress.match(/^0x[a-fA-F0-9]{40}$/)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  Send Invite
                </button>
                <button
                  onClick={() => {
                    setShowInviteForm(false);
                    setInviteAddress('');
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* My Invites (Received) */}
      {myInvites.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-900/30 rounded-lg border border-yellow-500">
          <h3 className="text-lg font-semibold text-yellow-300 mb-3">📨 Duel Invites</h3>
          <div className="space-y-2">
            {myInvites.map((duel) => (
              <div key={duel.id} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-md">
                <div>
                  <p className="text-sm text-gray-300">
                    From: {duel.player1.substring(0, 6)}...{duel.player1.substring(38)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(duel.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptInvite(duel.id)}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1 px-3 rounded transition-colors disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => declineInvite(duel.id)}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-3 rounded transition-colors disabled:opacity-50"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Duel Status */}
      {myDuel && (
        <div className="mb-6 p-4 bg-blue-900/30 rounded-lg border border-blue-500">
          <h3 className="text-lg font-semibold text-blue-300 mb-2">Your Duel</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Status: {myDuel.status}</p>
              {myDuel.status === 'waiting' && (
                <p className="text-xs text-yellow-400">Waiting for opponent...</p>
              )}
              {myDuel.status === 'invited' && (
                <p className="text-xs text-purple-400">
                  Invite sent to: {myDuel.player2.substring(0, 6)}...{myDuel.player2.substring(38)}
                </p>
              )}
              {myDuel.status === 'active' && (
                <button
                  onClick={() => onStartDuel(myDuel)}
                  className="mt-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Enter Duel
                </button>
              )}
            </div>
            <button
              onClick={cancelDuel}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Create Duel Button */}
      {!myDuel && (
        <div className="mb-6">
          <button
            onClick={createDuel}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Open Duel'}
          </button>
        </div>
      )}

      {/* Available Open Duels */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-300">Open Duels</h3>
        <div className="max-h-64 overflow-y-auto pr-2">
          {availableDuels
            .filter(duel => duel.status === 'waiting' && duel.player1 !== address)
            .map((duel) => (
              <div key={duel.id} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-md">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    ⚔️
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-300">
                      {duel.player1.substring(0, 6)}...{duel.player1.substring(38)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Created {new Date(duel.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => joinDuel(duel.id)}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  Join Duel
                </button>
              </div>
            ))}
        </div>
        
        {availableDuels.filter(duel => duel.status === 'waiting' && duel.player1 !== address).length === 0 && (
          <p className="text-gray-400 text-sm text-center">No open duels available. Create one!</p>
        )}
      </div>
    </div>
  );
}
