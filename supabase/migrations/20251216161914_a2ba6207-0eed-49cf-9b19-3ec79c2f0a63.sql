-- Create enum for goal types
CREATE TYPE public.goal_type AS ENUM ('weekly_workouts', 'weekly_reps', 'weekly_duration', 'exercise_pr_reps', 'exercise_pr_duration', 'streak');

-- Create workout_goals table
CREATE TABLE public.workout_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_type goal_type NOT NULL,
  exercise_type TEXT, -- For exercise-specific goals
  target_value INTEGER NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE, -- NULL for ongoing goals like streaks
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workout_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own goals"
ON public.workout_goals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
ON public.workout_goals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
ON public.workout_goals
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
ON public.workout_goals
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_workout_goals_updated_at
BEFORE UPDATE ON public.workout_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();