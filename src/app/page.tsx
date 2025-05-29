
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Position, AsteroidObject, GameState } from '@/types';
import ScoreDisplay from '@/components/game/score-display';
import GameOverScreen from '@/components/game/game-over-screen';
import GameArea from '@/components/game/game-area';
import { Button } from '@/components/ui/button';
import { Play, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const LOGICAL_GAME_WIDTH = 800;
const LOGICAL_GAME_HEIGHT = 600;
const SPACESHIP_SIZE = 50; 
const ASTEROID_MIN_SIZE = 20;
const ASTEROID_MAX_SIZE = 60;
const SPACESHIP_SPEED = 20;
const INITIAL_ASTEROID_BASE_SPEED = 1.0; 
const MAX_ASTEROID_SPEED = 7.0;
const INITIAL_LIVES = 5; 
const INITIAL_ASTEROID_SPAWN_INTERVAL = 1000; 
const MIN_ASTEROID_SPAWN_INTERVAL = 500; 
const SCORE_INCREMENT_INTERVAL = 1000; 

const SESSION_STORAGE_HIGH_SCORE_KEY = 'cosmicImpactHighScore';

export default function CosmicImpactPage() {
  const [actualGameDimensions, setActualGameDimensions] = useState({ 
    width: LOGICAL_GAME_WIDTH, 
    height: LOGICAL_GAME_HEIGHT 
  });

  const [gameState, setGameState] = useState<GameState>({
    spaceshipPosition: { x: LOGICAL_GAME_WIDTH / 2 - SPACESHIP_SIZE / 2, y: LOGICAL_GAME_HEIGHT - SPACESHIP_SIZE - 10 },
    asteroids: [],
    score: 0,
    lives: INITIAL_LIVES,
    isGameOver: false,
    gameStarted: false,
    highScore: 0,
  });

  const keysPressed = useRef<Set<string>>(new Set());
  const lastAsteroidSpawnTime = useRef<number>(0);
  const lastScoreIncrementTime = useRef<number>(0);
  const gameLoopId = useRef<number | null>(null);
  const gameStartTime = useRef<number>(0);

  useEffect(() => {
    const updateDimensions = () => {
      const aspectRatio = LOGICAL_GAME_HEIGHT / LOGICAL_GAME_WIDTH;
      let newWidth = Math.min(window.innerWidth * 0.95, LOGICAL_GAME_WIDTH);
      let newHeight = newWidth * aspectRatio;

      const maxGameAreaViewportHeightPercentage = 0.65; 
      const maxViewportHeight = window.innerHeight * maxGameAreaViewportHeightPercentage; 
      if (newHeight > maxViewportHeight) {
        newHeight = maxViewportHeight;
        newWidth = newHeight / aspectRatio;
      }
      
      setActualGameDimensions({ width: newWidth, height: newHeight });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);


  const loadHighScore = useCallback(() => {
    const storedHighScore = sessionStorage.getItem(SESSION_STORAGE_HIGH_SCORE_KEY);
    if (storedHighScore) {
      setGameState(prev => ({ ...prev, highScore: parseInt(storedHighScore, 10) }));
    }
  }, []);

  const saveHighScore = useCallback((newScore: number) => {
    setGameState(prev => {
      if (newScore > prev.highScore) {
        sessionStorage.setItem(SESSION_STORAGE_HIGH_SCORE_KEY, newScore.toString());
        return { ...prev, highScore: newScore };
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    loadHighScore();
  }, [loadHighScore]);

  const resetGame = useCallback(() => {
    gameStartTime.current = Date.now();
    setGameState(prev => ({
      ...prev,
      spaceshipPosition: { x: LOGICAL_GAME_WIDTH / 2 - SPACESHIP_SIZE / 2, y: LOGICAL_GAME_HEIGHT - SPACESHIP_SIZE * 2 },
      asteroids: [],
      score: 0,
      lives: INITIAL_LIVES,
      isGameOver: false,
      gameStarted: true,
    }));
    lastAsteroidSpawnTime.current = Date.now();
    lastScoreIncrementTime.current = Date.now();
    keysPressed.current.clear();
  }, []);

  const startGame = () => {
    resetGame();
  };

  const spawnAsteroid = useCallback((currentSpeed: number, elapsedSeconds: number) => {
    const size = Math.random() * (ASTEROID_MAX_SIZE - ASTEROID_MIN_SIZE) + ASTEROID_MIN_SIZE;
    
    let x: number;
    let y: number;
    let dx: number;
    let dy: number;

    const threeMinutes = 3 * 60; // 180 seconds

    if (elapsedSeconds < threeMinutes) {
        // Spawn from top (original logic for direction)
        x = Math.random() * (LOGICAL_GAME_WIDTH - size);
        y = -size; // Starts just above the screen
        dx = 0;
        dy = currentSpeed;
    } else {
        // Spawn from top, left, or right
        const side = Math.floor(Math.random() * 3); // 0: top, 1: left, 2: right

        if (side === 0) { // Top
            x = Math.random() * (LOGICAL_GAME_WIDTH - size);
            y = -size;
            dx = 0;
            dy = currentSpeed;
        } else if (side === 1) { // Left
            x = -size; // Starts just off screen to the left
            y = Math.random() * (LOGICAL_GAME_HEIGHT - size);
            
            const targetX = LOGICAL_GAME_WIDTH * (Math.random() * 0.4 + 0.3); 
            const targetY = LOGICAL_GAME_HEIGHT * (Math.random() * 0.4 + 0.3);
            
            const angle = Math.atan2(targetY - (y + size / 2), targetX - (x + size / 2));
            dx = Math.cos(angle) * currentSpeed;
            dy = Math.sin(angle) * currentSpeed;
        } else { // Right (side === 2)
            x = LOGICAL_GAME_WIDTH; // Starts just off screen to the right
            y = Math.random() * (LOGICAL_GAME_HEIGHT - size);

            const targetX = LOGICAL_GAME_WIDTH * (Math.random() * 0.4 + 0.3);
            const targetY = LOGICAL_GAME_HEIGHT * (Math.random() * 0.4 + 0.3);

            const angle = Math.atan2(targetY - (y + size / 2), targetX - (x + size / 2));
            dx = Math.cos(angle) * currentSpeed;
            dy = Math.sin(angle) * currentSpeed;
        }
    }

    const newAsteroid: AsteroidObject = {
      id: crypto.randomUUID(),
      x,
      y,
      size,
      width: size,
      height: size,
      rotation: (Math.random() - 0.5) * 360, // Random initial rotation
      rotationSpeed: (Math.random() - 0.5) * 4,
      dx,
      dy,
    };
    setGameState(prev => ({ ...prev, asteroids: [...prev.asteroids, newAsteroid] }));
  }, [setGameState]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    keysPressed.current.add(event.key.toLowerCase());
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    keysPressed.current.delete(event.key.toLowerCase());
  }, []);

  const handleButtonPress = useCallback((key: string) => {
    keysPressed.current.add(key);
  }, []);

  const handleButtonRelease = useCallback((key: string) => {
    keysPressed.current.delete(key);
  }, []);


  useEffect(() => {
    if (!gameState.gameStarted || gameState.isGameOver) return;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.gameStarted, gameState.isGameOver, handleKeyDown, handleKeyUp]);


  const gameLoop = useCallback(() => {
    if (!gameState.gameStarted || gameState.isGameOver) {
      if (gameLoopId.current) cancelAnimationFrame(gameLoopId.current);
      return;
    }

    const elapsedTimeInSeconds = Math.floor((Date.now() - gameStartTime.current) / 1000);
    
    const currentScore = gameState.score; // currentScore is still available if needed for other logic
    const currentAsteroidSpeed = Math.min(
      MAX_ASTEROID_SPEED,
      INITIAL_ASTEROID_BASE_SPEED + Math.floor(elapsedTimeInSeconds / 10) * 0.20
    );
    const currentSpawnInterval = Math.max(
      MIN_ASTEROID_SPAWN_INTERVAL,
      INITIAL_ASTEROID_SPAWN_INTERVAL - Math.floor(currentScore / 100) * 50
    );

    setGameState(prev => {
      if (!prev.gameStarted || prev.isGameOver) return prev;
      
      let { spaceshipPosition, asteroids, score, lives, isGameOver } = { ...prev };

      let newX = spaceshipPosition.x;
      let newY = spaceshipPosition.y;

      if (keysPressed.current.has('arrowleft') || keysPressed.current.has('a')) newX -= SPACESHIP_SPEED;
      if (keysPressed.current.has('arrowright') || keysPressed.current.has('d')) newX += SPACESHIP_SPEED;
      if (keysPressed.current.has('arrowup') || keysPressed.current.has('w')) newY -= SPACESHIP_SPEED;
      if (keysPressed.current.has('arrowdown') || keysPressed.current.has('s')) newY += SPACESHIP_SPEED;
      
      spaceshipPosition = {
        x: Math.max(0, Math.min(LOGICAL_GAME_WIDTH - SPACESHIP_SIZE, newX)),
        y: Math.max(0, Math.min(LOGICAL_GAME_HEIGHT - SPACESHIP_SIZE, newY)),
      };

      const updatedAsteroids = asteroids.map(a => ({
        ...a,
        x: a.x + a.dx,
        y: a.y + a.dy,
        rotation: (a.rotation + a.rotationSpeed) % 360,
      })).filter(a => {
        const shipRect = { x: spaceshipPosition.x, y: spaceshipPosition.y, width: SPACESHIP_SIZE, height: SPACESHIP_SIZE };
        const asteroidRect = { x: a.x, y: a.y, width: a.width, height: a.height };

        if (
          shipRect.x < asteroidRect.x + asteroidRect.width &&
          shipRect.x + shipRect.width > asteroidRect.x &&
          shipRect.y < asteroidRect.y + asteroidRect.height &&
          shipRect.y + shipRect.height > asteroidRect.y
        ) {
          lives--;
          if (lives <= 0) {
            isGameOver = true;
          }
          
          spaceshipPosition = { x: LOGICAL_GAME_WIDTH / 2 - SPACESHIP_SIZE / 2, y: LOGICAL_GAME_HEIGHT - SPACESHIP_SIZE * 2 - 20 }; 
          return false; // Asteroid hit player, remove it
        }

        // Keep asteroid if it's within the game boundaries
        const isOffScreenBottom = a.y >= LOGICAL_GAME_HEIGHT;
        const isOffScreenTop = a.y + a.height <= 0; // If it moved upwards off screen
        const isOffScreenLeft = a.x + a.width <= 0; // If it moved leftwards off screen
        const isOffScreenRight = a.x >= LOGICAL_GAME_WIDTH; // If it moved rightwards off screen
        
        // Return false to remove the asteroid if it's off screen from any side
        if (isOffScreenBottom || isOffScreenTop || isOffScreenLeft || isOffScreenRight) {
          return false;
        }
        
        return true; // Otherwise, keep the asteroid
      });
      
      asteroids = updatedAsteroids;
      
      if (Date.now() - lastScoreIncrementTime.current > SCORE_INCREMENT_INTERVAL && !isGameOver) {
        score += 10; 
        lastScoreIncrementTime.current = Date.now();
      }
      
      if (isGameOver && !prev.isGameOver) { 
          saveHighScore(score);
      }

      return { ...prev, spaceshipPosition, asteroids, score, lives, isGameOver };
    });

    if (gameState.gameStarted && !gameState.isGameOver) {
        if (Date.now() - lastAsteroidSpawnTime.current > currentSpawnInterval) {
            spawnAsteroid(currentAsteroidSpeed, elapsedTimeInSeconds);
            lastAsteroidSpawnTime.current = Date.now();
        }
    }

    gameLoopId.current = requestAnimationFrame(gameLoop);
  }, [gameState.gameStarted, gameState.isGameOver, gameState.score, spawnAsteroid, saveHighScore, gameStartTime]);


  useEffect(() => {
    if (gameState.gameStarted && !gameState.isGameOver) {
      lastAsteroidSpawnTime.current = Date.now(); 
      lastScoreIncrementTime.current = Date.now(); 
      gameLoopId.current = requestAnimationFrame(gameLoop);
    } else if (gameLoopId.current) {
      cancelAnimationFrame(gameLoopId.current);
    }
    return () => {
      if (gameLoopId.current) cancelAnimationFrame(gameLoopId.current);
    };
  }, [gameState.gameStarted, gameState.isGameOver, gameLoop]);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 relative select-none overflow-hidden">
      <ScoreDisplay score={gameState.score} lives={gameState.lives} highScore={gameState.highScore} />

      {!gameState.gameStarted && (
        <div className="flex flex-col items-center text-center">
           <h1 className="text-5xl md:text-6xl font-bold mb-8 text-primary font-mono">Cosmic Impact</h1>
          <Button onClick={startGame} size="lg" className="px-8 py-6 text-xl md:text-2xl">
            <Play className="mr-2 h-7 w-7 md:h-8 md:w-8" /> Start Game
          </Button>
        </div>
      )}

      {gameState.gameStarted && !gameState.isGameOver && (
        <GameArea
          spaceship={{ position: gameState.spaceshipPosition, size: SPACESHIP_SIZE }}
          asteroids={gameState.asteroids}
          actualWidth={actualGameDimensions.width}
          actualHeight={actualGameDimensions.height}
          logicalWidth={LOGICAL_GAME_WIDTH}
          logicalHeight={LOGICAL_GAME_HEIGHT}
        />
      )}

      {gameState.isGameOver && (
        <GameOverScreen score={gameState.score} onRestart={startGame} />
      )}
      
      {gameState.gameStarted && !gameState.isGameOver && (
        <>
          <div className="flex flex-col items-center mt-4 space-y-1 md:space-y-2">
            <Button
              size="lg"
              className="p-3 md:p-4"
              aria-label="Move Up"
              onMouseDown={() => handleButtonPress('arrowup')}
              onMouseUp={() => handleButtonRelease('arrowup')}
              onTouchStart={(e) => { e.preventDefault(); handleButtonPress('arrowup'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease('arrowup'); }}
            >
              <ArrowUp className="h-6 w-6 md:h-8 md:w-8" />
            </Button>
            <div className="flex space-x-6 md:space-x-8">
              <Button
                size="lg"
                className="p-3 md:p-4"
                aria-label="Move Left"
                onMouseDown={() => handleButtonPress('arrowleft')}
                onMouseUp={() => handleButtonRelease('arrowleft')}
                onTouchStart={(e) => { e.preventDefault(); handleButtonPress('arrowleft'); }}
                onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease('arrowleft'); }}
              >
                <ArrowLeft className="h-6 w-6 md:h-8 md:w-8" />
              </Button>
              <Button
                size="lg"
                className="p-3 md:p-4"
                aria-label="Move Right"
                onMouseDown={() => handleButtonPress('arrowright')}
                onMouseUp={() => handleButtonRelease('arrowright')}
                onTouchStart={(e) => { e.preventDefault(); handleButtonPress('arrowright'); }}
                onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease('arrowright'); }}
              >
                <ArrowRight className="h-6 w-6 md:h-8 md:w-8" />
              </Button>
            </div>
            <Button
              size="lg"
              className="p-3 md:p-4"
              aria-label="Move Down"
              onMouseDown={() => handleButtonPress('arrowdown')}
              onMouseUp={() => handleButtonRelease('arrowdown')}
              onTouchStart={(e) => { e.preventDefault(); handleButtonPress('arrowdown'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease('arrowdown'); }}
            >
              <ArrowDown className="h-6 w-6 md:h-8 md:w-8" />
            </Button>
          </div>
          <p className="mt-3 text-muted-foreground font-mono text-xs md:text-sm text-center">Use Arrow Keys, WASD, or On-Screen Controls to move</p>
        </>
      )}
    </div>
  );
}
