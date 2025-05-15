
export interface Position {
  x: number;
  y: number;
}

export interface GameObject extends Position {
  id: string;
  size: number; // Logical size
  width: number; // Logical width
  height: number; // Logical height
}

// Represents the logical data for a spaceship
export interface SpaceshipProps {
  position: Position; // Logical position
  size: number;     // Logical size
}

export interface AsteroidObject extends GameObject {
  rotation: number;
  rotationSpeed: number;
}

export interface GameState {
  spaceshipPosition: Position; // Logical position
  asteroids: AsteroidObject[]; // Asteroids with logical positions and sizes
  score: number;
  lives: number;
  isGameOver: boolean;
  gameStarted: boolean;
  highScore: number;
}
