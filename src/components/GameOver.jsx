import React, { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import ChaosOrbABI from '../abi/ChaosOrb.json';

// --- REAL CONTRACT CONFIGURATION ---
const chaosOrbContractAddress = '0x01bFe93F9a12b1C2cf99Da16ec5D485f617B083B';
const chaosOrbABI = ChaosOrbABI.abi;

export function GameOver({ score, onPlayAgain }) {
  const { address, isConnected } = useAccount();
  const [showStats, setShowStats] = useState(false);

  // Step 1: Read the mint fee from the contract.
  const { data: mintFee, isLoading: isFeeLoading } = useReadContract({
    address: chaosOrbContractAddress,
    abi: chaosOrbABI,
    functionName: 'mintFee',
  });

  // Step 2: Use the new Wagmi v2 API for writing to contracts
  const { data, isPending, isSuccess, writeContract, error } = useWriteContract();

  // Generate some mock stats for the game
  const gameStats = {
    fragmentsCollected: score,
    timeSpent: '2:00',
    mutationsExperienced: Math.floor(score / 5) + 1,
    rank: score > 50 ? 'Chaos Master' : score > 20 ? 'Data Hunter' : 'Apprentice'
  };

  const handleMint = () => {
    if (!isConnected || !address) {
      alert("Debug: Wallet not connected.");
      return;
    }
    if (isFeeLoading) {
      alert("Debug: Mint fee is still loading, please wait.");
      return;
    }
    if (mintFee === undefined) {
      alert("Debug: Could not read mint fee from the contract. Check console for errors.");
      return;
    }
    if (!writeContract) {
      alert("Debug: The 'writeContract' function is not ready. This is unexpected.");
      return;
    }

    // Call the writeContract function with proper parameters
    writeContract({
      address: chaosOrbContractAddress,
      abi: chaosOrbABI,
      functionName: 'mintOrb',
      args: [address],
      value: mintFee,
      chainId: 10143,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-scale-in">
      <div className="card p-8 text-center space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full mx-auto flex items-center justify-center animate-float">
            <span className="text-3xl">💀</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-cyber font-bold text-gradient animate-glow">
            Game Over
          </h1>
          <p className="text-xl text-gray-400">The chaos has consumed you...</p>
        </div>

        {/* Score Display */}
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-lg text-gray-400 mb-2">Final Score</p>
            <div className="relative">
              <p className="text-6xl sm:text-7xl font-bold text-white mb-2 animate-glow">{score}</p>
              <div className="absolute inset-0 text-6xl sm:text-7xl font-bold text-purple-500 animate-pulse opacity-50">{score}</div>
            </div>
            <p className="text-lg text-purple-400 font-semibold">Rank: {gameStats.rank}</p>
          </div>
        </div>

        {/* Game Stats */}
        <div className="space-y-4">
          <button
            onClick={() => setShowStats(!showStats)}
            className="btn-secondary text-sm flex items-center space-x-2 mx-auto"
          >
            <span>{showStats ? '📊 Hide Stats' : '📊 Show Game Stats'}</span>
          </button>

          {showStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-down">
              <div className="card p-4 space-y-3">
                <h3 className="text-lg font-semibold text-purple-300">Performance</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fragments Collected:</span>
                    <span className="text-white font-semibold">{gameStats.fragmentsCollected}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time Survived:</span>
                    <span className="text-white font-semibold">{gameStats.timeSpent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mutations Experienced:</span>
                    <span className="text-white font-semibold">{gameStats.mutationsExperienced}</span>
                  </div>
                </div>
              </div>

              <div className="card p-4 space-y-3">
                <h3 className="text-lg font-semibold text-blue-300">Achievements</h3>
                <div className="space-y-2 text-sm">
                  {score > 50 && (
                    <div className="flex items-center space-x-2 text-yellow-400">
                      <span>🏆</span>
                      <span>Chaos Master</span>
                    </div>
                  )}
                  {score > 20 && (
                    <div className="flex items-center space-x-2 text-blue-400">
                      <span>🎯</span>
                      <span>Fragment Hunter</span>
                    </div>
                  )}
                  {gameStats.mutationsExperienced > 5 && (
                    <div className="flex items-center space-x-2 text-purple-400">
                      <span>🧬</span>
                      <span>Mutation Survivor</span>
                    </div>
                  )}
                  {score <= 5 && (
                    <div className="flex items-center space-x-2 text-gray-400">
                      <span>🌱</span>
                      <span>First Steps</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {/* Mint NFT Button */}
          <div className="space-y-3">
            <button
              onClick={handleMint}
              disabled={isPending || isSuccess || isFeeLoading}
              className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isFeeLoading && (
                <span className="flex items-center space-x-2">
                  <div className="loading-spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Fetching Mint Fee...</span>
                </span>
              )}
              {isPending && (
                <span className="flex items-center space-x-2">
                  <div className="loading-spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Check Wallet...</span>
                </span>
              )}
              {isSuccess && (
                <span className="flex items-center space-x-2">
                  <span>🎉</span>
                  <span>Minted Successfully!</span>
                </span>
              )}
              {!isFeeLoading && !isPending && !isSuccess && (
                <span className="flex items-center space-x-2">
                  <span>🔮</span>
                  <span>Mint Chaos Orb (0.01 MON)</span>
                </span>
              )}
            </button>

            {isSuccess && data && (
              <div className="card p-4 bg-green-500/10 border-green-500/20 animate-slide-up">
                <p className="text-green-400 font-semibold mb-2">✨ Transaction Successful!</p>
                <a 
                  href={`https://testnet.monadexplorer.com/tx/${data}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-400 hover:text-blue-300 underline text-sm"
                >
                  View on Monad Explorer →
                </a>
              </div>
            )}

            {error && (
              <div className="card p-4 bg-red-500/10 border-red-500/20">
                <p className="text-red-400 font-semibold mb-2">❌ Transaction Failed</p>
                <p className="text-red-300 text-sm break-words">
                  {error.shortMessage || error.message}
                </p>
              </div>
            )}
          </div>

          {/* Play Again Button */}
          <button
            onClick={onPlayAgain}
            className="btn-secondary w-full text-lg"
          >
            <span className="flex items-center space-x-2">
              <span>🎮</span>
              <span>Play Again</span>
            </span>
          </button>
        </div>

        {/* Tip */}
        <div className="text-center pt-4">
          <p className="text-xs text-gray-500">
            💡 Tip: Mint your Chaos Orb to unlock special abilities in future games!
          </p>
        </div>
      </div>
    </div>
  );
}
