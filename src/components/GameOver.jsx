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
    <div className="w-full max-w-lg text-center bg-gray-800/50 rounded-lg p-8 shadow-2xl backdrop-blur-sm">
      <h1 className="text-4xl sm:text-5xl font-bold text-yellow-400 mb-4">Game Over</h1>
      <p className="text-lg sm:text-xl text-gray-300 mb-2">Your Final Score:</p>
      <p className="text-5xl sm:text-6xl font-bold text-white mb-4">{score}</p>
      <p className="text-sm text-purple-400 mb-6">Rank: {gameStats.rank}</p>

      {/* Game Stats Toggle */}
      <button
        onClick={() => setShowStats(!showStats)}
        className="mb-4 text-sm text-blue-400 hover:text-blue-300 underline"
      >
        {showStats ? 'Hide Stats' : 'Show Game Stats'}
      </button>

      {showStats && (
        <div className="mb-6 p-4 bg-gray-700/30 rounded-lg text-left">
          <h3 className="text-lg font-semibold text-purple-300 mb-3 text-center">Game Statistics</h3>
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
      )}

      <div className="space-y-4">
        <button
          onClick={handleMint}
          disabled={isPending || isSuccess || isFeeLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 disabled:bg-gray-500 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {isFeeLoading && 'Fetching Mint Fee...'}
          {isPending && 'Check Wallet...'}
          {isSuccess && 'Minted Successfully! 🎉'}
          {!isFeeLoading && !isPending && !isSuccess && `Mint Chaos Orb (0.01 MON)`}
        </button>

        {isSuccess && data && (
          <div className="text-green-400 mt-2 animate-bounce">
            <p>✨ Transaction sent!</p>
            <a href={`https://testnet.monadexplorer.com/tx/${data}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-300">
              View on Explorer
            </a>
          </div>
        )}
        {error && (
          <div className="text-red-400 mt-2 text-xs break-words bg-red-900/20 rounded p-2">
            <p>❌ Error: {error.shortMessage || error.message}</p>
          </div>
        )}

        <button
          onClick={onPlayAgain}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
        >
          🎮 Play Again
        </button>
      </div>
    </div>
  );
}
