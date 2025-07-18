// src/components/Avatar.jsx

import React from 'react';

// This component now displays a PNG avatar image.
// It takes the avatar name (e.g., 'chog') and constructs the path.
export function Avatar({ avatarName, size = 32 }) {
  const avatarPath = `/avatar/${avatarName}.png`;

  return (
    <div
      className="rounded-full overflow-hidden border-2 border-gray-600 bg-gray-700 flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <img
        src={avatarPath}
        alt={`${avatarName} avatar`}
        className="w-full h-full object-cover"
        // Add a fallback in case the image fails to load
        onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.backgroundColor = '#4a5568'; }}
      />
    </div>
  );
}