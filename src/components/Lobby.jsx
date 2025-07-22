// src/components/Lobby.jsx

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Avatar } from './Avatar';
import { NFTCollection } from './NFTCollection';
import { PlayerStatus } from './PlayerStatus';
import { LobbyPresence } from './LobbyPresence';

export function Lobby({ onStartGame, playerAvatar, selectedNFT, onSelectNFT }) {
  const { address } = useAccount();
  const [showNFTCollection, setShowNFTCollection] = useState(false);

  const players = [
    { 
      address: address || '0x...', 
      avatar: playerAvatar, 
      nft: selectedNFT,
      status: 'ready',
      level: 15,
      wins: 42 
    },
    { 
      address: '0x1234567890123456789012345678901234567890', 
      avatar: 'molandak', 
      nft: null,
      status: 'ready',
      level: 8,
      wins: 23
    },
    { 
      address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', 
      avatar: 'moyaki', 
      nft: { name: 'Chaos Orb #3', power: 'Speed Boost' },
      status: 'ready',
      level: 22,
      wins: 67
    },
    { 
      address: '0xfeedfeedfeedfeedfeedfeedfeedfeedfeedfeed', 
      avatar: 'chog', 
      nft: null,
      status: 'waiting',
      level: 5,
      wins: 12
    },
  ];

  if (showNFTCollection) {
    return (
      <div className="w-full animate-scale-in">
        <NFTCollection
          onSelectNFT={onSelectNFT}
          selectedNFT={selectedNFT}
          onClose={() => setShowNFTCollection(false)}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <LobbyPresence playerAvatar={playerAvatar} />
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl sm:text-4xl font-cyber font-bold text-gradient">
          Game Lobby
        </h2>
        <p className="text-gray-400">Prepare for battle and enhance your abilities</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{players.length}</div>
          <div className="text-sm text-gray-400">Players Ready</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {players.filter(p => p.status === 'ready').length}
          </div>
          <div className="text-sm text-gray-400">Ready to Fight</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {players.filter(p => p.nft).length}
          </div>
          <div className="text-sm text-gray-400">NFT Enhanced</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">∞</div>
          <div className="text-sm text-gray-400">Max Players</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Player Status Section */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Your Status</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">Connected</span>
            </div>
          </div>
          <PlayerStatus />
        </div>

        {/* NFT Enhancement Section */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-blue-300">Chaos Influence</h3>
            <span className="text-xs text-gray-400">NFT Power-ups</span>
          </div>
          
          {selectedNFT ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🔮</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{selectedNFT.name}</p>
                  <p className="text-sm text-green-400">Power: {selectedNFT.power}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Active</div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <p className="text-xs text-yellow-400 text-center">
                ⚡ Will increase {selectedNFT.power} frequency during battle!
              </p>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <div className="w-16 h-16 border-2 border-dashed border-gray-600 rounded-lg mx-auto flex items-center justify-center">
                <span className="text-2xl text-gray-600">🔮</span>
              </div>
              <p className="text-gray-400 text-sm">No NFT influence active</p>
              <p className="text-xs text-gray-500">Select an NFT to gain battle advantages</p>
            </div>
          )}
          
          <button
            onClick={() => setShowNFTCollection(true)}
            className="w-full btn-secondary text-sm"
          >
            {selectedNFT ? '🔄 Change NFT' : '🎯 Select NFT Power-up'}
          </button>
        </div>
      </div>

      {/* Players List */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Battle Arena</h3>
          <span className="text-sm text-gray-400">{players.length} warriors assembled</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-64 overflow-y-auto pr-2">
          {players.map((player, index) => (
            <div 
              key={index} 
              className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${
                player.address === address 
                  ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30' 
                  : 'bg-dark-800/50 hover:bg-dark-700/50'
              }`}
            >
              <div className="relative">
                <Avatar avatarName={player.avatar} />
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  player.status === 'ready' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
                }`}>
                  {player.status === 'ready' ? '✓' : '⏳'}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-semibold text-gray-300 truncate">
                    {player.address === address 
                      ? `${player.address.substring(0,6)}...${player.address.substring(38)} (You)` 
                      : `${player.address.substring(0,6)}...${player.address.substring(38)}`
                    }
                  </p>
                  {player.address === address && (
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">You</span>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center space-x-3 text-xs text-gray-400">
                    <span>Lv.{player.level}</span>
                    <span>•</span>
                    <span>{player.wins}W</span>
                  </div>
                  {player.nft && (
                    <div className="flex items-center space-x-1 text-xs text-blue-400">
                      <span>🔮</span>
                      <span>{player.nft.power}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Start Game Button */}
      <div className="text-center">
        <button 
          onClick={onStartGame} 
          className="btn-primary text-lg px-12 py-4 font-bold"
          disabled={players.filter(p => p.status === 'ready').length < 2}
        >
          <span className="flex items-center space-x-2">
            <span>🚀</span>
            <span>Start Battle</span>
          </span>
        </button>
        {players.filter(p => p.status === 'ready').length < 2 && (
          <p className="text-sm text-yellow-400 mt-2">
            Waiting for more players to join...
          </p>
        )}
      </div>
    </div>
  );
}