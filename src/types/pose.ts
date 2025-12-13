export interface Keypoint {
  x: number;
  y: number;
  score?: number;
  name?: string;
}

export interface Pose {
  keypoints: Keypoint[];
  score?: number;
}

export type ExerciseType = 'squats' | 'pushups' | 'bicep-curls' | 'lunges';

export interface Exercise {
  id: ExerciseType;
  name: string;
  description: string;
  icon: string;
  targetMuscles: string[];
}

export type FormQuality = 'good' | 'warning' | 'bad';

export interface FormFeedback {
  quality: FormQuality;
  message: string;
  tip?: string;
}

export interface WorkoutStats {
  reps: number;
  duration: number;
  calories: number;
  formScore: number;
}

export interface RepState {
  phase: 'up' | 'down' | 'neutral';
  angle: number;
  count: number;
}
