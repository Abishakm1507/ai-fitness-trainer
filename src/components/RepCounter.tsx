import React, { useEffect, useState } from 'react';
import { RepState } from '@/types/pose';

interface RepCounterProps {
  repState: RepState;
  exerciseName: string;
}

const RepCounter: React.FC<RepCounterProps> = ({ repState, exerciseName }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (repState.count > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timer);
    }
  }, [repState.count]);

  return (
    <div className="glass-card-elevated p-6 text-center">
      <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">
        {exerciseName}
      </h3>
      <div className="relative mb-4">
        <span
          className={`stat-value transition-transform duration-300 ${
            animate ? 'animate-count-up' : ''
          }`}
        >
          {repState.count}
        </span>
        <span className="block text-lg text-muted-foreground mt-1">reps</span>
      </div>

      {/* Phase indicator */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <div
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            repState.phase === 'up' ? 'bg-primary glow-primary scale-125' : 'bg-muted'
          }`}
        />
        <span className="text-sm text-muted-foreground capitalize w-16">{repState.phase}</span>
        <div
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            repState.phase === 'down' ? 'bg-accent glow-accent scale-125' : 'bg-muted'
          }`}
        />
      </div>

      {/* Angle display */}
      {repState.angle > 0 && (
        <div className="text-sm text-muted-foreground">
          Joint angle: <span className="text-foreground font-medium">{repState.angle}°</span>
        </div>
      )}
    </div>
  );
};

export default RepCounter;
