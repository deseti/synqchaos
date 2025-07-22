import React, { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '../utils/supabaseClient';
import { Glitch } from './Glitch';
import { DataFragment } from './DataFragment';
import { MutationDisplay } from './MutationDisplay';
import { VirtualControls } from './VirtualControls';
import { soundManager } from '../utils/sounds';
import { useHybridInput, useIsMobile } from '../hooks/useHybridInput';

const duelMutations = [
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
    id: 'shield',
    name: 'SHIELD',
    description: 'Protected from attacks!',
    color: 'border-green-400',
    type: 'defense'
  },
  {
    id: 'attack-boost',
    name: 'ATTACK BOOST',
    description: 'Steal fragments from opponent!',
    color: 'border-red-500',
    type: 'attack'
  }
];

export function DuelGame({ duel, onGameOver, playerAvatar, selectedNFT }) {
  const { address } = useAccount();
  const [player, setPlayer] = useState({ x: 100, y: 100, score: 0, direction: 'right', velocity: { x: 0, y: 0 } });
  const [opponent, setOpponent] = useState({ x: 400, y: 100, score: 0, direction: 'left', velocity: { x: 0, y: 0 } });
  const [fragments, setFragments] = useState([]);
  const [timeLeft, setTimeLeft] = useState(90); // 90 seconds for duel
  const [activeMutation, setActiveMutation] = useState(null);
  const [mutationTimeLeft, setMutationTimeLeft] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPlayer1] = useState(duel.player1 === address);
  const [virtualKeys, setVirtualKeys] = useState({});
  
  // Use hybrid input (keyboard + virtual controls)
  const keys = useHybridInput(virtualKeys);
  const isMobile = useIsMobile();
  const arenaRef = useRef(null);
  const keysRef = useRef(keys);
  const basePlayerSpeed = 5;
  const playerSize = 32;
  const fragmentSize = 20;

  // Sync game state with Supabase
  useEffect(() => {
    if (!duel) return;

    const channel = supabase
      .channel(`duel_${duel.id}`)
      .on('broadcast', { event: 'player_update' }, (payload) => {
        if (payload.payload.address !== address) {
          setOpponent(payload.payload.playerState);
        }
      })
      .on('broadcast', { event: 'fragment_collected' }, (payload) => {
        if (payload.payload.address !== address) {
          setFragments(currentFragments => 
            currentFragments.filter(f => f.id !== payload.payload.fragmentId)
          );
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [duel, address]);

  // Broadcast player state
  const broadcastPlayerState = useCallback((playerState) => {
    if (!duel) return;
    
    supabase
      .channel(`duel_${duel.id}`)
      .send({
        type: 'broadcast',
        event: 'player_update',
        payload: {
          address,
          playerState
        }
      });
  }, [duel, address]);

  // Update sound manager when sound setting changes
  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Update duel result to database
  const updateDuelResult = useCallback(async (finalPlayerScore, finalOpponentScore) => {
    if (!duel || !address) return;
    
    try {
      // Update duel status to completed
      const { error: duelError } = await supabase
        .from('duels')
        .update({
          status: 'completed',
          player1_score: isPlayer1 ? finalPlayerScore : finalOpponentScore,
          player2_score: isPlayer1 ? finalOpponentScore : finalPlayerScore,
          winner: finalPlayerScore > finalOpponentScore ? address : 
                  finalOpponentScore > finalPlayerScore ? (isPlayer1 ? duel.player2 : duel.player1) : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', duel.id);

      if (duelError) {
        console.error('Error updating duel:', duelError);
      }

      // Update player score in players table
      const { error: playerError } = await supabase
        .from('players')
        .upsert({
          address: address,
          avatar: playerAvatar,
          score: finalPlayerScore,
          total_score: finalPlayerScore,
          total_games: 1, // We'll improve this to increment later
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'address',
          ignoreDuplicates: false
        });

      if (playerError) {
        console.error('Error updating player score:', playerError);
      } else {
        console.log('Duel result saved successfully');
      }
    } catch (error) {
      console.error('Error in updateDuelResult:', error);
    }
  }, [duel, address, isPlayer1, playerAvatar]);

  // Timer for game end
  useEffect(() => {
    if (timeLeft <= 0) {
      soundManager.playGameOverSound();
      updateDuelResult(player.score, opponent.score);
      onGameOver(player.score, opponent.score);
      return;
    }
    
    if (timeLeft <= 10) {
      soundManager.playCountdownSound();
    }
    
    const timerId = setInterval(() => setTimeLeft(prevTime => prevTime - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, onGameOver, player.score, opponent.score]);

  // Mutation timer
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

  // Spawn fragments
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
    setFragments([spawnFragment(), spawnFragment(), spawnFragment(), spawnFragment()].filter(Boolean));
  }, [spawnFragment]);

  useEffect(() => {
    keysRef.current = keys;
  }, [keys]);

  // Game loop
  useEffect(() => {
    const arena = arenaRef.current;
    if (!arena) return;

    const gameLoop = () => {
      let playerSpeed = basePlayerSpeed;
      if (activeMutation && activeMutation.type === 'speed') {
        playerSpeed = activeMutation.apply(basePlayerSpeed);
      }

      setPlayer(prevPlayer => {
        const currentKeys = keysRef.current;
        let newX = prevPlayer.x;
        let newY = prevPlayer.y;
        let newDirection = prevPlayer.direction;

        // Movement controls
        const moveUp = currentKeys['w'] || currentKeys['arrowup'];
        const moveDown = currentKeys['s'] || currentKeys['arrowdown'];
        const moveLeft = currentKeys['a'] || currentKeys['arrowleft'];
        const moveRight = currentKeys['d'] || currentKeys['arrowright'];

        // Apply movement
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

        // Boundary constraints
        const arenaRect = arena.getBoundingClientRect();
        newX = Math.max(0, Math.min(newX, arenaRect.width - playerSize));
        newY = Math.max(0, Math.min(newY, arenaRect.height - playerSize));

        const newPlayerState = { ...prevPlayer, x: newX, y: newY, direction: newDirection };
        
        // Broadcast state to opponent
        broadcastPlayerState(newPlayerState);

        return newPlayerState;
      });
    };

    const intervalId = setInterval(gameLoop, 16);
    return () => clearInterval(intervalId);
  }, [basePlayerSpeed, activeMutation, broadcastPlayerState]);

  // Fragment collection logic
  useEffect(() => {
    const checkCollisions = () => {
      setFragments(currentFragments => {
        const playerRect = { 
          left: player.x, 
          top: player.y, 
          right: player.x + playerSize, 
          bottom: player.y + playerSize 
        };
        
        const remainingFragments = [];
        let collectedCount = 0;

        for (const fragment of currentFragments) {
          const fragmentRect = { 
            left: fragment.x, 
            top: fragment.y, 
            right: fragment.x + fragmentSize, 
            bottom: fragment.y + fragmentSize 
          };
          
          if (playerRect.left < fragmentRect.right && 
              playerRect.right > fragmentRect.left && 
              playerRect.top < fragmentRect.bottom && 
              playerRect.bottom > fragmentRect.top) {
            collectedCount++;
            
            // Broadcast fragment collection
            supabase
              .channel(`duel_${duel.id}`)
              .send({
                type: 'broadcast',
                event: 'fragment_collected',
                payload: {
                  address,
                  fragmentId: fragment.id
                }
              });
          } else {
            remainingFragments.push(fragment);
          }
        }

        if (collectedCount > 0) {
          soundManager.playCollectSound();
          setPlayer(p => ({ ...p, score: p.score + collectedCount }));
          
          // Spawn new fragments
          for (let i = 0; i < collectedCount; i++) {
            const newFragment = spawnFragment();
            if (newFragment) remainingFragments.push(newFragment);
          }
        }

        return remainingFragments;
      });
    };

    const collisionInterval = setInterval(checkCollisions, 16);
    return () => clearInterval(collisionInterval);
  }, [player.x, player.y, duel, address, spawnFragment]);

  // Random mutations for duel
  useEffect(() => {
    const mutationInterval = setInterval(() => {
      const newMutation = duelMutations[Math.floor(Math.random() * duelMutations.length)];
      setActiveMutation(newMutation);
      setMutationTimeLeft(10);
      soundManager.playMutationSound();
    }, 20000);

    return () => clearInterval(mutationInterval);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="w-full h-[70vh] max-w-4xl flex flex-col items-center">
      {/* Game UI */}
      <div className="w-full flex justify-between items-center mb-4 px-2">
        <div className="flex items-center space-x-4">
          <div className="text-blue-400 font-bold text-sm">
            You: {player.score}
          </div>
          <div className="text-red-400 font-bold text-sm">
            Opponent: {opponent.score}
          </div>
        </div>
        
        <div className={`font-bold text-sm ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
          Time: {formatTime(timeLeft)}
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            className={`text-xs font-bold py-1 px-2 rounded-lg ${soundEnabled ? 'bg-green-600/80 hover:bg-green-700' : 'bg-gray-600/80 hover:bg-gray-700'} text-white transition-colors`}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button 
            onClick={() => {
              updateDuelResult(player.score, opponent.score);
              onGameOver(player.score, opponent.score);
            }} 
            className="bg-red-600/80 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded-lg transition-colors"
          >
            Leave Duel
          </button>
        </div>
      </div>

      {/* NFT Influence Indicator */}
      {selectedNFT && (
        <div className="w-full mb-2 px-2">
          <div className="bg-purple-900/50 border border-purple-400 rounded-lg p-2 text-center">
            <span className="text-xs text-purple-300">🔮 NFT Power: </span>
            <span className="text-xs font-bold text-white">{selectedNFT.name}</span>
          </div>
        </div>
      )}

      {/* Game Arena */}
      <div ref={arenaRef} className="w-full h-full bg-gray-900/80 border-2 border-red-500/50 rounded-lg relative overflow-hidden shadow-2xl">
        <MutationDisplay mutation={activeMutation} timeLeft={mutationTimeLeft} />
        
        {/* Fragments */}
        {fragments.map(fragment => (
          <DataFragment key={fragment.id} position={{ x: fragment.x, y: fragment.y }} />
        ))}
        
        {/* Player */}
        <Glitch position={{ x: player.x, y: player.y }} avatarName={playerAvatar} direction={player.direction} />
        
        {/* Opponent */}
        <div 
          className="absolute w-8 h-8 border-2 border-red-400 rounded-full bg-red-500/30 flex items-center justify-center"
          style={{ left: opponent.x, top: opponent.y }}
        >
          <span className="text-white text-xs">👤</span>
        </div>

        {/* Controls hint */}
        <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-black/50 rounded px-2 py-1">
          {isMobile ? '📱 Use touch controls • Collect fragments • Beat your opponent!' : 'WASD or Arrow keys to move • Collect fragments • Beat your opponent!'}
        </div>

        {/* Duel info */}
        <div className="absolute top-2 left-2 text-xs text-red-400 bg-black/50 rounded px-2 py-1">
          ⚔️ DUEL MODE
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
