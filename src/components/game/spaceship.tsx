"use client";

import type { SpaceshipProps } from '@/types';
import { cn } from '@/lib/utils';

const Spaceship: React.FC<SpaceshipProps> = ({ position, size }) => {
  const spaceshipStyle: React.CSSProperties = {
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: '0px',
    height: '0px',
    borderLeft: `${size / 2}px solid transparent`,
    borderRight: `${size / 2}px solid transparent`,
    borderBottom: `${size}px solid hsl(var(--primary))`, // Cyan
    transition: 'left 0.05s linear, top 0.05s linear', // Smooth movement
  };

  return (
    <div
      className="absolute"
      style={spaceshipStyle}
      aria-label="Spaceship"
    />
  );
};

export default Spaceship;
