// src/components/AvatarSelector.jsx

import React, { useState } from 'react';

const avatars = [
  { name: 'chog', displayName: 'Chog', description: 'The Swift Hunter' },
  { name: 'molandak', displayName: 'Molandak', description: 'The Wise Guardian' },
  { name: 'moyaki', displayName: 'Moyaki', description: 'The Fierce Warrior' },
];

export function AvatarSelector({ onSelect }) {
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const handleSelection = (avatarName) => {
    setSelectedAvatar(avatarName);
    setTimeout(() => onSelect(avatarName), 500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-6xl font-cyber font-bold text-gradient animate-glow">
          Choose Your Glitch
        </h1>
        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
          Select your Monad Animal companion to enter the chaotic arena. Each character brings unique energy to the battlefield.
        </p>
      </div>

      {/* Avatar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        {avatars.map((avatar, index) => (
          <div
            key={avatar.name}
            className={`card-hover p-8 cursor-pointer group transition-all duration-500 animate-slide-up ${
              selectedAvatar === avatar.name ? 'border-purple-500 shadow-glow-lg scale-105' : ''
            }`}
            style={{ animationDelay: `${index * 200}ms` }}
            onClick={() => handleSelection(avatar.name)}
          >
            {/* Avatar Image Container */}
            <div className="relative mb-6">
              <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className={`relative w-full h-full rounded-full border-4 transition-all duration-300 overflow-hidden ${
                  selectedAvatar === avatar.name 
                    ? 'border-purple-500 shadow-glow-lg' 
                    : 'border-purple-500/30 group-hover:border-purple-500/60'
                }`}>
                  <img
                    src={`/avatar/${avatar.name}.png`}
                    alt={avatar.displayName}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                {/* Selection Indicator */}
                {selectedAvatar === avatar.name && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center animate-scale-in">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                )}
              </div>
            </div>

            {/* Avatar Info */}
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300">
                {avatar.displayName}
              </h3>
              <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                {avatar.description}
              </p>
            </div>

            {/* Hover Effect */}
            <div className="mt-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-12 space-y-4">
        <div className="inline-flex items-center space-x-2 text-purple-400 animate-bounce-slow">
          <span className="text-lg">👆</span>
          <span className="text-lg font-semibold">Select your character to continue</span>
        </div>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Your choice affects your avatar's appearance in the game lobby and during battles.
        </p>
      </div>
    </div>
  );
}