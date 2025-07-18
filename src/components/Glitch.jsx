import React from 'react';

export function Glitch({ position, avatarName, direction }) {
  const avatarPath = `/avatar/${avatarName}.png`;

  return (
    <div
      // The "bg-purple-900" class has been removed from here.
      className="w-8 h-8 rounded-lg"
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
        transition: 'transform 0.15s ease-in-out',
      }}
    >
      <img src={avatarPath} alt="Player Glitch" className="w-full h-full object-contain" />
    </div>
  );
}
