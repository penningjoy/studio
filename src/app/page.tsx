
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

  const spawnAsteroid = useCallback(() => {
    const size = Math.random() * (ASTEROID_MAX_SIZE - ASTEROID_MIN_SIZE) + ASTEROID_MIN_SIZE;
    const x = Math.random() * (LOGICAL_GAME_WIDTH - size);
    const newAsteroid: AsteroidObject = {
      id: crypto.randomUUID(),
      x,
      y: -size, 
      size,
      width: size,
      height: size,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 4, 
    };
    setGameState(prev => ({ ...prev, asteroids: [...prev.asteroids, newAsteroid] }));
  }, []);

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
    
    const currentScore = gameState.score;
    const currentAsteroidSpeed = Math.min(
      MAX_ASTEROID_SPEED,
      INITIAL_ASTEROID_BASE_SPEED + Math.floor(currentScore / 250) * 0.25 
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
        y: a.y + currentAsteroidSpeed,
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
          return false; 
        }
        return a.y < LOGICAL_GAME_HEIGHT; 
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
            spawnAsteroid();
            lastAsteroidSpawnTime.current = Date.now();
        }
    }

    gameLoopId.current = requestAnimationFrame(gameLoop);
  }, [gameState.gameStarted, gameState.isGameOver, gameState.score, spawnAsteroid, saveHighScore]);


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
