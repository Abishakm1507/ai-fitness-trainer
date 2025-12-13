import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkoutTimerProps {
  isActive: boolean;
  onToggle: () => void;
  onReset: () => void;
}

const WorkoutTimer: React.FC<WorkoutTimerProps> = ({ isActive, onToggle, onReset }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = useCallback((totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleReset = () => {
    setSeconds(0);
    onReset();
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider text-center">
        Workout Time
      </h3>
      <div className="text-center mb-4">
        <span className="text-4xl font-bold tracking-tight text-foreground font-mono">
          {formatTime(seconds)}
        </span>
      </div>
      <div className="flex justify-center gap-3">
        <Button
          onClick={onToggle}
          variant={isActive ? 'secondary' : 'default'}
          size="lg"
          className="gap-2 min-w-[120px]"
        >
          {isActive ? (
            <>
              <Pause className="w-5 h-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start
            </>
          )}
        </Button>
        <Button onClick={handleReset} variant="outline" size="lg">
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default WorkoutTimer;
