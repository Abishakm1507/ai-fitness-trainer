import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type GoalType = 'weekly_workouts' | 'weekly_reps' | 'weekly_duration' | 'exercise_pr_reps' | 'exercise_pr_duration' | 'streak';

export interface WorkoutGoal {
  id: string;
  user_id: string;
  goal_type: GoalType;
  exercise_type: string | null;
  target_value: number;
  current_value: number;
  start_date: string;
  end_date: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export const useWorkoutGoals = () => {
  const [goals, setGoals] = useState<WorkoutGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchGoals = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('workout_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setGoals((data as WorkoutGoal[]) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const createGoal = async (goal: Omit<WorkoutGoal, 'id' | 'user_id' | 'current_value' | 'is_completed' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error: insertError } = await supabase
        .from('workout_goals')
        .insert({
          user_id: user.id,
          goal_type: goal.goal_type,
          exercise_type: goal.exercise_type,
          target_value: goal.target_value,
          start_date: goal.start_date,
          end_date: goal.end_date
        });

      if (insertError) throw insertError;
      await fetchGoals();
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error('Failed to create goal') };
    }
  };

  const updateGoalProgress = async (goalId: string, currentValue: number) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const goal = goals.find(g => g.id === goalId);
      const isCompleted = goal ? currentValue >= goal.target_value : false;

      const { error: updateError } = await supabase
        .from('workout_goals')
        .update({ current_value: currentValue, is_completed: isCompleted })
        .eq('id', goalId);

      if (updateError) throw updateError;
      await fetchGoals();
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error('Failed to update goal') };
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error: deleteError } = await supabase
        .from('workout_goals')
        .delete()
        .eq('id', goalId);

      if (deleteError) throw deleteError;
      await fetchGoals();
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error('Failed to delete goal') };
    }
  };

  const getActiveGoals = useCallback(() => {
    const now = new Date();
    return goals.filter(goal => {
      if (goal.is_completed) return false;
      if (goal.end_date && new Date(goal.end_date) < now) return false;
      return true;
    });
  }, [goals]);

  const getGoalLabel = (goalType: GoalType): string => {
    const labels: Record<GoalType, string> = {
      weekly_workouts: 'Weekly Workouts',
      weekly_reps: 'Weekly Reps',
      weekly_duration: 'Weekly Duration (min)',
      exercise_pr_reps: 'Exercise PR (Reps)',
      exercise_pr_duration: 'Exercise PR (Duration)',
      streak: 'Workout Streak'
    };
    return labels[goalType];
  };

  return { 
    goals, 
    loading, 
    error, 
    createGoal, 
    updateGoalProgress, 
    deleteGoal, 
    fetchGoals,
    getActiveGoals,
    getGoalLabel
  };
};
