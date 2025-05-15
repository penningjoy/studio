"use client";

import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onRestart }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
      <h2 className="text-5xl font-bold text-destructive mb-4">Game Over</h2>
      <p className="text-3xl mb-8 text-accent font-mono">Final Score: {score}</p>
      <Button onClick={onRestart} size="lg" variant="default">
        <RotateCcw className="mr-2 h-5 w-5" /> Play Again
      </Button>
    </div>
  );
};

export default GameOverScreen;
