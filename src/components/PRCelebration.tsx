import React from 'react';
import { Trophy, Flame, Clock, Target } from 'lucide-react';
import { PRComparison } from '@/hooks/usePersonalRecords';

interface PRCelebrationProps {
  prComparison: PRComparison;
  exerciseName: string;
}

const PRCelebration: React.FC<PRCelebrationProps> = ({ prComparison, exerciseName }) => {
  const { isRepsRecord, isDurationRecord, isFormScoreRecord, improvements } = prComparison;
  
  const hasAnyPR = isRepsRecord || isDurationRecord || isFormScoreRecord;
  
  if (!hasAnyPR) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-gradient-to-br from-primary to-accent backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-primary/50 animate-scale-in max-w-sm mx-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-background/20 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-background animate-bounce" />
          </div>
          
          <h2 className="text-2xl font-bold text-background mb-2">
            Personal Record!
          </h2>
          <p className="text-background/80 mb-6">
            You crushed your {exerciseName} best!
          </p>
          
          <div className="space-y-3">
            {isRepsRecord && (
              <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-background/10">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-background" />
                  <span className="text-background font-medium">Reps</span>
                </div>
                <span className="text-background font-bold">
                  +{improvements.reps} more
                </span>
              </div>
            )}
            
            {isDurationRecord && (
              <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-background/10">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-background" />
                  <span className="text-background font-medium">Duration</span>
                </div>
                <span className="text-background font-bold">
                  +{formatDuration(improvements.duration)}
                </span>
              </div>
            )}
            
            {isFormScoreRecord && (
              <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-background/10">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-background" />
                  <span className="text-background font-medium">Form Score</span>
                </div>
                <span className="text-background font-bold">
                  +{improvements.formScore.toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PRCelebration;
