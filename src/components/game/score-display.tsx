"use client";

interface ScoreDisplayProps {
  score: number;
  lives: number;
  highScore: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, lives, highScore }) => {
  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between text-2xl font-mono z-10 p-2 rounded-md bg-black/50">
      <p>Score: <span className="text-accent">{score}</span></p>
      <p>High Score: <span className="text-accent">{highScore}</span></p>
      <p>Lives: <span className="text-accent">{lives}</span></p>
    </div>
  );
};

export default ScoreDisplay;
