import React from 'react';
import { exercises } from '@/lib/exercises';
import { ExerciseType } from '@/types/pose';

interface ExerciseSelectorProps {
  selectedExercise: ExerciseType;
  onSelectExercise: (exercise: ExerciseType) => void;
}

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  selectedExercise,
  onSelectExercise,
}) => {
  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
        Select Exercise
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {exercises.map((exercise) => {
          const isSelected = selectedExercise === exercise.id;
          return (
            <button
              key={exercise.id}
              onClick={() => onSelectExercise(exercise.id)}
              className={`relative p-4 rounded-xl text-left transition-all duration-300 ${
                isSelected
                  ? 'bg-primary/20 border-2 border-primary glow-primary'
                  : 'bg-secondary/50 border-2 border-transparent hover:bg-secondary hover:border-border'
              }`}
            >
              <span className="text-2xl mb-2 block">{exercise.icon}</span>
              <h4 className={`font-semibold mb-1 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                {exercise.name}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {exercise.targetMuscles.join(', ')}
              </p>
              {isSelected && (
                <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-primary animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ExerciseSelector;
