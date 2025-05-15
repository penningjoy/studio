
export interface Position {
  x: number;
  y: number;
}

export interface GameObject extends Position {
  id: string;
  size: number;
  width: number;
  height: number;
}

export interface SpaceshipProps {
  position: Position;
  size: number;
}

export interface AsteroidObject extends GameObject {
 // Potentially type or color in future
}

export interface GameState {
  spaceshipPosition: Position;
  asteroids: AsteroidObject[];
  score: number;
  lives: number;
  isGameOver: boolean;
  gameStarted: boolean;
  highScore: number;
}
