// src/components/DataFragment.jsx

import React from 'react';

export function DataFragment({ position }) {
  return (
    <div
      className="w-5 h-5 bg-yellow-400 rounded-full shadow-lg animate-pulse"
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    />
  );
}