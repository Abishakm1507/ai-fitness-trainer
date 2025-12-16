import React, { useState, useCallback, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { usePersonalRecords, PRComparison } from '@/hooks/usePersonalRecords';
import { useWorkoutGoals } from '@/hooks/useWorkoutGoals';
import { useAuth } from '@/contexts/AuthContext';
import { ExerciseType, FormFeedback, FormQuality } from '@/types/pose';
import { getExercise } from '@/lib/exercises';
import CameraFeed from '@/components/CameraFeed';
import ExerciseSelector from '@/components/ExerciseSelector';
import RepCounter from '@/components/RepCounter';
import FormFeedbackPanel from '@/components/FormFeedbackPanel';
import WorkoutTimer from '@/components/WorkoutTimer';
import LoadingOverlay from '@/components/LoadingOverlay';
import PRCelebration from '@/components/PRCelebration';
import AppNavigation from '@/components/AppNavigation';
import { useToast } from '@/hooks/use-toast';

const Dashboard: React.FC = () => {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>('squats');
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [formFeedback, setFormFeedback] = useState<FormFeedback | null>(null);
  const [formQuality, setFormQuality] = useState<FormQuality>('good');
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const [formScores, setFormScores] = useState<number[]>([]);
  const [prCelebration, setPrCelebration] = useState<PRComparison | null>(null);
  
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const { workouts, saveWorkout } = useWorkoutHistory();
  const { checkForPRs } = usePersonalRecords(workouts);
  const { goals, updateGoalProgress } = useWorkoutGoals();

  // Auto-dismiss PR celebration after 4 seconds
  useEffect(() => {
    if (prCelebration) {
      const timer = setTimeout(() => setPrCelebration(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [prCelebration]);

  const handleRepComplete = useCallback(
    (count: number) => {
      if (count % 5 === 0 && count > 0) {
        toast({
          title: `🔥 ${count} reps!`,
          description: 'Great work! Keep pushing!',
        });
      }
    },
    [toast]
  );

  const handleFormFeedback = useCallback((feedback: FormFeedback) => {
    setFormFeedback(feedback);
    setFormQuality(feedback.quality);
    const score = feedback.quality === 'good' ? 100 : feedback.quality === 'warning' ? 70 : 40;
    setFormScores(prev => [...prev, score]);
  }, []);

  const { isLoading, error, pose, repState, startDetection, stopDetection, resetReps } =
    usePoseDetection({
      exercise: selectedExercise,
      onRepComplete: handleRepComplete,
      onFormFeedback: handleFormFeedback,
    });

  const handleVideoReady = useCallback(
    (video: HTMLVideoElement) => {
      startDetection(video);
    },
    [startDetection]
  );

  const handleVideoStop = useCallback(() => {
    stopDetection();
  }, [stopDetection]);

  const handleExerciseChange = useCallback(
    (exercise: ExerciseType) => {
      setSelectedExercise(exercise);
      resetReps();
      setFormFeedback(null);
      setFormScores([]);
    },
    [resetReps]
  );

  const handleWorkoutToggle = useCallback(() => {
    setIsWorkoutActive((prev) => !prev);
  }, []);

  const handleTimerUpdate = useCallback((seconds: number) => {
    setWorkoutDuration(seconds);
  }, []);

  const updateGoals = useCallback(async (reps: number, duration: number) => {
    for (const goal of goals) {
      if (goal.is_completed) continue;
      
      let newValue = goal.current_value;
      
      switch (goal.goal_type) {
        case 'weekly_workouts':
          newValue = goal.current_value + 1;
          break;
        case 'weekly_reps':
          newValue = goal.current_value + reps;
          break;
        case 'weekly_duration':
          newValue = goal.current_value + Math.floor(duration / 60);
          break;
        case 'exercise_pr_reps':
          if (goal.exercise_type === selectedExercise && reps > goal.current_value) {
            newValue = reps;
          }
          break;
        case 'exercise_pr_duration':
          if (goal.exercise_type === selectedExercise && duration > goal.current_value) {
            newValue = duration;
          }
          break;
        case 'streak':
          // Streak logic: increment if working out today
          newValue = goal.current_value + 1;
          break;
      }
      
      if (newValue !== goal.current_value) {
        await updateGoalProgress(goal.id, newValue);
      }
    }
  }, [goals, selectedExercise, updateGoalProgress]);

  const handleWorkoutReset = useCallback(async () => {
    if (user && repState.count > 0 && workoutDuration > 0) {
      const avgFormScore = formScores.length > 0 
        ? formScores.reduce((a, b) => a + b, 0) / formScores.length 
        : 0;
      
      const exerciseMultipliers: Record<ExerciseType, number> = {
        'squats': 0.4,
        'pushups': 0.3,
        'bicep-curls': 0.15,
        'lunges': 0.35
      };
      const caloriesBurned = repState.count * (exerciseMultipliers[selectedExercise] || 0.2);

      const prComparison = checkForPRs(selectedExercise, repState.count, workoutDuration, avgFormScore);
      
      const { error } = await saveWorkout({
        exercise_type: selectedExercise,
        total_reps: repState.count,
        duration_seconds: workoutDuration,
        calories_burned: caloriesBurned,
        form_score: avgFormScore
      });

      if (!error) {
        // Update goals after saving workout
        await updateGoals(repState.count, workoutDuration);
        
        const hasAnyPR = prComparison.isRepsRecord || prComparison.isDurationRecord || prComparison.isFormScoreRecord;
        
        if (hasAnyPR) {
          setPrCelebration(prComparison);
          toast({
            title: '🏆 New Personal Record!',
            description: `You beat your previous best for ${selectedExercise.replace('-', ' ')}!`,
          });
        } else {
          toast({
            title: '💪 Workout saved!',
            description: `${repState.count} ${selectedExercise.replace('-', ' ')} recorded.`,
          });
        }
      }
    }

    resetReps();
    setFormFeedback(null);
    setIsWorkoutActive(false);
    setWorkoutDuration(0);
    setFormScores([]);
  }, [resetReps, user, repState.count, workoutDuration, formScores, selectedExercise, saveWorkout, toast, checkForPRs, updateGoals]);

  const exercise = getExercise(selectedExercise);

  // Show loading while checking auth
  if (loading) {
    return <LoadingOverlay isLoading={true} />;
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <LoadingOverlay isLoading={isLoading} />
      
      {prCelebration && (
        <PRCelebration 
          prComparison={prCelebration} 
          exerciseName={exercise?.name || selectedExercise} 
        />
      )}

      <AppNavigation />

      {error && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="p-4 rounded-xl bg-destructive/20 border border-destructive/50 text-destructive">
            {error}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CameraFeed
              onVideoReady={handleVideoReady}
              onVideoStop={handleVideoStop}
              pose={pose}
              formQuality={formQuality}
              isActive={isWorkoutActive}
            />
          </div>

          <div className="space-y-4">
            <div className="animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
              <RepCounter repState={repState} exerciseName={exercise?.name || 'Exercise'} />
            </div>

            <div className="animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
              <WorkoutTimer
                isActive={isWorkoutActive}
                onToggle={handleWorkoutToggle}
                onReset={handleWorkoutReset}
                onTimeUpdate={handleTimerUpdate}
              />
            </div>

            <div className="animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
              <FormFeedbackPanel feedback={formFeedback} />
            </div>

            <div className="animate-slide-in-right" style={{ animationDelay: '0.5s' }}>
              <ExerciseSelector
                selectedExercise={selectedExercise}
                onSelectExercise={handleExerciseChange}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Powered by TensorFlow.js MoveNet • Position yourself in frame for best results
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
