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

  // Analyze pose for exercise-specific rep counting with detailed form feedback
  const analyzePose = useCallback(
    (keypoints: poseDetection.Keypoint[]) => {
      const getKeypoint = (name: string) => {
        const idx = KEYPOINT_INDICES[name as keyof typeof KEYPOINT_INDICES];
        return keypoints[idx];
      };

      let angle = 0;
      let currentPhase: 'up' | 'down' | 'neutral' = 'neutral';
      let feedback: FormFeedback = { quality: 'good', message: 'Looking great!', tip: 'Keep up the excellent work!' };

      switch (exercise) {
        case 'squats': {
          const leftHip = getKeypoint('leftHip');
          const leftKnee = getKeypoint('leftKnee');
          const leftAnkle = getKeypoint('leftAnkle');
          const rightHip = getKeypoint('rightHip');
          const rightKnee = getKeypoint('rightKnee');
          const rightAnkle = getKeypoint('rightAnkle');
          const leftShoulder = getKeypoint('leftShoulder');
          const rightShoulder = getKeypoint('rightShoulder');

          if (leftHip && leftKnee && leftAnkle && leftHip.score! > 0.3 && leftKnee.score! > 0.3 && leftAnkle.score! > 0.3) {
            angle = calculateAngle(leftHip, leftKnee, leftAnkle);

            if (angle < 100) {
              currentPhase = 'down';
              feedback = { 
                quality: 'good', 
                message: 'Excellent depth! 🎯', 
                tip: 'Drive through your heels as you stand up. You\'re doing amazing!' 
              };
            } else if (angle > 160) {
              currentPhase = 'up';
              feedback = { 
                quality: 'good', 
                message: 'Standing tall! 💪', 
                tip: 'Great job! Ready when you are for the next rep.' 
              };
            } else {
              currentPhase = 'neutral';
              feedback = { 
                quality: 'good', 
                message: 'Keep going! 🔥', 
                tip: 'Lower down slowly with control for best results.' 
              };
            }

            // Check for knee cave (valgus)
            if (leftKnee && leftAnkle && Math.abs(leftKnee.x - leftAnkle.x) > 50) {
              feedback = { 
                quality: 'warning', 
                message: 'Knee alignment check! 🦵', 
                tip: 'Push your knees outward to track over your toes. Imagine spreading the floor apart with your feet.' 
              };
            }

            // Check for forward lean (torso should stay relatively upright)
            if (leftShoulder && leftHip && currentPhase === 'down') {
              const torsoAngle = Math.abs(leftShoulder.x - leftHip.x);
              if (torsoAngle > 80) {
                feedback = { 
                  quality: 'warning', 
                  message: 'Chest up! 📐', 
                  tip: 'Keep your chest proud and look forward. Think about sitting back into a chair while keeping your torso upright.' 
                };
              }
            }

            // Check for weight distribution (hips shouldn't drift too far back)
            if (rightHip && rightKnee && rightAnkle && rightHip.score! > 0.3) {
              const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
              if (Math.abs(angle - rightKneeAngle) > 20) {
                feedback = { 
                  quality: 'warning', 
                  message: 'Balance your weight! ⚖️', 
                  tip: 'Distribute your weight evenly on both legs. You\'ve got this!' 
                };
              }
            }
          } else {
            feedback = { 
              quality: 'warning', 
              message: 'Adjusting view... 📷', 
              tip: 'Step back a bit so I can see your full body. Make sure your hips, knees, and ankles are visible.' 
            };
          }
          break;
        }

        case 'pushups': {
          const shoulder = getKeypoint('leftShoulder');
          const elbow = getKeypoint('leftElbow');
          const wrist = getKeypoint('leftWrist');
          const hip = getKeypoint('leftHip');
          const ankle = getKeypoint('leftAnkle');

          if (shoulder && elbow && wrist && shoulder.score! > 0.3 && elbow.score! > 0.3 && wrist.score! > 0.3) {
            angle = calculateAngle(shoulder, elbow, wrist);

            if (angle < 100) {
              currentPhase = 'down';
              feedback = { 
                quality: 'good', 
                message: 'Great depth! 💪', 
                tip: 'Excellent! Chest close to the ground. Push up with power!' 
              };
            } else if (angle > 150) {
              currentPhase = 'up';
              feedback = { 
                quality: 'good', 
                message: 'Arms locked out! ✨', 
                tip: 'Perfect extension! Keep your core engaged throughout.' 
              };
            } else {
              currentPhase = 'neutral';
              feedback = { 
                quality: 'good', 
                message: 'Moving well! 🔥', 
                tip: 'Control the movement - slow on the way down, explosive up!' 
              };
            }

            // Check for sagging hips
            if (hip && ankle && shoulder) {
              const bodyLineAngle = calculateAngle(shoulder, hip, ankle);
              if (bodyLineAngle < 160) {
                feedback = { 
                  quality: 'warning', 
                  message: 'Engage your core! 🎯', 
                  tip: 'Your hips are dropping. Squeeze your glutes and tighten your abs to create a straight line from head to heels.' 
                };
              } else if (bodyLineAngle > 185) {
                feedback = { 
                  quality: 'warning', 
                  message: 'Lower your hips! 📐', 
                  tip: 'Your hips are too high. Think about creating one straight line through your body.' 
                };
              }
            }

            // Check elbow position (shouldn't flare out too much)
            const rightElbow = getKeypoint('rightElbow');
            const rightShoulder = getKeypoint('rightShoulder');
            if (elbow && shoulder && rightElbow && rightShoulder) {
              const elbowFlare = Math.abs(elbow.y - shoulder.y);
              if (elbowFlare > 100 && currentPhase === 'down') {
                feedback = { 
                  quality: 'warning', 
                  message: 'Tuck those elbows! 💡', 
                  tip: 'Keep elbows at about 45° from your body, not flared out. This protects your shoulders!' 
                };
              }
            }
          } else {
            feedback = { 
              quality: 'warning', 
              message: 'Position check... 📷', 
              tip: 'Make sure your shoulders, elbows, and wrists are visible in the camera.' 
            };
          }
          break;
        }

        case 'bicep-curls': {
          const shoulder = getKeypoint('rightShoulder');
          const elbow = getKeypoint('rightElbow');
          const wrist = getKeypoint('rightWrist');
          const hip = getKeypoint('rightHip');

          if (shoulder && elbow && wrist && shoulder.score! > 0.3 && elbow.score! > 0.3 && wrist.score! > 0.3) {
            angle = calculateAngle(shoulder, elbow, wrist);

            if (angle < 60) {
              currentPhase = 'up';
              feedback = { 
                quality: 'good', 
                message: 'Squeeze at the top! 💪', 
                tip: 'Beautiful contraction! Hold for a moment and feel the bicep working.' 
              };
            } else if (angle > 140) {
              currentPhase = 'down';
              feedback = { 
                quality: 'good', 
                message: 'Full extension! ✨', 
                tip: 'Great range of motion! Control the weight on the way up.' 
              };
            } else {
              currentPhase = 'neutral';
              feedback = { 
                quality: 'good', 
                message: 'Keep curling! 🔥', 
                tip: 'Slow and controlled - time under tension builds muscle!' 
              };
            }

            // Check for swinging/using momentum
            if (hip && shoulder) {
              const torsoMovement = Math.abs(shoulder.x - hip.x);
              if (torsoMovement > 60) {
                feedback = { 
                  quality: 'warning', 
                  message: 'Avoid swinging! 🎯', 
                  tip: 'Keep your upper arm stationary - only your forearm should move. If you need to swing, try a lighter weight.' 
                };
              }
            }

            // Check elbow position (shouldn't drift forward)
            if (shoulder && elbow) {
              const elbowDrift = elbow.x - shoulder.x;
              if (Math.abs(elbowDrift) > 40) {
                feedback = { 
                  quality: 'warning', 
                  message: 'Lock your elbow position! 📐', 
                  tip: 'Keep your elbow pinned to your side. Imagine a wall behind you - your elbow should stay against it.' 
                };
              }
            }
          } else {
            feedback = { 
              quality: 'warning', 
              message: 'Adjusting view... 📷', 
              tip: 'Stand sideways to the camera so I can see your arm movement clearly.' 
            };
          }
          break;
        }

        case 'lunges': {
          const leftHip = getKeypoint('leftHip');
          const leftKnee = getKeypoint('leftKnee');
          const leftAnkle = getKeypoint('leftAnkle');
          const rightHip = getKeypoint('rightHip');
          const rightKnee = getKeypoint('rightKnee');
          const leftShoulder = getKeypoint('leftShoulder');

          if (leftHip && leftKnee && leftAnkle && leftHip.score! > 0.3 && leftKnee.score! > 0.3 && leftAnkle.score! > 0.3) {
            angle = calculateAngle(leftHip, leftKnee, leftAnkle);

            if (angle < 110) {
              currentPhase = 'down';
              feedback = { 
                quality: 'good', 
                message: 'Deep lunge! 🎯', 
                tip: 'Excellent depth! Back knee close to the ground. Push through your front heel to rise.' 
              };
            } else if (angle > 160) {
              currentPhase = 'up';
              feedback = { 
                quality: 'good', 
                message: 'Standing strong! 💪', 
                tip: 'Great work! Ready for the next rep or switch legs.' 
              };
            } else {
              currentPhase = 'neutral';
              feedback = { 
                quality: 'good', 
                message: 'Looking good! 🔥', 
                tip: 'Lower down with control - aim for a 90° angle at both knees.' 
              };
            }

            // Check front knee tracking over toes
            if (leftKnee && leftAnkle) {
              const kneeOverToe = leftKnee.x - leftAnkle.x;
              if (kneeOverToe > 50 && currentPhase === 'down') {
                feedback = { 
                  quality: 'warning', 
                  message: 'Knee behind toes! 🦵', 
                  tip: 'Your front knee is going too far forward. Take a bigger step and keep your shin vertical.' 
                };
              }
            }

            // Check torso position (should stay upright)
            if (leftShoulder && leftHip) {
              const torsoLean = Math.abs(leftShoulder.x - leftHip.x);
              if (torsoLean > 60 && currentPhase === 'down') {
                feedback = { 
                  quality: 'warning', 
                  message: 'Torso upright! 📐', 
                  tip: 'Keep your chest up and look forward. Engage your core to maintain an upright posture.' 
                };
              }
            }

            // Check for hip drop (level hips)
            if (rightHip && leftHip && rightHip.score! > 0.3) {
              const hipDifference = Math.abs(leftHip.y - rightHip.y);
              if (hipDifference > 40) {
                feedback = { 
                  quality: 'warning', 
                  message: 'Level your hips! ⚖️', 
                  tip: 'Keep your hips square and level. Imagine a spotlight on your hips - they should face forward.' 
                };
              }
            }
          } else {
            feedback = { 
              quality: 'warning', 
              message: 'Adjusting view... 📷', 
              tip: 'Step back so I can see your full body from hips to feet.' 
            };
          }
          break;
        }
      }

      // Count reps based on phase transitions (ignore neutral to avoid breaking transitions)
      if (currentPhase !== 'neutral') {
        if (lastPhaseRef.current === 'down' && currentPhase === 'up') {
          repCountRef.current += 1;
          onRepComplete?.(repCountRef.current);
        }
        lastPhaseRef.current = currentPhase;
      }

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
