// src/App.jsx

import React, { useState, useEffect } from 'react';
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// Import our components, including the new GameOver
import { Lobby } from './components/Lobby';
import { Game } from './components/Game';
import { AvatarSelector } from './components/AvatarSelector';
import { GameOver } from './components/GameOver';
import { DuelLobby } from './components/DuelLobby';
import { DuelGame } from './components/DuelGame';
import { Leaderboard } from './components/Leaderboard';
import { ChatSystem } from './components/ChatSystem';
import { supabase } from './utils/supabaseClient';

import '@rainbow-me/rainbowkit/styles.css';
import './App.css';

// Config remains the same
const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz'] } },
  blockExplorers: { default: { name: 'MonadScan', url: 'https://testnet.monadexplorer.com' } },
  testnet: true,
};
const config = getDefaultConfig({
  appName: 'SynqChaos',
  projectId: import.meta.env.VITE_RAINBOWKIT_PROJECT_ID,
  chains: [monadTestnet],
  ssr: false,
});
const queryClient = new QueryClient();

// This component now manages the main application flow
function AppContent({ playerAvatar }) {
  // Game state includes: 'lobby', 'game', 'gameover', 'duel-lobby', 'duel'
  const [gameState, setGameState] = useState('lobby');
  const [finalScore, setFinalScore] = useState(0);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [currentDuel, setCurrentDuel] = useState(null);
  const { isConnected, address } = useAccount();

  // Auto-register player when wallet connects
  useEffect(() => {
    const registerPlayer = async () => {
      if (!isConnected || !address) return;

      try {
        // Check if player already exists
        const { data: existingPlayer, error: checkError } = await supabase
          .from('players')
          .select('address')
          .eq('address', address)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 = no rows returned, which is expected for new players
          console.error('Error checking existing player:', checkError);
          return;
        }

        // If player doesn't exist, register them
        if (!existingPlayer) {
          const { error: insertError } = await supabase
            .from('players')
            .insert([
              {
                address: address,
                avatar: playerAvatar,
                created_at: new Date().toISOString()
              }
            ]);

          if (insertError) {
            console.error('Error registering player:', insertError);
          } else {
            console.log('Player registered successfully:', address);
          }
        }
      } catch (error) {
        console.error('Error in player registration:', error);
      }
    };

    registerPlayer();
  }, [isConnected, address, playerAvatar]);

  const handleGameOver = async (score, opponentScore) => {
    setFinalScore(score);
    setGameState('gameover');
    
    // Update player score in database
    if (isConnected && address && score > 0) {
      try {
        const { error } = await supabase
          .from('players')
          .upsert({
            address: address,
            avatar: playerAvatar,
            score: score,
            total_score: score,
            total_games: 1, // For now, we'll increment this later
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'address',
            ignoreDuplicates: false
          });

        if (error) {
          console.error('Error updating player score:', error);
        } else {
          console.log('Player score updated successfully:', { address, score });
        }
      } catch (error) {
        console.error('Error in score update:', error);
      }
    }
  };

  const handlePlayAgain = () => {
    setGameState('lobby');
  };

  const handleStartDuel = (duel) => {
    setCurrentDuel(duel);
    setGameState('duel');
  };

  const renderGameState = () => {
    switch (gameState) {
      case 'game':
        return <Game onGameOver={(score) => handleGameOver(score)} playerAvatar={playerAvatar} selectedNFT={selectedNFT} />;
      case 'gameover':
        return <GameOver score={finalScore} onPlayAgain={handlePlayAgain} />;
      case 'duel-lobby':
        return <DuelLobby onStartDuel={handleStartDuel} playerAvatar={playerAvatar} selectedNFT={selectedNFT} />;
      case 'duel':
        return (
          <>
            <DuelGame 
              duel={currentDuel} 
              onGameOver={handleGameOver} 
              playerAvatar={playerAvatar} 
              selectedNFT={selectedNFT} 
            />
            <ChatSystem duelId={currentDuel?.id} />
          </>
        );
      case 'lobby':
      default:
        return (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 w-full">
            {/* Main Game Section */}
            <div className="xl:col-span-2 space-y-6">
              <Lobby 
                onStartGame={() => setGameState('game')} 
                playerAvatar={playerAvatar}
                selectedNFT={selectedNFT}
                onSelectNFT={setSelectedNFT}
              />
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setGameState('duel-lobby')}
                  className="btn-danger flex-1 flex items-center justify-center space-x-2"
                >
                  <span className="text-xl">⚔️</span>
                  <span>Enter Duel Arena</span>
                </button>
                <button
                  onClick={() => setGameState('game')}
                  className="btn-secondary flex-1 flex items-center justify-center space-x-2"
                >
                  <span className="text-xl">🎮</span>
                  <span>Quick Play</span>
                </button>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="xl:col-span-1">
              <Leaderboard />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col font-game">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow animation-delay-400"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse-slow animation-delay-200"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center animate-float">
              <span className="text-2xl font-bold text-white">S</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-cyber font-bold text-gradient animate-glow">
                SynqChaos
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 font-light">Monad Gaming Arena</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Online</span>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-4 sm:px-8 py-8">
        <div className="w-full max-w-7xl">
          {!isConnected ? (
            <div className="text-center space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-5xl font-cyber font-bold text-gradient">
                  Welcome to the Arena
                </h2>
                <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                  Enter the ultimate gaming battlefield where skills meet blockchain technology. 
                  Connect your wallet and prove your worth in the chaos.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
                <div className="card p-6 text-center animate-slide-up">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">⚔️</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-purple-300">Epic Battles</h3>
                  <p className="text-gray-400 text-sm">Engage in thrilling multiplayer duels with unique gameplay mechanics</p>
                </div>
                
                <div className="card p-6 text-center animate-slide-up animation-delay-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">🔮</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-blue-300">NFT Power-ups</h3>
                  <p className="text-gray-400 text-sm">Enhance your abilities with collectible NFTs and special powers</p>
                </div>
                
                <div className="card p-6 text-center animate-slide-up animation-delay-400">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-green-300">Global Rankings</h3>
                  <p className="text-gray-400 text-sm">Climb the leaderboards and become the ultimate chaos champion</p>
                </div>
              </div>
              
              <div className="mt-12">
                <div className="inline-flex items-center space-x-2 text-purple-400 animate-bounce-slow">
                  <span className="text-lg">👆</span>
                  <span className="text-lg font-semibold">Connect your wallet to begin</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-scale-in">
              {renderGameState()}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-4 sm:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>© 2025 SynqChaos</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Powered by Monad</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-purple-400 transition-colors">Documentation</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Discord</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// The main App component remains the same
function App() {
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={darkTheme({
            accentColor: '#9333ea',
            accentColorForeground: 'white',
            borderRadius: 'medium',
            fontStack: 'mono',
          })}
          locale="en-US"
        >
          {!selectedAvatar ? (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
              <AvatarSelector onSelect={setSelectedAvatar} />
            </div>
          ) : (
            <AppContent playerAvatar={selectedAvatar} />
          )}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;