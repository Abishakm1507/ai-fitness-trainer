import { useCallback } from 'react';
import { WorkoutSession } from '@/hooks/useWorkoutHistory';
import { ExerciseType } from '@/types/pose';

export interface PersonalRecord {
  reps: number;
  duration: number;
  formScore: number;
}

export interface PRComparison {
  isRepsRecord: boolean;
  isDurationRecord: boolean;
  isFormScoreRecord: boolean;
  previousBests: PersonalRecord;
  improvements: {
    reps: number;
    duration: number;
    formScore: number;
  };
}

export const usePersonalRecords = (workouts: WorkoutSession[]) => {
  const getPersonalRecords = useCallback((exerciseType: ExerciseType): PersonalRecord => {
    const exerciseWorkouts = workouts.filter(w => w.exercise_type === exerciseType);
    
    if (exerciseWorkouts.length === 0) {
      return { reps: 0, duration: 0, formScore: 0 };
    }

    return {
      reps: Math.max(...exerciseWorkouts.map(w => w.total_reps)),
      duration: Math.max(...exerciseWorkouts.map(w => w.duration_seconds)),
      formScore: Math.max(...exerciseWorkouts.map(w => Number(w.form_score) || 0)),
    };
  }, [workouts]);

  const checkForPRs = useCallback((
    exerciseType: ExerciseType,
    newReps: number,
    newDuration: number,
    newFormScore: number
  ): PRComparison => {
    const previousBests = getPersonalRecords(exerciseType);
    
    return {
      isRepsRecord: newReps > previousBests.reps && previousBests.reps > 0,
      isDurationRecord: newDuration > previousBests.duration && previousBests.duration > 0,
      isFormScoreRecord: newFormScore > previousBests.formScore && previousBests.formScore > 0,
      previousBests,
      improvements: {
        reps: newReps - previousBests.reps,
        duration: newDuration - previousBests.duration,
        formScore: newFormScore - previousBests.formScore,
      },
    };
  }, [getPersonalRecords]);

  const getAllTimeRecords = useCallback(() => {
    const exerciseTypes: ExerciseType[] = ['squats', 'pushups', 'bicep-curls', 'lunges'];
    const records: Record<ExerciseType, PersonalRecord> = {} as Record<ExerciseType, PersonalRecord>;
    
    exerciseTypes.forEach(type => {
      records[type] = getPersonalRecords(type);
    });
    
    return records;
  }, [getPersonalRecords]);

  return { getPersonalRecords, checkForPRs, getAllTimeRecords };
};
