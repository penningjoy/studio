
"use client";

import type { Position } from '@/types'; // GameObject or Position might be more accurate depending on usage

interface SpaceshipComponentProps {
  position: Position;
  size: number;
  scale: number;
}

const Spaceship: React.FC<SpaceshipComponentProps> = ({ position, size, scale }) => {
  const scaledSize = size * scale;
  const scaledX = position.x * scale;
  const scaledY = position.y * scale;

  const spaceshipStyle: React.CSSProperties = {
    left: `${scaledX}px`,
    top: `${scaledY}px`,
    width: `${scaledSize}px`,
    height: `${scaledSize}px`,
    transition: 'left 0.05s linear, top 0.05s linear', 
  };

  return (
    <div
      className="absolute"
      style={spaceshipStyle}
      aria-label="Spaceship"
    >
      <svg 
        viewBox="0 0 200 200" 
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        {/* Main body */}
        <path d="M100 20 L140 100 L100 180 L60 100 Z" fill="hsl(var(--primary))" stroke="hsl(var(--accent))" strokeWidth="10"/>
        {/* Cockpit */}
        <circle cx="100" cy="90" r="20" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="6"/>
        {/* Engine Flame */}
        <path d="M90 180 L110 180 L100 215 L90 180 Z" fill="hsl(var(--destructive))" />
      </svg>
    </div>
  );
};

export default Spaceship;
