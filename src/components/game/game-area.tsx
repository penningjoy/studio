
"use client";

import type { SpaceshipProps as SpaceshipData, AsteroidObject } from '@/types';
import SpaceshipComponent from './spaceship'; // Renamed to avoid conflict with imported Spaceship type
import AsteroidComponent from './asteroid'; // Renamed to avoid conflict
import { cn } from '@/lib/utils';

interface GameAreaProps {
  spaceship: SpaceshipData;
  asteroids: AsteroidObject[];
  width: number;
  height: number;
  className?: string;
}

const GameArea: React.FC<GameAreaProps> = ({ spaceship, asteroids, width, height, className }) => {
  return (
    <div
      className={cn(
        "relative bg-black/50 border-2 border-accent shadow-2xl overflow-hidden",
        className // Allows additional classes from parent, though mx-auto is useful if not otherwise centered
      )}
      style={{ width: `${width}px`, height: `${height}px` }}
      aria-label="Game Area"
    >
      <SpaceshipComponent position={spaceship.position} size={spaceship.size} />
      {asteroids.map((asteroid) => (
        <AsteroidComponent key={asteroid.id} asteroid={asteroid} />
      ))}
    </div>
  );
};

export default GameArea;
