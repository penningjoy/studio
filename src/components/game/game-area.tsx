
"use client";

import type { SpaceshipProps as SpaceshipData, AsteroidObject } from '@/types';
import SpaceshipComponent from './spaceship'; 
import AsteroidComponent from './asteroid'; 
import { cn } from '@/lib/utils';

interface GameAreaProps {
  spaceship: SpaceshipData;
  asteroids: AsteroidObject[];
  actualWidth: number;
  actualHeight: number;
  logicalWidth: number;
  logicalHeight: number; // Though scale might often be uniform, good to have if needed
  className?: string;
}

const GameArea: React.FC<GameAreaProps> = ({ 
  spaceship, 
  asteroids, 
  actualWidth, 
  actualHeight,
  logicalWidth,
  // logicalHeight, // Currently assuming uniform scaling based on width
  className 
}) => {
  // Calculate scale factor. Assuming uniform scaling based on width.
  // If non-uniform scaling is ever needed, you'd have scaleX and scaleY.
  const scale = actualWidth / logicalWidth;

  return (
    <div
      className={cn(
        "relative bg-black/50 border-2 border-accent shadow-2xl overflow-hidden",
        className
      )}
      style={{ width: `${actualWidth}px`, height: `${actualHeight}px` }}
      aria-label="Game Area"
    >
      <SpaceshipComponent 
        position={spaceship.position} 
        size={spaceship.size} 
        scale={scale} 
      />
      {asteroids.map((asteroid) => (
        <AsteroidComponent 
          key={asteroid.id} 
          asteroid={asteroid} 
          scale={scale} 
        />
      ))}
    </div>
  );
};

export default GameArea;
