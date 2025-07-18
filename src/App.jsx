// src/App.jsx

import React, { useState } from 'react';
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// Import our components, including the new GameOver
import { Lobby } from './components/Lobby';
import { Game } from './components/Game';
import { AvatarSelector } from './components/AvatarSelector';
import { GameOver } from './components/GameOver'; // NEW

import '@rainbow-me/rainbowkit/styles.css';

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
  // NEW: Game state now includes 'gameover'
  const [gameState, setGameState] = useState('lobby'); // 'lobby', 'game', 'gameover'
  const [finalScore, setFinalScore] = useState(0);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const { isConnected } = useAccount();

  const handleGameOver = (score) => {
    setFinalScore(score);
    setGameState('gameover');
  };

  const handlePlayAgain = () => {
    setGameState('lobby');
  };

  const renderGameState = () => {
    switch (gameState) {
      case 'game':
        return <Game onGameOver={handleGameOver} playerAvatar={playerAvatar} selectedNFT={selectedNFT} />;
      case 'gameover':
        return <GameOver score={finalScore} onPlayAgain={handlePlayAgain} />;
      case 'lobby':
      default:
        return (
          <Lobby 
            onStartGame={() => setGameState('game')} 
            playerAvatar={playerAvatar}
            selectedNFT={selectedNFT}
            onSelectNFT={setSelectedNFT}
          />
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