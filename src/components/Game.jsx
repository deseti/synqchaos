import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Glitch } from './Glitch';
import { DataFragment } from './DataFragment';
import { MutationDisplay } from './MutationDisplay';
import { VirtualControls } from './VirtualControls';
import { soundManager } from '../utils/sounds';
import { useHybridInput, useIsMobile } from '../hooks/useHybridInput';

const mutations = [
  { 
    id: 'speed-boost', 
    name: 'SPEED BOOST', 
    description: 'Gotta go fast!', 
    color: 'border-blue-400', 
    type: 'speed',
    apply: (speed) => speed * 2 
  },
  { 
    id: 'slow-mo', 
    name: 'SLOW MO', 
    description: 'Walking through molasses...', 
    color: 'border-red-400', 
    type: 'speed',
    apply: (speed) => speed * 0.5 
  },
  {
    id: 'reversed-controls',
    name: 'REVERSED CONTROLS',
    description: 'Up is down, left is right!',
    color: 'border-purple-400',
    type: 'control'
  },
  {
    id: 'ice-arena',
    name: 'ICE ARENA',
    description: 'Slippery surface ahead!',
    color: 'border-cyan-400',
    type: 'arena'
  },
  {
    id: 'bouncy-walls',
    name: 'BOUNCY WALLS',
    description: 'Walls now bounce you back!',
    color: 'border-green-400',
    type: 'arena'
  },
  {
    id: 'position-chaos',
    name: 'POSITION CHAOS',
    description: 'Random teleportation incoming!',
    color: 'border-yellow-400',
    type: 'teleport'
  }
];

export function Game({ onGameOver, playerAvatar, selectedNFT }) { // UPDATED: Added selectedNFT prop
  const [player, setPlayer] = useState({ x: 100, y: 100, score: 0, direction: 'right', velocity: { x: 0, y: 0 } });
  const [fragments, setFragments] = useState([]);
  const [timeLeft, setTimeLeft] = useState(120);
  const [activeMutation, setActiveMutation] = useState(null);
  const [mutationTimeLeft, setMutationTimeLeft] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [virtualKeys, setVirtualKeys] = useState({});
  
  // Use hybrid input (keyboard + virtual controls)
  const keys = useHybridInput(virtualKeys);
  const isMobile = useIsMobile();
  
  const arenaRef = useRef(null);
  const keysRef = useRef(keys);
  const basePlayerSpeed = 5;
  const playerSize = 32;
  const fragmentSize = 20;

  // Update sound manager when sound setting changes
  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    const conductorInterval = setInterval(() => {
      let availableMutations = [...mutations];
      
      // NFT influence: increase chance of specific mutation
      if (selectedNFT && selectedNFT.power) {
        const nftPowerToMutationMap = {
          'Speed Boost': 'speed-boost',
          'Slow Motion': 'slow-mo',
          'Reversed Controls': 'reversed-controls',
          'Ice Arena': 'ice-arena',
          'Bouncy Walls': 'bouncy-walls',
          'Position Chaos': 'position-chaos'
        };
        
        const influencedMutationId = nftPowerToMutationMap[selectedNFT.power];
        if (influencedMutationId) {
          // Add the influenced mutation multiple times to increase its probability
          const influencedMutation = mutations.find(m => m.id === influencedMutationId);
          if (influencedMutation) {
            // 60% chance for NFT-influenced mutation
            availableMutations = [
              ...mutations,
              influencedMutation,
              influencedMutation,
              influencedMutation
            ];
          }
        }
      }
      
      const newMutation = availableMutations[Math.floor(Math.random() * availableMutations.length)];
      setActiveMutation(newMutation);
      setMutationTimeLeft(15); // 15 detik per mutasi
      
      // Play mutation sound
      soundManager.playMutationSound();
      
      // Handle position chaos immediately
      if (newMutation.id === 'position-chaos') {
        soundManager.playTeleportSound();
        setPlayer(prevPlayer => {
          const arena = arenaRef.current;
          if (!arena) return prevPlayer;
          const arenaRect = arena.getBoundingClientRect();
          return {
            ...prevPlayer,
            x: Math.random() * (arenaRect.width - playerSize),
            y: Math.random() * (arenaRect.height - playerSize),
            velocity: { x: 0, y: 0 } // Reset velocity on teleport
          };
        });
      }
    }, 15000);
    return () => clearInterval(conductorInterval);
  }, [selectedNFT]); // Added selectedNFT dependency

  // Timer untuk mutasi
  useEffect(() => {
    if (mutationTimeLeft > 0) {
      const timer = setInterval(() => {
        setMutationTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (mutationTimeLeft === 0 && activeMutation) {
      setActiveMutation(null);
    }
  }, [mutationTimeLeft, activeMutation]);

  useEffect(() => {
    if (timeLeft <= 0) {
      soundManager.playGameOverSound();
      onGameOver(player.score); // UPDATED: Call onGameOver with the final score
      return;
    }
    
    // Play countdown sound for last 10 seconds
    if (timeLeft <= 10) {
      soundManager.playCountdownSound();
    }
    
    const timerId = setInterval(() => setTimeLeft(prevTime => prevTime - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, onGameOver, player.score]); // Added player.score to dependency

  const spawnFragment = useCallback(() => {
    const arena = arenaRef.current;
    if (!arena) return null;
    const arenaRect = arena.getBoundingClientRect();
    return {
      id: Date.now() + Math.random(),
      x: Math.random() * (arenaRect.width - fragmentSize),
      y: Math.random() * (arenaRect.height - fragmentSize),
    };
  }, []);

  useEffect(() => {
    setFragments([spawnFragment(), spawnFragment(), spawnFragment()].filter(Boolean));
  }, [spawnFragment]);

  useEffect(() => {
    keysRef.current = keys;
  }, [keys]);

  useEffect(() => {
    const arena = arenaRef.current;
    if (!arena) return;
    const gameLoop = () => {
      // Calculate player speed based on mutation
      let playerSpeed = basePlayerSpeed;
      if (activeMutation && activeMutation.type === 'speed') {
        playerSpeed = activeMutation.apply(basePlayerSpeed);
      }

      setPlayer(prevPlayer => {
        const currentKeys = keysRef.current;
        let newX = prevPlayer.x;
        let newY = prevPlayer.y;
        let newDirection = prevPlayer.direction;
        let newVelocity = { ...prevPlayer.velocity };

        // Handle input based on mutations
        let moveUp = currentKeys['w'] || currentKeys['arrowup'];
        let moveDown = currentKeys['s'] || currentKeys['arrowdown'];
        let moveLeft = currentKeys['a'] || currentKeys['arrowleft'];
        let moveRight = currentKeys['d'] || currentKeys['arrowright'];

        // Reversed controls mutation
        if (activeMutation && activeMutation.id === 'reversed-controls') {
          [moveUp, moveDown] = [moveDown, moveUp];
          [moveLeft, moveRight] = [moveRight, moveLeft];
        }

        // Ice arena mutation - add momentum
        if (activeMutation && activeMutation.id === 'ice-arena') {
          const friction = 0.95;
          const acceleration = 0.8;
          
          if (moveUp) newVelocity.y -= acceleration;
          if (moveDown) newVelocity.y += acceleration;
          if (moveLeft) {
            newVelocity.x -= acceleration;
            newDirection = 'left';
          }
          if (moveRight) {
            newVelocity.x += acceleration;
            newDirection = 'right';
          }
          
          // Apply friction
          newVelocity.x *= friction;
          newVelocity.y *= friction;
          
          // Limit velocity
          const maxVelocity = playerSpeed;
          newVelocity.x = Math.max(-maxVelocity, Math.min(maxVelocity, newVelocity.x));
          newVelocity.y = Math.max(-maxVelocity, Math.min(maxVelocity, newVelocity.y));
          
          newX += newVelocity.x;
          newY += newVelocity.y;
        } else {
          // Normal movement
          newVelocity = { x: 0, y: 0 };
          if (moveUp) newY -= playerSpeed;
          if (moveDown) newY += playerSpeed;
          if (moveLeft) {
            newX -= playerSpeed;
            newDirection = 'left';
          }
          if (moveRight) {
            newX += playerSpeed;
            newDirection = 'right';
          }
        }

        const arenaRect = arena.getBoundingClientRect();
        
        // Handle bouncy walls mutation
        if (activeMutation && activeMutation.id === 'bouncy-walls') {
          if (newX <= 0 || newX >= arenaRect.width - playerSize) {
            soundManager.playBounceSound();
            newVelocity.x *= -1.2; // Bounce with slight speed increase
            newX = newX <= 0 ? 0 : arenaRect.width - playerSize;
          }
          if (newY <= 0 || newY >= arenaRect.height - playerSize) {
            soundManager.playBounceSound();
            newVelocity.y *= -1.2; // Bounce with slight speed increase
            newY = newY <= 0 ? 0 : arenaRect.height - playerSize;
          }
          
          // Apply velocity for bouncing
          newX += newVelocity.x;
          newY += newVelocity.y;
          
          // Damping to prevent infinite bouncing
          newVelocity.x *= 0.98;
          newVelocity.y *= 0.98;
        } else {
          // Normal boundary constraints
          newX = Math.max(0, Math.min(newX, arenaRect.width - playerSize));
          newY = Math.max(0, Math.min(newY, arenaRect.height - playerSize));
        }

        setFragments(currentFragments => {
          const playerRect = { left: newX, top: newY, right: newX + playerSize, bottom: newY + playerSize };
          const remainingFragments = [];
          let collectedCount = 0;
          for (const fragment of currentFragments) {
            const fragmentRect = { left: fragment.x, top: fragment.y, right: fragment.x + fragmentSize, bottom: fragment.y + fragmentSize };
            if (playerRect.left < fragmentRect.right && playerRect.right > fragmentRect.left && playerRect.top < fragmentRect.bottom && playerRect.bottom > fragmentRect.top) {
              collectedCount++;
            } else {
              remainingFragments.push(fragment);
            }
          }
          if (collectedCount > 0) {
            soundManager.playCollectSound();
            setPlayer(p => ({ ...p, score: p.score + collectedCount }));
            for (let i = 0; i < collectedCount; i++) {
              remainingFragments.push(spawnFragment());
            }
          }
          return remainingFragments.filter(Boolean);
        });
        return { ...prevPlayer, x: newX, y: newY, direction: newDirection, velocity: newVelocity };
      });
    };
    const intervalId = setInterval(gameLoop, 16);
    return () => clearInterval(intervalId);
  }, [spawnFragment, activeMutation]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  return (
    <div className="w-full h-[70vh] max-w-4xl flex flex-col items-center relative">
      <div className="w-full flex justify-between items-center mb-4 px-2">
        <div className="text-yellow-400 font-bold text-sm sm:text-base">Score: {player.score}</div>
        <div className={`font-bold text-sm sm:text-base ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-red-400'}`}>
          Time: {formatTime(timeLeft)}
        </div>
        <div className="flex gap-2">
          {/* Sound toggle */}
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            className={`text-xs font-bold py-1 px-2 sm:px-3 rounded-lg ${soundEnabled ? 'bg-green-600/80 hover:bg-green-700' : 'bg-gray-600/80 hover:bg-gray-700'} text-white transition-colors`}
            title={soundEnabled ? 'Disable Sound' : 'Enable Sound'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          {/* The Leave button now calls onGameOver with the current score */}
          <button onClick={() => onGameOver(player.score)} className="bg-red-600/80 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 sm:px-3 rounded-lg transition-colors">
            Leave
          </button>
        </div>
      </div>
      
      {/* NFT Influence Indicator */}
      {selectedNFT && (
        <div className="w-full mb-2 px-2">
          <div className="bg-blue-900/50 border border-blue-400 rounded-lg p-2 text-center animate-pulse">
            <span className="text-xs text-blue-300">🔮 NFT Influence: </span>
            <span className="text-xs font-bold text-white">{selectedNFT.name}</span>
            <span className="text-xs text-blue-400"> - {selectedNFT.power} boosted!</span>
          </div>
        </div>
      )}
      
      <div ref={arenaRef} className="w-full h-full bg-gray-900/80 border-2 border-purple-500/50 rounded-lg relative overflow-hidden shadow-2xl">
        <MutationDisplay mutation={activeMutation} timeLeft={mutationTimeLeft} />
        {fragments.map(fragment => (
          <DataFragment key={fragment.id} position={{ x: fragment.x, y: fragment.y }} />
        ))}
        <Glitch position={{ x: player.x, y: player.y }} avatarName={playerAvatar} direction={player.direction} />

        {/* Game controls hint */}
        <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-black/50 rounded px-2 py-1">
          {isMobile ? '📱 Use touch controls' : 'WASD or Arrow keys to move'}
        </div>
      </div>

      {/* Virtual Controls for Mobile */}
      {isMobile && (
        <VirtualControls 
          onInputChange={setVirtualKeys}
          isVisible={true}
        />
      )}
    </div>
  );
}