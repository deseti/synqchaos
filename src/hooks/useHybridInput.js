import { useState, useEffect } from 'react';


export function useHybridInput(virtualKeys = {}) {
  const [keyboardKeys, setKeyboardKeys] = useState({});

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        setKeyboardKeys(prev => ({ ...prev, [key]: true }));
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      setKeyboardKeys(prev => ({ ...prev, [key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const combinedKeys = { ...keyboardKeys };

  Object.keys(virtualKeys).forEach(key => {
    if (virtualKeys[key]) {
      combinedKeys[key] = true;
    }
  });

  if (combinedKeys.w || combinedKeys.arrowup) combinedKeys.arrowup = true;
  if (combinedKeys.s || combinedKeys.arrowdown) combinedKeys.arrowdown = true;
  if (combinedKeys.a || combinedKeys.arrowleft) combinedKeys.arrowleft = true;
  if (combinedKeys.d || combinedKeys.arrowright) combinedKeys.arrowright = true;

  return combinedKeys;
}

export function isMobileDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  if (/android/i.test(userAgent)) return true;
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) return true;
  
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    return window.innerWidth < 1024;
  }
  
  return false;
}

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
