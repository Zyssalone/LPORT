'use client';

import { useEffect } from 'react';
import SmoothScroll from 'smooth-scroll';

const SmoothScrollWrapper = () => {
  useEffect(() => {
    // Initialize SmoothScroll when the component is mounted
    const scroll = new SmoothScroll('a[href*="#"]', {
      speed: 800,
      speedAsDuration: true,
    });
    
    // Clean up the scroll instance on unmount
    return () => scroll.destroy();
  }, []);

  return null;
};

export default SmoothScrollWrapper;
