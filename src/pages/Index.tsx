import React, { useState, useCallback } from 'react';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import { ExerciseType, FormFeedback, FormQuality } from '@/types/pose';
import { getExercise } from '@/lib/exercises';
import CameraFeed from '@/components/CameraFeed';
import ExerciseSelector from '@/components/ExerciseSelector';
import RepCounter from '@/components/RepCounter';
import FormFeedbackPanel from '@/components/FormFeedbackPanel';
import WorkoutTimer from '@/components/WorkoutTimer';
import LoadingOverlay from '@/components/LoadingOverlay';
import { Dumbbell, Sparkles, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index: React.FC = () => {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>('squats');
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [formFeedback, setFormFeedback] = useState<FormFeedback | null>(null);
  const [formQuality, setFormQuality] = useState<FormQuality>('good');
  const { toast } = useToast();

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
    },
    [resetReps]
  );

  const handleWorkoutToggle = useCallback(() => {
    setIsWorkoutActive((prev) => !prev);
  }, []);

  const handleWorkoutReset = useCallback(() => {
    resetReps();
    setFormFeedback(null);
    setIsWorkoutActive(false);
  }, [resetReps]);

  const exercise = getExercise(selectedExercise);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <LoadingOverlay isLoading={isLoading} />

      {/* Header */}
      <header className="max-w-7xl mx-auto mb-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center glow-primary">
              <Dumbbell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                FitAI Trainer
                <Sparkles className="w-5 h-5 text-primary" />
              </h1>
              <p className="text-sm text-muted-foreground">Real-time AI-powered fitness coaching</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI Active</span>
          </div>
        </div>
      </header>

      {/* Error display */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="p-4 rounded-xl bg-destructive/20 border border-destructive/50 text-destructive">
            {error}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera feed - takes up 2 columns on large screens */}
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CameraFeed
              onVideoReady={handleVideoReady}
              onVideoStop={handleVideoStop}
              pose={pose}
              formQuality={formQuality}
              isActive={isWorkoutActive}
            />
          </div>

          {/* Side panel */}
          <div className="space-y-4">
            {/* Rep counter */}
            <div className="animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
              <RepCounter repState={repState} exerciseName={exercise?.name || 'Exercise'} />
            </div>

            {/* Timer */}
            <div className="animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
              <WorkoutTimer
                isActive={isWorkoutActive}
                onToggle={handleWorkoutToggle}
                onReset={handleWorkoutReset}
              />
            </div>

            {/* Form feedback */}
            <div className="animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
              <FormFeedbackPanel feedback={formFeedback} />
            </div>

            {/* Exercise selector */}
            <div className="animate-slide-in-right" style={{ animationDelay: '0.5s' }}>
              <ExerciseSelector
                selectedExercise={selectedExercise}
                onSelectExercise={handleExerciseChange}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Powered by TensorFlow.js MoveNet • Position yourself in frame for best results
        </p>
      </footer>
    </div>
  );
};

export default Index;
