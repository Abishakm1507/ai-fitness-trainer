import { Exercise, ExerciseType } from '@/types/pose';

export const exercises: Exercise[] = [
  {
    id: 'squats',
    name: 'Squats',
    description: 'Lower body compound exercise',
    icon: '🦵',
    targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
  },
  {
    id: 'pushups',
    name: 'Push-ups',
    description: 'Upper body pushing exercise',
    icon: '💪',
    targetMuscles: ['Chest', 'Triceps', 'Shoulders'],
  },
  {
    id: 'bicep-curls',
    name: 'Bicep Curls',
    description: 'Arm isolation exercise',
    icon: '🏋️',
    targetMuscles: ['Biceps', 'Forearms'],
  },
  {
    id: 'lunges',
    name: 'Lunges',
    description: 'Unilateral leg exercise',
    icon: '🏃',
    targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
  },
];

export const getExercise = (id: ExerciseType): Exercise | undefined => {
  return exercises.find(e => e.id === id);
};

// Keypoint indices for MoveNet
export const KEYPOINT_INDICES = {
  nose: 0,
  leftEye: 1,
  rightEye: 2,
  leftEar: 3,
  rightEar: 4,
  leftShoulder: 5,
  rightShoulder: 6,
  leftElbow: 7,
  rightElbow: 8,
  leftWrist: 9,
  rightWrist: 10,
  leftHip: 11,
  rightHip: 12,
  leftKnee: 13,
  rightKnee: 14,
  leftAnkle: 15,
  rightAnkle: 16,
};

// Skeleton connections for drawing
export const SKELETON_CONNECTIONS = [
  [KEYPOINT_INDICES.leftShoulder, KEYPOINT_INDICES.rightShoulder],
  [KEYPOINT_INDICES.leftShoulder, KEYPOINT_INDICES.leftElbow],
  [KEYPOINT_INDICES.leftElbow, KEYPOINT_INDICES.leftWrist],
  [KEYPOINT_INDICES.rightShoulder, KEYPOINT_INDICES.rightElbow],
  [KEYPOINT_INDICES.rightElbow, KEYPOINT_INDICES.rightWrist],
  [KEYPOINT_INDICES.leftShoulder, KEYPOINT_INDICES.leftHip],
  [KEYPOINT_INDICES.rightShoulder, KEYPOINT_INDICES.rightHip],
  [KEYPOINT_INDICES.leftHip, KEYPOINT_INDICES.rightHip],
  [KEYPOINT_INDICES.leftHip, KEYPOINT_INDICES.leftKnee],
  [KEYPOINT_INDICES.leftKnee, KEYPOINT_INDICES.leftAnkle],
  [KEYPOINT_INDICES.rightHip, KEYPOINT_INDICES.rightKnee],
  [KEYPOINT_INDICES.rightKnee, KEYPOINT_INDICES.rightAnkle],
];

// Calculate angle between three points
export const calculateAngle = (
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number }
): number => {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180) {
    angle = 360 - angle;
  }
  return angle;
};
