'use client';

import { useEffect, useState } from 'react';

export default function NeonOrbs() {
  const [orbs, setOrbs] = useState([]);

  useEffect(() => {
    // Generate initial orbs with random positions, sizes, and velocities
    const generateOrbs = () => {
      return Array.from({ length: 10 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 120 + Math.random() * 100,
        velocityX: Math.random() * 2 - 1, // Random X velocity (-1 to 1)
        velocityY: Math.random() * 2 - 1, // Random Y velocity (-1 to 1)
        duration: 15 + Math.random() * 10,
        delay: Math.random() * 5,
      }));
    };

    setOrbs(generateOrbs());

    // Animation loop to update positions
    const updateOrbs = () => {
      setOrbs((prevOrbs) =>
        prevOrbs.map((orb) => {
          // Calculate new positions
          let newTop = orb.top + orb.velocityY;
          let newLeft = orb.left + orb.velocityX;

          // Bounce off walls (edges of the screen)
          if (newTop <= 0 || newTop >= 100) orb.velocityY *= -1; // Reverse Y direction on top/bottom walls
          if (newLeft <= 0 || newLeft >= 100) orb.velocityX *= -1; // Reverse X direction on left/right walls

          // Return the updated orb
          return { ...orb, top: newTop, left: newLeft };
        })
      );

      // Continue the animation loop
      requestAnimationFrame(updateOrbs);
    };

    // Start the animation loop
    updateOrbs();

    return () => cancelAnimationFrame(updateOrbs); // Cleanup on component unmount
  }, []);

  return (
    <div className="fixed inset-0 z-100 pointer-events-none overflow-hidden">
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className="absolute rounded-full bg-[#22B205] opacity-[0.06] blur-3xl"
          style={{
            top: `${orb.top}%`,
            left: `${orb.left}%`,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            animationDuration: `${orb.duration}s`,
            animationDelay: `${orb.delay}s`,
            boxShadow: `0 0 ${orb.size / 2}px ${orb.size / 4}px rgba(0, 255, 0, 0.7)`,
          }}
        />
      ))}
    </div>
  );
}
