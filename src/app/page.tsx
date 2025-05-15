
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Position, AsteroidObject, GameState } from '@/types';
import ScoreDisplay from '@/components/game/score-display';
import GameOverScreen from '@/components/game/game-over-screen';
import GameArea from '@/components/game/game-area'; // Import GameArea
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const SPACESHIP_SIZE = 30;
const ASTEROID_MIN_SIZE = 20;
const ASTEROID_MAX_SIZE = 60;
const SPACESHIP_SPEED = 20;
const ASTEROID_BASE_SPEED = 1.5;
const INITIAL_LIVES = 3;
const ASTEROID_SPAWN_INTERVAL = 1800; //ms
const SCORE_INCREMENT_INTERVAL = 1000; // ms, for time-based score

const SESSION_STORAGE_HIGH_SCORE_KEY = 'cosmicImpactHighScore';

export default function CosmicImpactPage() {
  const [gameState, setGameState] = useState<GameState>({
    spaceshipPosition: { x: GAME_WIDTH / 2 - SPACESHIP_SIZE / 2, y: GAME_HEIGHT - SPACESHIP_SIZE - 10 },
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

  const loadHighScore = useCallback(() => {
    const storedHighScore = sessionStorage.getItem(SESSION_STORAGE_HIGH_SCORE_KEY);
    if (storedHighScore) {
      setGameState(prev => ({ ...prev, highScore: parseInt(storedHighScore, 10) }));
    }
  }, []);

  const saveHighScore = useCallback((newScore: number) => {
    // Access highScore via prev state to ensure latest value
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
      spaceshipPosition: { x: GAME_WIDTH / 2 - SPACESHIP_SIZE / 2, y: GAME_HEIGHT - SPACESHIP_SIZE * 2 },
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
    const x = Math.random() * (GAME_WIDTH - size);
    const newAsteroid: AsteroidObject = {
      id: crypto.randomUUID(),
      x,
      y: -size, 
      size,
      width: size,
      height: size,
    };
    setGameState(prev => ({ ...prev, asteroids: [...prev.asteroids, newAsteroid] }));
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    keysPressed.current.add(event.key.toLowerCase());
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    keysPressed.current.delete(event.key.toLowerCase());
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
    
    setGameState(prev => {
      if (!prev.gameStarted || prev.isGameOver) return prev; // Ensure we don't update if game state changed
      
      let { spaceshipPosition, asteroids, score, lives, isGameOver } = { ...prev };

      let newX = spaceshipPosition.x;
      let newY = spaceshipPosition.y;

      if (keysPressed.current.has('arrowleft') || keysPressed.current.has('a')) newX -= SPACESHIP_SPEED;
      if (keysPressed.current.has('arrowright') || keysPressed.current.has('d')) newX += SPACESHIP_SPEED;
      if (keysPressed.current.has('arrowup') || keysPressed.current.has('w')) newY -= SPACESHIP_SPEED;
      if (keysPressed.current.has('arrowdown') || keysPressed.current.has('s')) newY += SPACESHIP_SPEED;
      
      spaceshipPosition = {
        x: Math.max(0, Math.min(GAME_WIDTH - SPACESHIP_SIZE, newX)),
        y: Math.max(0, Math.min(GAME_HEIGHT - SPACESHIP_SIZE, newY)),
      };

      const updatedAsteroids = asteroids.map(a => ({ ...a, y: a.y + ASTEROID_BASE_SPEED })).filter(a => {
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
            // Defer saveHighScore to outside setGameState if it also calls setGameState
            // Or ensure saveHighScore is structured to not cause issues (it is, as it uses prev state)
          }
          spaceshipPosition = { x: GAME_WIDTH / 2 - SPACESHIP_SIZE / 2, y: GAME_HEIGHT - SPACESHIP_SIZE * 2 };
          return false; 
        }
        return a.y < GAME_HEIGHT; 
      });
      
      asteroids = updatedAsteroids;

      if (Date.now() - lastAsteroidSpawnTime.current > ASTEROID_SPAWN_INTERVAL && !isGameOver) {
        // spawnAsteroid() will cause a re-render and another call to setGameState.
        // This is tricky. Better to collect changes and apply once.
        // For now, let's assume spawnAsteroid's setGameState is fine if it's the last logical step for asteroids array.
        // To be safer, spawn logic could return the new asteroid and it's added here.
        // However, the current spawnAsteroid itself calls setGameState.
        // This means the current 'asteroids' variable might not reflect the spawn if it happens.
        // Let's defer the spawnAsteroid call to after this setGameState completes, via useEffect dependency or similar.
        // Or, for simplicity in a game loop, we can directly modify the array to be returned.
        // The original code structure was:
        // if (Date.now() - lastAsteroidSpawnTime.current > ASTEROID_SPAWN_INTERVAL) {
        //   spawnAsteroid(); 
        //   lastAsteroidSpawnTime.current = Date.now();
        // }
        // This is fine because spawnAsteroid() calls setGameState, and the next gameLoop iteration will use the updated state.
        // So, no direct change needed here for spawn logic, but it's a point of attention in React game loops.
      }
      
      if (Date.now() - lastScoreIncrementTime.current > SCORE_INCREMENT_INTERVAL && !isGameOver) {
        score += 10; 
        lastScoreIncrementTime.current = Date.now();
      }
      
      // If game over happened in this tick, save high score
      if (isGameOver && !prev.isGameOver) {
          saveHighScore(score);
      }

      return { ...prev, spaceshipPosition, asteroids, score, lives, isGameOver };
    });

    // Handle asteroid spawning separately to avoid issues with setGameState within setGameState updater
    if (gameState.gameStarted && !gameState.isGameOver) {
        if (Date.now() - lastAsteroidSpawnTime.current > ASTEROID_SPAWN_INTERVAL) {
            spawnAsteroid();
            lastAsteroidSpawnTime.current = Date.now();
        }
    }

    gameLoopId.current = requestAnimationFrame(gameLoop);
  }, [gameState.gameStarted, gameState.isGameOver, spawnAsteroid, saveHighScore]); // Added gameState.isGameOver to dependencies


  useEffect(() => {
    if (gameState.gameStarted && !gameState.isGameOver) {
      lastAsteroidSpawnTime.current = Date.now(); // Reset spawn timer on game start/restart
      lastScoreIncrementTime.current = Date.now(); // Reset score timer
      gameLoopId.current = requestAnimationFrame(gameLoop);
    } else if (gameLoopId.current) {
      cancelAnimationFrame(gameLoopId.current);
    }
    return () => {
      if (gameLoopId.current) cancelAnimationFrame(gameLoopId.current);
    };
  }, [gameState.gameStarted, gameState.isGameOver, gameLoop]);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 relative select-none">
      <ScoreDisplay score={gameState.score} lives={gameState.lives} highScore={gameState.highScore} />

      {!gameState.gameStarted && (
        <div className="flex flex-col items-center">
           <h1 className="text-6xl font-bold mb-8 text-primary font-mono">Cosmic Impact</h1>
          <Button onClick={startGame} size="lg" className="px-8 py-6 text-2xl">
            <Play className="mr-2 h-8 w-8" /> Start Game
          </Button>
        </div>
      )}

      {gameState.gameStarted && !gameState.isGameOver && (
        <GameArea
          spaceship={{ position: gameState.spaceshipPosition, size: SPACESHIP_SIZE }}
          asteroids={gameState.asteroids}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
        />
      )}

      {gameState.isGameOver && (
        <GameOverScreen score={gameState.score} onRestart={startGame} />
      )}
      
      {gameState.gameStarted && !gameState.isGameOver && (
        <p className="mt-4 text-muted-foreground font-mono">Use Arrow Keys or WASD to move</p>
      )}
    </div>
  );
}
