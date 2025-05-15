
"use client";

import type { AsteroidObject } from '@/types';
import { cn } from '@/lib/utils';

interface AsteroidComponentProps {
  asteroid: AsteroidObject;
}

const Asteroid: React.FC<AsteroidComponentProps> = ({ asteroid }) => {
  // Generate a somewhat random border radius for a more "rocky" look
  // This will be consistent for each asteroid once rendered, but different between asteroids
  // if they were re-rendered with new random values. For now, this is fine as they are spawned.
  const [dynamicBorderRadius] = React.useState(() => {
    const r = () => `${Math.random() * 40 + 30}%`; // Random percentage between 30% and 70%
    return `${r()} ${r()} ${r()} ${r()} / ${r()} ${r()} ${r()} ${r()}`;
  });
  
  const asteroidStyle: React.CSSProperties = {
    left: `${asteroid.x}px`,
    top: `${asteroid.y}px`,
    width: `${asteroid.width}px`,
    height: `${asteroid.height}px`,
    backgroundColor: 'hsl(var(--muted-foreground))', 
    // Irregular border radius for a more "rocky" look
    borderRadius: dynamicBorderRadius,
    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.3)', // Subtle inner shadow for depth
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
