import { useState, useEffect, useRef, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { Pose, ExerciseType, RepState, FormFeedback } from '@/types/pose';
import { KEYPOINT_INDICES, calculateAngle } from '@/lib/exercises';

interface UsePoseDetectionOptions {
  exercise: ExerciseType;
  onRepComplete?: (count: number) => void;
  onFormFeedback?: (feedback: FormFeedback) => void;
}

export const usePoseDetection = ({
  exercise,
  onRepComplete,
  onFormFeedback,
}: UsePoseDetectionOptions) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pose, setPose] = useState<Pose | null>(null);
  const [repState, setRepState] = useState<RepState>({
    phase: 'neutral',
    angle: 0,
    count: 0,
  });

  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationRef = useRef<number>();
  const lastPhaseRef = useRef<'up' | 'down' | 'neutral'>('neutral');
  const repCountRef = useRef(0);

  // Initialize TensorFlow and detector
  useEffect(() => {
    const initDetector = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await tf.ready();
        await tf.setBackend('webgl');

        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
            enableSmoothing: true,
          }
        );

        detectorRef.current = detector;
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize pose detector:', err);
        setError('Failed to load AI model. Please refresh the page.');
        setIsLoading(false);
      }
    };

    initDetector();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      detectorRef.current?.dispose();
    };
  }, []);

  // Analyze pose for exercise-specific rep counting
  const analyzePose = useCallback(
    (keypoints: poseDetection.Keypoint[]) => {
      const getKeypoint = (name: string) => {
        const idx = KEYPOINT_INDICES[name as keyof typeof KEYPOINT_INDICES];
        return keypoints[idx];
      };

      let angle = 0;
      let currentPhase: 'up' | 'down' | 'neutral' = 'neutral';
      let feedback: FormFeedback = { quality: 'good', message: 'Keep going!' };

      switch (exercise) {
        case 'squats': {
          const hip = getKeypoint('leftHip');
          const knee = getKeypoint('leftKnee');
          const ankle = getKeypoint('leftAnkle');

          if (hip && knee && ankle && hip.score! > 0.3 && knee.score! > 0.3 && ankle.score! > 0.3) {
            angle = calculateAngle(hip, knee, ankle);

            if (angle < 100) {
              currentPhase = 'down';
              feedback = { quality: 'good', message: 'Great depth!', tip: 'Push through your heels' };
            } else if (angle > 160) {
              currentPhase = 'up';
              feedback = { quality: 'good', message: 'Standing tall!', tip: 'Ready for next rep' };
            } else {
              currentPhase = 'neutral';
            }

            // Check form - knees shouldn't cave inward
            const leftKnee = getKeypoint('leftKnee');
            const leftAnkle = getKeypoint('leftAnkle');
            if (leftKnee && leftAnkle && Math.abs(leftKnee.x - leftAnkle.x) > 50) {
              feedback = { quality: 'warning', message: 'Watch your knees!', tip: 'Keep knees aligned with toes' };
            }
          }
          break;
        }

        case 'pushups': {
          const shoulder = getKeypoint('leftShoulder');
          const elbow = getKeypoint('leftElbow');
          const wrist = getKeypoint('leftWrist');

          if (shoulder && elbow && wrist && shoulder.score! > 0.3 && elbow.score! > 0.3 && wrist.score! > 0.3) {
            angle = calculateAngle(shoulder, elbow, wrist);

            if (angle < 100) {
              currentPhase = 'down';
              feedback = { quality: 'good', message: 'Good depth!', tip: 'Chest near the ground' };
            } else if (angle > 150) {
              currentPhase = 'up';
              feedback = { quality: 'good', message: 'Arms extended!', tip: 'Keep core tight' };
            } else {
              currentPhase = 'neutral';
            }
          }
          break;
        }

        case 'bicep-curls': {
          const shoulder = getKeypoint('rightShoulder');
          const elbow = getKeypoint('rightElbow');
          const wrist = getKeypoint('rightWrist');

          if (shoulder && elbow && wrist && shoulder.score! > 0.3 && elbow.score! > 0.3 && wrist.score! > 0.3) {
            angle = calculateAngle(shoulder, elbow, wrist);

            if (angle < 60) {
              currentPhase = 'up';
              feedback = { quality: 'good', message: 'Squeeze at top!', tip: 'Control the movement' };
            } else if (angle > 140) {
              currentPhase = 'down';
              feedback = { quality: 'good', message: 'Full extension!', tip: 'Don\'t swing' };
            } else {
              currentPhase = 'neutral';
            }

            // Check for swinging
            const hip = getKeypoint('rightHip');
            if (hip && Math.abs(shoulder.y - hip.y) < 100) {
              feedback = { quality: 'warning', message: 'Avoid swinging!', tip: 'Keep elbow stationary' };
            }
          }
          break;
        }

        case 'lunges': {
          const hip = getKeypoint('leftHip');
          const knee = getKeypoint('leftKnee');
          const ankle = getKeypoint('leftAnkle');

          if (hip && knee && ankle && hip.score! > 0.3 && knee.score! > 0.3 && ankle.score! > 0.3) {
            angle = calculateAngle(hip, knee, ankle);

            if (angle < 110) {
              currentPhase = 'down';
              feedback = { quality: 'good', message: 'Deep lunge!', tip: 'Back knee close to ground' };
            } else if (angle > 160) {
              currentPhase = 'up';
              feedback = { quality: 'good', message: 'Standing!', tip: 'Switch legs' };
            } else {
              currentPhase = 'neutral';
            }
          }
          break;
        }
      }

      // Count reps based on phase transitions
      if (lastPhaseRef.current === 'down' && currentPhase === 'up') {
        repCountRef.current += 1;
        onRepComplete?.(repCountRef.current);
      }
      lastPhaseRef.current = currentPhase;

      setRepState({
        phase: currentPhase,
        angle: Math.round(angle),
        count: repCountRef.current,
      });

      onFormFeedback?.(feedback);
    },
    [exercise, onRepComplete, onFormFeedback]
  );

  // Detect pose from video
  const detectPose = useCallback(async () => {
    if (!detectorRef.current || !videoRef.current) return;

    const video = videoRef.current;
    if (video.readyState < 2) {
      animationRef.current = requestAnimationFrame(detectPose);
      return;
    }

    try {
      const poses = await detectorRef.current.estimatePoses(video);

      if (poses.length > 0) {
        const detectedPose: Pose = {
          keypoints: poses[0].keypoints.map((kp) => ({
            x: kp.x,
            y: kp.y,
            score: kp.score,
            name: kp.name,
          })),
          score: poses[0].score,
        };

        setPose(detectedPose);
        analyzePose(poses[0].keypoints);
      }
    } catch (err) {
      console.error('Pose detection error:', err);
    }

    animationRef.current = requestAnimationFrame(detectPose);
  }, [analyzePose]);

  // Start detection
  const startDetection = useCallback(
    (video: HTMLVideoElement) => {
      videoRef.current = video;
      repCountRef.current = 0;
      lastPhaseRef.current = 'neutral';
      setRepState({ phase: 'neutral', angle: 0, count: 0 });
      detectPose();
    },
    [detectPose]
  );

  // Stop detection
  const stopDetection = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    videoRef.current = null;
    setPose(null);
  }, []);

  // Reset rep count
  const resetReps = useCallback(() => {
    repCountRef.current = 0;
    lastPhaseRef.current = 'neutral';
    setRepState({ phase: 'neutral', angle: 0, count: 0 });
  }, []);

  return {
    isLoading,
    error,
    pose,
    repState,
    startDetection,
    stopDetection,
    resetReps,
  };
};
