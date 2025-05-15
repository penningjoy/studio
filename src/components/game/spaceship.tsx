
"use client";

import type { SpaceshipProps } from '@/types';

const Spaceship: React.FC<SpaceshipProps> = ({ position, size }) => {
  // Basic SVG spaceship. You can find more complex SVGs or create your own.
  // The SVG is scaled by the 'size' prop.
  // fill uses the --primary HSL variable
  const spaceshipStyle: React.CSSProperties = {
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${size}px`,
    height: `${size}px`,
    transition: 'left 0.05s linear, top 0.05s linear', // Smooth movement
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
        // Using a CSS variable for fill directly in SVG might not always work as expected
        // depending on browser and context. Applying it via style on the parent or
        // directly on paths is more robust.
        // For simplicity, let's assume --primary is a HSL value and we can use it.
      >
        {/* Main body */}
        <path d="M100 20 L140 100 L100 180 L60 100 Z" fill="hsl(var(--primary))" stroke="hsl(var(--accent))" strokeWidth="5"/>
        {/* Cockpit */}
        <circle cx="100" cy="90" r="20" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="3"/>
        {/* Engine Flame (optional, simple triangle) */}
        <path d="M90 180 L110 180 L100 195 Z" fill="hsl(var(--destructive))" />
      </svg>
    </div>
  );
};

export default Spaceship;
