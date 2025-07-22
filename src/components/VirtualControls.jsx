import React, { useState, useEffect, useRef, useCallback } from 'react';

export function VirtualControls({ onInputChange, isVisible = true }) {
  const [activeKeys, setActiveKeys] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const joystickRef = useRef(null);
  const knobRef = useRef(null);

  const JOYSTICK_SIZE = 100;
  const KNOB_SIZE = 40;
  const MAX_DISTANCE = (JOYSTICK_SIZE - KNOB_SIZE) / 2;

  useEffect(() => {
    onInputChange(activeKeys);
  }, [activeKeys, onInputChange]);

  const updateKeysFromJoystick = useCallback((x, y) => {
    const distance = Math.sqrt(x * x + y * y);
    if (distance < 15) {
      setActiveKeys({});
      return;
    }

    const newKeys = {};
    const threshold = 20;

    if (Math.abs(x) > threshold) {
      if (x > 0) newKeys.d = true;
      if (x < 0) newKeys.a = true;
    }

    if (Math.abs(y) > threshold) {
      if (y > 0) newKeys.s = true;
      if (y < 0) newKeys.w = true;
    }

    setActiveKeys(newKeys);
  }, []);

  const handleJoystickMove = useCallback((clientX, clientY) => {
    if (!joystickRef.current) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let x = clientX - centerX;
    let y = clientY - centerY;

    const distance = Math.sqrt(x * x + y * y);
    if (distance > MAX_DISTANCE) {
      const angle = Math.atan2(y, x);
      x = Math.cos(angle) * MAX_DISTANCE;
      y = Math.sin(angle) * MAX_DISTANCE;
    }

    setJoystickPosition({ x, y });
    updateKeysFromJoystick(x, y);
  }, [updateKeysFromJoystick]);

  const handleTouchStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const touch = e.touches[0];
    handleJoystickMove(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!isDragging) return;
    const touch = e.touches[0];
    handleJoystickMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setJoystickPosition({ x: 0, y: 0 });
    setActiveKeys({});
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    handleJoystickMove(e.clientX, e.clientY);
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    if (!isDragging) return;
    handleJoystickMove(e.clientX, e.clientY);
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setJoystickPosition({ x: 0, y: 0 });
    setActiveKeys({});
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const handleButtonPress = (key) => {
    setActiveKeys(prev => ({ ...prev, [key]: true }));
  };

  const handleButtonRelease = (key) => {
    setActiveKeys(prev => {
      const newKeys = { ...prev };
      delete newKeys[key];
      return newKeys;
    });
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed bottom-6 left-6 z-50">
        <div className="flex flex-col items-center space-y-2">
          <div
            ref={joystickRef}
            className="relative bg-gray-800/80 border-2 border-gray-600 rounded-full flex items-center justify-center touch-none select-none"
            style={{
              width: JOYSTICK_SIZE,
              height: JOYSTICK_SIZE,
            }}
            onTouchStart={handleTouchStart}
            onMouseDown={handleMouseDown}
          >
            <div
              ref={knobRef}
              className="absolute bg-purple-500 border-2 border-purple-400 rounded-full transition-all duration-75 shadow-lg"
              style={{
                width: KNOB_SIZE,
                height: KNOB_SIZE,
                transform: `translate(${joystickPosition.x}px, ${joystickPosition.y}px)`,
                backgroundColor: isDragging ? '#a855f7' : '#8b5cf6',
                boxShadow: isDragging ? '0 0 20px rgba(168, 85, 247, 0.6)' : '0 0 10px rgba(139, 92, 246, 0.4)',
              }}
            />
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute top-2 text-gray-400 text-xs">↑</div>
              <div className="absolute bottom-2 text-gray-400 text-xs">↓</div>
              <div className="absolute left-2 text-gray-400 text-xs">←</div>
              <div className="absolute right-2 text-gray-400 text-xs">→</div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            Move
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 opacity-50">
        <div className="flex flex-col items-center space-y-1">
          <button
            className={`w-12 h-12 bg-gray-800/80 border border-gray-600 rounded-lg flex items-center justify-center text-white touch-none select-none ${
              activeKeys.w ? 'bg-purple-600/80 border-purple-400' : 'hover:bg-gray-700/80'
            }`}
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonPress('w');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleButtonRelease('w');
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              handleButtonPress('w');
            }}
            onMouseUp={(e) => {
              e.preventDefault();
              handleButtonRelease('w');
            }}
            onMouseLeave={(e) => {
              e.preventDefault();
              handleButtonRelease('w');
            }}
          >
            ↑
          </button>
          
          <div className="flex space-x-1">
            <button
              className={`w-12 h-12 bg-gray-800/80 border border-gray-600 rounded-lg flex items-center justify-center text-white touch-none select-none ${
                activeKeys.a ? 'bg-purple-600/80 border-purple-400' : 'hover:bg-gray-700/80'
              }`}
              onTouchStart={(e) => {
                e.preventDefault();
                handleButtonPress('a');
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleButtonRelease('a');
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                handleButtonPress('a');
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                handleButtonRelease('a');
              }}
              onMouseLeave={(e) => {
                e.preventDefault();
                handleButtonRelease('a');
              }}
            >
              ←
            </button>
            
            <button
              className={`w-12 h-12 bg-gray-800/80 border border-gray-600 rounded-lg flex items-center justify-center text-white touch-none select-none ${
                activeKeys.d ? 'bg-purple-600/80 border-purple-400' : 'hover:bg-gray-700/80'
              }`}
              onTouchStart={(e) => {
                e.preventDefault();
                handleButtonPress('d');
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleButtonRelease('d');
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                handleButtonPress('d');
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                handleButtonRelease('d');
              }}
              onMouseLeave={(e) => {
                e.preventDefault();
                handleButtonRelease('d');
              }}
            >
              →
            </button>
          </div>
          
          <button
            className={`w-12 h-12 bg-gray-800/80 border border-gray-600 rounded-lg flex items-center justify-center text-white touch-none select-none ${
              activeKeys.s ? 'bg-purple-600/80 border-purple-400' : 'hover:bg-gray-700/80'
            }`}
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonPress('s');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleButtonRelease('s');
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              handleButtonPress('s');
            }}
            onMouseUp={(e) => {
              e.preventDefault();
              handleButtonRelease('s');
            }}
            onMouseLeave={(e) => {
              e.preventDefault();
              handleButtonRelease('s');
            }}
          >
            ↓
          </button>
          
          <div className="text-xs text-gray-500 text-center mt-1">
            Alt Controls
          </div>
        </div>
      </div>

      <div className="fixed bottom-2 right-2 z-40">
        <div className="text-xs text-gray-500 bg-black/50 rounded px-2 py-1">
          📱 Touch controls active
        </div>
      </div>
    </>
  );
}
