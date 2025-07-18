// src/components/AvatarSelector.jsx

import React from 'react';

const avatars = [
  { name: 'chog', displayName: 'Chog' },
  { name: 'molandak', displayName: 'Molandak' },
  { name: 'moyaki', displayName: 'Moyaki' },
];

export function AvatarSelector({ onSelect }) {
  return (
    <div className="w-full max-w-lg text-center">
      <h1 className="text-4xl font-bold text-purple-400 mb-4">Choose Your Glitch</h1>
      <p className="text-gray-400 mb-10">Select your Monad Animal to enter the arena.</p>
      <div className="flex justify-center items-center gap-8">
        {avatars.map(avatar => (
          <div
            key={avatar.name}
            className="flex flex-col items-center gap-4 cursor-pointer group"
            onClick={() => onSelect(avatar.name)}
          >
            <div className="w-32 h-32 rounded-full bg-gray-800 border-4 border-transparent group-hover:border-purple-500 transition-all duration-300 p-2">
              <img
                src={`/avatar/${avatar.name}.png`}
                alt={avatar.displayName}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-bold text-lg text-gray-300 group-hover:text-white transition-colors">
              {avatar.displayName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}