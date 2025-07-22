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
  const [filter, setFilter] = useState('all');

  const { data: balance } = useReadContract({
    address: chaosOrbContractAddress,
    abi: chaosOrbABI,
    functionName: 'balanceOf',
    args: [address],
  });

  useEffect(() => {
    if (balance !== undefined) {
      setNFTBalance(Number(balance));
      const mockNFTs = [];
      for (let i = 0; i < Number(balance); i++) {
        mockNFTs.push({
          tokenId: i + 1,
          name: `Chaos Orb #${i + 1}`,
          rarity: ['Common', 'Rare', 'Epic', 'Legendary'][Math.floor(Math.random() * 4)],
          power: ['Speed Boost', 'Slow Motion', 'Reversed Controls', 'Ice Arena', 'Bouncy Walls', 'Position Chaos'][Math.floor(Math.random() * 6)],
          image: `/public/avatar/${['chog', 'molandak', 'moyaki'][Math.floor(Math.random() * 3)]}.png`,
          level: Math.floor(Math.random() * 10) + 1,
          description: 'A mystical orb containing chaotic energy from the digital realm.'
        });
      }
      setOwnedNFTs(mockNFTs);
      setLoading(false);
    }
  }, [balance]);

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Common': return 'from-gray-500 to-gray-600';
      case 'Rare': return 'from-blue-500 to-blue-600';
      case 'Epic': return 'from-purple-500 to-purple-600';
      case 'Legendary': return 'from-yellow-500 to-yellow-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRarityTextColor = (rarity) => {
    switch (rarity) {
      case 'Common': return 'text-gray-400';
      case 'Rare': return 'text-blue-400';
      case 'Epic': return 'text-purple-400';
      case 'Legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const filteredNFTs = filter === 'all' ? ownedNFTs : ownedNFTs.filter(nft => nft.rarity.toLowerCase() === filter);

  if (!isConnected) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="card p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🔐</span>
          </div>
          <h2 className="text-2xl font-bold text-gradient mb-4">NFT Collection</h2>
          <p className="text-gray-400 mb-6">Please connect your wallet to view your collection</p>
          <button onClick={onClose} className="btn-secondary w-full">
            Close
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="card p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
            <span className="text-2xl">🔮</span>
          </div>
          <h2 className="text-2xl font-bold text-gradient mb-4">NFT Collection</h2>
          <p className="text-gray-400 mb-4">Loading your collection...</p>
          <div className="flex justify-center">
            <div className="loading-spinner w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="card w-full max-w-6xl max-h-[90vh] overflow-hidden animate-scale-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-dark-700">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-2xl sm:text-3xl font-cyber font-bold text-gradient">Chaos Orb Collection</h2>
            <p className="text-gray-400 mt-1">Total NFTs: {nftBalance} • Selected: {selectedNFT ? selectedNFT.name : 'None'}</p>
          </div>
          <button onClick={onClose} className="btn-secondary">
            <span className="flex items-center space-x-2">
              <span>✕</span>
              <span>Close</span>
            </span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {nftBalance === 0 ? (
            <div className="text-center py-16 space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto flex items-center justify-center">
                <span className="text-4xl">🔮</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">No Chaos Orbs Yet</h3>
                <p className="text-gray-400 mb-4">Your collection is waiting to be born from chaos!</p>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Play games to earn scores and mint your first NFT. Each orb grants unique powers and abilities in battle.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                  <span className="flex items-center space-x-1">
                    <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                    <span>Common</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    <span>Rare</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                    <span>Epic</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <span>Legendary</span>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {['all', 'common', 'rare', 'epic', 'legendary'].map((rarity) => (
                  <button
                    key={rarity}
                    onClick={() => setFilter(rarity)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      filter === rarity
                        ? 'bg-purple-600 text-white'
                        : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                    }`}
                  >
                    {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                    {rarity !== 'all' && (
                      <span className="ml-1 text-xs">
                        ({ownedNFTs.filter(nft => nft.rarity.toLowerCase() === rarity).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredNFTs.map((nft) => (
                  <div
                    key={nft.tokenId}
                    className={`card-hover cursor-pointer transition-all duration-300 ${
                      selectedNFT && selectedNFT.tokenId === nft.tokenId 
                        ? 'border-purple-500 shadow-glow-lg scale-105' 
                        : ''
                    }`}
                    onClick={() => onSelectNFT(nft)}
                  >
                    <div className="p-6 space-y-4">
                      <div className="relative">
                        <div className={`w-20 h-20 bg-gradient-to-br ${getRarityColor(nft.rarity)} rounded-xl mx-auto flex items-center justify-center animate-float`}>
                          <span className="text-3xl">🔮</span>
                        </div>
                        {selectedNFT && selectedNFT.tokenId === nft.tokenId && (
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center animate-scale-in">
                            <span className="text-white text-sm font-bold">✓</span>
                          </div>
                        )}
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                          <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getRarityColor(nft.rarity)} text-white font-bold`}>
                            Lv.{nft.level}
                          </span>
                        </div>
                      </div>
                      <div className="text-center space-y-2">
                        <h3 className="font-bold text-white text-lg">{nft.name}</h3>
                        <p className={`text-sm font-semibold ${getRarityTextColor(nft.rarity)}`}>
                          {nft.rarity}
                        </p>
                        <div className="space-y-2">
                          <div className="bg-dark-800/50 rounded-lg p-2">
                            <p className="text-xs text-gray-400 mb-1">Power</p>
                            <p className="text-sm text-blue-400 font-semibold">{nft.power}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredNFTs.length === 0 && filter !== 'all' && (
                <div className="text-center py-8">
                  <p className="text-gray-400">No {filter} NFTs found in your collection</p>
                  <button
                    onClick={() => setFilter('all')}
                    className="mt-2 text-sm text-purple-400 hover:text-purple-300 underline"
                  >
                    View all NFTs
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Selected NFT Actions */}
          {selectedNFT && (
            <div className="mt-8 pt-6 border-t border-dark-700">
              <div className="card p-6 bg-purple-500/10 border-purple-500/20">
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-bold text-purple-300">Selected NFT</h3>
                  <div className="flex items-center justify-center space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getRarityColor(selectedNFT.rarity)} rounded-lg flex items-center justify-center`}>
                      <span className="text-xl">🔮</span>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">{selectedNFT.name}</p>
                      <p className="text-sm text-purple-400">Power: {selectedNFT.power}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">
                    This orb will influence chaos mutations in your next battle!
                  </p>
                  <div className="flex space-x-4 justify-center">
                    <button
                      onClick={() => onSelectNFT(null)}
                      className="btn-secondary text-sm"
                    >
                      Deselect
                    </button>
                    <button
                      onClick={onClose}
                      className="btn-primary text-sm"
                    >
                      Confirm & Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
