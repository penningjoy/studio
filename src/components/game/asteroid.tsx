"use client";

import type { AsteroidObject } from '@/types';
import { cn } from '@/lib/utils';

interface AsteroidComponentProps {
  asteroid: AsteroidObject;
}

const Asteroid: React.FC<AsteroidComponentProps> = ({ asteroid }) => {
  const asteroidStyle: React.CSSProperties = {
    left: `${asteroid.x}px`,
    top: `${asteroid.y}px`,
    width: `${asteroid.width}px`,
    height: `${asteroid.height}px`,
    // Using muted-foreground for asteroids (gray)
    backgroundColor: 'hsl(var(--muted-foreground))', 
    borderRadius: '20%', // Slightly rounded square for asteroid look
  };

  return (
    <div
      className="absolute"
      style={asteroidStyle}
      aria-label="Asteroid"
    />
  );
};

export default Asteroid;
