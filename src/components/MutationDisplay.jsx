import React, { useState, useEffect } from 'react';

export function MutationDisplay({ mutation, timeLeft }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (mutation) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [mutation]);

  if (!mutation) {
    return null;
  }

  return (
    <>
      {visible && (
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 p-6 rounded-lg shadow-2xl text-center bg-black/70 border-2 ${mutation.color} animate-fade-in-out`}
        >
          <h3 className="text-3xl font-bold mb-2">{mutation.name}</h3>
          <p className="text-lg text-gray-300">{mutation.description}</p>
        </div>
      )}
      
      {!visible && timeLeft > 0 && (
        <div className="absolute top-4 right-4 z-20 bg-black/80 border border-gray-600 rounded-lg p-3">
          <div className={`text-sm font-bold border-l-4 pl-2 ${mutation.color.replace('border-', 'border-l-')}`}>
            <div className="text-white">{mutation.name}</div>
            <div className="text-gray-300">{timeLeft}s</div>
          </div>
        </div>
      )}
    </>
  );
}