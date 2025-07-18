// src/components/Lobby.jsx

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Avatar } from './Avatar';
import { NFTCollection } from './NFTCollection';

export function Lobby({ onStartGame, playerAvatar, selectedNFT, onSelectNFT }) {
  const { address } = useAccount();
  const [showNFTCollection, setShowNFTCollection] = useState(false);

  // Mock players. We assign them avatars for demonstration.
  const players = [
    { address: address || '0x...', avatar: playerAvatar, nft: selectedNFT },
    { address: '0x1234567890123456789012345678901234567890', avatar: 'molandak', nft: null },
    { address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', avatar: 'moyaki', nft: { name: 'Chaos Orb #3', power: 'Speed Boost' } },
    { address: '0xfeedfeedfeedfeedfeedfeedfeedfeedfeedfeed', avatar: 'chog', nft: null },
  ];

  if (showNFTCollection) {
    return (
      <NFTCollection
        onSelectNFT={onSelectNFT}
        selectedNFT={selectedNFT}
        onClose={() => setShowNFTCollection(false)}
      />
    );
  }

  return (
    <div className="w-full max-w-md bg-gray-800/50 rounded-lg p-6 shadow-2xl backdrop-blur-sm">
      <h2 className="text-2xl font-bold text-center text-purple-300 mb-6">Game Lobby</h2>
      
      {/* NFT Offering Section */}
      <div className="mb-6 p-4 bg-gray-700/30 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-300 mb-3">Chaos Influence</h3>
        {selectedNFT ? (
          <div className="text-center">
            <p className="text-green-400 text-sm mb-2">✨ Active NFT Influence:</p>
            <p className="font-semibold text-white">{selectedNFT.name}</p>
            <p className="text-xs text-gray-400">Power: {selectedNFT.power}</p>
            <p className="text-xs text-yellow-400 mt-1">Will increase {selectedNFT.power} frequency!</p>
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center">No NFT influence active</p>
        )}
        <button
          onClick={() => setShowNFTCollection(true)}
          className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors"
        >
          {selectedNFT ? 'Change NFT' : 'Select NFT'}
        </button>
      </div>

      <div className="space-y-3 mb-8">
        <p className="text-sm text-gray-400 text-center">{players.length} players ready</p>
        <div className="max-h-48 overflow-y-auto pr-2">
          {players.map((player, index) => (
            <div key={index} className="flex items-center bg-gray-700/50 p-3 rounded-md">
              <Avatar avatarName={player.avatar} />
              <div className="ml-4 flex-1">
                <p className="text-sm text-gray-300 truncate">
                  {player.address === address ? `${player.address.substring(0,6)}...${player.address.substring(38)} (You)` : `${player.address.substring(0,6)}...${player.address.substring(38)}`}
                </p>
                {player.nft && (
                  <p className="text-xs text-blue-400 mt-1">🔮 {player.nft.power}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <button onClick={onStartGame} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">
        Start Game
      </button>
    </div>
  );
}