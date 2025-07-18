// src/components/NFTCollection.jsx

import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import ChaosOrbABI from '../abi/ChaosOrb.json';

const chaosOrbContractAddress = '0x01bFe93F9a12b1C2cf99Da16ec5D485f617B083B';
const chaosOrbABI = ChaosOrbABI.abi;

export function NFTCollection({ onSelectNFT, selectedNFT, onClose }) {
  const { address, isConnected } = useAccount();
  const [nftBalance, setNFTBalance] = useState(0);
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Read NFT balance
  const { data: balance } = useReadContract({
    address: chaosOrbContractAddress,
    abi: chaosOrbABI,
    functionName: 'balanceOf',
    args: [address],
  });

  useEffect(() => {
    if (balance !== undefined) {
      setNFTBalance(Number(balance));
      // Generate mock NFTs for demonstration
      // In a real app, you'd fetch actual token IDs and metadata
      const mockNFTs = [];
      for (let i = 0; i < Number(balance); i++) {
        mockNFTs.push({
          tokenId: i + 1,
          name: `Chaos Orb #${i + 1}`,
          rarity: ['Common', 'Rare', 'Epic', 'Legendary'][Math.floor(Math.random() * 4)],
          power: ['Speed Boost', 'Slow Motion', 'Reversed Controls', 'Ice Arena', 'Bouncy Walls', 'Position Chaos'][Math.floor(Math.random() * 6)],
          image: `/public/avatar/${['chog', 'molandak', 'moyaki'][Math.floor(Math.random() * 3)]}.png`
        });
      }
      setOwnedNFTs(mockNFTs);
      setLoading(false);
    }
  }, [balance]);

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Common': return 'border-gray-400 text-gray-400';
      case 'Rare': return 'border-blue-400 text-blue-400';
      case 'Epic': return 'border-purple-400 text-purple-400';
      case 'Legendary': return 'border-yellow-400 text-yellow-400';
      default: return 'border-gray-400 text-gray-400';
    }
  };

  if (!isConnected) {
    return (
      <div className="w-full max-w-2xl bg-gray-800/50 rounded-lg p-8 shadow-2xl backdrop-blur-sm text-center">
        <h2 className="text-2xl font-bold text-purple-300 mb-4">NFT Collection</h2>
        <p className="text-gray-400">Please connect your wallet to view your collection</p>
        <button onClick={onClose} className="mt-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">
          Close
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full max-w-2xl bg-gray-800/50 rounded-lg p-8 shadow-2xl backdrop-blur-sm text-center">
        <h2 className="text-2xl font-bold text-purple-300 mb-4">NFT Collection</h2>
        <p className="text-gray-400">Loading your collection...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl bg-gray-800/50 rounded-lg p-8 shadow-2xl backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-purple-300">Your Chaos Orb Collection</h2>
        <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">
          Close
        </button>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-400">Total NFTs: {nftBalance}</p>
        {selectedNFT && (
          <p className="text-green-400 mt-2">Selected: {selectedNFT.name} - {selectedNFT.power}</p>
        )}
      </div>

      {nftBalance === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">You don't have any Chaos Orbs yet!</p>
          <p className="text-sm text-gray-500">Play the game and mint your first NFT to start your collection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {ownedNFTs.map((nft) => (
            <div
              key={nft.tokenId}
              className={`bg-gray-700/50 rounded-lg p-4 border-2 cursor-pointer transition-all hover:scale-105 ${
                selectedNFT && selectedNFT.tokenId === nft.tokenId 
                  ? 'border-purple-400 bg-purple-900/20' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onClick={() => onSelectNFT(nft)}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl">🔮</span>
                </div>
                <h3 className="font-bold text-white mb-1">{nft.name}</h3>
                <p className={`text-sm font-semibold mb-2 ${getRarityColor(nft.rarity)}`}>
                  {nft.rarity}
                </p>
                <p className="text-xs text-gray-400 bg-gray-800/50 rounded px-2 py-1">
                  Power: {nft.power}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedNFT && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400 mb-2">
            This NFT will influence the next round's chaos mutations!
          </p>
          <button
            onClick={() => onSelectNFT(null)}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-1 px-3 rounded-lg"
          >
            Deselect
          </button>
        </div>
      )}
    </div>
  );
}
