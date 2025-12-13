import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface WorkoutSession {
  id: string;
  exercise_type: string;
  total_reps: number;
  duration_seconds: number;
  calories_burned: number;
  form_score: number;
  created_at: string;
}

export const useWorkoutHistory = () => {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchWorkouts = useCallback(async () => {
    if (!user) {
      setWorkouts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('workout_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setWorkouts(data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch workouts');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  const saveWorkout = async (workout: Omit<WorkoutSession, 'id' | 'created_at'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error: insertError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          exercise_type: workout.exercise_type,
          total_reps: workout.total_reps,
          duration_seconds: workout.duration_seconds,
          calories_burned: workout.calories_burned,
          form_score: workout.form_score
        });

      if (insertError) throw insertError;
      
      await fetchWorkouts();
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error('Failed to save workout') };
    }
  };

  const getStats = useCallback(() => {
    const totalWorkouts = workouts.length;
    const totalReps = workouts.reduce((sum, w) => sum + w.total_reps, 0);
    const totalDuration = workouts.reduce((sum, w) => sum + w.duration_seconds, 0);
    const totalCalories = workouts.reduce((sum, w) => sum + Number(w.calories_burned), 0);
    const avgFormScore = totalWorkouts > 0 
      ? workouts.reduce((sum, w) => sum + Number(w.form_score), 0) / totalWorkouts 
      : 0;

    return { totalWorkouts, totalReps, totalDuration, totalCalories, avgFormScore };
  }, [workouts]);

  const getChartData = useCallback(() => {
    // Group workouts by date
    const grouped = workouts.reduce((acc, workout) => {
      const date = new Date(workout.created_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, reps: 0, duration: 0, calories: 0, count: 0 };
      }
      acc[date].reps += workout.total_reps;
      acc[date].duration += workout.duration_seconds;
      acc[date].calories += Number(workout.calories_burned);
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, { date: string; reps: number; duration: number; calories: number; count: number }>);

    return Object.values(grouped).reverse().slice(-14); // Last 14 days
  }, [workouts]);

  return { workouts, loading, error, saveWorkout, fetchWorkouts, getStats, getChartData };
};
