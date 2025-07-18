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
  projectId: 'd37072cc4f613f8e5941ea2c31279dcd',
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
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex flex-col gap-6">
              <Lobby 
                onStartGame={() => setGameState('game')} 
                playerAvatar={playerAvatar}
                selectedNFT={selectedNFT}
                onSelectNFT={setSelectedNFT}
              />
              <div className="flex gap-4">
                <button
                  onClick={() => setGameState('duel-lobby')}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
                >
                  ⚔️ Duel Arena
                </button>
              </div>
            </div>
            <Leaderboard />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-8 font-mono w-full">
      <header className="w-full max-w-5xl flex justify-between items-center mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-purple-400">SynqChaos</h1>
        <ConnectButton />
      </header>
      <main className="w-full flex-grow flex items-center justify-center">
        {!isConnected ? (
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl text-gray-400">Welcome to the Arena</h2>
            <p className="text-gray-500 mt-2">Connect your wallet to join the lobby.</p>
          </div>
        ) : (
          renderGameState()
        )}
      </main>
      <footer className="w-full max-w-5xl mt-16 text-center text-gray-600">
        <p>A multiplayer experiment for Monad Mission 6.</p>
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
        <RainbowKitProvider theme={darkTheme({
            accentColor: '#9333ea',
            accentColorForeground: 'white',
            borderRadius: 'medium',
            fontStack: 'mono',
          })}>
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