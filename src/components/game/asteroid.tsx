
"use client";

import * as React from 'react';
import type { AsteroidObject } from '@/types';
import { cn } from '@/lib/utils';

interface AsteroidComponentProps {
  asteroid: AsteroidObject;
  scale: number;
}

const Asteroid: React.FC<AsteroidComponentProps> = ({ asteroid, scale }) => {
  const [dynamicBorderRadius, setDynamicBorderRadius] = React.useState<string>("30% 70% 40% 60% / 60% 40% 70% 30%");

  React.useEffect(() => {
    const r = () => `${Math.random() * 40 + 30}%`;
    setDynamicBorderRadius(`${r()} ${r()} ${r()} ${r()} / ${r()} ${r()} ${r()} ${r()}`);
  }, []); 

  const asteroidStyle: React.CSSProperties = {
    left: `${asteroid.x * scale}px`,
    top: `${asteroid.y * scale}px`,
    width: `${asteroid.width * scale}px`,
    height: `${asteroid.height * scale}px`,
    backgroundColor: 'hsl(var(--muted-foreground))', 
    borderRadius: dynamicBorderRadius,
    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.3)',
    transform: `rotate(${asteroid.rotation}deg)`, // Apply rotation
    transition: 'top 0.05s linear', // Smooth falling, rotation is handled by direct style update
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
