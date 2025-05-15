
"use client";

import * as React from 'react';
import type { AsteroidObject } from '@/types';
import { cn } from '@/lib/utils';

interface AsteroidComponentProps {
  asteroid: AsteroidObject;
  scale: number;
}

const Asteroid: React.FC<AsteroidComponentProps> = ({ asteroid, scale }) => {
  // Initialize with a static, non-random border radius for SSR and initial client render
  const [dynamicBorderRadius, setDynamicBorderRadius] = React.useState<string>("30% 70% 40% 60% / 60% 40% 70% 30%");

  React.useEffect(() => {
    // Set the random border radius only on the client, after hydration
    const r = () => `${Math.random() * 40 + 30}%`; // Random percentage between 30% and 70%
    setDynamicBorderRadius(`${r()} ${r()} ${r()} ${r()} / ${r()} ${r()} ${r()} ${r()}`);
  }, []); // Empty dependency array ensures this runs once on mount on the client side

  const asteroidStyle: React.CSSProperties = {
    left: `${asteroid.x * scale}px`,
    top: `${asteroid.y * scale}px`,
    width: `${asteroid.width * scale}px`,
    height: `${asteroid.height * scale}px`,
    backgroundColor: 'hsl(var(--muted-foreground))', 
    borderRadius: dynamicBorderRadius, // Use the state variable
    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.3)', 
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
