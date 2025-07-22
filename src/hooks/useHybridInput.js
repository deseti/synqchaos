import { useState, useEffect } from 'react';

/**
 * Custom hook yang menggabungkan keyboard input dan virtual controls untuk mobile
 * @param {Object} virtualKeys - Keys dari virtual controls (touch/mouse)
 * @returns {Object} Combined keys dari keyboard dan virtual controls
 */
export function useHybridInput(virtualKeys = {}) {
  const [keyboardKeys, setKeyboardKeys] = useState({});

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      // Handle both WASD and Arrow keys
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        setKeyboardKeys(prev => ({ ...prev, [key]: true }));
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      setKeyboardKeys(prev => ({ ...prev, [key]: false }));
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Combine keyboard and virtual controls
  const combinedKeys = { ...keyboardKeys };

  // Add virtual keys (prioritize virtual controls on mobile)
  Object.keys(virtualKeys).forEach(key => {
    if (virtualKeys[key]) {
      combinedKeys[key] = true;
    }
  });

  // Also map WASD to arrow keys for consistency
  if (combinedKeys.w || combinedKeys.arrowup) combinedKeys.arrowup = true;
  if (combinedKeys.s || combinedKeys.arrowdown) combinedKeys.arrowdown = true;
  if (combinedKeys.a || combinedKeys.arrowleft) combinedKeys.arrowleft = true;
  if (combinedKeys.d || combinedKeys.arrowright) combinedKeys.arrowright = true;

  return combinedKeys;
}

/**
 * Utility function to detect if device is mobile
 * @returns {boolean}
 */
export function isMobileDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // Check for mobile devices
  if (/android/i.test(userAgent)) return true;
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) return true;
  
  // Check for touch support
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    // Additional check for screen size to avoid false positives on touch laptops
    return window.innerWidth < 1024;
  }
  
  return false;
}

/**
 * Hook to detect mobile device
 * @returns {boolean}
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice());
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}
