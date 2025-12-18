import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkoutTimerProps {
  isActive: boolean;
  onToggle: () => void;
  onReset: () => void;
  onTimeUpdate?: (seconds: number) => void;
}

const WorkoutTimer: React.FC<WorkoutTimerProps> = ({ isActive, onToggle, onReset, onTimeUpdate }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const newSeconds = prev + 1;
          onTimeUpdate?.(newSeconds);
          return newSeconds;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, onTimeUpdate]);

  const formatTime = useCallback((totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleFinish = () => {
    onReset();
    setSeconds(0);
    onTimeUpdate?.(0);
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
      <div className="flex flex-col gap-3">
        <Button
          onClick={onToggle}
          variant={isActive ? 'secondary' : 'default'}
          size="lg"
          className="gap-2 w-full"
        >
          {isActive ? (
            <>
              <Pause className="w-5 h-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start Workout
            </>
          )}
        </Button>
        {seconds > 0 && (
          <Button 
            onClick={handleFinish} 
            variant="default" 
            size="lg" 
            className="gap-2 w-full bg-success hover:bg-success/90 text-success-foreground"
          >
            <CheckCircle className="w-5 h-5" />
            Finish & Save Workout
          </Button>
        )}
      </div>
      {seconds === 0 && (
        <p className="text-xs text-muted-foreground text-center mt-3">
          Start the timer to track your workout
        </p>
      )}
    </div>
  );
};

export default WorkoutTimer;
