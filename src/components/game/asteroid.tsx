
"use client";

import * as React from 'react';
import type { AsteroidObject } from '@/types';
import { cn } from '@/lib/utils';

interface AsteroidComponentProps {
  asteroid: AsteroidObject;
  scale: number;
}

const Asteroid: React.FC<AsteroidComponentProps> = ({ asteroid, scale }) => {
  const [dynamicBorderRadius] = React.useState(() => {
    const r = () => `${Math.random() * 40 + 30}%`; 
    return `${r()} ${r()} ${r()} ${r()} / ${r()} ${r()} ${r()} ${r()}`;
  });
  
  const asteroidStyle: React.CSSProperties = {
    left: `${asteroid.x * scale}px`,
    top: `${asteroid.y * scale}px`,
    width: `${asteroid.width * scale}px`,
    height: `${asteroid.height * scale}px`,
    backgroundColor: 'hsl(var(--muted-foreground))', 
    borderRadius: dynamicBorderRadius,
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
